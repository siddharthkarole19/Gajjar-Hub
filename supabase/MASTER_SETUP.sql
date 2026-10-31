-- ==============================================================================
-- GAJJAR HUB: MASTER SUPABASE DATABASE SETUP & SYNC SCRIPT
-- Run this ONCE in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql
-- ==============================================================================

-- 0. Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. BASE TABLES (IF NOT EXIST)
-- ==============================================================================

-- Wings Table
create table if not exists public.wings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Profiles Table
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

-- Notices Table
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null check (category in ('General', 'Mess', 'Maintenance', 'Event', 'Urgent')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Complaints Table
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

-- Complaint Votes Table
create table if not exists public.complaint_votes (
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value integer not null check (value in (1, -1)),
  created_at timestamptz default now(),
  primary key (complaint_id, user_id)
);

-- Mess Menu Table
create table if not exists public.mess_menu (
  id uuid primary key default gen_random_uuid(),
  mess integer not null check (mess in (1, 2)),
  day_of_week integer not null check (day_of_week between 1 and 7),
  meal text not null check (meal in ('breakfast', 'lunch', 'dinner')),
  items text[] not null default '{}',
  updated_at timestamptz default now(),
  unique (mess, day_of_week, meal)
);

-- Polls Table
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  mess integer not null check (mess in (1, 2)),
  title text not null,
  closes_at timestamptz not null,
  is_closed boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Poll Options Table
create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

-- Poll Votes Table
create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (poll_id, user_id)
);

-- Hostel Leaders Table
create table if not exists public.hostel_leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  post text not null,
  phone text not null,
  email text not null,
  sort_order integer not null default 0
);

-- ==============================================================================
-- 2. SEED INITIAL WINGS (REQUIRED FOR COMPLAINTS & ONBOARDING)
-- ==============================================================================
insert into public.wings (name) values
  ('Wing A'),
  ('Wing B'),
  ('Wing C'),
  ('Wing D')
on conflict (name) do nothing;

-- ==============================================================================
-- 3. SEED HOSTEL LEADERS (HS)
-- ==============================================================================
insert into public.hostel_leaders (name, post, phone, email, sort_order) values
  ('Aarav Sharma', 'HOSTEL CAPTAIN', '+919876543210', 'aarav.sharma@hostel.edu', 1),
  ('Rohan Verma', 'VICE CAPTAIN', '+919876543211', 'rohan.verma@hostel.edu', 2),
  ('Kavya Patel', 'MESS CONVENER (MESS 1)', '+919876543212', 'kavya.mess1@hostel.edu', 3),
  ('Nikhil Deshmukh', 'MESS CONVENER (MESS 2)', '+919876543213', 'nikhil.mess2@hostel.edu', 4),
  ('Pooja Nair', 'MAINTENANCE HEAD', '+919876543214', 'pooja.maintenance@hostel.edu', 5),
  ('Devansh Mehta', 'SPORTS & CULTURAL REP', '+919876543215', 'devansh.sports@hostel.edu', 6)
on conflict do nothing;

