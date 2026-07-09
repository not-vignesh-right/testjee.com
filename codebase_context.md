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
│   ├── stores/
│   │   ├── authStore.js         # Student authentication, profile registration & approval state
│   │   ├── adminStore.js        # Administrator authentication and live monitoring control
│   │   ├── examStore.js         # Practice exam logic (timers, answers, appeal snapshots, RLS calls)
│   │   └── examSessionStore.js  # Live session logic (temp student credentials, saveAnswer RLS triggers)
│   └── components/
│       ├── Login.vue            # Student credentials login / register (mobile field is required*)
│       ├── Dashboard.vue        # Student landing page + compulsory phone-number overlay (Section 7)
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
    └── pages/
        ├── DashboardPage.vue    # Student list table with approval, test count, and is_genuine_user toggles
        └── StudentDetailPage.vue # Full student profile editor with Genuine/Dev toggle in header
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

## 10. Email-Based Practice Signup Approval & Quota System

A secure administrative verification and test-limiting system is implemented for self-serve practice accounts:

### A. Signup Approval Flow
1. **Student Registration**: When a student fills out the registration form in `Login.vue`, the client runs a duplicate check calling `check_email_exists()`. If unique, it triggers an **EmailJS** template dispatch to the administrator.
2. **Approval Request**: The dispatch includes student metadata and a base64 encoded payload mapped to an approval link pointing to `https://login.testjee.com/admin-approve`.
3. **Approval Landing (`AdminApprove.vue`)**: When the admin clicks the link, the page verifies the metadata, programmatically registers the student account in Supabase Auth, adds their row to the `students` table, and sets `is_approved = true`.

### B. Practice Test Quota Management
1. **Compulsory Test Count**: Every approved student profile contains a `number_of_tests` balance (defaults to 1).
2. **Quota Decrement**: When a student launches a new practice mock test from `Dashboard.vue`, the system decrements `number_of_tests` by 1.
3. **Out-of-Tests Gate**: If a student attempts to start a mock test with `number_of_tests == 0`, the client intercepts the flow and renders a **"Request More Tests"** modal popup.
4. **Quota Restore Appeal**: In the modal, the student selects a quota size (1, 3, 5, or 10 tests), which sends an EmailJS request to the admin containing a restore link:
   ```
   https://login.testjee.com/admin-approve?action=restore&email=EMAIL&tests=N&name=NAME&sid=STUDENT_ID
   ```
5. **Restore Action**: Clicking the link runs a database update incrementing the student's `number_of_tests` balance.

### C. Email Confirmation Exemption
* **Design Rule**: In this system, admin approval constitutes absolute verification. To prevent students from getting stuck, the `email_confirmed_at` check is fully disabled in `Login.vue` and the router guard.
* **Requirement**: Supabase Auth settings must have **"Confirm email" disabled (OFF)**.

### D. Timer Stacking Prevention
* **Global Ref Tracker**: Standard practice exams manage timers using a single `globalTimerInterval` reference inside `examStore.js`.
* **Clearance**: Both `startTimer()` and `resetExamState()` explicitly clear existing intervals before spawning new ones to prevent timer acceleration loops on consecutive attempts.

