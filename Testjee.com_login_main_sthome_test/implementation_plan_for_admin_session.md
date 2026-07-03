# Complete Live Exam System — Deep Technical Implementation Plan

---

## Part 1: Root Cause Analysis (Every Bug, Exact Location)

### The Core Architectural Problem

The system has **two separate exam engines** that were never properly connected:

| Engine | Store | Tables | Used By |
|---|---|---|---|
| **Regular Exam** | `examStore.js` | `exam_sessions`, `results` | `ExamLayout.vue` + all sub-components |
| **Live Session Exam** | `examSessionStore.js` | `student_exam_sessions`, `live_exam_sessions` | `LiveExamInterface.vue` (custom, incomplete) |

`ExamLayout.vue` is the production-grade UI with fullscreen, anti-cheat, grace period, appeal/resume system, wake lock, and emergency submit. `LiveExamInterface.vue` is a lightweight prototype that has **none of these**. The fix is to use `ExamLayout.vue` for live sessions too, powered by a bridge layer.

---

### Bug Table (Line-Level Precision)

#### 🔴 BUG-01 — Exam screen is always blank after student clicks "Start"
**File:** `ExamWaitingRoom.vue` → `beginExam()` function  
**Root Cause:** `store.startExam()` (calls `start_student_exam` RPC) returns only `questionOrder` — an array of question IDs. It does NOT return question content. The next required call is `store.loadQuestions()` (calls `get_student_exam_questions` RPC) which fetches the actual question text, choices, and images. This call is never made.  
**Result:** `LiveExamInterface.vue` renders with `store.questions = []`. Everything is blank. The exam is technically started in DB but student sees nothing.

```js
// CURRENT (broken) - ExamWaitingRoom.vue beginExam()
const res = await store.startExam()
if (!res.success) throw new Error(res.error)
router.push(`/live-exam/${route.params.sessionCode}/active`)

// FIXED
const res = await store.startExam()
if (!res.success) throw new Error(res.error)
const loadRes = await store.loadQuestions()  // ← THIS LINE IS MISSING
if (!loadRes.success) throw new Error('Failed to load questions')
// Then bridge + navigate (see Part 3)
```

---

#### 🔴 BUG-02 — Double-start corrupts session
**File:** `LiveExamInterface.vue` → `onMounted` → lines 367–372  
**Root Cause:** If `store.examStatus !== 'in_progress'`, the component calls `store.startExam()` again as a "fallback". But `startExam()` calls `start_student_exam` RPC which sets a new `question_order` in the DB row, overwriting the already-set order. Time tracking also restarts. This can desync the student's question sequence from what the DB has.

```js
// CURRENT (broken) — LiveExamInterface.vue onMounted
if (store.examStatus !== 'in_progress') {
  await store.startExam()   // ← WRONG: double-starts, corrupts question_order
}
```

**Fix:** Remove this fallback entirely. `ExamWaitingRoom.vue` is the ONLY place `startExam()` should be called. If a student navigates back and re-enters, `examSessionStore` already has `examStatus = 'in_progress'` in memory and the DB row is intact.

---

#### 🔴 BUG-03 — Timer never starts for live exam
**File:** `LiveExamInterface.vue` — the component calls `store.loadQuestions()` in `onMounted` but never calls `store.startTimer()`. The `examSessionStore.startTimer()` method IS defined and works correctly — it was just never called after questions loaded.  
**File:** `examSessionStore.js` → `startExam()` → line 121: timer IS started here (`startTimer()` is called) — but since BUG-01 prevents questions from loading, the student sees a blank screen even though the timer is counting in the background. The timer silently runs to zero and auto-submits an empty exam.

**Fix cascade:** BUG-01 fix → questions load → timer already running from `startExam()` ✅

---

#### 🔴 BUG-04 — Timer based on wrong reference point
**File:** `examSessionStore.js` → `calculateTimeRemaining()` → line 286  
**Root Cause:** Uses `sessionDetails.scheduledEndTime` (the originally scheduled end). But when admin clicks **"Start Early"**, the exam starts before the scheduled time. The `scheduled_end_time` in the DB is still the original end, but the actual per-student end time is `student_exam_start_time + duration_minutes`. These are different times.

