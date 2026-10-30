-- ==============================================================================
-- GAJJAR HUB: PREVENT STUDENTS FROM ALTERING OFFICIAL HOSTEL DETAILS
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql
-- ==============================================================================

-- 1. Create protection trigger function
create or replace function public.protect_student_details()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Captains / Admins are authorized to reassign wings, rooms, or mess
  if public.is_captain() then
    return new;
  end if;

  -- If student has already completed initial onboarding (room_no is set),
  -- block any modification to mess, wing_id, room_no, or full_name
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

-- 2. Attach trigger to public.profiles
drop trigger if exists tr_protect_student_details on public.profiles;
create trigger tr_protect_student_details
  before update on public.profiles
  for each row execute function public.protect_student_details();
