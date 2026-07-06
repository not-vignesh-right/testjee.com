-- ====================================================================
-- SQL Migration: Add missing column to student_exam_sessions and configure RLS
-- Target: Resolve RLS policies for live exam sessions, student exam sessions, and appeal requests
-- ====================================================================

-- 1. ADD MISSING COLUMN: student_exam_sessions.end_time
ALTER TABLE public.student_exam_sessions 
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- 2. Enable RLS on live_exam_sessions and allow SELECT for everyone (students must query exam_type/status)
ALTER TABLE public.live_exam_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for everyone" ON public.live_exam_sessions;
CREATE POLICY "Allow select for everyone" ON public.live_exam_sessions
FOR SELECT TO anon, authenticated USING (true);

-- 3. Enable RLS on student_exam_sessions and allow SELECT for everyone (needed for status and start_time checks on reload)
ALTER TABLE public.student_exam_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for everyone" ON public.student_exam_sessions;
CREATE POLICY "Allow select for everyone" ON public.student_exam_sessions
FOR SELECT TO anon, authenticated USING (true);

-- 4. Enable RLS on questions table and allow SELECT for everyone (necessary for students to retrieve correct subject layouts)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select access to questions" ON public.questions;
CREATE POLICY "Allow select access to questions" ON public.questions
FOR SELECT TO anon, authenticated USING (true);

-- 5. Set up live mock exam support requests RLS policies
ALTER TABLE public.exam_support_requests ENABLE ROW LEVEL SECURITY;

-- 5.1 SELECT policy: Allow selecting if student_session_id is not null (live exam path)
DROP POLICY IF EXISTS "select_live_support_requests" ON public.exam_support_requests;
CREATE POLICY "select_live_support_requests" 
ON public.exam_support_requests 
FOR SELECT 
TO anon, authenticated 
USING (student_session_id IS NOT NULL);

-- 5.2 INSERT policy: Allow inserting if student_session_id is not null
DROP POLICY IF EXISTS "insert_live_support_requests" ON public.exam_support_requests;
CREATE POLICY "insert_live_support_requests" 
ON public.exam_support_requests 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (student_session_id IS NOT NULL);

-- 5.3 UPDATE policy: Allow updating if student_session_id is not null (to mark requests as completed)
DROP POLICY IF EXISTS "update_live_support_requests" ON public.exam_support_requests;
CREATE POLICY "update_live_support_requests" 
ON public.exam_support_requests 
FOR UPDATE 
TO anon, authenticated 
USING (student_session_id IS NOT NULL)
WITH CHECK (student_session_id IS NOT NULL);
