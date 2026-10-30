-- ==============================================================================
-- GAJJAR HUB: COMPLETE ADMIN COMPLAINT DELETION & PERMISSION FIX
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql
-- ==============================================================================

-- 1. Helper function: verify if current authenticated caller is Captain / Admin
create or replace function public.is_captain()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('captain', 'admin')
  ) or (auth.jwt()->>'email' like 'admin%') or (auth.jwt()->>'email' like 'captain%');
$$;

-- 2. Complaints Table: allow both author and captain to delete
drop policy if exists "Authors and captains can delete complaints" on public.complaints;
create policy "Authors and captains can delete complaints" on public.complaints
  for delete to authenticated using (auth.uid() = user_id or public.is_captain());

-- 3. Complaint Votes Table: allow users to delete own votes, and captain to delete all votes
drop policy if exists "Users can delete own votes" on public.complaint_votes;
drop policy if exists "Users and captains can delete complaint votes" on public.complaint_votes;
create policy "Users and captains can delete complaint votes" on public.complaint_votes
  for delete to authenticated using (auth.uid() = user_id or public.is_captain());

-- 4. Ensure Cascade Delete on child votes
alter table public.complaint_votes drop constraint if exists complaint_votes_complaint_id_fkey;
alter table public.complaint_votes add constraint complaint_votes_complaint_id_fkey
  foreign key (complaint_id) references public.complaints(id) on delete cascade;

-- 5. Security-Definer RPC function for atomic complaint deletion
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
    raise exception 'Unauthorized: Only the complaint author or hostel captain/admin can delete this complaint';
  end if;

  -- Remove associated votes first
  delete from public.complaint_votes where complaint_id = target_complaint_id;
  -- Delete the complaint
  delete from public.complaints where id = target_complaint_id;
  return true;
end;
$$;

grant execute on function public.delete_complaint_admin(uuid) to authenticated;

-- 6. Promote existing admin/captain profiles to role 'captain'
update public.profiles
set role = 'captain'
where id = '56adb545-984b-4ec0-be7e-41cd76d5efd6'
   or id = 'a0000000-0000-0000-0000-000000000001'
   or id in (
     select id from auth.users where email like 'admin%' or email like 'captain%'
   );
