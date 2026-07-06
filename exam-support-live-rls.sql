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


-- ====================================================================
-- 6. CORRECT SCORING & NEGATIVE MARKING FUNCTION FOR LIVE MOCK EXAMS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.submit_student_exam(input_student_session_id integer)
 RETURNS TABLE(score numeric, max_score integer, percentage numeric, time_taken_seconds integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_score DECIMAL := 0;
  v_max_score INTEGER := 0;
  v_time_taken INTEGER;
  v_start_time TIMESTAMPTZ;
  v_exam_type TEXT;
  v_correct_marks NUMERIC := 4.0;
  v_incorrect_marks NUMERIC := -1.0;
BEGIN
  -- Get exam type and start time
  SELECT les.exam_type, ses.start_time 
  INTO v_exam_type, v_start_time
  FROM student_exam_sessions ses
  JOIN live_exam_sessions les ON les.live_session_id = ses.live_session_id
  WHERE ses.student_session_id = input_student_session_id;
  
  -- If KCET exam, adjust marking parameters (1 mark per correct answer, 0 for incorrect)
  IF v_exam_type LIKE 'KCET_%' THEN
    v_correct_marks := 1.0;
    v_incorrect_marks := 0.0;
  END IF;

  v_time_taken := EXTRACT(EPOCH FROM (NOW() - v_start_time))::INTEGER;
  
  -- Calculate score by checking each answer
  UPDATE student_answers sa
  SET 
    is_correct = (
      CASE 
        WHEN c.correct_answer IS NULL THEN false
        WHEN q.question_type = 'multiple_choice' THEN
          sa.selected_answer = c.correct_answer
        WHEN q.question_type = 'numeric' THEN
          sa.selected_answer::DECIMAL = c.correct_answer::DECIMAL
        ELSE false
      END
    ),
    marks_obtained = (
      CASE 
        -- If answer key is not present/configured, do not award or penalize
        WHEN c.correct_answer IS NULL THEN 0.0
        -- If answer is correct, award correct marks (+4 for JEE, +1 for KCET)
        WHEN (
          CASE 
            WHEN q.question_type = 'multiple_choice' THEN
              sa.selected_answer = c.correct_answer
            WHEN q.question_type = 'numeric' THEN
              sa.selected_answer::DECIMAL = c.correct_answer::DECIMAL
            ELSE false
          END
        ) THEN v_correct_marks
        -- If answer is cleared/unattempted, award 0.0
        WHEN sa.selected_answer IS NULL OR sa.selected_answer = '' THEN 0.0
        -- If answer is incorrect, penalize (-1 for JEE, 0 for KCET)
        ELSE v_incorrect_marks
      END
    )
  FROM questions q
  LEFT JOIN choices c ON q.question_id = c.question_id
  WHERE sa.question_id = q.question_id
    AND sa.student_session_id = input_student_session_id;
  
  -- Calculate total score by summing up the marks obtained
  SELECT 
    COALESCE(SUM(sa.marks_obtained), 0)
  INTO v_score
  FROM student_answers sa
  WHERE sa.student_session_id = input_student_session_id;

  -- Calculate the true maximum score of the exam paper based on total scheduled questions,
  -- NOT the count of questions the student happened to attempt!
  SELECT 
    cardinality(ses.question_order) * v_correct_marks
  INTO v_max_score
  FROM student_exam_sessions ses
  WHERE ses.student_session_id = input_student_session_id;
  
  -- Update student session
  UPDATE student_exam_sessions
  SET 
    status = 'submitted',
    submit_time = NOW(),
    time_taken_seconds = v_time_taken,
    score = v_score,
    max_score = v_max_score,
    percentage = (v_score / NULLIF(v_max_score, 0)) * 100
  WHERE student_session_id = input_student_session_id;
  
  RETURN QUERY SELECT v_score, v_max_score, (v_score / NULLIF(v_max_score, 0)) * 100, v_time_taken;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.submit_student_exam(integer) TO anon, authenticated;
