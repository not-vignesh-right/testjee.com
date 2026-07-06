-- ====================================================================
-- SQL Migration: Add Anonymous/Authenticated Policies for Live Exam Support Appeals
-- Target: Enable RLS access for temp_students (anon role) in live sessions
-- ====================================================================

-- 1. SELECT policy: Allow selecting if student_session_id is not null (live exam path)
DROP POLICY IF EXISTS "select_live_support_requests" ON public.exam_support_requests;
CREATE POLICY "select_live_support_requests" 
ON public.exam_support_requests 
FOR SELECT 
TO anon, authenticated 
USING (student_session_id IS NOT NULL);

-- 2. INSERT policy: Allow inserting if student_session_id is not null
DROP POLICY IF EXISTS "insert_live_support_requests" ON public.exam_support_requests;
CREATE POLICY "insert_live_support_requests" 
ON public.exam_support_requests 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (student_session_id IS NOT NULL);

-- 3. UPDATE policy: Allow updating if student_session_id is not null (to mark requests as completed)
DROP POLICY IF EXISTS "update_live_support_requests" ON public.exam_support_requests;
CREATE POLICY "update_live_support_requests" 
ON public.exam_support_requests 
FOR UPDATE 
TO anon, authenticated 
USING (student_session_id IS NOT NULL)
WITH CHECK (student_session_id IS NOT NULL);
