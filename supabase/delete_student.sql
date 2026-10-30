-- ==============================================================================
-- GAJJAR HUB: DELETE STUDENT DATA SCRIPTS
-- ==============================================================================

-- 1. DELETE A STUDENT COMPLETELY (BY EMAIL)
-- Because our schema uses "ON DELETE CASCADE", deleting from auth.users automatically
-- deletes their profile, all their complaints, complaint votes, and poll votes!
DELETE FROM auth.users 
WHERE email = 'student@example.com';


-- 2. DELETE A STUDENT COMPLETELY (BY USER UUID)
DELETE FROM auth.users 
WHERE id = 'put-user-uuid-here';


-- 3. RESET A STUDENT'S ACTIVITY ONLY (KEPT REGISTERED, BUT COMPLAINTS & VOTES DELETED)
-- Use this if a student moved rooms or wants a clean slate without having to sign up again:
BEGIN;
  DELETE FROM public.complaint_votes WHERE user_id = 'put-user-uuid-here';
  DELETE FROM public.poll_votes WHERE user_id = 'put-user-uuid-here';
  DELETE FROM public.complaints WHERE user_id = 'put-user-uuid-here';
  UPDATE public.profiles 
  SET room_no = '', wing_id = NULL 
  WHERE id = 'put-user-uuid-here';
COMMIT;


-- 4. BATCH CLEANUP: DELETE ALL REGISTERED STUDENTS (KEEPS CAPTAINS & ADMINS SAFE)
-- Useful at the end of an academic year when a senior batch graduates:
DELETE FROM auth.users 
WHERE id IN (
  SELECT id FROM public.profiles WHERE role = 'student'
);
