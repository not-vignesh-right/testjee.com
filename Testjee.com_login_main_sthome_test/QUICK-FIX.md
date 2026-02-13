# Quick Fix - Name Not Showing

## Your Current Issue
- Name entered: "Chinmay Panghri"
- Name shown: "Student"
- Record created in database with name "Student"
- 406 error in console

## Immediate Fix (3 Steps)

### Step 1: Update RLS Policies in Supabase
Copy and run this in Supabase SQL Editor:

```sql
-- Fix RLS policies to include TO authenticated
DROP POLICY IF EXISTS "Students can view own profile" ON students;
DROP POLICY IF EXISTS "Students can update own profile" ON students;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON students;

CREATE POLICY "Students can view own profile" 
ON students 
FOR SELECT 
TO authenticated
USING (auth.uid() = supabase_user_id);

CREATE POLICY "Students can update own profile" 
ON students 
FOR UPDATE 
TO authenticated
USING (auth.uid() = supabase_user_id);

CREATE POLICY "Allow insert for authenticated users" 
ON students 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = supabase_user_id);
```

### Step 2: Fix Your Existing Student Record
Run this in Supabase SQL Editor:

```sql
-- Update your existing record with correct name
UPDATE students 
SET student_name = 'Chinmay Panghri',
    modification_date = NOW()
WHERE email_id = 'chinmaypanghri@gmail.com';

-- Verify it worked
SELECT student_id, student_name, email_id 
FROM students 
WHERE email_id = 'chinmaypanghri@gmail.com';
```

### Step 3: Refresh Your App
1. In browser console, run:
   ```javascript
   localStorage.clear()
   location.reload()
   ```
2. Login again
3. Name should now show as "Chinmay Panghri"

## Why This Happened

1. **RLS Policy Issue**: The policies were missing `TO authenticated`, causing 406 errors
2. **Name Not Captured**: The student record was created before the name could be retrieved from localStorage/metadata
3. **Existing Record**: Once created with "Student", it won't update automatically

## Verify It's Fixed

After the fix, check:

1. **In Browser Console:**
   ```javascript
   const auth = useAuthStore()
   console.log(auth.studentName) // Should show "Chinmay Panghri"
   ```

2. **In HeaderBar:** Should display "Chinmay Panghri" under "Student Name"

3. **No 406 Errors:** Check Network tab, no more 406 errors

## Test With New User

To test the full flow with a new user:

1. **Delete your test record:**
   ```sql
   DELETE FROM students WHERE email_id = 'chinmaypanghri@gmail.com';
   ```

2. **Delete from Supabase Auth:**
   - Go to Supabase Dashboard → Authentication → Users
   - Find chinmaypanghri@gmail.com
   - Delete the user

3. **Clear browser:**
   ```javascript
   localStorage.clear()
   ```

4. **Sign up again:**
   - Enter name: "Chinmay Panghri"
   - Enter email: chinmaypanghri@gmail.com
   - Click magic link
   - Name should appear correctly

## If Still Not Working

Check the updated `authStore.js` has console.log statements:

```javascript
console.log('User metadata:', user.value.user_metadata)
console.log('localStorage name:', localStorage.getItem('pendingStudentName'))
console.log('Creating new student with name:', userName)
```

These will help debug where the name is being lost.

## Next Steps

1. Run Step 1 (RLS policies) - **REQUIRED**
2. Run Step 2 (fix existing record) - **REQUIRED**
3. Refresh app - **REQUIRED**
4. Test with new user (optional but recommended)
5. Check `TROUBLESHOOTING.md` if issues persist
