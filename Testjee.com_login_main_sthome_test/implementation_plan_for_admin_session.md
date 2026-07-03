# Live Exam System — Master Implementation Plan
> **Working Mode:**  
> This file is the single source of truth. Updated after every phase.  
> Code reviewed and re-planned by senior engineer after Phase 1 completion.

---

## Phase Status Tracker

| Phase | Goal | Status |
|---|---|---|
| **Phase 1** | Make exam work end-to-end | ✅ Complete |
| **Phase 2** | Data integrity (credentials, results, appeals, submit) | ✅ Complete |
| **Phase 3** | Fairness & quality (subjects, shuffle, redirect loop) | ✅ Complete |
| **Phase 4** | Admin UX overhaul (Dashboard, results, monitoring) | ✅ Complete |
| **Phase 5** | Polish & production hardening | ✅ Complete |

---

---

# ✅ PHASE 1 — Critical Path (Complete)

**Goal:** Student can login → wait in lobby → start exam → see questions in ExamLayout → submit → see results

## Phase 1 Code Review — Senior Notes

Phase 1 is architecturally sound. The bridge pattern is the right call — reusing ExamLayout.vue's anti-cheat, fullscreen enforcement, and grace period logic instead of rebuilding it in LiveExamInterface.vue is excellent engineering. Here is the full review.

### ✅ What is Good (Do Not Touch)

**`liveExamBridge.js`** — Clean and well-commented. The fallback `deriveSubjectFromNumber()` is a smart stopgap. The comment on line 9 correctly identifies the assumption about shuffle boundaries. Keep it.

**`examSessionStore.js`** — The personal end time fix (BUG-04) is correctly implemented client-side. `calculateTimeRemaining()` now correctly prefers `personalEndTime` over `scheduledEndTime`. The `stopTimer()` guard in `startTimer()` prevents interval stacking.

**`router/index.js`** — The BUG-14 live mode bypass is correctly placed BEFORE the `requiresAdminAuth` and `requiresAuth` blocks. Order matters here — do not move it.

**`ExamWaitingRoom.vue`** — The polling approach using `student_exam_login` RPC (which is SECURITY DEFINER) is the right way to bypass RLS for lobby status checks. Direct table reads would break in a locked-down RLS environment. Good decision.

**`adminStore.js`** — Token-only localStorage pattern is correct. Keeping the full profile only in memory is a good security principle. The `verify_admin_session` RPC re-validation on every route guard is the right move.

---

### ⚠️ Phase 1 Remaining Issues (Fix in Phase 2+)

| ID | File | Issue | Phase Fix |
|---|---|---|---|
| BUG-05 | `AdminResumeRequests.vue` | `approveRequest()` writes to `exam_sessions` not `student_exam_sessions` | P2 |
| BUG-06 | `SessionCredentials.vue` | Fallback queries `live_exam_students` (table does not exist) | P2 |
| BUG-07 | `ExamResults.vue` | `maxScore` crashes when `results` array is empty | P2 |
| BUG-08 | `ExamSubmitConfirmation.vue` | `.size` on plain object always returns `undefined` | P2 |
| BUG-09 | `ScheduleExam.vue` | Subjects hardcoded to JEE | P3 |
| BUG-10 | `ScheduleExam.vue` | Biased `sort(() => 0.5 - Math.random())` shuffle | P3 |
| BUG-11 | `StudentResults.vue` | Direct table read on `student_exam_sessions` blocked by RLS | P1 ✓ |
| BUG-12 | `ExamWaitingRoom.vue` | 5s poll for lobby status | P5 |
| BUG-13 | `AdminLiveSessions.vue` | Back button from monitor causes redirect loop | P3 |

---

### 🔍 Senior Review: New Hidden Issues Found

**NEW-01 — `ExamResults.vue` filters out non-submitted students**
Line 193 filters to only `submitted` and `auto_submitted`. Students who never started are completely hidden. Admin needs to see the full picture.
Fix: Remove the filter. Show all students. Add "Did Not Attempt" status display.

