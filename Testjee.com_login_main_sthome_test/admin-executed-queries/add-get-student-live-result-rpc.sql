-- BUG-11 fix: StudentResults.vue currently reads student_exam_sessions directly via the
-- Supabase client. Live-exam students are NOT Supabase-authenticated (temp credentials only),
-- so this select depends on RLS allowing anon reads on student_exam_sessions — if that policy
-- isn't in place (or ever gets locked down), the page silently returns no data.
--
-- This is a NEW, additive function only — it does not replace or modify any existing RPC,
-- so it's safe to run without needing the current definitions of start_student_exam /
-- get_student_exam_questions / student_exam_login.
--
-- Run this in the Supabase SQL editor. Adjust column names below first if your
-- student_exam_sessions table names them differently — verify with:
--   select column_name from information_schema.columns where table_name = 'student_exam_sessions';

CREATE OR REPLACE FUNCTION get_student_live_result(input_student_session_id integer)
RETURNS TABLE(
  score numeric,
  max_score integer,
  percentage numeric,
  rank integer,
  time_taken_seconds integer,
  student_name text,
  roll_number text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ses.score,
    ses.max_score,
    ses.percentage,
    ses.rank,
    ses.time_taken_seconds,
    ts.student_name,
    ts.roll_number,
    ses.status::text
  FROM student_exam_sessions ses
  JOIN temp_students ts ON ts.temp_student_id = ses.temp_student_id
  WHERE ses.student_session_id = input_student_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_student_live_result(integer) TO anon, authenticated;