**Example:** Session scheduled 10:00–13:00. Admin starts at 09:45. Student starts at 09:47. `scheduled_end_time` = 13:00. `student_actual_end` = 09:47 + 180min = 12:47. Student gets 13min extra time silently.

**Fix:** `start_student_exam` RPC should return `personal_end_time = start_time + duration`. The store should use this for the countdown, not `scheduled_end_time`.

---

#### 🔴 BUG-05 — Resume appeal writes to wrong table/column
**File:** `AdminResumeRequests.vue` → `approveRequest()` → lines 258–262  
**Root Cause:** The approve function updates `exam_sessions` table:
```js
const { error: sessErr } = await supabase
  .from('exam_sessions')       // ← WRONG TABLE for live sessions
  .update({ is_submitted: false, end_time: null })
  .eq('session_id', req.session_id)  // ← req.session_id is a live-session FK
```

The `exam_support_requests` table's `session_id` column (from `ExamLayout.vue`'s `submitSupportRequest`) references `exam_sessions.session_id` (regular exam table). But the live exam uses `student_exam_sessions` (separate table). If the column foreign key is different, this update silently does nothing.

**Fix:** 
- For **regular exam** appeals: update `exam_sessions` (current behavior ✅)
- For **live exam** appeals: update `student_exam_sessions` WHERE `student_session_id = req.student_session_id`
- The `exam_support_requests` table needs a `student_session_id` column added to distinguish the two types.

---

#### 🔴 BUG-06 — SessionCredentials uses wrong table name
**File:** `SessionCredentials.vue` → `fetchFromDatabase()` → line 174  
**Root Cause:** The DB fallback fetch queries `live_exam_students` table. But examining the `ExamLogin.vue` SQL fix snippet (line 233–236), the actual table is `temp_students` (with `admin_test_id` FK, joined to `live_exam_sessions` via `admin_test_id`).

```js
// CURRENT (broken)
const { data: studentsData } = await supabase
  .from('live_exam_students')   // ← TABLE DOES NOT EXIST
  .select('username')
  .eq('live_session_id', sessionId)

// FIXED
const { data: studentsData } = await supabase
  .from('temp_students')        // ← Correct table
  .select('username, student_name, roll_number')
  .eq('admin_test_id', sessionData.admin_test_id)
  .order('created_at', { ascending: true })
```

---

#### 🔴 BUG-07 — ExamResults crashes with no submissions
**File:** `ExamResults.vue` → `maxScore` computed → line 205  
**Root Cause:**
```js
const maxScore = computed(() => {
  if (results.value.length === 0) return 0
  return results.value[0].max_score  // ← if results[0].max_score is undefined, returns undefined
})
```
When session is live and no one has submitted yet, `results.value` is empty after the filter on line 193. `results.value[0]` is `undefined`. Even with the guard, `results.value[0].max_score` throws if somehow the guard is bypassed. Additionally `averageScore.toFixed(1)` on line 55 crashes if `averageScore` returns `NaN`.

**Fix:** 
```js
const maxScore = computed(() => results.value[0]?.max_score ?? sessionMeta.value?.max_score ?? 300)
const averageScore = computed(() => {
  if (!results.value.length) return 0
  return results.value.reduce((a, c) => a + (Number(c.score) || 0), 0) / results.value.length
})
```

---

#### 🟡 BUG-08 — ExamSubmitConfirmation: markedForReview count is always 0
**File:** `ExamSubmitConfirmation.vue` → line 45  
**Root Cause:** `store.markedForReview` in `examSessionStore` is a plain object `{}`. The template checks `store.markedForReview.size` — `.size` is a `Map` property, not applicable to plain objects. Result: always `undefined`, the warning banner never shows.

**Fix:**
```js
// Template: replace .size with Object.keys()
v-if="Object.keys(store.markedForReview).length > 0"
// Content: 
{{ Object.keys(store.markedForReview).length }} questions marked
```

---

#### 🟡 BUG-09 — ScheduleExam: subjects hardcoded, ignores category
**File:** `ScheduleExam.vue` → `handleCreateSession()` → line 229  
**Root Cause:**
```js
for (const subjectName of ['Physics', 'Chemistry', 'Mathematics']) { ... }
```
This is hardcoded. If admin selects NEET category, it still fetches Physics/Chemistry/Math (JEE subjects). NEET needs Physics/Chemistry/Botany/Zoology.

