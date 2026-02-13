# Setup Guide - Student Name Persistence

## Quick Start

### Step 1: Apply Database Migration
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-migration.sql`
4. Click "Run" to execute the migration
5. Verify the changes:
   ```sql
   -- Check if column exists
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'students' 
   AND column_name = 'supabase_user_id';
   
   -- Check RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('students', 'results');
   ```

### Step 2: Test the Application
1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:3000`

3. Test new user signup:
   - Enter name: "John Doe"
   - Enter email: your-email@example.com
   - Click "Send Magic Link"
   - Check email and click the link
   - Verify name appears in HeaderBar

4. Check database:
   ```sql
   SELECT student_id, student_name, email_id, supabase_user_id 
   FROM students 
   ORDER BY creation_date DESC 
   LIMIT 5;
   ```

### Step 3: Test Exam Submission
1. Navigate through exam questions
2. Answer some questions
3. Click "Submit Exam"
4. Verify in database:
   ```sql
   SELECT r.result_id, r.student_id, s.student_name, r.score 
   FROM results r
   JOIN students s ON r.student_id = s.student_id
   ORDER BY r.created_at DESC
   LIMIT 5;
   ```

## Troubleshooting

### Issue: Name shows as "Student" instead of entered name
**Solution:** 
- Check if `supabase_user_id` column exists in students table
- Verify localStorage has `pendingStudentName` before clicking magic link
- Check browser console for errors in `fetchOrCreateStudent()`

### Issue: student_id is still null in results
**Solution:**
- Ensure `authStore.fetchOrCreateStudent()` is called in AuthCallback
- Check that `authStore.studentId` has a value before submitting
- Verify RLS policies allow insert with student_id

### Issue: "Row Level Security" error
**Solution:**
- Make sure RLS policies are created (run migration SQL)
- Verify user is authenticated before accessing protected routes
- Check Supabase logs for policy violations

### Issue: Duplicate student records
**Solution:**
- Ensure `supabase_user_id` has UNIQUE constraint
- Check that `fetchOrCreateStudent()` queries by `supabase_user_id`, not email
- Clear test data: `DELETE FROM students WHERE email_id = 'test@example.com';`

## Development Tips

### Clear Test Data
```sql
-- Remove test students
DELETE FROM students WHERE email_id LIKE '%test%';

-- Remove test results
DELETE FROM results WHERE student_id IS NULL;
```

### Check Auth Session
```javascript
// In browser console
const { data } = await supabase.auth.getSession()
console.log(data.session?.user)
```

### Debug Student Profile
```javascript
// In browser console (with Vue DevTools)
const auth = useAuthStore()
console.log('Student Profile:', auth.studentProfile)
console.log('Student Name:', auth.studentName)
console.log('Student ID:', auth.studentId)
```

## Production Checklist

Before deploying to production:

- [ ] Supabase migration applied
- [ ] RLS policies tested and working
- [ ] Email redirect URL updated in Supabase Auth settings
- [ ] Test with real email addresses
- [ ] Verify student data privacy (users can only see their own data)
- [ ] Test logout and re-login flow
- [ ] Verify exam submission with correct student_id
- [ ] Check results are properly associated with students
