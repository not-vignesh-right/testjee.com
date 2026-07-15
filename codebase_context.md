# TestJEE Codebase Context & Reference Guide

> [!IMPORTANT]
> **CRITICAL FIRST STEP FOR THE INCOMING AGENT (Gateway Entry Point):**
> This file is the primary entry point to understanding the TestJEE codebase. Before modifying or inspecting components, read these linked architecture guides:
> * **Global Database Schema**: Refer to the complete SQL schema at [entireSchema.sql](file:///c:/Users/admin/Desktop/testjee/entireSchema.sql).
> * **Live Session Admin Panel & RPCs**: Refer to [admin_architecture_and_flow.md](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/admin_architecture_and_flow.md).
> * **Mock Exam Selection & Deduplication Logic**: Refer to [TECHNICAL_DETAILS.md](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/TECHNICAL_DETAILS.md).
> * **Static Landing Page Architecture**: Refer to [ARCHITECTURE.md](file:///c:/Users/admin/Desktop/testjee/TestJee.com_home/ARCHITECTURE.md).

This file provides the complete, absolute context of the **TestJEE Mock Exam Platform** (NTA JEE Main replica) codebase. It captures the architecture, database schema, proctoring systems, state persistence layers, and page-reload recovery workflows. Use this document as the primary reference when starting a new chat in Antigravity.

---

## 1. Tech Stack & Project Overview
* **Frontend**: Vue 3 (Composition API) + Vite + Pinia + Vue Router + Tailwind CSS
* **Backend/Database**: Supabase (PostgreSQL) + Row-Level Security (RLS) policies
* **Purpose**: A strict replica of the NTA JEE Main exam layout with extreme anti-cheat/proctoring capabilities, supporting both self-paced practice tests and live classroom-wide mock exams.
* **Auth Admin App**: A separate Vue 3 app (`Testjee.com_auth_admin/`) used by the platform owner to manage student approvals, test allocations, exam support/resume requests, and the `is_genuine_user` toggle. It connects directly to Supabase with its own key and routes.

---

## 2. Directory & File Structure
```
Testjee.com_login_main_sthome_test/
├── src/
│   ├── main.js                  # App bootstrap and store/router registration
│   ├── App.vue                  # Main layout shell
│   ├── lib/supabase.js          # Supabase client instantiation
│   ├── router/index.js          # Authentication guards, route definitions, and live session restoration
│   ├── data/
│   │   ├── quotes.js            # Array of motivational quotes
│   │   └── examConfigs.js       # Core exam configurations (JEE Main marking schema, templates)
│   ├── utils/
│   │   └── topicExamEngine.js   # Shared question-selection engine (Section 12) — used by examStore.js + admin ScheduleExam.vue
│   ├── stores/
│   │   ├── authStore.js         # Student authentication, profile registration & approval state
│   │   ├── adminStore.js        # Administrator authentication and live monitoring control
│   │   ├── examStore.js         # Practice exam logic (timers, answers, appeal snapshots, RLS calls)
│   │   └── examSessionStore.js  # Live session logic (temp student credentials, saveAnswer RLS triggers)
│   └── components/
│       ├── Login.vue            # Student credentials login / register (mobile field is required*)
│       ├── Dashboard.vue        # Student landing page + compulsory phone-number overlay (Section 7)
│       ├── AuthCallback.vue     # Google OAuth redirect target; enforces mandatory phone number (Section 11.C)
│       ├── PaymentPage.vue      # Payment/plan selection incl. custom test count; sets payment_confirmed (Section 11.B)
│       ├── WaitingApproval.vue  # Pending/Rejected/Approved status screen (Section 11.A)
│       ├── ExamLayout.vue       # Proctoring container, timers, fullscreen check, and questions pane
│       ├── LandingPage.vue      # TestJEE homepage / marketing interface
│       ├── StudentLayout.vue    # Student layout wrapper (contains Sidebar, HeaderBar, Footer)
│       ├── HeaderBar.vue        # Navigation header
│       ├── FooterNav.vue        # Footer navigation mapping
│       ├── QuestionArea.vue     # Core MCQ / Numeric question rendering
│       ├── QuestionPalette.vue  # Interactive JEE navigation grid
│       ├── QuestionDetail.vue   # Modal popover with solutions and explanations
│       ├── Results.vue          # Student's regular exam score summaries
│       ├── ResultsDetails.vue   # Performance analysis per question
│       ├── admin/
│       │   ├── AdminHome.vue           # Admin control panel
│       │   ├── AdminLayout.vue         # Admin page structure layout wrapper
│       │   ├── AdminLiveSessions.vue   # Manage, cancel, and start scheduled sessions
│       │   ├── ScheduleExam.vue        # Form to schedule new mock exams
│       │   ├── SessionCredentials.vue  # Access code and login roster sheet for students
│       │   ├── LiveExamMonitor.vue     # Live student action logs, warnings, and submissions
│       │   ├── ExamResults.vue         # Admin panel student rankings and click-through reviews
│       │   └── AdminResumeRequests.vue # Approve/reject student proctoring appeal requests
│       └── live-exam/
│           ├── ExamLogin.vue           # Temporary credentials entry for live tests
│           ├── ExamWaitingRoom.vue     # Live lobby (polling for session 'live' status)
│           └── StudentResults.vue      # Results screen for live exams (RPC-backed)

Testjee.com_auth_admin/
└── src/
    ├── pages/
    │   ├── DashboardPage.vue    # Pending/Leads/Rejected/All Students, approval + is_genuine_user toggles (Section 11.D)
    │   └── StudentDetailPage.vue # Full student profile editor incl. Reject/Reopen controls (Section 11.D)
    └── components/
        ├── PendingCard.vue      # Pending-approval student card + WhatsApp button (Section 11.D)
        └── LeadCard.vue         # Unpaid-lead student card + WhatsApp button (Section 11.D, new)
```

---

## 3. The Two Exam Engines

The platform runs two distinct exam pipelines integrated into a single user interface:

### A. Practice / Regular Exams
* **User base**: Authenticated permanent students (`students` table).
* **Control store**: [examStore.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/stores/examStore.js).
* **Persistence**: Synchronizes state dynamically to `localStorage` during active testing. Evaluates and submits final scores to `results` and session states to `exam_sessions`.
* **Resumption**: Recovered via proctoring appeals (`exam_support_requests`). Admin must approve the ticket, and the client restores exact question arrays, responses, and marked-for-review items.

### B. Live Session Exams
* **User base**: Classroom students with temporary usernames/codes (`temp_students` table).
* **Control store**: [examSessionStore.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/stores/examSessionStore.js).
* **Persistence**: Bypasses `localStorage` for answer states. Every response change or mark-for-review flag is saved **instantly to the database** via the `save_student_answer` RPC to prevent offline data loss or client-side caching hacks.
* **Resumption**: Does not use appeal tickets. If a student reloads or crashes, they are restored directly back into the live session as long as the status is `'in_progress'`.

### C. Topic-Uniform Question Selection
* **Uniformity Fix**: Prevents questions from clustering inside a single topic per subject by fetching up to `1000` candidates from Supabase and running a round-robin selector (`selectUniformlyFromTopics`) in [examStore.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/stores/examStore.js) and [ScheduleExam.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/admin/ScheduleExam.vue).
* **De-duplication**: Filters out duplicate question diagrams and passages using unique `image_url` checks during compilation.

---

## 4. Proctoring & Anti-Cheat System (Fully Hardened)

The anti-cheat mechanisms are strictly managed inside [ExamLayout.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/ExamLayout.vue). If a student triggers any violation:

### A. Fullscreen Enforcement
* Fullscreen is programmatically requested via `enforceFullScreen()`.
* If a student exits fullscreen (e.g. presses `Escape`), the `handleFullscreenChange` listener triggers a **10-second warning countdown**.
* The screen is covered by an overlay modal. The student must click **"Return to Full Screen"** within 10 seconds.
* Tab switching or window minimizations during this countdown will trigger an **instant auto-submission** with no warning.

### B. Focus / Tab-Switch Enforcement
* **Visibility Change** (`document.hidden`): Switching tabs, opening another app, or minimizing the browser triggers an **instant auto-submit** (`examStore.submitExam(true)`).
* **Window Blur** (focus loss): Clicking outside the browser window starts the **10-second warning countdown**.

### C. System Disables
* Right-click (context menu) is disabled (`contextmenu.preventDefault()`).
* Developer Tools keys (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+U`) are blocked.
* Text copying, cutting, pasting, and drag-selections are fully blocked.

### D. Screen Wake Lock API (Anti-Lock / Sleep Prevention)
* **API Used**: `navigator.wakeLock.request('screen')` (integrated in both `ExamLayout.vue` and `LiveExamInterface.vue` on exam start/mount).
* **Behavior**: Dynamically requests a screen wake lock when the student enters the active exam interface. This blocks standard operating system actions such as screen savers, screen dimming, auto-sleep, and screen locks due to student inactivity.
* **Release**: Automatically releases the wake lock (`wakeLock.release()`) when the exam is submitted or when the student leaves/unmounts the component.

### E. Dialog Loophole Fixes (Wall-Clock Synchronization)
* **The Loophole**: Browser confirm alerts (e.g. the native `Leave site?` dialog triggered by `beforeunload` on refresh) pause the browser's JavaScript execution thread, including standard intervals (`remainingTime.value--`). A student could stay on the reload dialog to get infinite time.
* **The Solution**: All timers are calculated against **absolute target timestamps** (`Date.now() + duration`).
  * **Exam Timer**:
    ```javascript
    const targetEndTime = Date.now() + remainingTime.value * 1000;
    globalTimerInterval.value = setInterval(() => {
      remainingTime.value = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
      if (remainingTime.value <= 0) submitExam(true);
    }, 1000);
    ```
  * **Grace Timer**: If a student triggers a 10s warning countdown and opens a browser dialog, the countdown continues in real-world time. When they close the dialog, the next tick evaluates the elapsed time and instantly auto-submits if $\ge 10$ seconds have passed.

---

## 5. Page-Reload (Ctrl+R) & Resumption Flows

When a page reload happens during an active exam:

### A. Regular Exam Path
1. `beforeunload` catches reload and runs `emergencySubmit()`, saving all answers and visited statuses to `localStorage` (it does **not** update `is_submitted` in the DB).
2. On page load, `initializeSession()` reads the live DB session, restores state from `localStorage`, and keeps the exam active.
3. Because programmatic fullscreen fails without a user gesture, the page displays immediately, fullscreen fails, and the **10-second warning grace countdown immediately covers the screen**.
4. The student must click **"Return to Full Screen"** (which acts as the user gesture) to hide the warning and continue.

### B. Live Exam Path
1. On reload, the Pinia store state is wiped.
2. The route guard in [router/index.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/router/index.js) intercepts the transition to `/exam?mode=live`.
3. It detects that `studentSessionId` is null, reads `student_username` from `sessionStorage` and `sessionCode` from the URL, and invokes `loginToExam` and `loadQuestions` in the background.
4. Inside `loginToExam` in [examSessionStore.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/stores/examSessionStore.js), the store fetches the student's original `start_time` from the `student_exam_sessions` database table and recalculates `personalEndTime` accurately:
   ```javascript
   personalEndTime = start_time + duration_minutes
   ```
5. `bridgeLiveSessionToExamStore` maps questions and restored answers into Pinia.
6. The router continues navigation, the page displays, programmatic fullscreen fails, and the student is shown the **10-second warning countdown** to return to fullscreen.

### C. Appeal / Resumption Restore Workflow (Regular & Live Exams)
1. **Request Submission**: When an exam is auto-submitted due to a proctoring violation:
   - A support request is generated (`submitSupportRequest`) capturing the student's remaining time, reason, and a JSONB snapshot of all active answers.
   - This request is saved to `exam_support_requests` under status `'pending'`.
2. **Dashboard Banner & Polling**:
   - The student dashboard (`Dashboard.vue`) shows a prominent appeal/status alert for **10 minutes** post-auto-submission.
   - The alert displays the status of the request (`pending`, `approved`, `rejected`) and polls the database for changes.
   - Once the status changes to `'approved'`, a **"Resume Test Now"** button is unlocked. Clicking it calls `restoreResumedSession(...)` to reload their answers and redirect the student back into the active `/exam`.
3. **Admin Verification & Action (`AdminResumeRequests.vue` / `DashboardPage.vue`)**:
   - Admins can inspect the queue of appeals.
   - Clicking **"Approve and Reopen"**:
     - Deletes the temporary scorecard row from the `results` table (to prevent duplicate submissions).
     - Sets the request status to `approved`.
     - Resets the exam session status (`is_submitted = false` or `status = 'in_progress'`), resets `start_time` to `NOW()`, and adjusts `total_duration_seconds` to the student's remaining time.
4. **Proxy Parameter Parser**: The admin panel uses a REST proxy API to talk to Supabase. To prevent request failures due to multiline parsing bugs in the proxy, all PostgREST query parameters (like RPC selections) are strictly formatted as single-line strings without whitespace or carriage returns.
5. **Session Restore Logic**: When `restoreResumedSession()` runs:
   - It restores the exact questions, answers, and review flags (`is_marked`) from the database snapshot saved inside the `exam_support_requests` record.
   - It verifies the request status in the database first to prevent duplicate resume replay exploits.
   - It explicitly resets the `examStore.isSubmitted` flag to `false` to clear any expired time-out overlays.

---

## 6. Supabase Tables & Key Database RPCs

> [!NOTE]
> The full database schema structure and constraints are defined in [entireSchema.sql](file:///c:/Users/admin/Desktop/testjee/entireSchema.sql).

### Key Tables
* **`students`**: Personal profile, email, verification state, approved checks, total practice tests remaining, `mobile_number` (required for genuine users), and `is_genuine_user` (boolean, default `true` — see Section 7).
* **`exam_sessions`**: Practice session logs (linked to `students`). Stores start/end times and submission status.
* **`results`**: Practice answers array and scores.
* **`exam_support_requests`**: Appealed anti-cheat logs, status (`pending`, `approved`, `completed`), and JSON snapshots of questions and answers.
* **`temp_students`**: Temporary usernames and passwords assigned to live test takers.
* **`live_exam_sessions`**: Live scheduled tests created by instructors, containing the active status (`scheduled`, `live`, `completed`).
* **`student_exam_sessions`**: Live testing states. Stores individual progress, score, start/end timestamps, and question shuffling arrays.
* **`student_answers`**: Detail tables tracking live session answers, time spent per question, and review markers.

### Key RPC Definitions (Security Definer Bypasses)
1. **`student_exam_login(input_session_code, input_username)`**
   * Verifies live session code and student username. Returns student details, status, and duration bounds.
2. **`start_student_exam(input_student_session_id)`**
   * Transitions a student's session to `in_progress`, populates the shuffled `question_order` array, and sets the active timestamps.
3. **`get_student_exam_questions(input_student_session_id)`**
   * Securely returns the text content, options, topics, image resources, and existing answers for the student's assigned questions.
4. **`save_student_answer(input_student_session_id, input_question_id, input_question_number, input_selected_answer, input_time_spent_seconds, input_is_marked_for_review)`**
   * Persists a student's response state, time counters, and review flags into `student_answers` on every click.
5. **`submit_student_exam(input_student_session_id)`**
   * Evaluates responses, computes scores using config marking parameters, registers final ranks, and sets the session status to `submitted`.
6. **`get_student_live_result(input_student_session_id)`**
   * Securely aggregates student ranks, scores, and accuracy parameters for presentation in results.

---

## 7. Genuine User Flag & Compulsory Phone Number Enforcement

### A. `is_genuine_user` Column (students table)
* **Type**: `boolean NOT NULL DEFAULT true`
* **Migration applied**: `ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_genuine_user boolean NOT NULL DEFAULT true;`
* **Purpose**: Distinguishes real paying customers from internal dev/test accounts. When `false`, the student is treated as a dev/internal user and phone-number enforcement is completely skipped.
* **Default**: All existing and new rows default to `true` — no existing student is affected unless explicitly toggled.

### B. Admin Toggle Controls
Admins can flip this field in two places inside **`Testjee.com_auth_admin`**:
* **[DashboardPage.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_auth_admin/src/pages/DashboardPage.vue)** — "Genuine User" column in the All Students table. Each row shows a green `✓ Genuine` or gray `⚙ Dev` pill plus a small swap-icon button that calls `toggleGenuineUser()`.
* **[StudentDetailPage.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_auth_admin/src/pages/StudentDetailPage.vue)** — Badge and `Mark as Dev` / `Mark as Genuine` button in the student header card, alongside the existing approval toggle. Calls `toggleGenuineUser()`.

Both call `supabase.from('students').update({ is_genuine_user: newValue })` directly and update the local reactive state on success.

### C. Compulsory Phone Number Overlay (Dashboard.vue)
* **Location**: [Dashboard.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/Dashboard.vue) — injected via `<Teleport to="body">` at the very top of the template.
* **z-index**: `200` — above all modals, sidebars, and exam controls.
* **Trigger condition** (`needsPhone` computed):
  ```javascript
  const VALID_PHONE_REGEX = /^[6-9]\d{9}$/  // Indian numbers only
  const needsPhone = computed(() => {
    const profile = studentProfile.value
    if (!profile) return false                          // still loading
    if (profile.is_genuine_user === false) return false // dev accounts exempt
    return !VALID_PHONE_REGEX.test(profile.mobile_number || '')
  })
  ```
* **Non-dismissible**: No close button. The backdrop is not clickable. The only exits are:
  1. Submit a valid 10-digit Indian mobile number → saved via `authStore.updateStudentProfile()` → `needsPhone` becomes `false` reactively → overlay disappears.
  2. Click **"Sign out of your account"** → `authStore.logout()` → redirect to `/`.
* **Catches Google OAuth users**: Since Google sign-up skips the mobile input form, they hit this overlay on first dashboard load.

### D. Compulsory Mobile in Sign-Up Form (Login.vue)
* The **Mobile** field in the Email/Password sign-up form now shows a red `*` asterisk.
* Input has `required`, `inputmode="numeric"`, and `maxlength="10"` attributes.
* JavaScript `validateSignUp()` already enforces the `^[6-9]\d{9}$` regex before submission — the form cannot be submitted without a valid number.

---

## 8. Live Mock Exam Bug Fixes (July 2026)

The following bug fixes were implemented to stabilize the live exam system:

### A. Lobby Waiting Room & Dynamic Start Labels
* **Files**: [ExamWaitingRoom.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/live-exam/ExamWaitingRoom.vue), [AdminLiveSessions.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/admin/AdminLiveSessions.vue)
* **Changes**: 
  - Restored `canStartExam` to only allow entering once the session status is `'live'` (preventing DB `exam is not live` errors if student clicks button when the DB status is still `'scheduled'`).
  - Added an `isTimeReached` computed property in the waiting room. Once the countdown hits `00:00:00` and the scheduled time has passed, the UI displays **"Waiting for Instructor"** with a helpful description explaining that the exam will begin as soon as the instructor starts the session.
  - Dynamically changes the start button label in the admin dashboard from **"Start Early"** to **"Start Exam"** if the scheduled time has already passed.

### B. Question Rendering & Layout Crash Prevention (KCET Layout Fix)
* **Files**: [liveExamBridge.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/stores/liveExamBridge.js), [QuestionArea.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/QuestionArea.vue), [exam-support-live-rls.sql](file:///c:/Users/admin/Desktop/testjee/exam-support-live-rls.sql)
* **Changes**: 
  - Live exams return `question_content` as a parsed JSON object. The bridge now stringifies the question content object/stem text to ensure `q.text` is always a string. Defensive type checks were also added to `QuestionArea.vue` before checking `.includes()`.
  - Created a public/anonymous SELECT policy on `live_exam_sessions` (and `student_exam_sessions`). Without this, the student client was blocked by RLS from reading the `exam_type` column of the session on lobby load or reload, causing the bridge to fall back to the default `JEE_MAIN_FULL` structure (which mistakenly loaded Maths and Chemistry sections for a KCET Physics mock test).

### C. Live Header Student Name
* **File**: [HeaderBar.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/HeaderBar.vue)
* **Changes**: Implemented `studentNameDisplay` computed property. If `isLiveMode` is true, the header extracts the student's name from `liveStore.sessionDetails.studentName` (falling back to username) rather than referencing the empty `authStore.studentName` of the unauthenticated auth session.

### D. DB Schema & Support Appeals RLS Policies
* **File**: [exam-support-live-rls.sql](file:///c:/Users/admin/Desktop/testjee/exam-support-live-rls.sql)
* **Changes**: 
  - Appended a migration to add the missing `end_time` column to the `student_exam_sessions` table if it is not present, resolving syntax/schema errors when admins click **"Approve and Reopen"** for live resumption requests.
  - Configured SELECT, INSERT, and UPDATE policies on `exam_support_requests` for the anonymous (`anon`) role, gated on `student_session_id IS NOT NULL`.

### E. Submitted Reload & Resumption Lock
* **Files**: [router/index.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/router/index.js), [ExamLayout.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/ExamLayout.vue)
* **Changes**:
  - Added a status check in the reload-recovery router guard (`router/index.js`). If `liveStore.examStatus` is already `'submitted'` or `'auto_submitted'` during page refresh, the student is blocked from re-entering `/exam` and immediately redirected to their results page `/live-exam/${sessionCode}/results`.
  - Fixed a UI state lock where the "Exam Time Expired" screen persisted after resumption because the `examStore.isSubmitted` flag was never reset. It is now explicitly set to `false` when `resumeTest` succeeds.

### F. Deprecated Bare-Bones Active UI Bypass
* **Files**: [ExamLogin.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/live-exam/ExamLogin.vue), [ExamWaitingRoom.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/live-exam/ExamWaitingRoom.vue)
* **Changes**: 
  - Centralized in-progress mock exam re-logins. Previously, logging back in while the test was `in_progress` redirected the student to `/live-exam/:sessionCode/active` (`LiveExamInterface.vue`), which is a deprecated, bare-bones UI with layout glitches and blank question palettes.
  - Re-routed all `in_progress` pathways to `/lobby` instead. In the lobby, the `onMounted` hook fetches the session's configuration parameters, invokes the Pinia bridge, and automatically pushes the student directly to `/exam?mode=live&sessionCode=CODE` (the primary proctored layout), bypassing the bare-bones screen completely.

### G. Question Subject Mapping & Layout Grouping
* **Files**: [examSessionStore.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/stores/examSessionStore.js), [exam-support-live-rls.sql](file:///c:/Users/admin/Desktop/testjee/exam-support-live-rls.sql)
* **Changes**:
  - Resolved an issue where questions from different subjects were mixed up across the layout sections (e.g., Chemistry questions showing inside the Physics tab). The backend RPC `get_student_exam_questions` does not return `subject_name` or `subject_id`, and the client previously guessed the subject by dividing the question number into blocks. Because the questions are shuffled, this block indexing was completely broken.
  - Reconfigured `loadQuestions` in `examSessionStore.js` to query the public `questions` table directly for the loaded question IDs, resolving the actual `subject_id` and joining `subjects(subject_name)`. Added a SELECT policy on the `questions` table to allow anonymous reads.
  - By resolving and mapping actual database subject names client-side, all questions are mapped to their correct sections for all exam configurations (JEE, NEET, KCET).

### H. Question Sorting & Numerical Grouping
* **File**: [liveExamBridge.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/stores/liveExamBridge.js)
* **Changes**: 
  - Restructured the bridged question array inside `liveExamBridge.js` to group questions by subject order (Physics first, then Chemistry, then Mathematics) and within each subject, group MCQs (`multiple_choice`) first and Numerical (`numeric`) questions last.
  - Uses JavaScript's stable sorting to preserve the randomized relative order generated by the database for each student's MCQ and Numeric sets.
  - Loops through the finalized sorted list to assign correct sequential `question_number` keys from `1` to `N` (e.g. 1 to 75 for JEE, 180 for NEET, 60 for KCET) so that question numbers do not display as scrambled values.

### I. Database Scoring & Negative Marking Fix
* **File**: [exam-support-live-rls.sql](file:///c:/Users/admin/Desktop/testjee/exam-support-live-rls.sql)
* **Changes**: 
  - Patched the logical grading errors in the PostgreSQL database function `submit_student_exam`.
  - **Max Score Fix**: Replaced the incorrect `v_max_score` evaluation (`COUNT(*) * 4` of the student's answered rows in `student_answers` which dynamic-sized the max score based on their attempts, e.g. showing 112 instead of 300) with the true maximum score of the paper: `cardinality(ses.question_order) * v_correct_marks`.
  - **Negative Marking Fix**: Previously, incorrect answers scored `0.0`. It now resolves the session's active `exam_type`. For KCET, it sets Correct = `+1.0`, Incorrect = `0.0`. For JEE and NEET, it applies correct negative markings: Correct = `+4.0`, Incorrect = `-1.0` (unattempted questions stay at `0.0`).
  - Added RLS grant execution to make it callable by both `anon` and `authenticated` roles.

---

## 9. Detailed Exam Results & Admin Click-Through Review (July 2026)

The following detailed results and review capabilities were added to improve student feedback and instructor review flows:

### A. Live Exam Detailed Attempt RPC (`get_student_live_detailed_results`)
* **RPC Signature**: `get_student_live_detailed_results(input_student_session_id INTEGER, p_admin_token TEXT DEFAULT NULL)`
* **Shuffled Mapping**: Reconstructs the student's exact shuffled exam order by lateral-joining and unnesting `student_exam_sessions.question_order`.
* **Security Gates**: 
  - If a student accesses it, the function verifies that the corresponding `live_exam_sessions` status is `'completed'` (meaning the admin ended the exam). It prevents leakage of correct answers while the exam is active.
  - If an instructor accesses it, they pass their admin token (`p_admin_token`), verifying their credential via `verify_admin_session`, which grants immediate read access to the detailed responses.
* **PostgREST Call Signature**: To ensure PostgREST matches the double parameter signature `(integer, text)` in the schema cache, the student results view calls the RPC explicitly passing `{ p_admin_token: null }`.

### B. Student Results Detailed View (`StudentResults.vue`)
* **Live Session Polling**: The page now checks the live exam status. If the exam is still active, it polls `live_exam_sessions` every 5 seconds.
* **Integrity Notice**: While the exam is active, it continues showing the *"Detailed Answer Key Hidden"* placeholder.
* **Instant Reveal**: As soon as the polling detects that the instructor ended the session, the poll ceases, scores/rankings are updated, and the attempt analysis is instantly displayed.
* **Subject Grouped Grid**: Shows the complete card grid of questions grouped by subject (e.g. Physics, Chemistry, Mathematics). Each card displays the question number, correct/incorrect status, time spent, selected answer, and correct answer.
* **Inline Modal Overlay**: Teleports a dialog to the document body to display full question stems, images, choice options, selected answer vs correct answer comparisons, and solutions/explanations.

### C. Instructor Live Results Dashboard (`ExamResults.vue`)
* **Leaderboard Interactivity**: Hovering over student rows (for students who started the test) turns the cursor to a pointer. Clicking a row initiates the view.
* **Review Drawer**: Opens a slide-over panel displaying the student's details, aggregate statistics, and the exact same subject-grouped question grid.
* **Instructor Question Modal**: Instructors can click any card in the grid to open the identical Teleported question detail modal to inspect the exact options, question images, responses, and solutions.
* **Admin Secure Client-Side Join Bypass (`get_student_session_id_by_username` RPC)**: Solved RLS restrictions preventing the admin app's anonymous client from joining `temp_students` table by adding a secure helper RPC.
* **Admin Unified Question Order & Labeling**: Implemented a single, deterministic sorting convention for admin reviews:
  1. Sort by subject order (from `EXAM_CONFIGS`).
  2. Within each subject: MCQs first, Numerics last.
  3. Within MCQs/Numerics: **sort by `question_id` ascending!** (Since `question_id` is a database key, it is static and identical across all students, satisfying the user's need for a single, consistent arrangement).

### D. Admin Student Practice Detail Review (`StudentDetailPage.vue`)
* **Clickable Practice Attempt List**: Rows in the **Exam History** table (under the practice sessions list) are now hover-interactive and clickable for any submitted practice session.
* **Practice Attempt Drawer**: Clicking a submitted session opens an overlay drawer featuring the detailed score, total questions attempted, and a subject-grouped card layout representing each question.
* **Question Detail Modal**: Clicking a question card opens a modal overlay showing the question stem, images, answer choices, what answer the student selected, the correct answer, time spent on that question, and the explanation/solution text.
* **Z-Index Layering**: Increased the z-index of results drawers to `z-[60]` in both `StudentDetailPage.vue` and `ExamResults.vue` to prevent overlapping by dashboard navigation top bars.

### E. Refresh State Recovery on Results Screen
* **Reload Persistence**: Persisted the results dashboard on reload by checking `sessionStorage` for the active `student_username` on mount. If a saved session username is found, it automatically calls `store.loginToExam(...)` to re-initialize and restore their Pinia session.

---

## 10. Database-Driven Practice Signup Approval & Quota System

A secure database-driven administrative verification and test-limiting system is implemented for self-serve practice accounts:

### A. Signup Approval Flow
1. **Student Registration**: When a student signs up via the form in `Login.vue`, the client checks if the email is registered using `check_email_exists()`. If unique, the user's Supabase Auth record is registered, and a corresponding profile row is inserted into the `students` table with `is_approved = false`.
2. **Admin Approvals Queue**: Active pending students are loaded inside the **Auth Admin Console** (`Testjee.com_auth_admin/src/pages/DashboardPage.vue`).
3. **Approval Execution**: The platform owner manually approves students by toggling their approval state, which directly runs an `UPDATE` on the `students` table setting `is_approved = true`.

### B. Practice Test Quota & Payment Redirection
1. **Compulsory Test Count**: Every approved student profile contains a `number_of_tests` balance (defaults to 1).
2. **Quota Decrement**: Launching a mock test from `Dashboard.vue` decrements `number_of_tests` by 1.
3. **Out-of-Tests Gate**: If a student attempts to start a mock test with `number_of_tests == 0`, they are blocked from entry.
4. **Quota Request & Payment**: Students can purchase more tests. Clicking "Request More Tests" sets `is_approved = false` on their profile and redirects them to the **Payment screen** (`PaymentPage.vue`), where they are shown the QR transaction details.
5. **Admin Re-Approval**: After verifying the payment manually, the admin updates the student's test balance and resets `is_approved = true` in the Auth Admin Console to restore access.

### C. Email Confirmation Exemption
* **Design Rule**: Admin database approval serves as the definitive gate. To prevent students from getting stuck, the `email_confirmed_at` check is bypassed in `Login.vue` and the router guard.
* **Requirement**: Supabase Auth settings must have **"Confirm email" disabled (OFF)**.

### D. Timer Stacking Prevention
* **Global Ref Tracker**: Standard practice exams manage timers using a single `globalTimerInterval` reference inside `examStore.js`.
* **Clearance**: Both `startTimer()` and `resetExamState()` explicitly clear existing intervals before spawning new ones to prevent timer acceleration loops on consecutive attempts.

---

## 11. Signup Approval Lifecycle Hardening (July 2026)

Section 10's approval model (`is_approved` boolean only) had three concrete gaps, fixed by adding two new `students` columns via [signup-lifecycle-migration.sql](file:///c:/Users/admin/Desktop/testjee/signup-lifecycle-migration.sql):

### A. `is_rejected` — Reject no longer deletes the row
* **Old behavior**: Admin's **Reject** button hard-`DELETE`d the `students` row. Since `auth.users` was untouched, a rejected student could still log in — `fetchOrCreateStudent()`'s "not found → create new" fallback then silently re-created a fresh pending row, making rejection effectively a no-op with no trace and no message shown to the student.
* **New behavior**: Reject sets `is_rejected = true, is_approved = false` and **keeps the row**. [WaitingApproval.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/WaitingApproval.vue) shows a distinct "Application Rejected" screen (with a WhatsApp contact link) instead of looping back into "waiting." The email stays permanently reserved (blocks re-signup via `check_email_exists`) until an admin clicks **Reopen** (`Testjee.com_auth_admin`'s `DashboardPage.vue`/`StudentDetailPage.vue`), which just clears `is_rejected`.
* **Revoke** (unrelated, unchanged) still just sets `is_approved = false` — it's the soft "back to pending" action, distinct from the sticky Reject state.

### B. `payment_confirmed` — Lead vs. genuine approval request
* **Old behavior**: The `students` row (and thus visibility in the admin's "Pending Approvals" queue) was created at signup/first-Google-login — before the student ever saw the payment page, let alone paid.
* **New behavior**: Signup/Google-auth still creates the row immediately (`payment_confirmed` defaults `false`) — it's now a **Lead**, shown in a separate "Leads — Not Yet Paid" section in the admin dashboard with a WhatsApp follow-up button, kept out of Pending Approvals. Only [PaymentPage.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/PaymentPage.vue)'s `confirmPayment()` (the "I have completed the payment" click) sets `payment_confirmed = true`, promoting it into Pending Approvals. `Dashboard.vue`/`Results.vue`'s "Request More Tests" flow resets `payment_confirmed = false` when re-entering the payment page for a repeat purchase.
* Admin's **Approve** action also force-sets `payment_confirmed = true` (and clears `is_rejected`), so an admin can promote a Lead straight to Approved if payment was verified manually (e.g. over WhatsApp) without the student ever clicking the in-app button.

### C. Mandatory Phone Number — Google sign-in bypass closed
* **The bug**: `validateSignUp()` in `Login.vue` required a valid phone for the manual email/password form, but `handleGoogleSignIn()` had no equivalent check — a Google-authenticated student could reach the admin's approval queue with `mobile_number = null`, making WhatsApp follow-up impossible.
* **The fix**: [AuthCallback.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/AuthCallback.vue) (the Google OAuth redirect target) now checks `mobile_number` against the same `^[6-9]\d{9}$` regex after `fetchOrCreateStudent()`. If missing/invalid, it blocks with an inline "One last thing" phone-entry step before routing onward to payment — same requirement, just enforced at the point where Google sign-in actually creates the account instead of only in the manual form's client-side validation. `Dashboard.vue`'s existing non-dismissible phone overlay (Section 7) remains as a safety net for any pre-existing accounts that slipped through before this fix.

### D. Admin dashboard additions (`Testjee.com_auth_admin`)
* **Leads** and **Rejected** sections added to `DashboardPage.vue` (new `LeadCard.vue` component), alongside the existing Pending Approvals/All Students. Filter dropdown gained `lead`/`rejected` options.
* **WhatsApp buttons** added to `PendingCard.vue`, `LeadCard.vue`, and a per-row column in the All Students table (shown whenever `mobile_number` is present).
* **"Attempted" column** added to All Students — cross-references `exam_sessions.is_submitted = true` per `student_id` to show whether a student has ever completed a practice exam.
* **Exam Support Logs & Appeals** section moved below All Students and collapsed by default behind a Show more/Hide toggle (previously always-expanded and usually empty, pushing more relevant sections down).

### E. No email notifications exist
* Grepped the full repo — no email-sending integration (EmailJS/SendGrid/Resend/etc.) exists anywhere. Approve/Reject only write to the DB; the only real emails sent are Supabase Auth's own built-in ones (verification, password reset), unrelated to the approval flow. `WaitingApproval.vue`'s previous "you'll receive an email when approved" copy (false) was removed and replaced with "we'll update this page automatically." `AdminApprove.vue` is a dead/legacy component built for an email-link-triggered approval flow that nothing in the codebase actually sends — unused.

---

## 12. Shared Question Selection Engine & Topic-Wise Live Scheduling (July 2026)

* **New file**: [topicExamEngine.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/utils/topicExamEngine.js) — extracts the question-selection algorithm (subject-name resolution via `subjectNameSynonyms`, `selectUniformlyFromTopics` round-robin + image-dedup, and cross-category "borrowing") that was previously duplicated between `examStore.js` (student practice) and `ScheduleExam.vue` (admin live scheduling) — the admin copy was a weaker reimplementation with no cross-category fallback. See [TECHNICAL_DETAILS.md Section 5](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/TECHNICAL_DETAILS.md) for the full algorithm.
* **`examStore.js`** imports the shared `selectUniformlyFromTopics`/`shuffleArray` instead of a local copy (pure dedup, no behavior change), and its 8 fallback-tier question fetches now go through the true-random RPC below instead of a raw `.limit(n)` query.
* **`ScheduleExam.vue`** (admin live exam scheduling) gained full parity with the student dashboard's topic-wise flow: colorful JEE/NEET/KCET cards (replacing the flat tile grid), a Full Mock Test vs Topic Wise mode toggle, and a Class 11/12 topic picker per subject. Session creation now calls the shared `compileExamQuestions()`, which — unlike the old admin-only assembly — includes the cross-category borrow fallback and blocks with a clear per-subject error (`shortfalls`) if the question pool can't be filled even after borrowing, instead of silently shipping a shorter paper. See [admin_architecture_and_flow.md Phase 7](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/admin_architecture_and_flow.md).
* **Payment page custom test count**: [PaymentPage.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/PaymentPage.vue)'s "Change Plan" selector gained a Custom option (number input, 1-100), matching the sign-up page's existing custom package picker — previously only the 6 preset tiers were selectable there.

### F. True Random Candidate Fetch (`get_random_questions` RPC)
* **The bug**: every question-selection query (both `examStore.js` and the admin scheduler) fetched candidates via a plain `.limit(n)` with no `ORDER BY`. Postgres/PostgREST return unordered queries in roughly insertion order — at this platform's scale (10,000+ questions, 3,000+ per subject), a `.limit(1000)` candidate pool could be systematically dominated by whichever topics were uploaded first, silently excluding later-uploaded topics from ever being selectable, regardless of how correctly "uniform across topics" the downstream round-robin logic (`selectUniformlyFromTopics`) was — it can only work with whatever candidates actually got fetched.
* **The fix**: [random-question-selection-rpc.sql](file:///c:/Users/admin/Desktop/testjee/random-question-selection-rpc.sql) adds a `get_random_questions` `SECURITY DEFINER` RPC that does `ORDER BY random() LIMIT n` at the database level. `fetchRandomQuestionBatch()` in `topicExamEngine.js` calls it and reshapes the flat result back into the nested `{ topics: { topic_name }, choices: { choice1..4 } }` shape the selection/transform pipeline already expected, so no downstream code needed to change. Used by both `examStore.js` (student practice, all fallback tiers) and `compileSubjectQuestions` (admin scheduling).

---

## 13. Institution-Specific Branding (July 2026)

Admins (colleges) can now have their own logo + name shown throughout the live-exam flow, manually configured by us (no admin-facing upload UI):

* **DB**: [college-branding-migration.sql](file:///c:/Users/admin/Desktop/testjee/college-branding-migration.sql) adds `admins.logo_url text`. Logos are stored manually in a Supabase Storage bucket (`Admins/College_Logos/`, set **public** so `logo_url` works directly as an `<img src>`) — we contact each admin, get their logo + college name, and set `institute_name`/`logo_url` via the Table Editor. No student/admin-facing upload feature was built by design.
* **Two new RPCs** (the `admins` table itself stays locked down — never given a public SELECT policy, since it holds `password`/`session_token`):
  - `get_admin_branding(p_token)` — token-verified (same pattern as every other hardened admin RPC), returns the logged-in admin's own `institute_name`/`logo_url`. Used by [AdminLayout.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/admin/AdminLayout.vue) to show the college's logo/name next to the TestJEE logo in the admin header.
  - `get_session_branding(input_session_code)` — public (no admin session exists yet on student-facing pages), joins `live_exam_sessions.admin_id → admins`. Used by [ExamLogin.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/live-exam/ExamLogin.vue) (debounced fetch as the student types/arrives with a session code — shows the college's branding above a "Powered by TestJEE" caption, falling back to plain TestJEE branding if none is set) and [ExamWaitingRoom.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/live-exam/ExamWaitingRoom.vue) (shown in the lobby card header).

**Note**: no "reschedule an already-scheduled live session" feature exists today — `AdminLiveSessions.vue` only offers Cancel (kills it) or Duplicate (prefills a brand-new session form with a different time); there's no in-place edit of an existing scheduled session's date/time.

---

## 14. Reschedule / Nudge a Scheduled Live Session, Live Countdown Sync (July 2026)

Closes the gap noted in Section 13 — admins can now edit an already-scheduled session's start time in place, and the change propagates to students already sitting in the lobby without a page refresh.

* **DB**: [reschedule-live-exam-session-rpc.sql](file:///c:/Users/admin/Desktop/testjee/reschedule-live-exam-session-rpc.sql) adds two token-verified, ownership-checked RPCs, both only usable while `status = 'scheduled'`:
  - `reschedule_live_exam_session(p_token, live_session_id, new_start_time, duration_minutes?)` — full reschedule to an exact new date/time, optionally also changing duration.
  - `nudge_live_exam_session_start(p_token, live_session_id, minutes)` — relative shift (the "+5 min" button), computed via a server-side `INTERVAL` add so it's immune to client/server clock skew.
* **Admin UI**: `SessionCredentials.vue`'s existing Admin Controls bar gained **+5 min** and **Reschedule** (inline datetime + duration form) buttons alongside the existing Cancel/Force Start Exam. `AdminLiveSessions.vue`'s per-session card gained a **+5 min** quick button too (the full reschedule form only lives on the Credentials page, to avoid a duplicated inline form per list row).
* **Live propagation to the student lobby — the actual interesting part**: both RPCs `UPDATE` the `live_exam_sessions` row, which the lobby's existing Realtime subscription (`ExamWaitingRoom.vue`, channel `lobby-{sessionCode}`, already listening for `UPDATE` on that table) already fires on with zero DB-side changes needed. The fix was client-side: `checkStatusSafely()` previously only read `session_status`/`can_start` off the `student_exam_login` RPC response and ignored everything else, so even though the Realtime event correctly triggered a refetch, the countdown kept counting down to the **stale** cached `scheduledStartTime` in the Pinia store. Now every call to `checkStatusSafely()` (both the Realtime-triggered one and the 5s poll fallback) also refreshes `store.sessionDetails.scheduledStartTime`/`scheduledEndTime`/`durationMinutes` from the RPC's response — so a reschedule or nudge updates the lobby countdown live, no refresh needed.
* **Bug found + fixed while testing this**: `reschedule_live_exam_session`/`nudge_live_exam_session_start` both initially hit Postgres error 42702 ("column reference is ambiguous") — `RETURNS TABLE(scheduled_start_time, scheduled_end_time, duration_minutes)` implicitly declares those names as PL/pgSQL variables inside the function body, colliding with the real table columns whenever referenced without a table alias. Fixed by aliasing `live_exam_sessions AS les` everywhere in both functions.

### G. Pre-existing bug found (not caused by anything above): "0 Student Slots" after refreshing the Credentials page
* **Symptom**: `SessionCredentials.vue` correctly shows student usernames right after creating a session (fast path, reading `sessionStorage`), but shows "0 Student Slots" after a page refresh — even when the `temp_students` rows genuinely exist (visible directly in Table Editor) for that session's `admin_test_id`. No console error either.
* **Root cause**: the DB-fallback path (used on refresh, once the one-time `sessionStorage` cache is gone) queried `temp_students` directly from the client (`.from('temp_students').select(...)`). This table was **deliberately never given RLS policies** in this project (see the Security Hardening section's "Deliberately NOT done" note) — meaning its client-side readability has always silently depended on RLS being off for that table. Supabase does not error when RLS blocks a `SELECT`; it just returns zero rows, which is exactly this symptom.
* **Fix**: [get-session-credentials-rpc.sql](file:///c:/Users/admin/Desktop/testjee/get-session-credentials-rpc.sql) adds `get_session_credentials(p_token, live_session_id)` — a token-verified, ownership-checked `SECURITY DEFINER` RPC (same pattern as `student_exam_login`, `get_admin_pending_appeals`, etc.), which `SessionCredentials.vue`'s `fetchFromDatabase()` now calls instead of the raw table read. This both fixes the bug regardless of the table's actual current RLS state, and closes a latent privacy gap the old code had (no ownership check at all — any admin's browser could query any other admin's `admin_test_id` for its student roster).

---

## 15. Live "Students in Lobby" Presence + Session Credentials Page Redesign (July 2026)

### A. Live lobby presence (distinct from the "not started" DB status)
* **The gap**: `student_exam_sessions.status = 'not_started'` (the "Wait" bucket on the sessions list) is set for every enrolled student from the moment the admin schedules the session — it only changes when they click "Start Exam." So it can't tell "never opened the link" apart from "sitting in the lobby right now, waiting." There is no presence/connection concept anywhere in the schema.
* **The fix**: [lobbyPresence.js](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/utils/lobbyPresence.js) — a small shared module using Supabase Realtime **Presence** (not `postgres_changes`; no DB writes, no replication dependency, purely socket-based and auto-cleared the instant a tab closes) on the lobby's existing `lobby-{sessionCode}` Realtime channel:
  - `trackLobbyPresence(channel, identity)` — student side. `ExamWaitingRoom.vue` calls this once its existing channel subscription reports `SUBSCRIBED`.
  - `watchLobbyPresence(sessionCode, onCountChange)` — admin side. Subscribes to the same channel purely to observe (never calls `.track()` itself, so the admin never counts as a "present student"), returns the channel for cleanup. Used by both `AdminLiveSessions.vue` (one watch per visible scheduled/live session card, a `Map` keyed by session code for cleanup) and `SessionCredentials.vue` (single watch for the one session it's showing).
* Displayed as a small pulsing "N in lobby now" indicator — sessions list (per card) and the Credentials page header.

### B. Session Credentials page redesign
* **The problem**: `SessionCredentials.vue` was never included in the Phase 6 "Impeccable" design pass that gave the rest of the admin panel its `canvas`/`surface`/`ink`/`gta-*` token system — it still used raw Tailwind grays/blues, and had accumulated a lot of stacked, differently-styled zones (distribution actions, a bordered gray "Admin Controls" box with an inline reschedule form, error/success banners, then a separately-styled printable card) that read as cluttered next to the rest of the panel.
* **The fix**: rebuilt using the existing tokens and this project's own product-register principles (calm under load, whitespace/typography over borders, no nested cards, one confident primary action per screen — see `Testjee.com_login_main_sthome_test/PRODUCT.md`):
  - Header consolidated into one block: session name, status badge, scheduled time, live presence — no more separate boxed status area.
  - Copy Link / WhatsApp / Print given equal visual weight (all quiet outline buttons) since none of them is *the* primary action; **Force Start Exam** is the only solid/filled button on the page, as the one genuine commit action.
  - The "Admin Controls" bordered box replaced with a plain top-rule + inline action row; the reschedule form reveals inline in a soft `canvas`-tinted panel instead of a second bordered box.
  - Credential grid cards lost their dashed-border hover-color-flip gimmick in favor of plain, consistent `canvas`-tinted rows.
  - Print stylesheet, Copy Link/WhatsApp share, and all reschedule/nudge/cancel/force-start logic preserved exactly — this was a visual pass only, no behavior changes beyond the new presence indicator.

