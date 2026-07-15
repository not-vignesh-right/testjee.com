-- Fixes SessionCredentials.vue's DB-fallback path (shown after a page refresh, once the
-- sessionStorage fast-path from session creation has been cleared) silently showing "0
-- Student Slots" even when temp_students genuinely has rows for that session.
--
-- Root cause: that fallback queried `temp_students` directly from the client
-- (`.from('temp_students').select(...)`). This table was deliberately never given RLS
-- policies in this project (see harden-admin-rpc-security.sql's "Deliberately NOT done —
-- RLS as defense-in-depth" note) — meaning its client-side readability has always silently
-- depended on RLS being off. Supabase does not throw an error when RLS blocks a SELECT; it
-- just returns zero rows, which is exactly the symptom (0 slots, no console error, but the
-- rows are visible in Table Editor since that bypasses RLS entirely).
--
-- Fix: route through a SECURITY DEFINER RPC instead — bypasses RLS entirely (like every
-- other sensitive read in this codebase already does: student_exam_login,
-- get_admin_pending_appeals, get_admin_branding, ...) AND adds a real ownership check, so
-- one admin's browser can't read another admin's session roster even if RLS is ever
-- reconsidered later.

CREATE OR REPLACE FUNCTION get_session_credentials(
  p_token TEXT,
  input_live_session_id INTEGER
)
RETURNS TABLE (
  username TEXT,
  student_name TEXT,
  roll_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
  v_owner_id INTEGER;
  v_admin_test_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  SELECT les.admin_id, les.admin_test_id INTO v_owner_id, v_admin_test_id
  FROM public.live_exam_sessions les
  WHERE les.live_session_id = input_live_session_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  IF v_owner_id <> v_admin_id THEN
    RAISE EXCEPTION 'Access denied: this session belongs to another admin';
  END IF;

  RETURN QUERY
  SELECT ts.username, ts.student_name, ts.roll_number
  FROM public.temp_students ts
  WHERE ts.admin_test_id = v_admin_test_id
  ORDER BY ts.created_date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_session_credentials(TEXT, INTEGER) TO anon, authenticated;
