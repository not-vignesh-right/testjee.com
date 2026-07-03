-- Security fix: AdminResumeRequests.vue / AdminLayout.vue previously queried
-- exam_support_requests with no admin scoping at all, so any admin could see and
-- approve/reject every other admin's live-exam appeals (including student PII).
--
-- Only the LIVE-exam path is scoped here. Regular-exam appeals (exam_sessions) have no
-- admin_id column anywhere in the schema — self-serve student exams aren't owned by any
-- admin — so there is no ownership to filter on for that path, and it intentionally stays
-- visible to every admin, matching current behavior.
--
-- Additive only — new RPC, does not modify exam_support_requests or any existing function.

CREATE OR REPLACE FUNCTION get_admin_pending_appeals(p_admin_id INTEGER)
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
BEGIN
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
  -- Join path for live exams
  LEFT JOIN student_exam_sessions ses ON esr.student_session_id = ses.student_session_id
  LEFT JOIN live_exam_sessions les ON ses.live_session_id = les.live_session_id
  LEFT JOIN temp_students ts ON ses.temp_student_id = ts.temp_student_id
  -- Join path for regular exams
  LEFT JOIN exam_sessions es ON esr.session_id = es.session_id
  LEFT JOIN students st ON esr.student_id = st.student_id
  WHERE
    -- Live-exam appeal: only visible to the admin who owns that live session
    (esr.student_session_id IS NOT NULL AND les.admin_id = p_admin_id)
    -- Regular-exam appeal: no admin ownership exists in the schema for this path,
    -- so it stays visible to all admins (unchanged from current behavior)
    OR (esr.student_session_id IS NULL AND esr.session_id IS NOT NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_pending_appeals(integer) TO anon, authenticated;
