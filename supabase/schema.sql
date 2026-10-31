-- ==============================================================================
-- GAJJAR HUB - COMPLETE SUPABASE DATABASE SCHEMA
-- Matches PRD v2.0 specs with RLS, triggers, views, and functions
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. WINGS TABLE
create table if not exists public.wings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  room_no text,
  wing_id uuid references public.wings(id),
  mess integer check (mess in (1, 2)),
  role text not null default 'student' check (role in ('student', 'captain')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. NOTICES TABLE
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null check (category in ('General', 'Mess', 'Maintenance', 'Event', 'Urgent')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 4. COMPLAINTS TABLE
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  wing_id uuid not null references public.wings(id),
  category text not null check (category in ('Room', 'Water', 'Power', 'Wi-Fi', 'Other')),
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now()
);

-- 5. COMPLAINT VOTES TABLE
create table if not exists public.complaint_votes (
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value integer not null check (value in (1, -1)),
  created_at timestamptz default now(),
  primary key (complaint_id, user_id)
);

-- 6. MESS MENU TABLE
create table if not exists public.mess_menu (
  id uuid primary key default gen_random_uuid(),
  mess integer not null check (mess in (1, 2)),
  day_of_week integer not null check (day_of_week between 1 and 7), -- 1: Mon, 7: Sun
  meal text not null check (meal in ('breakfast', 'lunch', 'dinner')),
  items text[] not null default '{}',
  updated_at timestamptz default now(),
  unique (mess, day_of_week, meal)
);

-- 7. POLLS TABLE
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  mess integer not null check (mess in (1, 2)),
  title text not null,
  closes_at timestamptz not null,
  is_closed boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 8. POLL OPTIONS TABLE
create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

-- 9. POLL VOTES TABLE
create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (poll_id, user_id)
);

-- 10. HOSTEL MANAGEMENT / LEADERS TABLE
create table if not exists public.hostel_leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  post text not null,
  phone text,
  email text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper to check if current user is captain
create or replace function public.is_captain()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'captain'
  );
$$;

-- Trigger to create profile row when user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to prevent students from altering registered hostel details
create or replace function public.protect_student_details()
returns trigger
language plpgsql
security definer
as $$
begin
  if public.is_captain() then
    return new;
  end if;

  if old.room_no is not null and trim(old.room_no) != '' then
    if new.mess is distinct from old.mess or
       new.wing_id is distinct from old.wing_id or
       lower(trim(new.room_no)) is distinct from lower(trim(old.room_no)) or
       new.full_name is distinct from old.full_name then
      raise exception 'Contact HMS to edit your details';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tr_protect_student_details on public.profiles;
create trigger tr_protect_student_details
  before update on public.profiles
  for each row execute function public.protect_student_details();

-- ==============================================================================
-- VIEWS
-- ==============================================================================

-- View: complaint_feed
create or replace view public.complaint_feed as
select 
  c.id,
  c.user_id,
  c.wing_id,
  w.name as wing_name,
  c.category,
  c.title,
  c.description,
  c.status,
  c.created_at,
  p.full_name as author_name,
  coalesce(count(case when cv.value = 1 then 1 end), 0)::int as like_count,
  coalesce(count(case when cv.value = -1 then 1 end), 0)::int as dislike_count,
  coalesce(max(case when cv.user_id = auth.uid() then cv.value end), 0)::int as user_vote
from public.complaints c
left join public.profiles p on c.user_id = p.id
left join public.wings w on c.wing_id = w.id
left join public.complaint_votes cv on c.id = cv.complaint_id
group by c.id, c.user_id, c.wing_id, w.name, c.category, c.title, c.description, c.status, c.created_at, p.full_name;

-- View: poll_results
create or replace view public.poll_results as
select
  po.id as option_id,
  po.poll_id,
  po.label,
  po.sort_order,
  count(pv.user_id)::int as vote_count