**Fix:** After selecting `category_id`, dynamically fetch which subjects belong to it:
```js
const { data: subjectRows } = await supabase
  .from('questions')
  .select('subjects!inner(subject_name)')
  .eq('category_id', formData.value.category_id)
  .limit(1000)

const uniqueSubjects = [...new Set(subjectRows.map(r => r.subjects.subject_name))]
```
Or better: maintain a `category → examType` mapping that derives the subject list from `EXAM_CONFIGS`.

---

#### 🟡 BUG-10 — Fisher-Yates shuffle missing (biased distribution)
**File:** `ScheduleExam.vue` → line 243  
**Root Cause:** `[...mcqs].sort(() => 0.5 - Math.random())` — this is a well-known incorrect shuffle. The distribution is non-uniform; some orderings appear more frequently than others. For a fair exam system, this matters.

**Fix:** Fisher-Yates:
```js
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
```
(Note: `examStore.js` already has a correct `shuffleArray` — reuse it)

---

#### 🟡 BUG-11 — StudentResults blocked by RLS
**File:** `StudentResults.vue` → `onMounted` → line 125  
**Root Cause:** Direct Supabase query to `student_exam_sessions` without a `SECURITY DEFINER` function. Row Level Security will prevent students from reading this table unless RLS policies explicitly allow it. If policies aren't set up, result is silently empty data or a permission error.

**Fix:** Create a Supabase RPC `get_my_live_exam_result(input_student_session_id)` with `SECURITY DEFINER` that returns the student's result safely.

---

#### 🟡 BUG-12 — ExamWaitingRoom: "Start Early" not detected fast enough
**File:** `ExamWaitingRoom.vue` → polling interval: 5 seconds  
**Root Cause:** Status polling runs every 5 seconds. When admin clicks "Start Early", up to 5 seconds pass before student's lobby updates. During that gap, students sit in lobby confused. Not a crash bug but a UX problem.

**Fix:** Add a Supabase Realtime subscription on `live_exam_sessions` for this session code as a primary notification mechanism, with polling as fallback.

---

#### 🟡 BUG-13 — Admin sessions list auto-redirects on back-button
**File:** `AdminLiveSessions.vue` → `onMounted` → lines 214–220  
**Root Cause:** When a live session exists, admin is forcibly redirected to the monitor. Using `?noRedirect=true` works only for manual navigation. After using browser back-button from the monitor, the URL won't have `?noRedirect=true` so admin is trapped in a redirect loop.

**Fix:** Use `router.replace` with a state flag:
```js
const hasSeenRedirect = sessionStorage.getItem(`redirected_${liveSession.live_session_id}`)
if (liveSession && !hasSeenRedirect) {
  sessionStorage.setItem(`redirected_${liveSession.live_session_id}`, '1')
  router.replace(`/admin/sessions/${liveSession.live_session_id}/monitor`)
}
```

---

#### 🟡 BUG-14 — ExamLayout.vue not usable for live sessions (auth guard)
**File:** `router/index.js` → line 83, and `ExamLayout.vue` → `onMounted` → line 373  
**Root Cause:** The `/exam` route has `meta: { requiresAuth: true }` which requires a Supabase authenticated user session. Live exam students are NOT authenticated via Supabase (they use temp student credentials via `examSessionStore`). Navigating to `/exam?mode=live` would fail the auth guard and redirect to login.

**Fix:** Add a bypass condition to the router guard:
```js
// router/index.js
if (to.path === '/exam' && to.query.mode === 'live') {
  // Live exam mode — student already authenticated via examSessionStore
  // Verify examSessionStore has an active session
  const liveStore = useExamSessionStore()
  if (!liveStore.studentSessionId) return next('/live-exam') // No live session = redirect
  return next() // Allow through
}
```
And in `ExamLayout.vue` `onMounted`:
```js
// Instead of checking auth.isAuthenticated for live mode:
if (isLiveMode.value) {
  if (!liveStore.studentSessionId) {
    router.push(`/live-exam`)
    return
  }
  // Skip regular exam init
  ...
}
```

---

