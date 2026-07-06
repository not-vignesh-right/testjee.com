-- ====================================================================
-- SQL Migration: Add get_student_live_detailed_results RPC
-- Target: Fetch structured, shuffled attempt questions, correct answers,
--         and selected responses for student results analysis.
-- ====================================================================

-- Drop if exists to ensure clean type mapping
DROP FUNCTION IF EXISTS public.get_student_live_detailed_results(integer, text);

CREATE OR REPLACE FUNCTION public.get_student_live_detailed_results(
  input_student_session_id INTEGER,
  p_admin_token TEXT DEFAULT NULL
)
RETURNS TABLE (
  question_id INTEGER,
  question_type TEXT,
  question_content JSONB,
  image_url TEXT,
  solution TEXT,
  external_reference TEXT,
  difficulty TEXT,
  subject_name TEXT,
  topic_name TEXT,
  choice1 JSONB,
  choice2 JSONB,
  choice3 JSONB,
  choice4 JSONB,
  correct_answer TEXT,
  selected_answer TEXT,
  time_spent_seconds INTEGER,
  is_marked_for_review BOOLEAN,
  is_correct BOOLEAN,
  marks_obtained NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
  v_live_session_id INTEGER;
  v_session_status TEXT;
BEGIN
  -- 1. Get the live session status
  SELECT ses.live_session_id, les.status::text
  INTO v_live_session_id, v_session_status
  FROM student_exam_sessions ses
  JOIN live_exam_sessions les ON les.live_session_id = ses.live_session_id
  WHERE ses.student_session_id = input_student_session_id;

  -- 2. Authorization check
  IF p_admin_token IS NOT NULL AND p_admin_token <> '' THEN
    -- Verify the admin token
    SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_admin_token) LIMIT 1;
    IF v_admin_id IS NULL THEN
      RAISE EXCEPTION 'Invalid or expired admin session';
    END IF;
  ELSE
    -- If not admin, the student can only view detailed results if status = 'completed'
    IF v_session_status IS NULL OR v_session_status != 'completed' THEN
      RAISE EXCEPTION 'Detailed results are hidden until the exam is completed.';
    END IF;
  END IF;

  -- 3. Return the detailed answers
  RETURN QUERY
  SELECT 
    q.question_id,
    q.question_type::text,
    q.question_content,
    q.image_url,
    q.solution,
    q.external_reference,
    q.difficulty::text,
    sub.subject_name::text,
    top.topic_name::text,
    c.choice1,
    c.choice2,
    c.choice3,
    c.choice4,
    c.correct_answer::text,
    sa.selected_answer::text,
    sa.time_spent_seconds,
    sa.is_marked_for_review,
    sa.is_correct,
    sa.marks_obtained
  FROM student_exam_sessions ses
  JOIN LATERAL unnest(ses.question_order) WITH ORDINALITY AS ord(q_id, idx) ON true
  JOIN questions q ON q.question_id = ord.q_id
  LEFT JOIN subjects sub ON q.subject_id = sub.subject_id
  LEFT JOIN topics top ON q.topic_id = top.topic_id
  LEFT JOIN choices c ON q.question_id = c.question_id
  LEFT JOIN student_answers sa ON sa.student_session_id = ses.student_session_id AND sa.question_id = q.question_id
  WHERE ses.student_session_id = input_student_session_id
  ORDER BY ord.idx;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_live_detailed_results(integer, text) TO anon, authenticated;
