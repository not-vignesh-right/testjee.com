-- Phase 3.1 (BUG-09): ScheduleExam.vue currently hardcodes every live session as a
-- Physics/Chemistry/Mathematics (JEE-shaped) paper regardless of category, because there
-- was never anywhere to store which exam type (JEE Main / NEET UG / KCET ...) a live
-- session actually is. This adds that column.
--
-- Additive only. Existing rows default to 'JEE_MAIN_FULL' (today's only real behavior),
-- so nothing already scheduled changes meaning.

ALTER TABLE live_exam_sessions
ADD COLUMN IF NOT EXISTS exam_type TEXT NOT NULL DEFAULT 'JEE_MAIN_FULL';

-- New, additive RPC — does not touch create_live_exam_session_custom, whose current body
-- I don't have visibility into. Called by ScheduleExam.vue right after session creation to
-- persist the exam type chosen in the new dropdown.
CREATE OR REPLACE FUNCTION set_live_session_exam_type(
  input_admin_id INTEGER,
  input_live_session_id INTEGER,
  input_exam_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE live_exam_sessions
  SET exam_type = input_exam_type
  WHERE live_session_id = input_live_session_id
    AND admin_id = input_admin_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION set_live_session_exam_type(integer, integer, text) TO anon, authenticated;
