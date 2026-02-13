-- Migration: Add supabase_user_id to students table
-- This links students table to Supabase Auth users

-- Add supabase_user_id column if it doesn't exist
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Add foreign key constraint to auth.users (optional but recommended)
-- Note: This requires the auth schema to be accessible
-- ALTER TABLE public.students 
-- ADD CONSTRAINT fk_students_auth_users 
-- FOREIGN KEY (supabase_user_id) 
-- REFERENCES auth.users(id) 
-- ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_supabase_user_id 
ON public.students(supabase_user_id);

-- Enable Row Level Security (RLS) on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.students;

-- Policy: Students can read their own profile
-- IMPORTANT: This allows SELECT even if record doesn't exist yet
CREATE POLICY "Students can view own profile" 
ON public.students 
FOR SELECT 
TO authenticated
USING (auth.uid() = supabase_user_id);

-- Policy: Students can update their own profile
CREATE POLICY "Students can update own profile" 
ON public.students 
FOR UPDATE 
TO authenticated
USING (auth.uid() = supabase_user_id);

-- Policy: Allow insert for new students (during signup)
-- This allows authenticated users to create their own profile
CREATE POLICY "Allow insert for authenticated users" 
ON public.students 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = supabase_user_id);

-- Enable RLS on results table
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Students can view own results" ON public.results;
DROP POLICY IF EXISTS "Students can insert own results" ON public.results;

-- Policy: Students can view their own results
CREATE POLICY "Students can view own results" 
ON public.results 
FOR SELECT 
TO authenticated
USING (
  student_id IN (
    SELECT student_id FROM public.students 
    WHERE supabase_user_id = auth.uid()
  )
);

-- Policy: Students can insert their own results
CREATE POLICY "Students can insert own results" 
ON public.results 
FOR INSERT 
TO authenticated
WITH CHECK (
  student_id IN (
    SELECT student_id FROM public.students 
    WHERE supabase_user_id = auth.uid()
  )
);

-- Note: Run this migration in your Supabase SQL Editor
-- Make sure to test the policies after applying them
