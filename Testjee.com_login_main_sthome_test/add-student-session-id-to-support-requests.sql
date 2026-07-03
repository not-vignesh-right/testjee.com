-- Phase 2.3 (BUG-05 / NEW-03): exam_support_requests currently only supports regular-exam
-- appeals (session_id -> exam_sessions, student_id -> students). Live-exam appeals need to
-- key off student_exam_sessions instead, since live students aren't in the `students` table.
--
-- Additive only: adds a nullable column + FK, and relaxes the two existing columns to
-- nullable so a live appeal (which has no session_id/student_id) can be inserted without
-- touching the existing regular-exam appeal path.

ALTER TABLE exam_support_requests
ADD COLUMN IF NOT EXISTS student_session_id INTEGER
REFERENCES student_exam_sessions(student_session_id);

-- Safe even if these are already nullable — DROP NOT NULL is a no-op in that case.
ALTER TABLE exam_support_requests ALTER COLUMN session_id DROP NOT NULL;
ALTER TABLE exam_support_requests ALTER COLUMN student_id DROP NOT NULL;
