-- Allow authenticated students to update their own support requests (e.g. to mark as completed when resuming)
DROP POLICY IF EXISTS "Students can update own support requests" ON public.exam_support_requests;

CREATE POLICY "Students can update own support requests" 
ON public.exam_support_requests 
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
