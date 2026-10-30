-- ==============================================================================
-- GAJJAR HUB: FIX COMPLAINT VOTES RLS (MULTI-USER LIKE / DISLIKE FIX)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql
-- ==============================================================================

-- 1. Drop old restrictive policies on complaint_votes
drop policy if exists "Users can view own votes" on public.complaint_votes;
drop policy if exists "Signed in users can read complaint votes" on public.complaint_votes;
drop policy if exists "Users can insert own votes" on public.complaint_votes;
drop policy if exists "Users can update own votes" on public.complaint_votes;
drop policy if exists "Users can delete own votes" on public.complaint_votes;

-- 2. Allow all authenticated users to read complaint votes
-- (This allows the complaint_feed view to aggregate total like_count and dislike_count across all users)
create policy "Signed in users can read complaint votes" on public.complaint_votes
  for select to authenticated using (true);

-- 3. Allow users to insert their own vote
create policy "Users can insert own votes" on public.complaint_votes
  for insert to authenticated with check (auth.uid() = user_id);

-- 4. Allow users to update their own vote (switch between like and dislike)
create policy "Users can update own votes" on public.complaint_votes
  for update to authenticated using (auth.uid() = user_id);

-- 5. Allow users to delete their own vote (toggle off / unlike)
create policy "Users can delete own votes" on public.complaint_votes
  for delete to authenticated using (auth.uid() = user_id);

-- 6. Refresh the complaint_feed view to ensure it calculates sums properly
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
