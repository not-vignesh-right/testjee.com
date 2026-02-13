-- Migration: Add exam_sessions table to prevent timer reset exploit
-- This tracks when students start exams and prevents refresh cheating

-- Create exam_sessions table
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  session_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL DEFAULT 'JEE_MAIN_FULL', -- Can add different exam types later
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ, -- NULL = in progress, NOT NULL = completed
  total_duration_seconds INTEGER NOT NULL DEFAULT 10800, -- 3 hours = 10800 seconds
  is_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_id ON public.exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_active ON public.exam_sessions(student_id, is_submitted) WHERE is_submitted = FALSE;

-- Prevent multiple active sessions (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_session 
ON public.exam_sessions (student_id, exam_type) 
WHERE is_submitted = FALSE;

-- Enable RLS
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own sessions
CREATE POLICY "Students can view own sessions" 
ON public.exam_sessions 
FOR SELECT 
TO authenticated
USING (
  student_id IN (
    SELECT student_id FROM public.students 
    WHERE supabase_user_id = auth.uid()
  )
);

-- Policy: Students can insert their own sessions
CREATE POLICY "Students can insert own sessions" 
ON public.exam_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (
  student_id IN (
    SELECT student_id FROM public.students 
    WHERE supabase_user_id = auth.uid()
  )
);

-- Policy: Students can update their own sessions
CREATE POLICY "Students can update own sessions" 
ON public.exam_sessions 
FOR UPDATE 
TO authenticated
USING (
  student_id IN (
    SELECT student_id FROM public.students 
    WHERE supabase_user_id = auth.uid()
  )
)
WITH CHECK (
  student_id IN (
    SELECT student_id FROM public.students 
    WHERE supabase_user_id = auth.uid()
  )
);

-- Add session_id to results table to link results to sessions
ALTER TABLE public.results 
ADD COLUMN IF NOT EXISTS session_id INTEGER REFERENCES public.exam_sessions(session_id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_results_session_id ON public.results(session_id);

-- Function to calculate remaining time
CREATE OR REPLACE FUNCTION get_remaining_time(p_session_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_total_duration INTEGER;
  v_elapsed_seconds INTEGER;
  v_remaining_seconds INTEGER;
BEGIN
  SELECT start_time, total_duration_seconds
  INTO v_start_time, v_total_duration
  FROM exam_sessions
  WHERE session_id = p_session_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_start_time))::INTEGER;
  v_remaining_seconds := v_total_duration - v_elapsed_seconds;
  
  -- Return 0 if time is up, otherwise return remaining seconds
  RETURN GREATEST(0, v_remaining_seconds);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.exam_sessions IS 'Tracks exam sessions to prevent timer reset exploits';
COMMENT ON FUNCTION get_remaining_time IS 'Calculates remaining time for an exam session based on server time';
