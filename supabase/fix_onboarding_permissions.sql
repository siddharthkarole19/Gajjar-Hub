-- ==============================================================================
-- GAJJAR HUB: ONBOARDING & PROFILE PERMISSIONS FIX
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql)
-- ==============================================================================

-- 1. Ensure authenticated users can insert their own profile record if missing
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- 2. Ensure authenticated users can update their own profile record
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Ensure handle_new_user automatically creates profile with default student role
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
