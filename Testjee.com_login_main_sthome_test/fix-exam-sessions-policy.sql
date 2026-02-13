-- Fix exam_sessions UPDATE policy to allow marking as submitted

-- Drop existing policy
DROP POLICY IF EXISTS "Students can update own sessions" ON public.exam_sessions;

-- Recreate with WITH CHECK clause
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

-- Verify the policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'exam_sessions';