**NEW-02 — `ExamResults.vue` — Export button is a dead stub**
Line 32-35: "Export Excel (WIP)" button has no @click handler. Wire it up in Phase 2 or disable it.

**NEW-03 — `AdminResumeRequests.vue` only loads regular exam appeals**
The `loadRequests()` query joins `exam_sessions` and `students` — the regular tables. Live exam appeals won't appear because they come from `student_exam_sessions` and `temp_students`. This is why BUG-05 is symptomless — no data means no crash.

**NEW-04 — `AdminLiveSessions.vue` redirect is unconditional on direct navigation**
The `?noRedirect=true` only works from the back button. Navigating directly to `/admin/sessions` bypasses this protection and causes a loop.

**NEW-05 — `SessionCredentials.vue` — `sessionStorage` is never cleared**
`'newSessionCredentials'` key has no TTL. Old credentials from a previous session can silently appear.
Fix: After reading from sessionStorage, immediately call `sessionStorage.removeItem('newSessionCredentials')`.

**NEW-06 — `liveExamBridge.js` hardcodes `examType = 'JEE_MAIN_FULL'`**
Line 78. When NEET/KCET support is added, this will cause wrong scoring and subject labels.

**NEW-07 — `AdminLayout.vue` uses 30s polling for the badge**
Should be replaced with Supabase Realtime in Phase 4.

**NEW-08 — `ExamWaitingRoom.vue` uses `alert()` on exam start failure**
Line 275: `alert()` in a Vue SPA is bad UX. Replace with an inline error message.

---

---

# ✅ PHASE 2 — Data Integrity (Complete)

**Goal:** Fix all data correctness bugs. Every admin-facing view shows real, correct, complete data.

> **Senior Review Note:** The phase 2 implementations are flawless. As noted, ensure your Supabase schema actually has the `end_time` column in `student_exam_sessions` before running the migration, otherwise `approveRequest` will fail. You can add it via: `ALTER TABLE student_exam_sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;`

> Implement in order. Each item below is self-contained. Complete and test one before starting the next.

---

## 2.1 — Fix `SessionCredentials.vue` (BUG-06 + NEW-05)

**File:** `src/components/admin/SessionCredentials.vue` — lines 128-196

**Fix A — Clear sessionStorage immediately after reading (NEW-05):**
```js
if (parsed.sessionCode && parsed.credentials?.length > 0) {
  meta.value = parsed
  loading.value = false
  sessionStorage.removeItem('newSessionCredentials') // ADD THIS
  return
}
```

**Fix B — Rewrite `fetchFromDatabase()` to use correct tables (BUG-06):**
```js
const fetchFromDatabase = async () => {
  try {
    if (!adminStore.adminProfile?.admin_id) {
      errorMsg.value = 'Admin session expired. Please log in again.'
      return
    }

    // Step A: Get session metadata + admin_test_id
    const { data: sessionData, error: sessionError } = await supabase
      .from('live_exam_sessions')
      .select('session_code, session_name, admin_id, admin_test_id')
      .eq('live_session_id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      errorMsg.value = 'Session not found.'
      return
    }

    if (sessionData.admin_id !== adminStore.adminProfile.admin_id) {
      errorMsg.value = 'Access denied.'
      return
    }

    // Step B: Fetch credentials from temp_students using admin_test_id
    const { data: studentsData, error: studentsError } = await supabase
      .from('temp_students')
      .select('username, student_name, roll_number')
      .eq('admin_test_id', sessionData.admin_test_id)
      .order('created_date', { ascending: true })

    if (studentsError) {
      errorMsg.value = 'Failed to load student credentials.'
      return
    }

    meta.value = {
      sessionCode: sessionData.session_code,
      sessionName: sessionData.session_name,
      credentials: studentsData || []
    }
  } catch (err) {
    errorMsg.value = 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}
```

**Test Checklist:**
- [ ] Create session → lands on credentials page → correct students shown
- [ ] Reload the credentials page → DB fallback runs → correct students still shown
- [ ] Navigate away, come back → no stale data from previous session

---

## 2.2 — Fix `ExamResults.vue` (BUG-07 + NEW-01 + NEW-02)

**File:** `src/components/admin/ExamResults.vue`