## Part 2: Architecture — The Bridge Pattern (Definitive)

### Core Design

```
examSessionStore.js          examStore.js (ExamLayout engine)
─────────────────            ──────────────────────────────
loginToExam()         ──────────────────────────────────────
startExam()           ──→  bridge:  questions, remainingTime,
loadQuestions()       ──→           sessionId, answers,
                                    questionStatuses
                                          │
                                          ▼
                                   ExamLayout.vue
                              (ALL security features active)
                              - Fullscreen enforcement
                              - Tab-switch detection
                              - Grace period (10s warning)
                              - Emergency submit
                              - Wake Lock API
                              - Appeal / resume form
                              - Subject tabs via HeaderBar
                              - Question palette
                              - Mark for review
                              - Numeric limit enforcement
                              - Anti-copy/paste/F12
```

### Data Mapping (examSessionStore → examStore)

The live exam questions from `get_student_exam_questions` RPC return:
```js
// examSessionStore.questions[i] shape (from RPC)
{
  question_id: 42,
  question_number: 1,
  question_type: 'multiple_choice',
  question_content: { text: '...', stem: '...' },
  image_url: 'https://...',
  selected_answer: 'a',    // previously saved
  is_marked_for_review: false,
  time_spent_seconds: 45,
  choices: {
    choice1: { text: 'Option A' },
    choice2: { text: 'Option B' },
    choice3: { text: 'Option C' },
    choice4: { text: 'Option D' },
    correct_answer: 'b'
  }
}
```

