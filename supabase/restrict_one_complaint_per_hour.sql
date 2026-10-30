-- ==============================================================================
-- GAJJAR HUB: RESTRICT USERS TO 1 COMPLAINT PER HOUR (RATE LIMIT TRIGGER)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql
-- ==============================================================================

create or replace function public.check_complaint_rate_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  last_complaint_time timestamptz;
begin
  -- Captains and admins are exempt from the rate limit
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