**Fix A — Null-safe `maxScore` (BUG-07):**
```js
// REPLACE the maxScore computed with:
const maxScore = computed(() =>
  results.value.find(r => r.max_score)?.max_score
  ?? sessionMeta.value?.max_score
  ?? 300
)
```

**Fix B — Show ALL students, not just submitted (NEW-01):**
```js
// REPLACE line 193:
results.value = (resultsData || []).sort((a, b) => {
  if (a.rank && b.rank) return a.rank - b.rank
  if (a.rank) return -1
  if (b.rank) return 1
  return (a.student_name || '').localeCompare(b.student_name || '')
})
```

Add "Did Not Attempt" badge in the status column:
```html
<span v-if="student.status === 'not_started'"
  class="px-2 py-1 rounded text-xs font-bold uppercase bg-gray-100 text-gray-500">
  Did Not Attempt
</span>
```

**Fix C — Wire up CSV Export (NEW-02):**
Add `@click="exportCSV"` to the export button, then add this function:
```js
const exportCSV = () => {
  const headers = ['Rank', 'Name', 'Roll No.', 'User ID', 'Score', 'Max Score', 'Percentage', 'Time Taken', 'Status']
  const rows = results.value.map(s => [
    s.rank ?? '-',
    s.student_name ?? 'Anonymous',
    s.roll_number ?? '-',
    s.username,
    s.score ?? '-',
    maxScore.value,
    s.percentage ? Number(s.percentage).toFixed(1) + '%' : '-',
    formatDuration(s.time_taken_seconds),
    s.status
  ])
  const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sessionMeta.value?.session_name ?? 'results'}_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

**Test Checklist:**
- [ ] Open results before anyone submits → no crash, shows all students as "Did Not Attempt"
- [ ] After submit → student row updates with score and rank
- [ ] Export button → .csv file downloads with correct data
- [ ] `maxScore` shows 300 when no submissions exist

---

## 2.3 — Fix `AdminResumeRequests.vue` (BUG-05 + NEW-03)

**File:** `src/components/admin/AdminResumeRequests.vue`

**Required DB Change first — run in Supabase SQL editor:**
```sql
ALTER TABLE exam_support_requests 
ADD COLUMN IF NOT EXISTS student_session_id INTEGER 
REFERENCES student_exam_sessions(student_session_id);
```

**Fix `loadRequests()` to include `student_session_id`:**
```js
const { data, error } = await supabase
  .from('exam_support_requests')
  .select(`
    request_id, session_id, student_session_id,
    student_id, reason, custom_message,
    remaining_time_seconds, answers, status, created_at,
    exam_sessions(exam_type, start_time, total_duration_seconds),
    students(student_name, email_id)
  `)
  .order('created_at', { ascending: false })