-- ==============================================================================
-- 4. SEED MESS MENU FOR MESS 1 & MESS 2
-- ==============================================================================
insert into public.mess_menu (mess, day_of_week, meal, items) values
  -- Mess 1 (North/General)
  (1, 1, 'breakfast', array['Poha', 'Sprouts', 'Boiled Eggs', 'Tea / Coffee', 'Banana']),
  (1, 1, 'lunch', array['Dal Tadka', 'Jeera Rice', 'Aloo Gobi', 'Roti', 'Curd', 'Salad']),
  (1, 1, 'dinner', array['Paneer Butter Masala', 'Tandoori Roti', 'Veg Pulao', 'Dal Fry', 'Gulab Jamun']),

  (1, 2, 'breakfast', array['Idli Sambhar', 'Coconut Chutney', 'Boiled Eggs', 'Tea / Coffee']),
  (1, 2, 'lunch', array['Rajma Masala', 'Steamed Rice', 'Bhindi Masala', 'Chapati', 'Boondi Raita']),
  (1, 2, 'dinner', array['Mix Veg Kolhapuri', 'Dal Makhani', 'Jeera Rice', 'Roti', 'Fruit Custard']),

  (1, 3, 'breakfast', array['Aloo Paratha', 'Curd', 'Pickle', 'Tea / Coffee']),
  (1, 3, 'lunch', array['Chole Bhature', 'Pulao Rice', 'Cucumber Salad', 'Fried Chillies']),
  (1, 3, 'dinner', array['Egg Curry / Mushroom Masala', 'Plain Rice', 'Tawa Roti', 'Dal Tadka', 'Ice Cream']),

  (1, 4, 'breakfast', array['Upma', 'Sambhar', 'Boiled Eggs', 'Bread Butter', 'Tea']),
  (1, 4, 'lunch', array['Kadhi Pakoda', 'Khichdi', 'Aloo Methi', 'Roti', 'Papad']),
  (1, 4, 'dinner', array['Dum Aloo Kashmiri', 'Yellow Dal', 'Peas Pulao', 'Chapati', 'Kheer']),

  (1, 5, 'breakfast', array['Masala Dosa', 'Sambhar', 'Tomato Chutney', 'Tea / Coffee']),
  (1, 5, 'lunch', array['Palak Paneer', 'Dal Fry', 'Steamed Basmati Rice', 'Roti', 'Salad']),
  (1, 5, 'dinner', array['Veg Biryani', 'Chicken Curry (Special)', 'Mirchi Ka Salan', 'Raita', 'Rasgulla']),

  (1, 6, 'breakfast', array['Methi Thepla', 'Chhunda', 'Curd', 'Boiled Eggs', 'Tea']),
  (1, 6, 'lunch', array['Sev Tameta', 'Gujarati Dal', 'Rice', 'Rotli', 'Chaas']),
  (1, 6, 'dinner', array['Pav Bhaji', 'Butter Pav', 'Chopped Onions', 'Lemon', 'Gulab Jamun']),

  (1, 7, 'breakfast', array['Puri Bhaji', 'Halwa', 'Boiled Eggs', 'Tea / Coffee']),
  (1, 7, 'lunch', array['Special Thali', 'Paneer Tikka', 'Dal Makhani', 'Naan', 'Jeera Rice', 'Sweet Lassi']),
  (1, 7, 'dinner', array['Special Veg Fried Rice', 'Manchurian Gravy', 'Spring Rolls', 'Brownie with Ice Cream']),

  -- Mess 2 (South/Continental)
  (2, 1, 'breakfast', array['Medu Vada', 'Sambhar', 'Coconut Chutney', 'Filter Coffee']),
  (2, 1, 'lunch', array['Tomato Rasam', 'Beans Poriyal', 'Steamed Rice', 'Curd', 'Appalam']),
  (2, 1, 'dinner', array['Malai Kofta', 'Chapati', 'Ghee Rice', 'Dal Tadka', 'Payasam']),

  (2, 2, 'breakfast', array['Uttapam', 'Kara Chutney', 'Boiled Eggs', 'Coffee / Tea']),
  (2, 2, 'lunch', array['Sambar Rice', 'Potato Roast', 'Curd Rice', 'Pickle', 'Papad']),
  (2, 2, 'dinner', array['Veg Hakka Noodles', 'Chilli Paneer', 'Hot & Sour Soup', 'Fruit Salad']),

  (2, 3, 'breakfast', array['Poha', 'Sev', 'Boiled Eggs', 'Fresh Fruits', 'Tea']),
  (2, 3, 'lunch', array['Dal Maharani', 'Steamed Rice', 'Bhindi Fry', 'Phulka', 'Boondi Raita']),
  (2, 3, 'dinner', array['Shahi Paneer', 'Butter Naan', 'Jeera Rice', 'Moong Dal Halwa']),

  (2, 4, 'breakfast', array['Rava Dosa', 'Coconut Chutney', 'Sambhar', 'Tea / Coffee']),
  (2, 4, 'lunch', array['Kashmiri Dum Aloo', 'Pulao', 'Tawa Paratha', 'Dal Fry', 'Curd']),
  (2, 4, 'dinner', array['Mix Vegetable Kurma', 'Malabar Parotta', 'Curd Rice', 'Gulab Jamun']),

  (2, 5, 'breakfast', array['Appam with Vegetable Stew', 'Boiled Eggs', 'Tea / Coffee']),
  (2, 5, 'lunch', array['Hyderabadi Veg Biryani', 'Mirchi Salan', 'Onion Raita', 'Sweet Boondi']),
  (2, 5, 'dinner', array['Paneer Do Pyaza', 'Yellow Dal', 'Rice', 'Chapati', 'Ice Cream']),

  (2, 6, 'breakfast', array['Poori Masala', 'Kesari Bath', 'Tea / Coffee']),
  (2, 6, 'lunch', array['Bisi Bele Bath', 'Boondi', 'Potato Chips', 'Curd Rice']),
  (2, 6, 'dinner', array['Veg Pulao', 'Dal Tadka', 'Chapati', 'Aloo Capsicum', 'Rasmalai']),

  (2, 7, 'breakfast', array['Masala Idli', 'Sambar', 'Groundnut Chutney', 'Coffee']),
  (2, 7, 'lunch', array['Curd Rice', 'Lemon Rice', 'Avial', 'Crispy Papad', 'Payasam']),
  (2, 7, 'dinner', array['Vegetable Fried Rice', 'Gobi Manchurian', 'Sweet Corn Soup', 'Vanilla Ice Cream'])
