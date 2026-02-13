# Troubleshooting Guide - Student Name Persistence

## Issue: Name Shows as "Student" Instead of Entered Name

### Root Causes
1. **User metadata not persisting** - Supabase may not store metadata in magic link
2. **localStorage cleared** - Browser cleared before callback
3. **Existing record** - Student already exists with "Student" name

### Solution Steps

#### Step 1: Check What's Being Stored
Open browser console and check:
```javascript
// Check localStorage
console.log('Stored name:', localStorage.getItem('pendingStudentName'))

// Check user metadata after login
const { data } = await supabase.auth.getSession()
console.log('User metadata:', data.session?.user?.user_metadata)
```

#### Step 2: Fix Existing Student Record
If a student record already exists with "Student" name, update it:

```sql
-- In Supabase SQL Editor
UPDATE students 
SET student_name = 'Chinmay Panghri'
WHERE email_id = 'chinmaypanghri@gmail.com';
```

Or use the provided script: `fix-existing-student.sql`

#### Step 3: Test Fresh Signup
1. Delete existing student record:
   ```sql
   DELETE FROM students WHERE email_id = 'your-email@example.com';
   ```
2. Clear localStorage: `localStorage.clear()`
3. Logout from Supabase Auth
4. Try signup again with name

#### Step 4: Verify RLS Policies
The 406 error indicates RLS is blocking the query. Run this to fix:

```sql
-- Drop and recreate policies with TO authenticated
DROP POLICY IF EXISTS "Students can view own profile" ON students;

CREATE POLICY "Students can view own profile" 
ON students 
FOR SELECT 
TO authenticated
USING (auth.uid() = supabase_user_id);
```

## Issue: 406 Error - "No API key found"

### Root Cause
Row Level Security (RLS) policies are blocking the query, and the error message is misleading.

### Solution

#### Option 1: Update RLS Policies (Recommended)
Run the updated `supabase-migration.sql` which includes `TO authenticated` in policies:

```sql
-- Re-run the migration with updated policies
-- Copy entire supabase-migration.sql and run in SQL Editor
```

#### Option 2: Temporarily Disable RLS (Testing Only)
**WARNING: Only for local testing, NOT for production!**

```sql
-- Disable RLS temporarily
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- Test your app

-- Re-enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
```

#### Option 3: Check Supabase Anon Key
Verify your `.env` or Vite config has the correct keys:

```javascript
// src/lib/supabase.js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Make sure these are set correctly
console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key exists:', !!supabaseAnonKey)
```

## Issue: Student Record Created But Name Not Displayed

### Debugging Steps

1. **Check if studentProfile is loaded**
   ```javascript
   // In browser console with Vue DevTools
   const auth = useAuthStore()
   console.log('Student Profile:', auth.studentProfile)
   console.log('Student Name:', auth.studentName)
   ```

2. **Check if fetchOrCreateStudent was called**
   - Open browser console
   - Look for console.log messages from fetchOrCreateStudent
   - Should see: "Fetching student for user:", "Found existing student:", etc.

3. **Verify AuthCallback is calling the function**
   ```vue
   <!-- src/components/AuthCallback.vue should have: -->
   await auth.loadSession()
   await auth.fetchOrCreateStudent()  // ← Make sure this line exists
   ```

4. **Check database record**
   ```sql
   SELECT student_id, supabase_user_id, student_name, email_id 
   FROM students 
   WHERE email_id = 'your-email@example.com';
   ```

## Issue: Duplicate Student Records

### Root Cause
Multiple signups or missing UNIQUE constraint on `supabase_user_id`

### Solution

1. **Add UNIQUE constraint** (if missing)
   ```sql
   ALTER TABLE students 
   ADD CONSTRAINT students_supabase_user_id_unique 
   UNIQUE (supabase_user_id);
   ```

2. **Clean up duplicates**
   ```sql
   -- Find duplicates
   SELECT email_id, COUNT(*) 
   FROM students 
   GROUP BY email_id 
   HAVING COUNT(*) > 1;

   -- Keep the latest, delete older ones
   DELETE FROM students 
   WHERE student_id NOT IN (
     SELECT MAX(student_id) 
     FROM students 
     GROUP BY email_id
   );
   ```

## Issue: Name Persists But Wrong Name Shown

### Root Cause
- Cached studentProfile in Pinia store
- Browser cache

### Solution

1. **Clear Pinia store**
   ```javascript
   // In browser console
   const auth = useAuthStore()
   auth.$reset()
   ```

2. **Hard refresh browser**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Clear all caches**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   // Then hard refresh
   ```

## Complete Reset Procedure

If nothing works, do a complete reset:

### 1. Clear Frontend
```bash
# Stop dev server
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 2. Clear Browser
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
// Hard refresh: Ctrl+Shift+R
```

### 3. Clear Database
```sql
-- Delete test data
DELETE FROM results WHERE student_id IN (
  SELECT student_id FROM students WHERE email_id LIKE '%test%'
);
DELETE FROM students WHERE email_id LIKE '%test%';

-- Or delete specific user
DELETE FROM students WHERE email_id = 'your-email@example.com';
```

### 4. Clear Supabase Auth
In Supabase Dashboard:
- Go to Authentication → Users
- Find your test user
- Click "..." → Delete User

### 5. Test Fresh Signup
1. Start dev server: `npm run dev`
2. Go to login page
3. Enter name: "Test User"
4. Enter email: "test@example.com"
5. Click magic link
6. Verify name appears in HeaderBar

## Debugging Checklist

- [ ] RLS policies include `TO authenticated`
- [ ] `supabase_user_id` column exists in students table
- [ ] UNIQUE constraint on `supabase_user_id`
- [ ] `fetchOrCreateStudent()` is called in AuthCallback
- [ ] localStorage has `pendingStudentName` before clicking magic link
- [ ] User metadata includes name (check in console)
- [ ] No 406 errors in network tab
- [ ] studentProfile is populated in authStore
- [ ] HeaderBar imports and uses authStore (not examStore)
- [ ] No duplicate student records in database

## Still Not Working?

### Enable Debug Mode

Add this to `src/stores/authStore.js`:

```javascript
async function fetchOrCreateStudent() {
  console.log('=== DEBUG: fetchOrCreateStudent START ===')
  console.log('User:', user.value)
  console.log('User ID:', user.value?.id)
  console.log('User Email:', user.value?.email)
  console.log('User Metadata:', user.value?.user_metadata)
  console.log('localStorage name:', localStorage.getItem('pendingStudentName'))
  
  // ... rest of function
  
  console.log('=== DEBUG: fetchOrCreateStudent END ===')
  console.log('Final studentProfile:', studentProfile.value)
}
```

### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "students"
3. Look for the SELECT and INSERT requests
4. Check request headers (should have apikey)
5. Check response (should not be 406)

### Contact Support
If still stuck, provide:
1. Browser console logs
2. Network tab screenshot
3. Database schema for students table
4. RLS policies (from Supabase Dashboard)
5. Code from authStore.js and AuthCallback.vue