```

**Fix `approveRequest()` to write to the correct table:**
```js
async function approveRequest(req) {
  actionLoadingId.value = req.request_id
  actionResult.value[req.request_id] = null
  try {
    // 1. Mark request as approved
    const { error: reqErr } = await supabase
      .from('exam_support_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('request_id', req.request_id)
    if (reqErr) throw reqErr

    // 2. Reopen the correct session table based on appeal type
    if (req.student_session_id) {
      // LIVE exam appeal
      const { error: sessErr } = await supabase
        .from('student_exam_sessions')
        .update({ status: 'in_progress', end_time: null })
        .eq('student_session_id', req.student_session_id)
      if (sessErr) throw sessErr
    } else {
      // Regular exam appeal (legacy path — keep working)
      const { error: sessErr } = await supabase
        .from('exam_sessions')
        .update({ is_submitted: false, end_time: null })
        .eq('session_id', req.session_id)
      if (sessErr) throw sessErr
    }

    actionResult.value[req.request_id] = {
      success: true,
      message: '✅ Approved! Session reopened. Student can now resume.'
    }
    const idx = requests.value.findIndex(r => r.request_id === req.request_id)
    if (idx !== -1) requests.value[idx].status = 'approved'
  } catch (err) {
    actionResult.value[req.request_id] = { success: false, message: `❌ Failed: ${err.message}` }
  } finally {
    actionLoadingId.value = null
  }
}
```

**Test Checklist:**
- [ ] Student in live exam gets auto-submitted → appeal submitted with `student_session_id`
- [ ] Admin sees the pending request card
- [ ] Admin approves → `student_exam_sessions` status updated to `in_progress`
- [ ] Student can resume with answers intact
- [ ] Regular exam appeal still works (old path unchanged)

---

## 2.4 — Fix `ExamSubmitConfirmation.vue` (BUG-08)

**File:** `src/components/live-exam/ExamSubmitConfirmation.vue`

```html
<!-- BEFORE: -->
v-if="store.markedForReview.size > 0"
{{ store.markedForReview.size }} questions marked

<!-- AFTER: -->
v-if="Object.keys(store.markedForReview).length > 0"
{{ Object.keys(store.markedForReview).length }} questions marked
```

---

---

# ✅ PHASE 3 — Fairness & Session Quality (Complete)

**Goal:** Every exam type generates correct questions. No redirect loops. Shuffle is statistically fair.

> **Implementation Note (3.1 deviated from the plan's literal snippet):** The plan's
> `EXAM_SUBJECT_CONFIG` keyed by `category_name` strings ('JEE Main'/'NEET UG'/'KCET')
> assumed those exist as rows in the `categories` table. They don't — `categories` only
> tags which underlying question bank (JEE-pool vs NEET-pool) a question belongs to;
> `category_id` is shared across multiple exam types (e.g. KCET Maths also pulls from the
> JEE pool). The actual source of truth for subjects/question-counts/marking per exam type
> is `EXAM_CONFIGS` in `examConfigs.js` — the same config the student dashboard already
> uses. Implemented instead: a real "Exam Type" dropdown in `ScheduleExam.vue` sourced from
> `EXAM_CONFIGS`, a new `exam_type` column on `live_exam_sessions` (see
> `add-exam-type-to-live-sessions.sql`) plus an additive `set_live_session_exam_type` RPC to
> persist the choice, and `ExamWaitingRoom.vue`/`liveExamBridge.js` now read that value back
> through the bridge instead of hardcoding `JEE_MAIN_FULL`.

---

## 3.1 — Dynamic Subject Mapping (BUG-09)

**Files:** `src/components/admin/ScheduleExam.vue`, `src/components/live-exam/ExamWaitingRoom.vue`, `src/stores/liveExamBridge.js`, `add-exam-type-to-live-sessions.sql`

**Implementation:**
Instead of hardcoding subjects, the question assembly loop is now fully config-driven.
- `ScheduleExam.vue` uses a real Exam Type dropdown sourced from `EXAM_CONFIGS`.
- Subjects, synonym-based subject lookup, per-subject MCQ/numeric counts, difficulty filters, and cross-category pools all now come from the config.
- Added `add-exam-type-to-live-sessions.sql` which adds an `exam_type` column on `live_exam_sessions` (defaulting to `JEE_MAIN_FULL`) and a new `set_live_session_exam_type` RPC.
- `ExamWaitingRoom.vue` reads that `exam_type` back and passes it through the bridge.

---

## 3.2 — Fisher-Yates Shuffle (BUG-10)

**File:** `src/components/admin/ScheduleExam.vue`

**Implementation:**
Replaced the biased `.sort(() => 0.5 - Math.random())` in both the MCQ and numeric selection with a proper Fisher-Yates shuffle function to ensure a statistically fair randomization of questions.

---

## 3.3 — Fix Redirect Loop (BUG-13 + NEW-04)

**Files:** `src/components/admin/AdminLiveSessions.vue`, `src/components/admin/LiveExamMonitor.vue`

**Implementation:**
Redirect-to-monitor now happens at most once per session per tab via a `sessionStorage` guard. 
Additionally, `LiveExamMonitor.vue` marks the session as "seen" the moment it mounts, ensuring that if an admin clicks "Back to Sessions List", they don't immediately bounce back to the monitor.

---

## 3.4 — Fix Hardcoded Exam Type in Bridge (NEW-06)

**File:** `src/stores/liveExamBridge.js`

**Implementation:**
The bridge function now accepts a real `examType` parameter (including in the subject-derivation fallback), defaulting to `JEE_MAIN_FULL` only when nothing better is available.

---

---

# ✅ PHASE 4 — Admin UX Overhaul (Complete)

**Goal:** The admin panel feels like a professional product. Every page gives instant, actionable insight.

> **Implementation Note:** 4.1–4.6 implemented largely as specified, with two deliberate
> deviations. (1) 4.2/4.3's Realtime subscriptions keep a slow fallback poll (60s/15s
> instead of removing polling outright) — Realtime requires replication to be enabled per
> table in the Supabase dashboard (Database → Replication) and I can't confirm that's done;
> without a fallback the badge/tracker would silently freeze if it isn't. (2) 4.6's
> duplicate-session prefill can't reliably read `duration_minutes`/`exam_type` off
> `get_admin_live_sessions`'s return shape (outside my visibility) — it derives duration
> from the scheduled start/end window as a fallback and leaves `exam_type` for
> `ScheduleExam.vue` to default if absent, merging prefill fields individually rather than
> blindly overwriting the form.

---

## 4.1 — `AdminHome.vue` — Live Now Banner

**Implementation:**
Added a dynamic "Live Now" banner above the Stats Grid. It detects the active live session (via `get_admin_live_sessions`), displays the elapsed time using a local timer based on `scheduled_start_time`, and provides a quick link to open the monitor.

---

## 4.2 & 4.3 — Realtime Subscriptions (NEW-07 & Progress Tracker)

**Files:** `src/components/admin/AdminLayout.vue`, `src/components/admin/LiveExamMonitor.vue`

**Implementation:**
- **Resume Badge (`AdminLayout.vue`):** Added a Supabase Realtime subscription to `exam_support_requests` to instantly update the pending requests badge.
- **Progress Tracker (`LiveExamMonitor.vue`):** Added a Realtime subscription to `student_exam_sessions` to instantly refresh the progress bar and student statuses.
- **Safety Fallback:** Kept a slow fallback poll (60s and 15s respectively) just in case Supabase Replication isn't enabled for these tables in the dashboard, preventing the UI from silently freezing.

---

## 4.4 — `ExamResults.vue` — Search Filter + Score Distribution Chart

**Implementation:**
- **Search Filter:** Added a client-side search query over the full leaderboard array (filtering by name, roll number, or username).
- **Score Distribution:** Implemented a pure CSS bucketed bar chart that derives 10 proportional buckets based on the `max_score` and automatically scales height percentages without needing any external chart libraries.

---

## 4.5 & 4.6 — Session Actions & Duplicate Session

**Files:** `src/components/admin/SessionCredentials.vue`, `src/components/admin/AdminLiveSessions.vue`, `src/components/admin/ScheduleExam.vue`

**Implementation:**
- **Share Options:** Added "Copy Link" and "WhatsApp Share" buttons that automatically formulate the login URL and session code.
- **Duplicate Session:** Clicking duplicate sets a `prefillExamSession` in `sessionStorage` containing the core details (calculating duration fallback from start/end times). `ScheduleExam.vue` detects this on mount and safely merges the fields instead of a blind overwrite, leaving `exam_type` to default naturally.

---

---

# ✅ PHASE 5 — Production Hardening (Complete)

| # | Task | Why Critical | Status |
|---|---|---|---|
| 5.1 | Replace `alert()` in `ExamWaitingRoom.vue` with inline error (NEW-08) | Professional UX | ✅ Fixed |
| 5.2 | Page reload recovery — sessionStorage bridge restore in `ExamLayout.vue` | Student reload during exam must not lose session | ✅ Already done (see note) |
| 5.3 | Lobby status polling → Supabase Realtime (BUG-12) | Instant start detection, no 5s delay | ✅ Fixed |
| 5.4 | Session tags/batch labels in ScheduleExam | Multi-batch management | ✅ Fixed |
| 5.5 | Pre-exam instructions panel in lobby from session config | Students read rules before starting | ✅ Fixed (best-effort) |
| 5.6 | Cancel/Archive scheduled session | Clean up unused sessions | ✅ Fixed (conservative) |
| 5.7 | Pass category name through bridge for non-JEE subject derivation | Correct subject tabs for NEET/KCET | ✅ Already done (via Phase 3.1) |

> **Implementation Notes:**
> - **5.2** was already solved by an earlier commit (outside this plan) that intercepts
>   `/exam?mode=live` reloads directly in `router/index.js`'s guard — re-running
>   `loginToExam()` → `loadQuestions()` → `bridgeLiveSessionToExamStore()` using
>   `sessionStorage`'s saved username + the URL's `sessionCode` before the component even
>   mounts. `ExamLayout.vue`'s existing "attempt fullscreen, then grace-period-if-it-fails"
>   logic (used for the regular exam's resume case too) handles the rest. No changes made
>   here — re-implementing the plan's sessionStorage-flag snippet on top would have been
>   redundant/conflicting with a working mechanism.
> - **5.7** was already solved in Phase 3.1, which went further than "pass category name" —
>   it passes the actual resolved `exam_type` (JEE/NEET/KCET variant) end-to-end through
>   `live_exam_sessions.exam_type` → `ExamWaitingRoom.vue` → `liveExamBridge.js`.
> - **5.3**: kept the existing 5s poll alongside the new Realtime subscription (same
>   Realtime-replication-can't-be-confirmed reasoning as Phase 4).
> - **5.6**: conservative by design — `cancel_live_exam_session` only flips `status` to
>   `'cancelled'`. It does **not** decrement any admin quota counters
>   (`tests_created`/`students_created`), since I can't verify from this codebase what
>   `create_live_exam_session_custom` increments or by how much — guessing wrong here would
>   silently corrupt an admin's quota. If you want cancelling to free up slots, decrement
>   those columns in `add-batch-label-and-cancel-support.sql` once you've confirmed the
>   exact counter semantics.
> - **5.4/5.5**: `batch_label` and `instructions` are only shown where the underlying RPC
>   (`get_admin_live_sessions` / `student_exam_login`) actually returns those columns — both
>   are outside my visibility, so these degrade gracefully (simply don't render) rather than
>   erroring if the columns aren't selected by those RPCs yet.

---

---

# Part: All Bugs Reference (Master List)

| ID | Severity | File | Description | Phase | Status |
|---|---|---|---|---|---|
| BUG-01 | 🔴 Critical | `ExamWaitingRoom.vue` | `loadQuestions()` never called | P1 | ✅ Fixed |
| BUG-02 | 🔴 Critical | `LiveExamInterface.vue` | Double `startExam()` corrupts question order | P1 | ✅ Fixed |
| BUG-03 | 🔴 Critical | `LiveExamInterface.vue` | Timer runs, questions never load | P1 | ✅ Fixed |
| BUG-04 | 🔴 Critical | `examSessionStore.js` | Timer uses scheduledEndTime not personalEndTime | P1 | ✅ Fixed |
| BUG-05 | 🔴 Critical | `AdminResumeRequests.vue` | Approve writes to wrong table | P2 | ✅ Fixed |
| BUG-06 | 🔴 Critical | `SessionCredentials.vue` | Queries non-existent table | P2 | ✅ Fixed |
| BUG-07 | 🔴 Critical | `ExamResults.vue` | Crashes when no submissions exist | P2 | ✅ Fixed |
| BUG-08 | 🟡 Medium | `ExamSubmitConfirmation.vue` | `.size` on plain object = undefined | P2 | ✅ Fixed |
| BUG-09 | 🟡 Medium | `ScheduleExam.vue` | Subjects hardcoded to JEE | P3 | ✅ Fixed |
| BUG-10 | 🟡 Medium | `ScheduleExam.vue` | Biased shuffle | P3 | ✅ Fixed |
| BUG-11 | 🟡 Medium | `StudentResults.vue` | RLS blocks direct table read | P1 | ✅ Fixed |
| BUG-12 | 🟡 Medium | `ExamWaitingRoom.vue` | 5s poll delay in lobby | P5 | ✅ Fixed |
| BUG-13 | 🟡 Medium | `AdminLiveSessions.vue` | Redirect loop on back navigation | P3 | ✅ Fixed |
| BUG-14 | 🔴 Critical | `router/index.js` | Auth guard blocks live students | P1 | ✅ Fixed |
| NEW-01 | 🟡 Medium | `ExamResults.vue` | Absentees hidden from leaderboard | P2 | ✅ Fixed |
| NEW-02 | 🟡 Medium | `ExamResults.vue` | Export button is a dead stub | P2 | ✅ Fixed |
| NEW-03 | 🔴 Critical | `AdminResumeRequests.vue` | Live exam appeals not visible | P2 | ✅ Fixed |
| NEW-04 | 🟡 Medium | `AdminLiveSessions.vue` | Redirect loop not protected from direct URL | P3 | ✅ Fixed |
| NEW-05 | 🟡 Medium | `SessionCredentials.vue` | Stale sessionStorage shows old credentials | P2 | ✅ Fixed |
| NEW-06 | 🟡 Medium | `liveExamBridge.js` | Exam type hardcoded to JEE_MAIN_FULL | P3 | ✅ Fixed |
| NEW-07 | 🟢 Low | `AdminLayout.vue` | Resume badge uses 30s poll instead of Realtime | P4 | ✅ Fixed |
| NEW-08 | 🟢 Low | `ExamWaitingRoom.vue` | Uses alert() on exam start failure | P5 | ✅ Fixed |

---

## Part: Supabase Changes Required

### Schema Change (needed before Phase 2.3)
```sql
ALTER TABLE exam_support_requests 
ADD COLUMN IF NOT EXISTS student_session_id INTEGER 
REFERENCES student_exam_sessions(student_session_id);
```

### RPC-1: `get_student_live_result` — ✅ Already created

### RPC-2: `get_student_exam_questions` — Add `subject_name` (Phase 3)
```sql
JOIN subjects s ON q.subject_id = s.subject_id
-- Add s.subject_name to SELECT
```

### RPC-3: `start_student_exam` — Add server-side `personal_end_time` (Phase 5, low priority)
```sql
now() + (les.duration_minutes * interval '1 minute') AS personal_end_time
```

---

## Part: File Change Map

| File | Phase | Action | Reason |
|---|---|---|---|
| `SessionCredentials.vue` | P2 | MODIFY | BUG-06: correct table; NEW-05: clear stale sessionStorage |
| `ExamResults.vue` | P2 | MODIFY | BUG-07: null safety; NEW-01: show all; NEW-02: CSV export |
| `AdminResumeRequests.vue` | P2 | MODIFY | BUG-05: correct table; NEW-03: load live appeals |
| `ExamSubmitConfirmation.vue` | P2 | MODIFY | BUG-08: Object.keys().length |
| `ScheduleExam.vue` | P3 | MODIFY | BUG-09: dynamic subjects; BUG-10: Fisher-Yates |
| `AdminLiveSessions.vue` | P3 | MODIFY | BUG-13 + NEW-04: per-session redirect flag |
| `liveExamBridge.js` | P3 | MODIFY | NEW-06: pass exam type dynamically |
| `AdminHome.vue` | P4 | MODIFY | Feature: Live Now banner |
| `AdminLayout.vue` | P4 | MODIFY | Feature: Realtime resume badge |
| `LiveExamMonitor.vue` | P4 | MODIFY | Feature: real progress bar + Realtime tracker |
| `ExamResults.vue` | P4 | MODIFY | Feature: search + score distribution chart |
| `SessionCredentials.vue` | P4 | MODIFY | Feature: copy link + WhatsApp share |
| `AdminLiveSessions.vue` | P4 | MODIFY | Feature: duplicate session |
| `ExamWaitingRoom.vue` | P5 | MODIFY | NEW-08: inline error; BUG-12: Realtime lobby |
| `ExamLayout.vue` | P5 | MODIFY | 5.2: page reload recovery |
| Supabase DB | P2 | SCHEMA | exam_support_requests.student_session_id column |
| Supabase DB | P3 | RPC | get_student_exam_questions + subject_name |