`examStore.questions[i]` shape (what ExamLayout's sub-components expect):
```js
{
  id: 42,                          // maps from question_id
  text: '...',                     // maps from question_content.text
  image_url: 'https://...',
  subject: 'Physics',              // ← needs to come from question_number grouping
  topic: 'Optics',
  question_type: 'multiple_choice',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ]
}
```

**Key gap:** The live RPC doesn't return `subject` per question. The `get_student_exam_questions` RPC should be updated to `JOIN subjects ON questions.subject_id = subjects.subject_id` and return `subject_name`. This is a DB-level fix.

### The Bridge Function (exact code)

New file: `src/stores/liveExamBridge.js`

```js
import { useExamStore } from './examStore'
import { useExamSessionStore } from './examSessionStore'
import { EXAM_CONFIGS } from '../data/examConfigs'

/**
 * Copies live exam session data into examStore so ExamLayout.vue can run it.
 * Call this AFTER examSessionStore.loadQuestions() has populated questions.
 */
export async function bridgeLiveSessionToExamStore() {
  const examStore = useExamStore()
  const liveStore = useExamSessionStore()

  if (!liveStore.questions || liveStore.questions.length === 0) {
    throw new Error('No questions loaded in examSessionStore. Call loadQuestions() first.')
  }

  // --- 1. Build examStore-format questions ---
  // Determine subject grouping from question_number ranges
  // The RPC question_order determines how questions are grouped by subject.
  // We rely on the question having a subject_name field (DB fix needed).
  const mappedQuestions = liveStore.questions.map(q => ({
    id: q.question_id,
    text: q.question_content?.text || q.question_content?.stem || '',
    image_url: q.image_url || null,
    subject: q.subject_name || deriveSubjectFromNumber(q.question_number, liveStore.sessionDetails),
    topic: q.topic_name || '',
    question_type: q.question_type,
    options: q.question_type === 'multiple_choice' ? [
      { id: 'a', text: q.choices?.choice1?.text || q.choices?.choice1 || '' },
      { id: 'b', text: q.choices?.choice2?.text || q.choices?.choice2 || '' },
      { id: 'c', text: q.choices?.choice3?.text || q.choices?.choice3 || '' },
      { id: 'd', text: q.choices?.choice4?.text || q.choices?.choice4 || '' },
    ] : null,
    correct_answer: q.choices?.correct_answer || null // Only used at submit
  }))

  // --- 2. Set questions ---
  examStore.questions = mappedQuestions

  // --- 3. Restore saved answers ---
  examStore.userAnswers = { ...liveStore.answers }

  // --- 4. Restore marked for review ---
  const statuses = {}
  mappedQuestions.forEach(q => {
    statuses[q.id] = {
      visited: true,
      answered: !!liveStore.answers[q.question_id],
      marked: !!liveStore.markedForReview[q.question_id]
    }
  })
  examStore.questionStatuses = statuses

  // --- 5. Set timer from server-authoritative end time ---
  // Use personal end time (student's start + duration), NOT scheduled_end_time
  const endTime = liveStore.sessionDetails.personalEndTime
    || liveStore.sessionDetails.scheduledEndTime

  const nowMs = Date.now()
  const endMs = new Date(endTime).getTime()
  examStore.remainingTime = Math.max(0, Math.floor((endMs - nowMs) / 1000))

  // --- 6. Set sessionId for examStore submit to reference ---
  // This is the live student_exam_sessions ID (NOT exam_sessions)
  // Store it separately so ExamLayout knows which system to submit to
  examStore.liveStudentSessionId = liveStore.studentSessionId
  examStore.isLiveMode = true

  // --- 7. Set exam type for marking scheme ---
  // Derive from session category — map category_id to exam type
  examStore.examType = liveStore.sessionDetails.examType || 'JEE_MAIN_FULL'

  console.log(`✅ Bridge complete: ${mappedQuestions.length} questions, ${examStore.remainingTime}s remaining`)
}
```

---

## Part 3: ExamLayout.vue Changes (Exact)

### New State Variables
```js
import { useRoute } from 'vue-router'
import { useExamSessionStore } from '../stores/examSessionStore'

const route = useRoute()
const liveStore = useExamSessionStore()

// Live mode detection
const isLiveMode = computed(() => examStore.isLiveMode === true)
const liveSessionCode = computed(() => route.query.sessionCode)
```

### onMounted Override for Live Mode
```js
onMounted(async () => {
  // LIVE MODE: questions already loaded and bridged by ExamWaitingRoom
  if (isLiveMode.value) {
    if (!liveStore.studentSessionId) {
      router.push('/live-exam')
      return
    }
    setupSecurityListeners()
    showInstructions.value = false  // Skip instructions — lobby was the instructions
    isResumedSession.value = false
    examStore.startTimer()          // Timer uses examStore.remainingTime (already set by bridge)
    enforceFullScreen()
    await requestWakeLock()
    return  // ← CRITICAL: Skip the rest of onMounted
  }
  
  // Regular exam flow (unchanged below this point)
  if (!auth.isAuthenticated) return
  setupSecurityListeners()
  ...
})
```

### Submit Override for Live Mode
```js
// Override submitExam to route to live results
const handleExamSubmit = async (isAuto = false) => {
  if (isLiveMode.value) {
    examStore.isManuallySubmitting = !isAuto
    // Flush time tracking for current question first
    const currQ = examStore.currentQuestion
    if (currQ && examStore.currentStartTime) {
      const elapsed = (Date.now() - examStore.currentStartTime) / 1000
      examStore.timeSpent[currQ.id] = (examStore.timeSpent[currQ.id] || 0) + elapsed
    }
    // Submit via live exam store (writes to student_exam_sessions + score calc)
    const res = await liveStore.submitExam(isAuto)
    if (res.success) {
      examStore.isSubmitted = true
      router.push(`/live-exam/${liveSessionCode.value}/results`)
    }
    return
  }
  // Regular submit (unchanged)
  await examStore.submitExam()
}
```

### Appeal System for Live Mode
The existing `submitAppeal` function in `ExamLayout.vue` calls `examStore.submitSupportRequest()` which inserts to `exam_support_requests` table with `session_id = examStore.sessionId`.

In live mode, we need to insert with `student_session_id = liveStore.studentSessionId` as well.

**Modified `submitSupportRequest` call in live mode:**
```js
const submitAppeal = async () => {
  if (isLiveMode.value) {
    // Live mode: use examSessionStore's studentSessionId
    const res = await liveStore.submitSupportRequest(
      appealReason.value,
      appealCustomMessage.value,
      examStore.remainingTime,
      examStore.userAnswers,
      examStore.questions
    )
    // ... rest same
    return
  }
  // Regular mode (unchanged)
  ...
}
```

---

## Part 4: New ExamWaitingRoom.vue `beginExam()` (Complete)

```js
import { useExamStore } from '../../stores/examStore'
import { bridgeLiveSessionToExamStore } from '../../stores/liveExamBridge'

const beginExam = async () => {
  loadingStart.value = true
  
  try {
    // Step 1: Start exam in DB — gets question_order, creates student_exam_sessions row
    const startRes = await store.startExam()
    if (!startRes.success) throw new Error(startRes.error || 'Failed to start exam')

    // Step 2: Load question content (text, choices, images) from DB
    const loadRes = await store.loadQuestions()
    if (!loadRes.success) throw new Error('Failed to load questions from server')

    // Step 3: Bridge data into examStore for ExamLayout.vue
    await bridgeLiveSessionToExamStore()

    // Step 4: Navigate to the full exam UI (ExamLayout.vue with live mode)
    router.push(`/exam?mode=live&sessionCode=${route.params.sessionCode}`)

  } catch(err) {
    console.error('Failed to begin exam:', err)
    alert(err.message || 'Could not start exam. Please refresh and try again.')
    loadingStart.value = false
  }
}
```

---

## Part 5: New Admin Features (Complete List)

### Existing Features (Keep + Fix)
1. Dashboard with test/student usage bars
2. Session list with tabs (All/Scheduled/Live/Completed)
3. Schedule New Exam form
4. Session Credentials printable page
5. Live Monitor with force-end
6. Results leaderboard
7. Resume requests queue

### New Features to Add

#### 📊 Feature: Real-Time Dashboard Enhancement
**Location:** `AdminHome.vue`  
**What:** Add a "Live Activity" card that appears when any session is live
- Shows: session name, enrolled/in-progress/submitted counts
- One-click "Go to Monitor" button
- Auto-disappears when no live sessions
- Pending resume requests count with direct link

#### 📤 Feature: Export Results to Excel/CSV
**Location:** `ExamResults.vue` — replace the "Export Excel (WIP)" stub  
**What:** Generate and download CSV of the leaderboard  
```js
const exportCSV = () => {
  const rows = [
    ['Rank', 'Student Name', 'Roll Number', 'Score', 'Max Score', 'Percentage', 'Time Taken', 'Status'],
    ...results.value.map(s => [
      s.rank, s.student_name, s.roll_number,
      s.score, maxScore.value,
      Number(s.percentage).toFixed(1) + '%',
      formatDuration(s.time_taken_seconds),
      s.status
    ])
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `${sessionMeta.value.session_name}_results.csv`
  a.click()
}
```

#### 📋 Feature: Session Duplication
**Location:** `AdminLiveSessions.vue` — add "Duplicate" action on completed sessions  
**What:** Admin clicks "Duplicate" → pre-fills `ScheduleExam.vue` form with same category, duration, student count, instructions. Admin just picks a new start time and creates.

#### 🔔 Feature: Real-Time Resume Request Notifications
**Location:** `AdminLayout.vue` badge + new toast system  
**What:** Use Supabase Realtime subscription on `exam_support_requests` instead of polling every 30s
```js
// In AdminLayout.vue
const subscription = supabase
  .channel('resume-requests')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'exam_support_requests',
    filter: 'status=eq.pending'
  }, (payload) => {
    pendingResumeCount.value++
    showToast(`New resume request from ${payload.new.student_name}`)
  })
  .subscribe()
```

#### 📈 Feature: Per-Student Answer Breakdown in Results
**Location:** `ExamResults.vue` — expandable row  
**What:** Click a student row → expand to show subject-wise breakdown:
- Physics: 12/20 correct, 4 wrong, 4 unattempted
- Chemistry: 15/20 correct, 2 wrong, 3 unattempted
- Math: 10/25 correct, 8 wrong, 7 unattempted

#### ⏱️ Feature: Session Countdown in Admin Header
**Location:** `AdminLayout.vue`  
**What:** When a live session exists, show a live elapsed-time counter in the header for any admin page (not just the monitor)

#### 🛑 Feature: Cancel/Archive Session
**Location:** `AdminLiveSessions.vue` — for scheduled sessions  
**What:** Allow admin to cancel a not-yet-started session, freeing up the student slots

#### 📱 Feature: Share Credentials via WhatsApp/Copy Link
**Location:** `SessionCredentials.vue`  
**What:** Generate a shareable link `https://testjee.com/live-exam/{SESSION_CODE}` with a one-click copy button and WhatsApp share button

#### 📊 Feature: Live Monitor Progress Bar
**Location:** `LiveExamMonitor.vue`  
**What:** Replace the dummy "activity feed" with a real progress bar showing % submitted

#### 📝 Feature: Pre-Exam Instructions Editor
**Location:** `ScheduleExam.vue`  
**What:** The instructions textarea should use a rich text editor (or at least support line breaks). The `ExamWaitingRoom` should display these instructions to students in the lobby.

#### 🔍 Feature: Search/Filter in Results Leaderboard
**Location:** `ExamResults.vue`  
**What:** Client-side search by student name or roll number in the results table

#### 🏷️ Feature: Session Tags/Labels
**Location:** `AdminLiveSessions.vue`, `ScheduleExam.vue`  
**What:** Optional label field (e.g., "Batch A", "Morning Slot") visible in the sessions list

#### 📊 Feature: Score Distribution Histogram
**Location:** `ExamResults.vue`  
**What:** Simple bar chart showing how many students scored in each range (0-60, 60-120, 120-180, 180-240, 240-300)

---

## Part 6: New Supabase RPCs Needed

### RPC-1: `get_student_live_result(input_student_session_id)`
```sql
CREATE OR REPLACE FUNCTION get_student_live_result(input_student_session_id integer)
RETURNS TABLE(
  score numeric, max_score integer, percentage numeric,
  rank integer, time_taken_seconds integer,
  student_name text, roll_number text, status text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ses.score, ses.max_score, ses.percentage,
    ses.rank, ses.time_taken_seconds,
    ts.student_name, ts.roll_number, ses.status::text
  FROM student_exam_sessions ses
  JOIN temp_students ts ON ts.temp_student_id = ses.temp_student_id
  WHERE ses.student_session_id = input_student_session_id;
END; $$;
```

### RPC-2: `submit_live_exam_support_request(...)` 
Similar to current `exam_support_requests` insert but includes `student_session_id` column.

### Schema Change: `exam_support_requests`
Add column: `student_session_id INTEGER REFERENCES student_exam_sessions(student_session_id)` to distinguish live vs regular appeals.

### RPC-3: Update `get_student_exam_questions` to return subject_name
Add `JOIN subjects s ON q.subject_id = s.subject_id` and return `s.subject_name` in the result set.

### RPC-4: Update `start_student_exam` to return `personal_end_time`
Return `now() + (duration_minutes * interval '1 minute')` as `personal_end_time`.

---

## Part 7: Complete File Change Map

| File | Action | Why |
|---|---|---|
| `ExamWaitingRoom.vue` | MODIFY | Fix BUG-01: add loadQuestions() + bridge + reroute |
| `ExamLayout.vue` | MODIFY | Fix BUG-14: isLiveMode bypass, override submit/appeal |
| `liveExamBridge.js` | CREATE NEW | Bridge utility function |
| `router/index.js` | MODIFY | Fix BUG-14: live mode bypass guard |
| `examSessionStore.js` | MODIFY | Add submitSupportRequest(), fix timer reference |
| `AdminResumeRequests.vue` | MODIFY | Fix BUG-05: correct table for live session approval |
| `SessionCredentials.vue` | MODIFY | Fix BUG-06: correct table name (temp_students) |
| `ExamResults.vue` | MODIFY | Fix BUG-07: null safety + export CSV |
| `ExamSubmitConfirmation.vue` | MODIFY | Fix BUG-08: markedForReview count |
| `ScheduleExam.vue` | MODIFY | Fix BUG-09/10: dynamic subjects + Fisher-Yates |
| `AdminLiveSessions.vue` | MODIFY | Fix BUG-13: session redirect loop |
| `StudentResults.vue` | MODIFY | Fix BUG-11: use new RPC for results |
| `AdminHome.vue` | MODIFY | New: live session status card |
| `AdminLayout.vue` | MODIFY | New: Realtime badge, header countdown |
| `LiveExamInterface.vue` | KEEP | Kept as fallback, no changes needed |
| `LiveExamMonitor.vue` | MODIFY | New: real progress bar |
| Supabase DB | MODIFY | New RPCs + schema changes |

---

## Part 8: Implementation Phases

### Phase 1 — Critical Path (Make Exam Work)
**Goal:** Student can login → wait → start → see questions → submit → see results

1. Fix `ExamWaitingRoom.vue` `beginExam()` (BUG-01)
2. Create `liveExamBridge.js`
3. Modify `router/index.js` for live mode bypass (BUG-14)
4. Modify `ExamLayout.vue` for live mode (isLiveMode, submit override)
5. Update `start_student_exam` RPC to return `personal_end_time`
6. Update `get_student_exam_questions` RPC to return `subject_name`
7. Create `get_student_live_result` RPC
8. Fix `StudentResults.vue` to use new RPC (BUG-11)

### Phase 2 — Data Integrity
**Goal:** Approval/resume works, credentials load, results don't crash

9. Fix `AdminResumeRequests.vue` approve logic (BUG-05)
10. Add `student_session_id` to `exam_support_requests` schema
11. Fix `examSessionStore.js` to call `submitSupportRequest` correctly
12. Fix `SessionCredentials.vue` table name (BUG-06)
13. Fix `ExamResults.vue` null safety (BUG-07)
14. Fix `ExamSubmitConfirmation.vue` markedForReview (BUG-08)

### Phase 3 — Quality & Fairness
**Goal:** Correct exam for all categories, fair question distribution

15. Fix `ScheduleExam.vue` dynamic subjects (BUG-09)
16. Fix `ScheduleExam.vue` Fisher-Yates shuffle (BUG-10)
17. Fix `AdminLiveSessions.vue` redirect loop (BUG-13)
18. Fix timer to use `personal_end_time` (BUG-04)

### Phase 4 — Admin Features
**Goal:** Admin has a professional, complete exam management dashboard

19. `AdminHome.vue` live activity card
20. `ExamResults.vue` CSV export + per-student breakdown
21. `AdminLayout.vue` Realtime badge + countdown
22. `SessionCredentials.vue` share link + copy button
23. `AdminLiveSessions.vue` duplicate session action
24. `LiveExamMonitor.vue` real progress bar

### Phase 5 — Polish
**Goal:** Production-ready experience

25. `ExamWaitingRoom.vue` Realtime subscription (replace polling)
26. Score distribution histogram in results
27. Search/filter in leaderboard
28. Session tags/labels
29. Pre-exam instruction rich text in lobby

---

## Part 9: End-to-End Test Script (13 steps)

1. **Admin login** → `/admin` → Dashboard shows 0 sessions
2. **Create session** → Schedule New Exam → Pick "JEE Main" category, "Test Batch A", 3 students, 30min, tomorrow 10:00 → Submit → **Verify:** credentials page shows 3 unique usernames + session code
3. **Verify DB:** `live_exam_sessions` has 1 row status='scheduled', `temp_students` has 3 rows with `admin_test_id`
4. **Student A login** → `/live-exam/{code}` → Enter username → Enter name + roll (first time) → Lobby shows countdown, "Waiting for instructor"
5. **Student B login** → Same flow → Both students in lobby simultaneously
6. **Admin starts exam** → Sessions list → "Start Early" on scheduled session → Confirm → Session becomes 'live' → Admin auto-redirected to monitor
7. **Student lobby update** → Within 5 seconds (realtime or poll), both students see "Exam is now LIVE!" green button
8. **Student A begins** → Click "Start Exam Now" → **Should land on ExamLayout.vue** → Fullscreen enforced → Questions visible with Physics/Chemistry/Math subject tabs → Timer shows remaining time
9. **Verify:** Question palette visible, Mark for Review works, subject navigation works
10. **Student A tab-switches** → Grace period overlay appears (10s countdown) → If no return: auto-submit → Appeal form appears → Student submits appeal
11. **Admin resume request** → AdminResumeRequests shows pending request → Admin approves → Student sees "Approved!" message → Can resume exam
12. **Student B submits voluntarily** → Confirm modal shows answered/unanswered counts → Submit → Redirects to StudentResults showing score (rank pending until session ends)
13. **Admin force-ends exam** → LiveExamMonitor → "FORCE END EXAM EARLY" → All remaining auto-submitted → Redirected to ExamResults → Leaderboard shows Student A and B with ranks, scores, and percentages
