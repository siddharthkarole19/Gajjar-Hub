-- ==============================================================================
-- GAJJAR HUB: CONFIRM ALL REGISTERED USERS IN SUPABASE
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql
-- ==============================================================================

-- 1. Pre-confirm all registered emails in auth.users so they can log in immediately
update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

-- 2. Verify profile rows exist for all users in public.profiles
insert into public.profiles (id, full_name, role)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', 'Student User'), 
  'student'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
