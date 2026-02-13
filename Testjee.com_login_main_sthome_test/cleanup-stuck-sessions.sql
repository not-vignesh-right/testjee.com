-- Cleanup script for stuck/expired exam sessions

-- 1. Find expired sessions that aren't marked as submitted
SELECT 
  es.session_id,
  s.student_name,
  s.email_id,
  es.start_time,
  es.total_duration_seconds,
  EXTRACT(EPOCH FROM (NOW() - es.start_time))::INTEGER as elapsed_seconds,
  es.is_submitted
FROM exam_sessions es
JOIN students s ON es.student_id = s.student_id
WHERE es.is_submitted = FALSE
  AND EXTRACT(EPOCH FROM (NOW() - es.start_time)) > es.total_duration_seconds
ORDER BY es.start_time DESC;

-- 2. Mark expired sessions as submitted
UPDATE exam_sessions
SET 
  is_submitted = TRUE,
  end_time = start_time + (total_duration_seconds || ' seconds')::INTERVAL
WHERE is_submitted = FALSE
  AND EXTRACT(EPOCH FROM (NOW() - start_time)) > total_duration_seconds;

-- 3. Verify the update
SELECT 
  session_id,
  student_id,
  start_time,
  end_time,
  is_submitted,
  EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER as duration_seconds
FROM exam_sessions
WHERE is_submitted = TRUE
ORDER BY start_time DESC
LIMIT 10;

-- 4. If you want to allow a student to retake (ONLY FOR TESTING):
-- DELETE FROM exam_sessions WHERE student_id = YOUR_STUDENT_ID AND is_submitted = TRUE;
-- DELETE FROM results WHERE student_id = YOUR_STUDENT_ID;
