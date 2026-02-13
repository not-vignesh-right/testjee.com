-- Fix RLS policies that are blocking exam submission

-- Drop existing policies
DROP POLICY IF EXISTS "Students can insert own results" ON public.results;
DROP POLICY IF EXISTS "Students can view own results" ON public.results;

-- Recreate with correct logic
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

-- Verify policies are working
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'results';
