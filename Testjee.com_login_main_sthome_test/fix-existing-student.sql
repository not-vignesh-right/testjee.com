-- Fix for existing student record that was created with wrong name
-- Run this AFTER running the main migration

-- First, let's see the current state
SELECT student_id, supabase_user_id, student_name, email_id 
FROM students 
WHERE email_id = 'chinmaypanghri@gmail.com';

-- Option 1: Update the existing record with correct name
-- Replace 'Chinmay Panghri' with the actual name you want
UPDATE students 
SET student_name = 'Chinmay Panghri',
    modification_date = NOW()
WHERE email_id = 'chinmaypanghri@gmail.com' 
  AND student_name = 'Student';

-- Option 2: Delete the incorrect record (if you want to test fresh signup)
-- Uncomment the line below if you want to delete and recreate
-- DELETE FROM students WHERE email_id = 'chinmaypanghri@gmail.com';

-- Verify the fix
SELECT student_id, supabase_user_id, student_name, email_id 
FROM students 
WHERE email_id = 'chinmaypanghri@gmail.com';
