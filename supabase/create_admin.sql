-- ==============================================================================
-- GAJJAR HUB: CREATE OFFICIAL HOSTEL ADMIN (CAPTAIN) IN SUPABASE
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql)
-- ==============================================================================

-- 1. Create the admin user in Supabase auth.users (Pre-confirmed, no email confirmation required)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
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
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@gajjarhub.edu',
  crypt('Admin@2026', gen_salt('bf')),
  now(),
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
  email_confirmed_at = now();

-- 2. Ensure the admin profile has role = 'captain'
insert into public.profiles (
  id,
  full_name,
  room_no,
  mess,
  role
)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Hostel Captain / Admin',
  'Office-101',
  1,
  'captain'
)
on conflict (id) do update set
  role = 'captain',
  full_name = 'Hostel Captain / Admin';
