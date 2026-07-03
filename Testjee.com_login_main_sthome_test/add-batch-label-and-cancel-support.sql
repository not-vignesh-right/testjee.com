-- Phase 5.4 + 5.6: batch/session labels for multi-batch management, and the ability to
-- cancel a not-yet-started session. Additive only — new nullable column + two new RPCs,
-- none of which touch create_live_exam_session_custom or any existing function.

ALTER TABLE live_exam_sessions
ADD COLUMN IF NOT EXISTS batch_label TEXT;

-- 5.4: persist the optional batch label chosen in ScheduleExam.vue
CREATE OR REPLACE FUNCTION set_live_session_batch_label(
  input_admin_id INTEGER,
  input_live_session_id INTEGER,
  input_batch_label TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE live_exam_sessions
  SET batch_label = input_batch_label
  WHERE live_session_id = input_live_session_id
    AND admin_id = input_admin_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION set_live_session_batch_label(integer, integer, text) TO anon, authenticated;

-- 5.6: cancel a session that hasn't started yet. Deliberately conservative — only flips
-- status to 'cancelled' (never deletes temp_students/rows) and does NOT decrement any
-- admin quota counters (tests_created/students_created), since I can't verify from this
-- codebase what increments them in create_live_exam_session_custom or whether decrementing
-- here would double-count against a later "duplicate" of this session. If you want
-- cancelled sessions to free up quota, decrement those columns here once you've confirmed
-- the exact counter semantics.
CREATE OR REPLACE FUNCTION cancel_live_exam_session(
  input_admin_id INTEGER,
  input_live_session_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE live_exam_sessions
  SET status = 'cancelled'
  WHERE live_session_id = input_live_session_id
    AND admin_id = input_admin_id
    AND status = 'scheduled';

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_live_exam_session(integer, integer) TO anon, authenticated;
