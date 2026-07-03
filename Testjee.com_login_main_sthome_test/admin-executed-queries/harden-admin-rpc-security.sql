-- Production security hardening: every admin RPC in this app (including the ones I added
-- in earlier fixes) currently trusts a client-supplied `admin_id` integer parameter instead
-- of verifying the caller's session token. Since admin_id is a small sequential integer and
-- these RPCs are SECURITY DEFINER + granted to `anon`, anyone with the public anon key can
-- call them directly (bypassing the login page and the app entirely) by guessing admin_id
-- values 1, 2, 3... This file fixes that for every RPC I control, by having each one call
-- the existing verify_admin_session(token) RPC internally and derive admin_id itself,
-- rather than accepting it as a parameter.
--
-- Assumes verify_admin_session(input_token TEXT) returns a row/set containing an `admin_id`
-- column (confirmed indirectly: adminStore.js assigns its result directly to adminProfile,
-- and the rest of the app reads `adminProfile.admin_id` with no renaming in between).

-- ============================================================================
-- 1. get_admin_pending_appeals — now token-verified instead of admin_id-trusted
-- ============================================================================
DROP FUNCTION IF EXISTS get_admin_pending_appeals(INTEGER);

CREATE OR REPLACE FUNCTION get_admin_pending_appeals(p_token TEXT)
RETURNS TABLE (
  request_id INTEGER,
  session_id INTEGER,
  student_session_id INTEGER,
  student_id INTEGER,
  reason TEXT,
  custom_message TEXT,
  remaining_time_seconds INTEGER,
  answers JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  exam_type TEXT,
  student_name TEXT,
  student_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  RETURN QUERY
  SELECT
    esr.request_id,
    esr.session_id,
    esr.student_session_id,
    esr.student_id,
    esr.reason,
    esr.custom_message,
    esr.remaining_time_seconds,
    esr.answers,
    esr.status,
    esr.created_at,
    COALESCE(es.exam_type, 'Live Exam') AS exam_type,
    COALESCE(st.student_name, ts.student_name) AS student_name,
    COALESCE(st.email_id, 'Roll: ' || COALESCE(ts.roll_number, '-')) AS student_email
  FROM exam_support_requests esr
  LEFT JOIN student_exam_sessions ses ON esr.student_session_id = ses.student_session_id
  LEFT JOIN live_exam_sessions les ON ses.live_session_id = les.live_session_id
  LEFT JOIN temp_students ts ON ses.temp_student_id = ts.temp_student_id
  LEFT JOIN exam_sessions es ON esr.session_id = es.session_id
  LEFT JOIN students st ON esr.student_id = st.student_id
  WHERE
    (esr.student_session_id IS NOT NULL AND les.admin_id = v_admin_id)
    OR (esr.student_session_id IS NULL AND esr.session_id IS NOT NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_pending_appeals(text) TO anon, authenticated;

-- ============================================================================
-- 2. approve_appeal / reject_appeal — NEW. Replace the raw client-side .update() calls in
--    AdminResumeRequests.vue, which had ZERO ownership check: any admin (or, per the issue
--    above, anyone with the anon key at all) could approve/reject ANY request by request_id.
-- ============================================================================
CREATE OR REPLACE FUNCTION approve_appeal(p_token TEXT, p_request_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
  v_student_session_id INTEGER;
  v_session_id INTEGER;
  v_owner_admin_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  SELECT student_session_id, session_id INTO v_student_session_id, v_session_id
  FROM exam_support_requests WHERE request_id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_student_session_id IS NOT NULL THEN
    -- Live-exam appeal: verify this admin actually owns the session before touching anything
    SELECT les.admin_id INTO v_owner_admin_id
    FROM student_exam_sessions ses
    JOIN live_exam_sessions les ON ses.live_session_id = les.live_session_id
    WHERE ses.student_session_id = v_student_session_id;

    IF v_owner_admin_id IS NULL OR v_owner_admin_id <> v_admin_id THEN
      RAISE EXCEPTION 'You do not have permission to act on this request';
    END IF;

    UPDATE exam_support_requests SET status = 'approved', updated_at = now() WHERE request_id = p_request_id;
    UPDATE student_exam_sessions SET status = 'in_progress', end_time = NULL WHERE student_session_id = v_student_session_id;
  ELSE
    -- Regular-exam appeal: no admin-ownership concept exists in the schema for this path
    -- (unchanged from before this fix) — but a valid admin session is still required now,
    -- where previously this endpoint required no authentication check at all.
    UPDATE exam_support_requests SET status = 'approved', updated_at = now() WHERE request_id = p_request_id;
    UPDATE exam_sessions SET is_submitted = false, end_time = NULL WHERE session_id = v_session_id;
  END IF;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION approve_appeal(text, integer) TO anon, authenticated;

CREATE OR REPLACE FUNCTION reject_appeal(p_token TEXT, p_request_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
  v_student_session_id INTEGER;
  v_owner_admin_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  SELECT student_session_id INTO v_student_session_id
  FROM exam_support_requests WHERE request_id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_student_session_id IS NOT NULL THEN
    SELECT les.admin_id INTO v_owner_admin_id
    FROM student_exam_sessions ses
    JOIN live_exam_sessions les ON ses.live_session_id = les.live_session_id
    WHERE ses.student_session_id = v_student_session_id;

    IF v_owner_admin_id IS NULL OR v_owner_admin_id <> v_admin_id THEN
      RAISE EXCEPTION 'You do not have permission to act on this request';
    END IF;
  END IF;

  UPDATE exam_support_requests SET status = 'rejected', updated_at = now() WHERE request_id = p_request_id;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION reject_appeal(text, integer) TO anon, authenticated;

-- ============================================================================
-- 3. Retrofit the 3 RPCs added in earlier fixes (Phase 3/5) to verify token instead of
--    trusting a client-supplied admin_id. These are mine to safely rewrite — I have their
--    full prior source (add-exam-type-to-live-sessions.sql, add-batch-label-and-cancel-support.sql).
-- ============================================================================
DROP FUNCTION IF EXISTS set_live_session_exam_type(INTEGER, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION set_live_session_exam_type(
  p_token TEXT,
  input_live_session_id INTEGER,
  input_exam_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  UPDATE live_exam_sessions
  SET exam_type = input_exam_type
  WHERE live_session_id = input_live_session_id AND admin_id = v_admin_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION set_live_session_exam_type(text, integer, text) TO anon, authenticated;

DROP FUNCTION IF EXISTS set_live_session_batch_label(INTEGER, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION set_live_session_batch_label(
  p_token TEXT,
  input_live_session_id INTEGER,
  input_batch_label TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  UPDATE live_exam_sessions
  SET batch_label = input_batch_label
  WHERE live_session_id = input_live_session_id AND admin_id = v_admin_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION set_live_session_batch_label(text, integer, text) TO anon, authenticated;

DROP FUNCTION IF EXISTS cancel_live_exam_session(INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION cancel_live_exam_session(
  p_token TEXT,
  input_live_session_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  UPDATE live_exam_sessions
  SET status = 'cancelled'
  WHERE live_session_id = input_live_session_id
    AND admin_id = v_admin_id
    AND status = 'scheduled';

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_live_exam_session(text, integer) TO anon, authenticated;

-- ============================================================================
-- NOT included here, and NOT safe for me to rewrite blind: admin_start_exam,
-- create_live_exam_session_custom, admin_end_exam_and_calculate_ranks,
-- get_admin_live_sessions, get_session_results. These are pre-existing RPCs whose bodies
-- aren't in this codebase, and every client call site passes them a raw admin_id the exact
-- same way — meaning they very likely have the identical vulnerability. Apply the same
-- pattern to each: change the first parameter from `input_admin_id INTEGER` to
-- `p_token TEXT`, add `SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token)
-- LIMIT 1; IF v_admin_id IS NULL THEN RAISE EXCEPTION ...` at the top of the function body,
-- then replace every use of the old parameter with v_admin_id. I don't have their current
-- bodies so I can't do this safely myself without risking breaking exam scheduling/starting/
-- ending — but structurally it's the same three-line change as above, repeated five times.
-- ============================================================================
