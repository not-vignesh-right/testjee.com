-- Reschedule / nudge an already-scheduled live exam session
-- Run this once in the Supabase SQL Editor.
--
-- Both RPCs only work while status = 'scheduled' (can't reschedule a session that's already
-- live/completed/cancelled), are token-verified (same verify_admin_session pattern as every
-- other hardened admin RPC — see harden-admin-rpc-security.sql), and check ownership so one
-- admin can't reschedule another admin's session.
--
-- Because this UPDATEs the live_exam_sessions row, the existing Realtime subscription in
-- ExamWaitingRoom.vue (channel `lobby-{sessionCode}`, listening for UPDATE on
-- live_exam_sessions) already fires on this change with no further DB work needed — the
-- client-side fix that makes the countdown actually reflect the new time is in
-- ExamWaitingRoom.vue's checkStatusSafely(), not here.

-- Full reschedule: admin picks an exact new start time (and optionally a new duration).
CREATE OR REPLACE FUNCTION reschedule_live_exam_session(
  p_token TEXT,
  input_live_session_id INTEGER,
  input_new_start_time TIMESTAMPTZ,
  input_duration_minutes INTEGER DEFAULT NULL
)
RETURNS TABLE (
  scheduled_start_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ,
  duration_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
  v_owner_id INTEGER;
  v_status TEXT;
  v_duration INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  SELECT admin_id, status, duration_minutes INTO v_owner_id, v_status, v_duration
  FROM public.live_exam_sessions
  WHERE live_session_id = input_live_session_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  IF v_owner_id <> v_admin_id THEN
    RAISE EXCEPTION 'Access denied: this session belongs to another admin';
  END IF;
  IF v_status <> 'scheduled' THEN
    RAISE EXCEPTION 'Cannot reschedule a session that is already % (only scheduled sessions can be rescheduled)', v_status;
  END IF;

  v_duration := COALESCE(input_duration_minutes, v_duration);

  UPDATE public.live_exam_sessions
  SET
    scheduled_start_time = input_new_start_time,
    scheduled_end_time = input_new_start_time + (v_duration || ' minutes')::interval,
    duration_minutes = v_duration
  WHERE live_session_id = input_live_session_id;

  RETURN QUERY
  SELECT les.scheduled_start_time, les.scheduled_end_time, les.duration_minutes
  FROM public.live_exam_sessions les
  WHERE les.live_session_id = input_live_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION reschedule_live_exam_session(TEXT, INTEGER, TIMESTAMPTZ, INTEGER) TO anon, authenticated;

-- Quick "+5 min" (or any relative shift): moves start+end by input_minutes, computed via a
-- server-side interval add so it's immune to client/server clock skew. Duration is unchanged.
CREATE OR REPLACE FUNCTION nudge_live_exam_session_start(
  p_token TEXT,
  input_live_session_id INTEGER,
  input_minutes INTEGER
)
RETURNS TABLE (
  scheduled_start_time TIMESTAMPTZ,
  scheduled_end_time TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
  v_owner_id INTEGER;
  v_status TEXT;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  SELECT admin_id, status INTO v_owner_id, v_status
  FROM public.live_exam_sessions
  WHERE live_session_id = input_live_session_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  IF v_owner_id <> v_admin_id THEN
    RAISE EXCEPTION 'Access denied: this session belongs to another admin';
  END IF;
  IF v_status <> 'scheduled' THEN
    RAISE EXCEPTION 'Cannot adjust timing on a session that is already % (only scheduled sessions can be adjusted)', v_status;
  END IF;

  UPDATE public.live_exam_sessions
  SET
    scheduled_start_time = scheduled_start_time + (input_minutes || ' minutes')::interval,
    scheduled_end_time = scheduled_end_time + (input_minutes || ' minutes')::interval
  WHERE live_session_id = input_live_session_id;

  RETURN QUERY
  SELECT les.scheduled_start_time, les.scheduled_end_time
  FROM public.live_exam_sessions les
  WHERE les.live_session_id = input_live_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION nudge_live_exam_session_start(TEXT, INTEGER, INTEGER) TO anon, authenticated;
