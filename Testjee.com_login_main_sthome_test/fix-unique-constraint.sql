-- Fix the unique constraint that's preventing session updates

-- Drop the problematic constraint
ALTER TABLE public.exam_sessions 
DROP CONSTRAINT IF EXISTS unique_active_session;

-- Create a better constraint: Only ONE active (not submitted) session per student
-- This uses a partial unique index instead
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_session 
ON public.exam_sessions (student_id, exam_type) 
WHERE is_submitted = FALSE;

-- This allows:
-- ✅ Multiple submitted sessions (is_submitted = TRUE)
-- ✅ Only ONE active session (is_submitted = FALSE)
-- ✅ Updating from FALSE to TRUE (no conflict!)

-- Verify
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'exam_sessions'::regclass;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'exam_sessions';
