# Timer Reset Fix - Prevent Infinite Time Exploit

## 🚨 Problem
Students could refresh the page and get infinite time by resetting the timer.

## ✅ Solution Implemented

### 1. Database: Exam Sessions Table
Created `exam_sessions` table to track:
- When each student starts an exam
- Total duration allowed
- Whether exam is submitted
- Prevents multiple active sessions

### 2. Server-Side Time Calculation
Timer is now calculated based on:
- **Server start time** (stored in database)
- **Current server time** (from database)
- **Elapsed time** = Current time - Start time
- **Remaining time** = Total duration - Elapsed time

### 3. Session Management
- First visit: Creates new session with start time
- Refresh: Resumes existing session with correct remaining time
- Submit: Marks session as completed

## 📋 Setup Steps

### Step 1: Run Database Migration
Copy and run `exam-session-migration.sql` in Supabase SQL Editor:

```sql
-- Creates exam_sessions table
-- Adds RLS policies
-- Links results to sessions
-- Adds helper function for time calculation
```

### Step 2: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Test the Fix

#### Test 1: Normal Flow
1. Login and start exam
2. Note the timer (e.g., 2:59:45)
3. Answer some questions
4. **Refresh the page** (F5)
5. ✅ Timer should continue from where it was (e.g., 2:58:30)
6. ❌ Timer should NOT reset to 3:00:00

#### Test 2: Resume After Closing
1. Start exam
2. Wait 5 minutes
3. Close browser completely
4. Open browser and login again
5. Go to exam
6. ✅ Timer should show ~2:55:00 remaining

#### Test 3: Prevent Multiple Sessions
1. Start exam in one browser
2. Try to open exam in another browser (same account)
3. ✅ Should resume the same session, not create new one

## 🔍 How It Works

### Database Schema
```sql
exam_sessions
├── session_id (PK)
├── student_id (FK → students)
├── exam_type ('JEE_MAIN_FULL')
├── start_time (TIMESTAMPTZ) ← Server time when exam started
├── end_time (TIMESTAMPTZ) ← NULL until submitted
├── total_duration_seconds (10800 = 3 hours)
└── is_submitted (BOOLEAN)
```

### Code Flow

**On First Visit:**
```javascript
1. initializeSession() called
2. Check for existing active session → None found
3. Create new session with start_time = NOW()
4. Set remainingTime = 10800 seconds (3 hours)
5. Start timer countdown
```

**On Refresh:**
```javascript
1. initializeSession() called
2. Check for existing active session → Found!
3. Calculate: elapsed = NOW() - start_time
4. Calculate: remainingTime = 10800 - elapsed
5. Resume timer from correct position
```

**On Submit:**
```javascript
1. submitExam() called
2. Mark session: is_submitted = TRUE, end_time = NOW()
3. Save results with session_id
4. Prevent further access to this exam
```

## 🛡️ Security Features

### 1. Unique Active Session Constraint
```sql
CONSTRAINT unique_active_session 
UNIQUE (student_id, exam_type, is_submitted)
```
- Only ONE active session per student per exam type
- Prevents creating multiple sessions to reset timer

### 2. Server-Side Time
- Timer based on database server time, not client time
- Student cannot manipulate by changing system clock
- Refresh doesn't affect server time

### 3. Row Level Security (RLS)
- Students can only see their own sessions
- Cannot modify other students' sessions
- Cannot delete sessions to reset timer

### 4. Session Validation
- Once submitted, session cannot be reused
- Expired sessions (time = 0) auto-submit
- Cannot start new session if active one exists

## 📊 Database Queries for Monitoring

### Check Active Sessions
```sql
SELECT 
  s.student_name,
  es.session_id,
  es.start_time,
  EXTRACT(EPOCH FROM (NOW() - es.start_time))::INTEGER as elapsed_seconds,
  es.total_duration_seconds - EXTRACT(EPOCH FROM (NOW() - es.start_time))::INTEGER as remaining_seconds,
  es.is_submitted
FROM exam_sessions es
JOIN students s ON es.student_id = s.student_id
WHERE es.is_submitted = FALSE
ORDER BY es.start_time DESC;
```

### Check Completed Exams
```sql
SELECT 
  s.student_name,
  es.start_time,
  es.end_time,
  EXTRACT(EPOCH FROM (es.end_time - es.start_time))::INTEGER as duration_seconds,
  r.score
FROM exam_sessions es
JOIN students s ON es.student_id = s.student_id
LEFT JOIN results r ON r.session_id = es.session_id
WHERE es.is_submitted = TRUE
ORDER BY es.end_time DESC;
```

### Find Suspicious Activity
```sql
-- Students who took longer than allowed
SELECT 
  s.student_name,
  EXTRACT(EPOCH FROM (es.end_time - es.start_time))::INTEGER as actual_duration,
  es.total_duration_seconds as allowed_duration
FROM exam_sessions es
JOIN students s ON es.student_id = s.student_id
WHERE es.is_submitted = TRUE
  AND EXTRACT(EPOCH FROM (es.end_time - es.start_time)) > es.total_duration_seconds + 60
ORDER BY actual_duration DESC;
```

## 🐛 Troubleshooting

### Issue: Timer still resets on refresh
**Check:**
1. Did you run the migration SQL?
2. Is `initializeSession()` being called in ExamLayout?
3. Check console for errors

**Debug:**
```javascript
// In browser console
const examStore = useExamStore()
console.log('Session ID:', examStore.sessionId)
console.log('Start Time:', examStore.sessionStartTime)
console.log('Remaining:', examStore.remainingTime)
```

### Issue: Cannot start exam (duplicate session error)
**Cause:** Active session already exists

**Fix:**
```sql
-- Delete active session to start fresh
DELETE FROM exam_sessions 
WHERE student_id = YOUR_STUDENT_ID 
  AND is_submitted = FALSE;
```

### Issue: Timer shows negative time
**Cause:** Session expired but not auto-submitted

**Fix:** The timer should auto-submit at 0. Check `startTimer()` function.

## 🎯 Benefits

✅ **No more timer reset exploit**
✅ **Fair exam timing for all students**
✅ **Resume capability** (close browser, come back later)
✅ **Audit trail** (track when students started/finished)
✅ **Prevent multiple attempts** (one session per exam)
✅ **Server-side validation** (cannot be manipulated by client)

## 📝 Next Steps

1. ✅ Run `exam-session-migration.sql`
2. ✅ Restart dev server
3. ✅ Test timer persistence on refresh
4. ✅ Test with multiple students
5. ✅ Monitor active sessions in database

## 🔮 Future Enhancements

- Add pause/resume functionality (with admin approval)
- Add extra time for students with accommodations
- Add proctoring integration
- Add session analytics dashboard
- Add automatic session cleanup for abandoned exams
