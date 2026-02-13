# Debug Steps - Name Not Persisting

## Current Situation
- You enter "Vignesh" but it shows "Student"
- Record is created with name "Student"
- Email is correct

## Root Cause Analysis
The name is being lost between login and callback. Let's find out where.

## Step-by-Step Debugging

### Step 1: Clear Everything First
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Step 2: Test Login Flow
1. Go to login page
2. Open browser console (F12)
3. Enter name: "Vignesh"
4. Enter email: your-email@example.com
5. Click "Send Magic Link"

**Expected Console Output:**
```
=== LOGIN: Storing name ===
Name entered: Vignesh
Email entered: your-email@example.com
Stored in localStorage: Vignesh
Magic link sent successfully
```

**Check:** Do you see this output? If not, the name field might not be binding correctly.

### Step 3: Verify localStorage
Before clicking the magic link, in console run:
```javascript
console.log('Name in localStorage:', localStorage.getItem('pendingStudentName'))
```

**Expected:** Should show "Vignesh"

### Step 4: Click Magic Link
Click the magic link in your email. You should be redirected to `/auth/callback`

**Expected Console Output:**
```
=== AUTH CALLBACK: Starting ===
localStorage before: Vignesh
Session loaded, user: {id: "...", email: "..."}
=== Fetching student for user: [UUID]
User metadata: {name: "Vignesh"} or {}
localStorage name: Vignesh
Creating new student with name: Vignesh
Created new student: {student_id: 1, student_name: "Vignesh", ...}
Student profile: {student_id: 1, student_name: "Vignesh", ...}
Student name: Vignesh
Redirecting to /exam
```

### Step 5: Check What Actually Happens

**Scenario A: localStorage is empty**
If you see:
```
localStorage before: null
```
This means localStorage was cleared between login and callback. Possible causes:
- Different domain/port
- Browser privacy settings
- Incognito mode

**Solution:** Check your redirect URL matches exactly:
```javascript
// In Login.vue, should be:
emailRedirectTo: 'http://localhost:3000/auth/callback'

// Check your actual URL in browser address bar
// Should be: http://localhost:3000 (not 127.0.0.1 or different port)
```

**Scenario B: user_metadata is empty**
If you see:
```
User metadata: {}
localStorage name: null
```
Both sources are empty. This means:
1. Supabase didn't store the metadata (known limitation)
2. localStorage was cleared

**Solution:** The issue is the redirect URL or localStorage scope.

**Scenario C: Name is there but still shows "Student"**
If you see:
```
Creating new student with name: Vignesh
```
But database has "Student", then there's an RLS issue.

**Solution:** Check RLS policies were updated.

## Quick Test: Manual localStorage

Try this to test if localStorage works:

1. **On login page**, before entering anything:
```javascript
localStorage.setItem('test', 'hello')
console.log('Set test:', localStorage.getItem('test'))
```

2. **Click magic link and on callback page**:
```javascript
console.log('Get test:', localStorage.getItem('test'))
```

If "test" is null on callback page, localStorage is not persisting across the redirect.

## Common Issues & Fixes

### Issue 1: Different Domains
**Problem:** Login is on `localhost:3000` but callback redirects to `127.0.0.1:3000`

**Fix:** Always use the same domain. Update Supabase redirect URL:
```javascript
// In Login.vue
emailRedirectTo: window.location.origin + '/auth/callback'
```

### Issue 2: Supabase Redirect URL Not Configured
**Problem:** Supabase rejects the redirect

**Fix:** 
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add to "Redirect URLs": `http://localhost:3000/auth/callback`

### Issue 3: Browser Blocking localStorage
**Problem:** Privacy settings or incognito mode

**Fix:** 
- Disable incognito mode
- Check browser settings allow localStorage
- Try different browser

### Issue 4: Name Field Not Binding
**Problem:** v-model not working

**Fix:** Check in console when typing:
```javascript
// Add this temporarily to Login.vue
watch(name, (newVal) => {
  console.log('Name changed to:', newVal)
})
```

## Nuclear Option: Hardcode for Testing

If nothing works, temporarily hardcode the name to test the rest of the flow:

```javascript
// In src/stores/authStore.js, in fetchOrCreateStudent()
const userName = 'HARDCODED TEST NAME' // Temporarily hardcode
```

If this works, the issue is definitely in the name capture/storage, not the database logic.

## Report Back

After running these steps, tell me:
1. What console output do you see at each step?
2. Does localStorage persist from login to callback?
3. What does `user.value.user_metadata` contain?
4. What is the exact URL in your browser address bar on login page?
5. What is the exact URL after clicking magic link?

This will help me pinpoint the exact issue!
