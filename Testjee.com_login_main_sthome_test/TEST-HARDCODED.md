# Test with Hardcoded Name

This will help us determine if the issue is with name capture or database insertion.

## Temporary Change

Update `src/stores/authStore.js` to hardcode the name:

```javascript
// In fetchOrCreateStudent(), replace this line:
const userName = user.value.user_metadata?.name || 
                 localStorage.getItem('pendingStudentName') || 
                 'Student'

// With this:
const userName = 'VIGNESH HARDCODED TEST'
```

## Test Steps

1. Delete existing student record:
```sql
DELETE FROM students WHERE email_id = 'your-email@example.com';
```

2. Delete from Supabase Auth:
- Dashboard → Authentication → Users
- Delete your test user

3. Clear browser:
```javascript
localStorage.clear()
```

4. Sign up again with any name/email

5. Check database:
```sql
SELECT student_name FROM students ORDER BY creation_date DESC LIMIT 1;
```

## Expected Results

**If it shows "VIGNESH HARDCODED TEST":**
✅ Database insertion works fine
❌ Problem is with name capture (localStorage or user_metadata)

**If it still shows "Student":**
❌ Problem is with database insertion or RLS policies
Need to check RLS policies

## If Database Works

The issue is definitely in name capture. Most likely causes:

1. **localStorage not persisting** - Different domain between login and callback
2. **user_metadata not working** - Supabase limitation with magic links
3. **Redirect URL mismatch** - Check Supabase dashboard settings

## Revert After Testing

Don't forget to change it back to:
```javascript
const userName = user.value.user_metadata?.name || 
                 localStorage.getItem('pendingStudentName') || 
                 'Student'
```