from public.poll_options po
left join public.poll_votes pv on po.id = pv.option_id
group by po.id, po.poll_id, po.label, po.sort_order;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.wings enable row level security;
alter table public.profiles enable row level security;
alter table public.notices enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_votes enable row level security;
alter table public.mess_menu enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.hostel_leaders enable row level security;

-- WINGS: Anyone signed-in can read. Captains can modify.
create policy "Signed in users can read wings" on public.wings
  for select to authenticated using (true);
create policy "Captains can modify wings" on public.wings
  for all to authenticated using (public.is_captain());

-- PROFILES: Signed-in users can read profiles. Users can update own profile (role blocked).
create policy "Signed in users can read profiles" on public.profiles
  for select to authenticated using (true);

create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id and 
    (role = (select role from public.profiles where id = auth.uid()) or public.is_captain())
  );

-- NOTICES: Signed in can read. Captains can insert, update, delete.
create policy "Signed in users can read notices" on public.notices
  for select to authenticated using (true);

create policy "Captains can insert notices" on public.notices
  for insert to authenticated with check (public.is_captain());

create policy "Captains can update notices" on public.notices
  for update to authenticated using (public.is_captain());

create policy "Captains can delete notices" on public.notices
  for delete to authenticated using (public.is_captain());

-- COMPLAINTS: Signed in can read.
create policy "Signed in users can read complaints" on public.complaints
  for select to authenticated using (true);

-- Students insert own complaint only with own user_id and own wing
create policy "Users can insert complaints for their own wing" on public.complaints
  for insert to authenticated with check (
    auth.uid() = user_id and
    wing_id = (select wing_id from public.profiles where id = auth.uid())
  );

-- Author can delete own complaints, captain can delete any
create policy "Authors and captains can delete complaints" on public.complaints
  for delete to authenticated using (
    auth.uid() = user_id or public.is_captain()
  );

-- Captain can update status
create policy "Captains can update complaints" on public.complaints
  for update to authenticated using (public.is_captain());

-- COMPLAINT VOTES: Users can manage own votes
create policy "Users can view own votes" on public.complaint_votes
  for select to authenticated using (auth.uid() = user_id);

create policy "Users can insert own votes" on public.complaint_votes
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update own votes" on public.complaint_votes
  for update to authenticated using (auth.uid() = user_id);

create policy "Users can delete own votes" on public.complaint_votes
  for delete to authenticated using (auth.uid() = user_id);

-- MESS MENU: Signed in can read. Captain can edit.
create policy "Signed in users can read mess_menu" on public.mess_menu
  for select to authenticated using (true);

create policy "Captains can manage mess_menu" on public.mess_menu
  for all to authenticated using (public.is_captain());

-- POLLS: Signed in can read. Captain can insert, update, delete.
create policy "Signed in users can read polls" on public.polls
  for select to authenticated using (true);

create policy "Captains can manage polls" on public.polls
  for all to authenticated using (public.is_captain());

-- POLL OPTIONS: Signed in can read. Captain can manage.
create policy "Signed in users can read poll_options" on public.poll_options
  for select to authenticated using (true);

create policy "Captains can manage poll_options" on public.poll_options
  for all to authenticated using (public.is_captain());

-- POLL VOTES: Signed in users can read poll votes for tallying results
create policy "Signed in users can read poll votes" on public.poll_votes
  for select to authenticated using (true);

-- Students can vote if poll is open and belongs to their mess (or captain)
create policy "Users can vote in their own open mess poll" on public.poll_votes
  for insert to authenticated with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.polls p
      join public.profiles pr on pr.id = auth.uid()
      where p.id = poll_id
        and (p.mess = pr.mess or pr.role = 'captain')
        and p.is_closed = false
    )
  );

create policy "Users can update own poll vote before close" on public.poll_votes
  for update to authenticated using (
    auth.uid() = user_id and
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.is_closed = false
    )
  );

-- HOSTEL LEADERS: Signed in can read. Captain can manage.
create policy "Signed in users can read hostel_leaders" on public.hostel_leaders
  for select to authenticated using (true);

create policy "Captains can manage hostel_leaders" on public.hostel_leaders
  for all to authenticated using (public.is_captain());