on conflict (mess, day_of_week, meal) do update set items = excluded.items;

-- ==============================================================================
-- 5. CREATE / REPAIR OFFICIAL ADMIN USER IN SUPABASE AUTH & PROFILES
-- ==============================================================================
do $$
declare
  admin_uid uuid := 'a0000000-0000-0000-0000-000000000001';
begin
  -- Insert or update user in auth.users
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    admin_uid,
    'authenticated',
    'authenticated',
    'admin@gajjarhub.edu',
    crypt('Admin@2026', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Hostel Captain / Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update set
    encrypted_password = crypt('Admin@2026', gen_salt('bf')),
    email = 'admin@gajjarhub.edu',
    email_confirmed_at = now();

  -- Crucial: insert into auth.identities so Supabase GoTrue Auth does not throw 500
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    admin_uid,
    admin_uid,
    format('{"sub":"%s","email":"%s"}', admin_uid, 'admin@gajjarhub.edu')::jsonb,
    'email',
    'admin@gajjarhub.edu',
    now(),
    now(),
    now()
  )
  on conflict (provider, provider_id) do nothing;

  -- Ensure profile exists with role = 'captain'
  insert into public.profiles (
    id,
    full_name,
    room_no,
    mess,
    role
  )
  values (
    admin_uid,
    'Hostel Captain / Admin',
    'Office-101',
    1,
    'captain'
  )
  on conflict (id) do update set
    role = 'captain',
    full_name = 'Hostel Captain / Admin';
end $$;

-- ==============================================================================
-- 6. AUTO-CONFIRM ALL USERS (PREVENTS EMAIL CONFIRMATION TIMEOUTS)
-- ==============================================================================
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

-- Trigger to auto-confirm future student registrations immediately
create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists tr_auto_confirm_user on auth.users;
create trigger tr_auto_confirm_user
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

-- Trigger to create profile row when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, mess)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'student', 1)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
  ) or (auth.jwt()->>'email' = 'admin@gajjarhub.edu');
$$;

-- Trigger to prevent students from altering registered hostel details after onboarding
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
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR MULTI-USER SHARING
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

-- WINGS: Anyone can read (so dropdowns populate immediately)
drop policy if exists "Signed in users can read wings" on public.wings;
drop policy if exists "Anyone can read wings" on public.wings;
drop policy if exists "Captains can modify wings" on public.wings;
create policy "Anyone can read wings" on public.wings for select using (true);
create policy "Captains can modify wings" on public.wings for all to authenticated using (public.is_captain());

-- PROFILES
drop policy if exists "Signed in users can read profiles" on public.profiles;
drop policy if exists "Anyone can read profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Anyone can read profiles" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id or public.is_captain());
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id or public.is_captain());

-- NOTICES: Anyone can read notices; Captains can insert, update, delete
drop policy if exists "Signed in users can read notices" on public.notices;
drop policy if exists "Anyone can read notices" on public.notices;
drop policy if exists "Captains can insert notices" on public.notices;
drop policy if exists "Captains can update notices" on public.notices;
drop policy if exists "Captains can delete notices" on public.notices;
create policy "Anyone can read notices" on public.notices for select using (true);
create policy "Captains can insert notices" on public.notices for insert to authenticated with check (public.is_captain());
create policy "Captains can update notices" on public.notices for update to authenticated using (public.is_captain());
create policy "Captains can delete notices" on public.notices for delete to authenticated using (public.is_captain());

-- COMPLAINTS: Anyone can read; Authenticated students can submit; Authors & captains can delete; Captain can update status
drop policy if exists "Signed in users can read complaints" on public.complaints;
drop policy if exists "Anyone can read complaints" on public.complaints;
drop policy if exists "Users can insert complaints for their own wing" on public.complaints;
drop policy if exists "Authenticated users can insert complaints" on public.complaints;
drop policy if exists "Authors and captains can delete complaints" on public.complaints;
drop policy if exists "Captains can update complaints" on public.complaints;
create policy "Anyone can read complaints" on public.complaints for select using (true);
create policy "Authenticated users can insert complaints" on public.complaints for insert to authenticated with check (auth.uid() = user_id or public.is_captain());
create policy "Authors and captains can delete complaints" on public.complaints for delete to authenticated using (auth.uid() = user_id or public.is_captain());
create policy "Captains can update complaints" on public.complaints for update to authenticated using (public.is_captain());

