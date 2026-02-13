# Action Plan - Fix Name Not Showing

## Current Status
✅ Code updated with extensive logging
✅ RLS policies fixed in SQL file
❌ Name still showing as "Student"

## What to Do Now

### Option 1: Debug with Logs (Recommended First)

Follow `DEBUG-STEPS.md` to see exactly where the name is being lost.

**Quick version:**
1. Clear localStorage and reload
2. Enter name "Vignesh" on login
3. Check console - should see "Stored in localStorage: Vignesh"
4. Click magic link
5. Check console - should see all the debug logs
6. Report back what you see

### Option 2: Test with Hardcoded Name

Follow `TEST-HARDCODED.md` to verify database works.

**Quick version:**
1. Temporarily hardcode name in authStore.js
2. Test signup
3. If it works → problem is name capture
4. If it doesn't → problem is database/RLS

### Option 3: Check Supabase Configuration

The most likely issue is **Supabase redirect URL configuration**.

**Steps:**
1. Go to Supabase Dashboard
2. Authentication → URL Configuration  
3. Under "Redirect URLs", add:
   ```
   http://localhost:3000/auth/callback
   ```
4. Save
5. Test again

## Most Likely Issues (in order)

### 1. Redirect URL Not Configured (90% likely)
**Symptom:** localStorage is null on callback page

**Fix:** Add redirect URL in Supabase dashboard

### 2. Domain Mismatch (5% likely)
**Symptom:** Login on localhost:3000, callback on 127.0.0.1:3000

**Fix:** Always use same domain

### 3. RLS Blocking Insert (3% likely)
**Symptom:** Name is captured but database has "Student"

**Fix:** Run updated RLS policies from supabase-migration.sql

### 4. Browser Privacy Settings (2% likely)
**Symptom:** localStorage doesn't work at all

**Fix:** Try different browser or disable privacy mode

## What I Need From You

To help you further, please run the debug steps and tell me:

1. **Console output from login page:**
   - Do you see "Stored in localStorage: Vignesh"?

2. **Console output from callback page:**
   - Do you see "localStorage before: Vignesh"?
   - What does "User metadata:" show?
   - What does "Creating new student with name:" show?

3. **Browser URLs:**
   - What's the URL on login page?
   - What's the URL after clicking magic link?

4. **Supabase Dashboard:**
   - Is `http://localhost:3000/auth/callback` in Redirect URLs?

## Quick Commands

**Clear everything:**
```javascript
localStorage.clear()
location.reload()
```

**Check localStorage:**
```javascript
console.log(localStorage.getItem('pendingStudentName'))
```

**Check auth state:**
```javascript
const auth = useAuthStore()
console.log('User:', auth.user)
console.log('Profile:', auth.studentProfile)
console.log('Name:', auth.studentName)
```

**Delete test data:**
```sql
DELETE FROM students WHERE email_id = 'your-email@example.com';
```

## Next Steps

1. ✅ Run DEBUG-STEPS.md
2. ✅ Check Supabase redirect URL configuration
3. ✅ Report console output
4. ⏳ I'll help you fix based on what you find
