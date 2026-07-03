-- BUG FIX: When an admin clicked "Start Early", it only flipped the session status to 'live'.
-- However, the student-side `start_student_exam` RPC strictly checks `if (now() < scheduled_start_time)`,
-- which caused the "Exam has not started yet" error even if the session was marked 'live'.
-- This fix makes `admin_start_exam` update the `scheduled_start_time` to `now()` as well.
-- SECURITY FIX: We are also upgrading this RPC to be token-verified (p_token) instead of trusting input_admin_id.

DROP FUNCTION IF EXISTS admin_start_exam(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION admin_start_exam(p_token TEXT, input_live_session_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id INTEGER;
BEGIN
    -- 1. Verify token
    SELECT admin_id INTO v_admin_id 
    FROM verify_admin_session(p_token) 
    LIMIT 1;

    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Invalid or expired admin token';
    END IF;

    -- 2. Verify ownership and update both status AND scheduled_start_time
    UPDATE live_exam_sessions
    SET 
        status = 'live',
        scheduled_start_time = now()
    WHERE live_session_id = input_live_session_id
      AND admin_id = v_admin_id
      AND status = 'scheduled';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found, not owned by you, or already started/cancelled.';
    END IF;

    RETURN TRUE;
END;
$$;
