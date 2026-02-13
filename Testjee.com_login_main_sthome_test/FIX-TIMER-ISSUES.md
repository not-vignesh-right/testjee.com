# Fix Timer & Submission Issues

## 🐛 Issues Fixed

### **1. Timer Shows 00:00:00**
**Cause:** Old session expired but not marked as submitted

**Fix:** Now properly handles expired sessions:
- Checks if time expired
- Marks session as submitted
- Prevents loading exam
- Sets `isSubmitted = true`

### **2. RLS Policy Blocking Submission (403)**
**Cause:** Row Level Security policy not configured correctly

**Fix:** Run `fix-rls-policies.sql` to update policies

### **3. Double Submit Error (409)**
**Cause:** Trying to submit already-submitted session

**Fix:** Added checks to prevent double submission

---

## 🔧 Steps to Fix Your Database

### **Step 1: Fix RLS Policies**
Run in Supabase SQL Editor:
```sql
-- Copy and run: fix-rls-policies.sql
```

### **Step 2: Clean Up Stuck Sessions**
Run in Supabase SQL Editor:
```sql
-- Copy and run: cleanup-stuck-sessions.sql
```

This will:
- Find expired sessions
- Mark them as submitted
- Allow students to start fresh

### **Step 3: Test with Fresh Session**
For the student with 00:00:00 timer:
```sql
-- Delete their stuck session (TESTING ONLY)
DELETE FROM exam_sessions 
WHERE student_id = (
  SELECT student_id FROM students 
  WHERE email_id = 'your-email@example.com'
);

-- Delete their results (TESTING ONLY)
DELETE FROM results 
WHERE student_id = (
  SELECT student_id FROM students 
  WHERE email_id = 'your-email@example.com'
);
```

---

## 🧪 Test the Fixes

### **Test 1: Normal Submission**
1. Start fresh exam
2. Answer some questions
3. Click submit
4. ✅ Should submit successfully
5. ✅ Should redirect to results

### **Test 2: Expired Session**
1. Find a session that's expired (or wait for timer to hit 0)
2. Try to access /exam
3. ✅ Should NOT load exam
4. ✅ Should mark session as submitted
5. ✅ Should redirect to results (or show message)

### **Test 3: Double Submit**
1. Submit exam
2. Try to submit again
3. ✅ Should show "already submitted" message
4. ✅ Should not create duplicate results

---

## 📊 Check Your Database

### **Find Problematic Sessions:**
```sql
-- Sessions that are expired but not submitted
SELECT 
  es.session_id,
  s.email_id,
  es.start_time,
  EXTRACT(EPOCH FROM (NOW() - es.start_time))::INTEGER as elapsed,
  es.total_duration_seconds as allowed,
  es.is_submitted
FROM exam_sessions es
JOIN students s ON es.student_id = s.student_id
WHERE es.is_submitted = FALSE
  AND EXTRACT(EPOCH FROM (NOW() - es.start_time)) > es.total_duration_seconds;
```

### **Check RLS Policies:**
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('exam_sessions', 'results', 'students')
ORDER BY tablename, policyname;
```

---

## 🎯 What Each Fix Does

### **Code Fix 1: Expired Session Handling**
```javascript
if (remainingTime.value <= 0) {
  // Don't try to submit - just mark as done
  await supabase
    .from('exam_sessions')
    .update({ is_submitted: true, end_time: NOW() })
    .eq('session_id', sessionId)
  
  isSubmitted.value = true
  return null // Don't load exam
}
```

### **Code Fix 2: Prevent Double Submit**
```javascript
if (isSubmitted.value) {
  return { success: false, message: 'Already submitted' }
}
```

### **Code Fix 3: Safe Session Update**
```javascript
.update({ is_submitted: true })
.eq('session_id', sessionId)
.eq('is_submitted', false) // Only if not already submitted
```

---

## ⚠️ Important Notes

### **For Students with Stuck Sessions:**
1. Run cleanup SQL to mark expired sessions as submitted
2. Delete their session to allow retake (testing only)
3. They can start fresh exam

### **For Production:**
- Don't delete sessions (audit trail)
- Expired sessions should auto-mark as submitted
- Students get one attempt per exam

### **RLS Policies:**
- MUST be configured correctly
- Students can only insert their own results
- Students can only view their own results

---

## 🔮 Prevention

### **These fixes prevent:**
- ✅ Expired sessions loading exam
- ✅ Double submission errors
- ✅ RLS policy violations
- ✅ 409 conflict errors
- ✅ Stuck sessions

### **Going forward:**
- Sessions auto-expire properly
- Clean error messages
- No stuck states
- Fair exam experience

---

## ✨ Summary

### **Run These SQL Scripts:**
1. ✅ `fix-rls-policies.sql` - Fix RLS
2. ✅ `cleanup-stuck-sessions.sql` - Clean up expired sessions

### **Code Changes:**
1. ✅ Handle expired sessions properly
2. ✅ Prevent double submission
3. ✅ Safe session updates

### **Result:**
- No more 00:00:00 timer bugs
- No more 403 RLS errors
- No more 409 conflict errors
- Clean exam experience

**Run the SQL scripts and restart your dev server!** 🚀
