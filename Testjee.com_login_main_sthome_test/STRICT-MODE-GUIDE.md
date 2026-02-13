# Strict Mode - Real Exam Simulation

## 🎯 Rules (Simulates Real Exam)

### **Once You Start, You MUST Finish:**

1. ✅ **Refresh = OK**
   - Answers preserved (localStorage)
   - Timer continues from server time
   - Resume exactly where you left off

2. ✅ **Close Tab = Can Resume**
   - IF localStorage intact → Resume with answers
   - IF localStorage cleared → Resume with empty answers (strict!)
   - Timer continues regardless

3. ✅ **Timer Expires = Auto-Submit**
   - At 0:00, exam auto-submits
   - Whatever answers you have are submitted
   - Cannot continue after time expires

4. ✅ **After Submit = Cannot Retake**
   - Once submitted, exam is done
   - Cannot access /exam route
   - Redirected to /results

5. ✅ **One Active Session**
   - Only one exam session at a time
   - Must finish current before starting new

---

## 🔒 What This Prevents

### **Cheating Attempts:**
- ❌ Cannot reset timer by refreshing
- ❌ Cannot restart exam after starting
- ❌ Cannot access exam after submitting
- ❌ Cannot have multiple sessions

### **Fair Exam:**
- ✅ Everyone gets same time (3 hours)
- ✅ Timer based on server (cannot manipulate)
- ✅ Auto-submit ensures no overtime
- ✅ One attempt per session

---

## 📋 Student Experience

### **Normal Flow:**
```
1. Login
2. Start exam (session created)
3. Answer questions
4. Submit
5. View results
✅ Perfect!
```

### **Accidental Refresh:**
```
1. Start exam
2. Answer 20 questions
3. Accidentally hit F5
4. ✅ Resume with all 20 answers
5. Continue exam
✅ No problem!
```

### **Close & Reopen (Quick):**
```
1. Start exam
2. Answer 10 questions
3. Close tab
4. Reopen in 5 minutes
5. ✅ Resume with all 10 answers
6. Continue exam
✅ Works fine!
```

### **Close & Reopen (Cache Cleared):**
```
1. Start exam
2. Answer 10 questions
3. Close tab
4. Clear browser cache
5. Reopen
6. ⚠️ Resume but answers are GONE
7. Timer still running
8. Must continue with empty answers
❌ This is strict mode - student's responsibility!
```

### **Timer Expires:**
```
1. Start exam
2. Answer questions
3. Timer hits 0:00
4. ✅ Auto-submit with current answers
5. Redirect to results
✅ Fair and automatic!
```

### **Try to Retake:**
```
1. Submit exam
2. Try to go to /exam
3. ✅ Redirected to /results
4. Cannot retake
✅ One attempt only!
```

---

## 🔧 Technical Implementation

### **1. Auto-Submit on Timer End:**
```javascript
const startTimer = () => {
  const timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timer)
      submitExam() // ← Auto-submit!
    }
  }, 1000)
}
```

### **2. Clear localStorage on Submit:**
```javascript
// After successful submission
localStorage.removeItem('examAnswers')
localStorage.removeItem('currentQuestionIndex')
```

### **3. Handle Expired Sessions:**
```javascript
if (remainingTime.value <= 0) {
  console.warn('Session time expired, auto-submitting...')
  await submitExam()
  return null
}
```

### **4. Handle Missing localStorage:**
```javascript
const savedAnswers = localStorage.getItem('examAnswers')
if (savedAnswers) {
  userAnswers.value = JSON.parse(savedAnswers)
} else {
  console.warn('⚠️ localStorage cleared - continuing with empty answers')
  // Continue anyway (strict mode)
}
```

---

## 🧪 Test Scenarios

### **Test 1: Normal Completion**
1. Start exam
2. Answer all 75 questions
3. Click submit
4. ✅ See results
5. Try to go back to /exam
6. ✅ Redirected to /results

### **Test 2: Timer Expiry**
1. Start exam
2. Wait for timer to hit 0:00 (or set short timer for testing)
3. ✅ Auto-submit should trigger
4. ✅ Redirect to results

### **Test 3: Refresh During Exam**
1. Start exam
2. Answer 10 questions
3. Refresh page
4. ✅ All 10 answers should be there
5. ✅ Timer should continue

### **Test 4: Close & Reopen**
1. Start exam
2. Answer 5 questions
3. Close browser completely
4. Reopen and login
5. ✅ Should resume exam
6. ✅ Answers should be there (if localStorage intact)

### **Test 5: localStorage Cleared**
1. Start exam
2. Answer 10 questions
3. Open DevTools → Application → Clear localStorage
4. Refresh
5. ⚠️ Answers gone but exam continues
6. Timer still running
7. Can continue with empty answers

---

## 📊 Database State

### **Active Session:**
```sql
SELECT * FROM exam_sessions 
WHERE student_id = 123 
  AND is_submitted = FALSE;

-- Shows:
session_id: 1
student_id: 123
start_time: 2024-01-15 10:00:00
is_submitted: FALSE
```

### **After Submit:**
```sql
SELECT * FROM exam_sessions 
WHERE student_id = 123;

-- Shows:
session_id: 1
student_id: 123
start_time: 2024-01-15 10:00:00
end_time: 2024-01-15 12:30:00
is_submitted: TRUE
```

### **Results Linked:**
```sql
SELECT r.*, s.student_name 
FROM results r
JOIN students s ON r.student_id = s.student_id
WHERE r.session_id = 1;

-- Shows complete exam record
```

---

## ⚠️ Important Notes

### **For Students:**
1. **Don't clear browser cache during exam**
2. **Don't use incognito mode**
3. **Don't close tab unless necessary**
4. **Watch the timer!**
5. **Submit before time expires**

### **For Admins:**
1. Sessions are permanent records
2. Can track when students started/finished
3. Can see if exam was auto-submitted (end_time = start_time + 3 hours)
4. Can audit exam attempts

---

## 🎓 Why Strict Mode?

### **Simulates Real Exams:**
- Real JEE/NEET exams don't let you restart
- Real exams auto-submit at time limit
- Real exams don't save if you leave
- This prepares students for actual conditions

### **Fair for Everyone:**
- Everyone gets same rules
- No advantage from gaming system
- Clear expectations
- Professional exam experience

---

## 🔮 Future Enhancements

### **Could Add Later:**
- Practice mode (unlimited attempts)
- Pause functionality (with admin approval)
- Extra time for accommodations
- Session recovery (admin can restore)
- Proctoring integration

### **But For Now:**
Keep it strict and simple. This is the real exam experience! 💪

---

## ✨ Summary

### **Strict Mode = Real Exam:**
```
✅ One attempt
✅ Fixed time limit
✅ Auto-submit at end
✅ Cannot retake
✅ localStorage for convenience only
✅ Fair for all students
```

**This is how real exams work. Students need to be prepared!** 🎯
