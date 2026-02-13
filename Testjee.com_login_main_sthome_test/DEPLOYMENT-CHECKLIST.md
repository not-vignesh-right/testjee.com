# Deployment Checklist - Student Name Persistence

## Pre-Deployment Steps

### 1. Database Migration
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy contents of `supabase-migration.sql`
- [ ] Execute the SQL migration
- [ ] Verify column exists:
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'students' AND column_name = 'supabase_user_id';
  ```
- [ ] Verify RLS is enabled:
  ```sql
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE tablename IN ('students', 'results');
  ```

### 2. Code Review
- [ ] Review changes in `src/stores/authStore.js`
- [ ] Review changes in `src/stores/examStore.js`
- [ ] Review changes in `src/components/AuthCallback.vue`
- [ ] Review changes in `src/components/Login.vue`
- [ ] Review changes in `src/components/HeaderBar.vue`
- [ ] Run `npm run build` to check for build errors
- [ ] No TypeScript/ESLint errors

### 3. Local Testing
- [ ] Start dev server: `npm run dev`
- [ ] Test new user signup flow:
  - [ ] Enter name and email on login page
  - [ ] Receive magic link email
  - [ ] Click magic link
  - [ ] Verify name appears in HeaderBar
  - [ ] Check database for new student record
- [ ] Test exam submission:
  - [ ] Answer some questions
  - [ ] Submit exam
  - [ ] Verify `student_id` is not null in results table
- [ ] Test returning user:
  - [ ] Logout
  - [ ] Login with same email
  - [ ] Verify existing name is displayed
  - [ ] No duplicate student records created

### 4. Database Verification
- [ ] Check students table:
  ```sql
  SELECT student_id, student_name, email_id, supabase_user_id 
  FROM students 
  ORDER BY creation_date DESC LIMIT 10;
  ```
- [ ] Check results table:
  ```sql
  SELECT r.result_id, r.student_id, s.student_name, r.score 
  FROM results r
  LEFT JOIN students s ON r.student_id = s.student_id
  ORDER BY r.created_at DESC LIMIT 10;
  ```
- [ ] Verify no null student_ids in results
- [ ] Verify all students have supabase_user_id

## Deployment Steps

### 5. Environment Configuration
- [ ] Update Supabase Auth redirect URL:
  - Development: `http://localhost:3000/auth/callback`
  - Production: `https://yourdomain.com/auth/callback`
- [ ] Verify Supabase environment variables:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Update email templates in Supabase (if needed)

### 6. Build & Deploy
- [ ] Run production build: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Deploy to hosting platform (Vercel/Netlify/etc.)
- [ ] Verify deployment URL is accessible

### 7. Post-Deployment Testing
- [ ] Test signup flow on production
- [ ] Test login flow on production
- [ ] Test exam submission on production
- [ ] Verify emails are being sent
- [ ] Check production database for correct data

## Security Verification

### 8. RLS Policy Testing
- [ ] Login as User A
- [ ] Note User A's student_id
- [ ] Try to access User B's data (should fail):
  ```sql
  -- This should return empty if RLS is working
  SELECT * FROM students WHERE student_id != [User A's ID];
  ```
- [ ] Verify User A can only see their own results
- [ ] Test in browser console:
  ```javascript
  // Should only return current user's data
  const { data } = await supabase.from('students').select('*')
  console.log(data)
  ```

### 9. Data Privacy
- [ ] Verify students cannot see other students' profiles
- [ ] Verify students cannot see other students' results
- [ ] Test unauthorized access attempts
- [ ] Check Supabase logs for policy violations

## Rollback Plan

### 10. Prepare Rollback (if needed)
- [ ] Document current git commit hash
- [ ] Backup production database:
  ```sql
  -- Export students table
  COPY students TO '/tmp/students_backup.csv' CSV HEADER;
  
  -- Export results table
  COPY results TO '/tmp/results_backup.csv' CSV HEADER;
  ```
- [ ] Keep previous deployment accessible
- [ ] Document rollback SQL:
  ```sql
  -- Disable RLS
  ALTER TABLE students DISABLE ROW LEVEL SECURITY;
  ALTER TABLE results DISABLE ROW LEVEL SECURITY;
  
  -- Drop policies
  DROP POLICY IF EXISTS "Students can view own profile" ON students;
  -- (etc.)
  ```

## Monitoring

### 11. Post-Launch Monitoring
- [ ] Monitor Supabase logs for errors
- [ ] Check for failed authentication attempts
- [ ] Monitor database for null student_ids
- [ ] Track user signup success rate
- [ ] Monitor email delivery rate

### 12. User Feedback
- [ ] Verify users see their correct names
- [ ] Check for duplicate account issues
- [ ] Monitor support tickets for auth issues
- [ ] Collect feedback on login experience

## Documentation

### 13. Team Documentation
- [ ] Share `IMPLEMENTATION-NOTES.md` with team
- [ ] Share `SETUP-GUIDE.md` with developers
- [ ] Update project README if needed
- [ ] Document any production-specific configurations
- [ ] Add to team wiki/knowledge base

## Success Criteria

### 14. Validation
- [ ] ✅ All new signups create student records with names
- [ ] ✅ Student names persist across sessions
- [ ] ✅ All exam submissions have valid student_id
- [ ] ✅ No RLS policy violations in logs
- [ ] ✅ No duplicate student records
- [ ] ✅ Returning users see their existing profiles
- [ ] ✅ Zero null student_ids in new results

## Troubleshooting Reference

### Common Issues & Solutions

**Issue**: Name shows as "Student" instead of entered name
- Check user_metadata in Supabase Auth
- Verify localStorage has pendingStudentName
- Check fetchOrCreateStudent() is called

**Issue**: student_id is null in results
- Verify authStore.studentId has value
- Check fetchOrCreateStudent() completed
- Verify RLS policies allow insert

**Issue**: Duplicate student records
- Check UNIQUE constraint on supabase_user_id
- Verify query uses supabase_user_id, not email
- Clean up duplicates manually

**Issue**: RLS policy errors
- Verify policies are created
- Check auth.uid() matches supabase_user_id
- Review Supabase logs for details

## Sign-Off

- [ ] Technical Lead Approval: ________________
- [ ] QA Testing Complete: ________________
- [ ] Database Migration Verified: ________________
- [ ] Production Deployment Complete: ________________
- [ ] Post-Launch Monitoring Active: ________________

---

**Deployment Date**: ________________
**Deployed By**: ________________
**Git Commit**: ________________
**Notes**: ________________