-- COMPLAINT VOTES: All users can read counts; Authenticated users manage own vote; Captains can delete
drop policy if exists "Users can view own votes" on public.complaint_votes;
drop policy if exists "Signed in users can read complaint votes" on public.complaint_votes;
drop policy if exists "Anyone can read complaint votes" on public.complaint_votes;
drop policy if exists "Users can insert own votes" on public.complaint_votes;
drop policy if exists "Users can update own votes" on public.complaint_votes;
drop policy if exists "Users can delete own votes" on public.complaint_votes;
drop policy if exists "Users and captains can delete complaint votes" on public.complaint_votes;
create policy "Anyone can read complaint votes" on public.complaint_votes for select using (true);
create policy "Users can insert own votes" on public.complaint_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own votes" on public.complaint_votes for update to authenticated using (auth.uid() = user_id);
create policy "Users and captains can delete complaint votes" on public.complaint_votes for delete to authenticated using (auth.uid() = user_id or public.is_captain());

-- RPC FUNCTION: Atomic complaint deletion by author or admin
create or replace function public.delete_complaint_admin(target_complaint_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  if not (
    public.is_captain() or 
    exists (select 1 from public.complaints where id = target_complaint_id and user_id = auth.uid())
  ) then
    raise exception 'Unauthorized to delete this complaint';
  end if;

  delete from public.complaint_votes where complaint_id = target_complaint_id;
  delete from public.complaints where id = target_complaint_id;
  return true;
end;
$$;
grant execute on function public.delete_complaint_admin(uuid) to authenticated;

-- MESS MENU: Anyone can read; Captain can edit
drop policy if exists "Signed in users can read mess_menu" on public.mess_menu;
drop policy if exists "Anyone can read mess_menu" on public.mess_menu;
drop policy if exists "Captains can manage mess_menu" on public.mess_menu;
create policy "Anyone can read mess_menu" on public.mess_menu for select using (true);
create policy "Captains can manage mess_menu" on public.mess_menu for all to authenticated using (public.is_captain());

-- POLLS & POLL OPTIONS: Anyone can read; Captain can create/modify
drop policy if exists "Signed in users can read polls" on public.polls;
drop policy if exists "Anyone can read polls" on public.polls;
drop policy if exists "Captains can manage polls" on public.polls;
create policy "Anyone can read polls" on public.polls for select using (true);
create policy "Captains can manage polls" on public.polls for all to authenticated using (public.is_captain());

drop policy if exists "Signed in users can read poll_options" on public.poll_options;
drop policy if exists "Anyone can read poll_options" on public.poll_options;
drop policy if exists "Captains can manage poll_options" on public.poll_options;
create policy "Anyone can read poll_options" on public.poll_options for select using (true);
create policy "Captains can manage poll_options" on public.poll_options for all to authenticated using (public.is_captain());

-- POLL VOTES: Anyone can read (for calculating percentages); Users can vote/switch
drop policy if exists "Signed in users can read poll votes" on public.poll_votes;
drop policy if exists "Anyone can read poll votes" on public.poll_votes;
drop policy if exists "Users can vote in their own open mess poll" on public.poll_votes;
drop policy if exists "Authenticated users can vote on polls" on public.poll_votes;
drop policy if exists "Users can update own poll vote before close" on public.poll_votes;
create policy "Anyone can read poll votes" on public.poll_votes for select using (true);
create policy "Authenticated users can vote on polls" on public.poll_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own poll vote before close" on public.poll_votes for update to authenticated using (auth.uid() = user_id);
create policy "Users can delete own poll votes" on public.poll_votes for delete to authenticated using (auth.uid() = user_id);

-- HOSTEL LEADERS: Anyone can read; Captain can manage
drop policy if exists "Signed in users can read hostel_leaders" on public.hostel_leaders;
drop policy if exists "Anyone can read hostel_leaders" on public.hostel_leaders;
drop policy if exists "Captains can manage hostel_leaders" on public.hostel_leaders;
create policy "Anyone can read hostel_leaders" on public.hostel_leaders for select using (true);
create policy "Captains can manage hostel_leaders" on public.hostel_leaders for all to authenticated using (public.is_captain());

-- ==============================================================================
-- 8. COMPLAINT FEED VIEW WITH TOTAL VOTES
-- ==============================================================================
drop view if exists public.complaint_feed;
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

-- ==============================================================================
-- 9. COMPLAINT RATE LIMIT TRIGGER (1 COMPLAINT PER HOUR)
-- ==============================================================================
create or replace function public.check_complaint_rate_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  last_complaint_time timestamptz;
begin
  if public.is_captain() then
    return new;
  end if;

  select created_at into last_complaint_time
  from public.complaints
  where user_id = new.user_id
    and created_at > (now() - interval '1 hour')
  order by created_at desc
  limit 1;

  if last_complaint_time is not null then
    raise exception 'Rate limit exceeded: You can only file 1 complaint per hour. Please wait before submitting another.';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_check_complaint_rate_limit on public.complaints;
create trigger tr_check_complaint_rate_limit
  before insert on public.complaints
  for each row execute function public.check_complaint_rate_limit();
