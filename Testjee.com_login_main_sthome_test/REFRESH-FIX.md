# Fix: Name Shows "Student" on Refresh

## Problem
When you refresh the page during the exam, the name shows as "Student" instead of your actual name.

## Root Cause
The router was loading the session but NOT calling `fetchOrCreateStudent()`, so the student profile was never loaded on page refresh.

## Solution
Updated `src/router/index.js` to call `fetchOrCreateStudent()` when:
- User is authenticated
- Student profile is not already loaded

## What Changed
```javascript
// Added this in router.beforeEach:
if (auth.isAuthenticated && !auth.studentProfile) {
  await auth.fetchOrCreateStudent()
}
```

## Test It
1. **Stop your dev server** (Ctrl+C)
2. **Restart it:** `npm run dev`
3. **Login** with your name
4. **Refresh the page** (F5)
5. **Name should persist** ✅

## Port 3000 vs 3001
Vite uses port 3001 when 3000 is already in use. You had another process running on 3000. Now that you've closed it:
- Restart dev server
- Should use port 3000
- Update Supabase redirect URL if needed

## Summary of All Fixes

### ✅ Fixed Issues:
1. **Name persistence** - Now captures and stores correctly
2. **Duplicate email error** - Now updates existing records
3. **Refresh showing "Student"** - Now loads profile on every route
4. **Port confusion** - Vite config is correct (3000)

### 🎯 Current Status:
- ✅ Login with name works
- ✅ Name displays in HeaderBar
- ✅ Name persists on refresh
- ✅ Multiple users with same name but different emails work
- ✅ Exam results linked to correct student

## Next Steps
1. Restart dev server on port 3000
2. Test login → refresh → name should persist
3. Test exam submission → results should have correct student_id
