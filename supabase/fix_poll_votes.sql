-- ==============================================================================
-- GAJJAR HUB: FIX POLL VOTES RLS (MULTI-USER VOTE ACCUMULATION FIX)
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jjrehedvaiethuyjspqk/sql
-- ==============================================================================

-- 1. Drop existing restrictive policies on poll_votes
drop policy if exists "Users can read own poll votes" on public.poll_votes;
drop policy if exists "Signed in users can read poll votes" on public.poll_votes;
drop policy if exists "Users can vote in their own open mess poll" on public.poll_votes;
drop policy if exists "Users can update own poll vote before close" on public.poll_votes;

-- 2. Allow signed-in users to read poll votes (enables multi-user tally calculation)
create policy "Signed in users can read poll votes" on public.poll_votes
  for select to authenticated using (true);

-- 3. Allow residents of the mess (and captain) to vote on open polls
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

-- 4. Allow users to update / switch their vote before poll closes
create policy "Users can update own poll vote before close" on public.poll_votes
  for update to authenticated using (
    auth.uid() = user_id and
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.is_closed = false
    )
  );
