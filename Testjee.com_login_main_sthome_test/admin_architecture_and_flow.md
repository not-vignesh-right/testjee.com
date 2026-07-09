# 📖 Live Exam Admin System — Architecture & Working Flow

> **Document Purpose:**  
> This file serves as the complete reference for the Admin architecture, working flows, Supabase table connections, and RPCs. It is the single source of truth for understanding how the admin system operates. 

---

# ✅ PHASE 6: The "Impeccable" UI/UX Overhaul (Complete)

The admin panel currently functions perfectly, but visually relies on the "Tailwind Default" aesthetic (white cards on gray backgrounds, standard dropdowns, repetitive spacing). Phase 6 will elevate this from a basic internal tool to a **premium, production-grade SaaS product**.

> **Implementation Note:** Built via the `impeccable` skill, which required setup first —
> wrote `PRODUCT.md` (register: product; users: institutes from ~30-student coaching
> centers to large colleges; personality: precise & calm, Linear/Stripe-register) after a
> short interview. Identity-preserving: kept the existing brand blue (`gta-primary`,
> "bright blue from logo") as the system's anchor rather than introducing a new palette —
> the admin panel just never adopted it, unlike the student exam UI, which is the actual
> root cause of the generic feel. Added `canvas`/`surface`/`ink` tokens to
> `tailwind.config.js`, scoped to the admin panel only (student exam UI's `body` background
> and tokens are untouched). One real fix beyond the plan's brief: **contrast**. Several
> initial choices — `ink-400` for secondary text, both hero banners' caption text, several
> semibold-not-bold labels on saturated buttons/badges — computed below 4.5:1 against their
> backgrounds (the exact "muted gray on tinted near-white" trap, plus light text on
> mid-saturation brand color). Fixed by darkening `ink-500` itself, eliminating `ink-400`
> as a text color entirely (kept only where a heavier weight was already safe), and
> swapping banner/badge backgrounds to `gta-secondary`/`red-700` where the lighter brand
> shades couldn't give their text enough headroom. Also added a global
> `prefers-reduced-motion` override in `style.css` (collapses all transitions/animations to
> near-instant), since none existed anywhere in the app before this.

## 1. Global Aesthetic & System (The Foundation)
- **Escape the "Nested Card" Trap:** We will remove unnecessary borders and drop-shadows. Instead of every page being a white card on a gray background, we will use a unified, sophisticated canvas (e.g., a true off-white or deep tinted neutral) and rely on whitespace, typography, and subtle dividers for structure.
- **Typography Upgrade:** Limit to a single, high-quality typeface (e.g., Inter or Outfit). Implement a strict hierarchy using size and weight contrast, abandoning all-caps body text and tiny "eyebrow" tracking. 
- **Micro-interactions:** Add purposeful, exponential ease-out transitions to buttons, list items, and route changes. No bouncy or elastic animations; only smooth, professional motion.

## 2. Redesigning `ScheduleExam.vue` (The Core Flow)
- **Visual "Exam Type" Selection:** Replace the boring `<select>` dropdown with a grid of clickable, premium tiles (JEE, NEET, KCET). Clicking a tile smoothly updates the form state below it.
- **Smart Timing Logic:** As you noted, duration is dictated by the exam (e.g., JEE is 3 hours). We will display the `180 mins` as a locked, branded badge (tied to the Exam Type tile). It will have a subtle "Edit Custom Duration" button next to it for edge cases, reducing cognitive load for the 99% standard path.
- **Smarter Date Picking:** Default the `start_time` to `now + 5 minutes` as planned, but style the input to feel like a premium scheduling tool, not a raw HTML5 input.

## 3. Redesigning `LiveExamMonitor.vue` (The War Room)
- **The Progress Tracker:** Transform the basic horizontal progress bar into a striking, data-viz style tracker (e.g., segmented rings or a smooth, gradient-filled gauge) that instantly communicates the ratio of *Waiting vs. In Progress vs. Submitted*.
- **Live Activity Feed:** Animate the entry of new student statuses using `motion` (or native CSS transitions) so the admin *feels* the real-time nature of the exam. 

## 4. Redesigning `AdminHome.vue` (The Dashboard)
- **Break the "Identical Grid" Cliché:** Instead of 4 identically sized stat cards for Quotas and Limits, we will use an asymmetrical layout. The "Live Now" banner will dominate as the hero element, while quotas will be visualized as sleek, minimal inline sparklines or typographic locks.

---

# ✅ Upcoming Enhancements (Complete)

**1. Default Schedule Time (`ScheduleExam.vue`)** — `minDateTime` now computes `now + 5
minutes` instead of `now` (the `formData.start_time` default follows automatically, since it
initializes from `minDateTime.value`).

**2. Session Lifecycle Controls (`SessionCredentials.vue`)** — added an "Admin Controls" bar
between the distribution-actions row (Copy/WhatsApp/Print) and the printable credentials
area, shown only while `meta.status === 'scheduled'`:
- **Cancel Session** → `cancel_live_exam_session(p_token, ...)` (token-verified) → redirects to `/admin/sessions` on success.
- **Force Start Exam** → `admin_start_exam(input_admin_id, ...)` → redirects to the monitor page on success. Note: `admin_start_exam` is one of the five pre-existing RPCs *not* hardened to token-based auth (see the Security Hardening section above) — still takes `input_admin_id`, matching how `AdminLiveSessions.vue`'s own "Start Early" button already calls it.
- `meta.status` is now fetched in both load paths (added to the DB-fallback's existing `select()`; a small dedicated `fetchStatus()` call for the sessionStorage fast-path, which never carried a status) so the bar reflects reality even if the session was started/cancelled from another tab since this page loaded.

**3. Hide Supabase Links in Exam View (`LiveExamInterface.vue` & `QuestionArea.vue`)** — both
question-text renderers (`currentQuestion.question_content?.text || currentQuestion.question_content`
in the live-mode fallback interface, `examStore.currentQuestion.text` in the shared
`QuestionArea.vue` used by `ExamLayout.vue`) now route through a `questionText` computed
that hides the text block entirely when it exactly matches `image_url` or contains
`supabase.co` — some question rows have no real `.text`, and the raw storage URL was
rendering as link text under the image.

---

## Part 1: Admin System Complete Reference

Everything the admin panel touches: every table, every RPC, every page, and how they fit together. 

## Admin-Related Tables

| Table | Purpose | Key columns | Written by | Read by |
|---|---|---|---|---|
| `admins` | One row per institute/admin account | `admin_id` (PK, integer), `institute_name`, `username`, `password`, `max_tests`, `max_students`, `tests_created`, `students_created`, `is_active` | `admin_login`/signup RPC (not in this codebase) | `adminStore.js` (login, loadSession) |
| `admin_tests` | Groups temp students + regular exam sessions created for a specific test batch | `admin_test_id` (PK) | `create_live_exam_session_custom` RPC (inferred) | `temp_students.admin_test_id`, `exam_sessions.admin_test_id` FK targets |
| `live_exam_sessions` | One row per scheduled/live/completed **live exam session** | `live_session_id` (PK), `session_code`, `session_name`, `admin_id`, `admin_test_id`, `status` (`scheduled`/`live`/`completed`/`cancelled`), `scheduled_start_time`, `scheduled_end_time`, `exam_type` (added Phase 3), `batch_label` (added Phase 5), `instructions` (assumed, unconfirmed) | `create_live_exam_session_custom`, `admin_start_exam`, `admin_end_exam_and_calculate_ranks`, `set_live_session_exam_type`, `set_live_session_batch_label`, `cancel_live_exam_session` | `get_admin_live_sessions`, `student_exam_login`, `SessionCredentials.vue`, `ExamWaitingRoom.vue` |
| `temp_students` | One row per student credential generated for a live session (NOT the same as `students`) | `temp_student_id` (PK, integer), `admin_id`, `admin_test_id`, `username`, `password`, `student_name`, `roll_number`, `has_appeared`, `created_date` | `create_live_exam_session_custom` | `SessionCredentials.vue` (fallback), `student_exam_login` RPC, `get_admin_pending_appeals` |
| `student_exam_sessions` | One row per student's attempt at a live exam — the live-mode equivalent of `exam_sessions` | `student_session_id` (PK), `temp_student_id`, `live_session_id`, `status` (`not_started`/`in_progress`/`submitted`/`auto_submitted`), `start_time`, `end_time`, `score`, `max_score`, `percentage`, `rank`, `time_taken_seconds` | `start_student_exam`, `save_student_answer`, `submit_student_exam`, `admin_end_exam_and_calculate_ranks`, `AdminResumeRequests.vue`'s `approveRequest()` | `get_session_results`, `get_student_live_result`, `get_admin_pending_appeals` |
| `exam_support_requests` | "Resume request" appeals from BOTH regular and live exams — one shared table, two different join paths | `request_id` (PK), `session_id` (regular-exam path), `student_id` (regular-exam path), `student_session_id` (live-exam path, added Phase 2), `reason`, `custom_message`, `remaining_time_seconds`, `answers` (JSON snapshot), `status` (`pending`/`approved`/`rejected`/`completed`), `created_at` | `examStore.js`'s `submitSupportRequest` (regular), `examSessionStore.js`'s `submitSupportRequest` (live), `AdminResumeRequests.vue`'s approve/reject | `get_admin_pending_appeals` (admin-scoped, see Security Hotfix below) |
| `exam_sessions` | Regular (self-serve, non-live) student exam attempts — **no admin ownership column at all** | `session_id` (PK), `student_id`, `exam_type`, `start_time`, `end_time`, `total_duration_seconds`, `is_submitted`, `temp_student_id`, `admin_test_id` | `examStore.js` | `examStore.js`, `get_admin_pending_appeals` (joined for regular-exam appeal display only) |
| `students` | Self-serve authenticated students (Supabase Auth) — separate identity system from `temp_students` | `student_id` (PK), `supabase_user_id`, `is_approved`, `student_name`, `email_id` | signup/auth flow (not in this codebase) | `get_admin_pending_appeals` (regular-exam appeal display) |
| `categories` | Tags a question as belonging to the JEE-pool (1) or NEET-pool (2) question bank — **not** the same concept as "exam type" | `category_id` (PK), `category_name` | seed data | `ScheduleExam.vue` (indirectly, via `EXAM_CONFIGS[examType].categoryId`) |
| `questions` / `subjects` / `topics` / `choices` | The question bank | — | admin question-upload flow (not in this codebase) | `ScheduleExam.vue` (assembling a live paper), `examStore.js` (regular exam) |

**The two-engine split, in one line:** `exam_sessions`/`exam_support_requests.session_id` = regular self-serve exams (owned by nobody, any admin can help). `student_exam_sessions`/`live_exam_sessions`/`temp_students`/`exam_support_requests.student_session_id` = admin-scheduled live batch exams (owned by the admin who scheduled them). `exam_support_requests` is the one table where both paths meet.

## Admin Authentication

`adminStore.js` — token-only pattern, not Supabase Auth:
1. `login(username, password)` → `admin_login` RPC → returns a 64-char `session_token` + profile. Only the token goes into `localStorage`; the profile (`admin_id`, quotas, etc.) lives in memory only (`adminProfile` ref).
2. Every `/admin/*` route load re-validates via `router/index.js`'s guard calling `adminStore.loadSession()` → `verify_admin_session` RPC with the stored token. Invalid/expired token → `logout()` (clears token + profile) → redirected to `/`.
3. Nothing here was touched by this project's phases — documented for completeness since every other flow below depends on `adminStore.adminProfile.admin_id` being populated first.

## Admin Flows

### 1. Dashboard (`AdminHome.vue`)
- On mount: `adminStore.loadSession()` (refresh quota numbers) → `get_admin_live_sessions` RPC, finds the one with `status === 'live'` (if any) for the "Live Now" banner.
- Banner elapsed-time counter ticks off `scheduled_start_time` (informational only — see BUG-04 caveat: if the admin used "Start Early," this runs ahead of the student's actual start).
- Quota bars read `adminStore.adminProfile.{tests_created,max_tests,students_created,max_students}` directly — no additional query.

### 2. Sessions List (`AdminLiveSessions.vue`)
- `fetchSessions()` → `get_admin_live_sessions` RPC → `rawSessions`, polled every 10s (no Realtime here — session status changes aren't currently latency-sensitive enough to warrant it).
- Auto-redirects to the Monitor page the first time a `live` session is seen per browser tab (`sessionStorage` key `seen_live_redirect_<id>`, also set by `LiveExamMonitor.vue` on its own mount so "Back to Sessions List" doesn't bounce the admin right back).
- Per-row actions by status:
  - **scheduled** → Start Early (`admin_start_exam` RPC) / View Setup (→ credentials page) / Cancel (`cancel_live_exam_session` RPC — flips `status` to `cancelled`, does **not** touch `admins.tests_created`/`students_created`, see Phase 5 note)
  - **live** → Monitor Live (→ `LiveExamMonitor.vue`)
  - **completed** → View Results (→ `ExamResults.vue`)
  - **any status** → Duplicate (prefills `ScheduleExam.vue` via `sessionStorage['prefillExamSession']`)

### 3. Schedule New Exam (`ScheduleExam.vue`)
1. Admin picks an **Exam Type** (JEE Main / NEET UG / KCET ×4) from `EXAM_CONFIGS` (`src/data/examConfigs.js`) — this drives subjects, per-subject MCQ/numeric counts, difficulty filter, and `categoryId` (which underlying question pool(s) to draw from). This replaced the original hardcoded-JEE-only assembly (BUG-09).
2. `handleCreateSession()` resolves subject_ids via synonym lookup against `subjects`, pulls candidate `questions` rows per subject (respecting `categoryId` and `difficultyFilter`), Fisher-Yates shuffles (BUG-10 fix), and slices to the exam type's target counts.
3. Assembled question ID list → `create_live_exam_session_custom` RPC (admin_id, name, start time, duration, num_students, instructions, question_ids) → creates the `live_exam_sessions` row + generates `temp_students` credentials + increments the admin's quota counters (inferred, not directly observed).
4. Best-effort follow-up calls: `set_live_session_exam_type` (persists the chosen exam type) and, if provided, `set_live_session_batch_label`. Both wrapped in try/catch so exam creation still succeeds even if either RPC/migration is missing.
5. Redirects to `SessionCredentials.vue`, passing the just-created credentials via `sessionStorage['newSessionCredentials']` (cleared immediately on read — NEW-05 fix — so stale creds never leak into a later session).

### 4. Session Credentials (`SessionCredentials.vue`)
- Fast path: reads `sessionStorage['newSessionCredentials']` (only present right after creation).
- Fallback (reload, or navigating here later): `live_exam_sessions` (verify `admin_id` ownership) → `temp_students` filtered by `admin_test_id` (BUG-06 fix — previously queried a nonexistent `live_exam_students` table).
- Copy Link / WhatsApp Share buttons build a `login.testjee.com/live-exam/{session_code}` URL from the session code.

### 5. Live Monitor (`LiveExamMonitor.vue`)
- `get_admin_live_sessions` (session meta) + `get_session_results` (per-student snapshot), driven by a Realtime subscription on `student_exam_sessions` filtered to this `live_session_id` (falls back to a 15s poll if Realtime isn't actually connecting — see the Cloudflare Worker proxy caveat).
- Real progress bar (submitted/in-progress/waiting, guarded against `total_students_enrolled === 0`).
- "FORCE END EXAM EARLY" → `admin_end_exam_and_calculate_ranks` RPC → auto-submits every remaining in-progress student and computes final ranks → redirects to Results.

### 6. Results (`ExamResults.vue`)
- Same `get_admin_live_sessions` + `get_session_results` pair. Shows **every** enrolled student including "Did Not Attempt" rows (NEW-01 fix), but the average/highest/pass-rate stat cards are scoped to only students who actually have a `submitted`/`auto_submitted` row (so a session with 2 of 20 submissions doesn't show a misleadingly crashed average).
- Search box filters the table client-side by name/roll/username. Score-distribution histogram buckets `submittedResults` by score (clamped both ends — negative scores from JEE-style negative marking used to crash this, fixed in the Pre-Deploy Review).
- Export CSV button — client-side blob download, no server round-trip.
- **Detailed Student Attempt Review Panel**: Clicking any student row opens a detailed slide-over review panel. It queries and compiles the student's question breakdown via `get_student_live_detailed_results`.
- **Unified Review Sorting**: Grouped questions in the review drawer are sorted in a single, consistent layout across all students (Subject block $\rightarrow$ MCQ first $\rightarrow$ Numeric last $\rightarrow$ `question_id` ascending), ensuring that question labels/numbers remain identical for the instructor.
- **Admin Secure Client Join Bypass**: Uses the `get_student_session_id_by_username` RPC to bypass anonymous client-side RLS limitations when joining `temp_students` table.
- **Interactive Solution Modal**: Instructors can click any card in the student's attempt list to view full question text, diagrams, choice options, selected answer vs correct answer highlighting, and solution explanations.

### 7. Resume Requests (`AdminResumeRequests.vue`)
- `get_admin_pending_appeals` RPC (admin-scoped — see Security Hotfix section above) replaces what was originally an unfiltered direct table query.
- **Approve**: sets `exam_support_requests.status = 'approved'`, then reopens the correct underlying session — `student_exam_sessions.status = 'in_progress'` for live appeals (keyed by `student_session_id`), or `exam_sessions.is_submitted = false` for regular appeals (keyed by `session_id`) — branching on which ID is present (BUG-05 fix; previously always wrote to `exam_sessions`, silently no-oping for every live appeal).
- **Reject**: sets `status = 'rejected'`, no session changes.
- The student-side counterpart (submitting the appeal, and resuming once approved) lives in `examStore.js`/`examSessionStore.js` and `ExamLayout.vue` — see Phase 2.3b below.

### 8. Global Admin Layout (`AdminLayout.vue`)
- Nav shell + logout. Resume-request pending-count badge: `get_admin_pending_appeals` (admin-scoped), refreshed on a Realtime `postgres_changes` event (any INSERT/UPDATE on `exam_support_requests` triggers a refetch — the event itself carries no admin_id to filter on, so it's used purely as a "something changed" signal, never as a source of truth for the count) with a 60s poll as a safety net.

---

---

# ✅ PRE-DEPLOY REVIEW (Complete)

Ran a multi-angle review (correctness line-scan, removed-behavior audit, cross-file
tracing, reuse/simplification/efficiency, altitude/conventions) across every file touched
in Phases 1–5. Four real, confirmed bugs found and fixed:

1. **`router/index.js`** — the live-exam reload-recovery guard (written before Phase 3.4
   added the `examType` parameter to `bridgeLiveSessionToExamStore`) was never updated to
   pass it. A NEET/KCET student reloading mid-exam would silently fall back to the JEE
   3-subject layout. **Fixed** — now fetches `exam_type` the same way `ExamWaitingRoom.vue` does.
2. **`ScheduleExam.vue`** — a reactive `watch()` on `exam_type` (added to reset duration
   when the admin changes exam type) fired *after* the "Duplicate Session" prefill set both
   fields, silently overwriting the duplicated session's custom duration back to that exam
   type's default. **Fixed** — replaced with an explicit `@change` handler so programmatic
   prefill assignment never triggers it.
3. **`ExamResults.vue`** — the score-distribution chart didn't clamp negative bucket
   indices; since JEE has negative marking, any student with a net-negative score would
   crash the whole results page. **Fixed** — clamped both ends.
4. **`LiveExamMonitor.vue`** — the new progress bar divided by `total_students_enrolled`
   with no zero-guard (`NaN%` width on an edge-case empty session). **Fixed**.

**⚠️ One pre-existing issue was surfaced that is NOT fixed and needs a decision before
multi-admin deployment:** `AdminResumeRequests.vue`'s `loadRequests()` (and the Realtime
badge in `AdminLayout.vue` added in Phase 4) query `exam_support_requests` with **no
admin/institute scoping at all** — any logged-in admin can see and approve/reject every
other admin's resume requests, including live-exam appeals with the live student's name
and roll number. This predates this project's changes, but Phase 2 extended the same
unscoped query with more PII, and Phase 4 put a Realtime feed on top of it. If this
platform is (or ever becomes) multi-admin/multi-institute, this needs an `admin_id` filter
added before deploy — I didn't add one because I can't confirm from this codebase whether
`exam_support_requests`/`student_exam_sessions` reliably chain back to an `admin_id`
without risking hiding legitimate requests if I guess the join wrong.

Also noted (not blocking, left as follow-up debt): the Realtime+poll-fallback pattern is
now hand-rolled three times with drifting intervals (AdminLayout.vue, LiveExamMonitor.vue,
ExamWaitingRoom.vue) instead of one shared composable; `examSessionStore.js`'s
`submitSupportRequest`/`restoreResumedSession` structurally duplicate `examStore.js`'s
regular-exam versions (keyed off different tables) with a minor snapshot-shape drift
(`is_marked` field present on one side, not the other — currently unused by any reader);
and `ExamLayout.vue` repeats an `isLiveMode.value ? liveStore.X() : examStore.X()` ternary
at three call sites instead of selecting the active store once.

---

# ✅ SECURITY HOTFIX: Multi-Admin Scoping (Complete — Implemented & Deployed)

**The Issue (as originally raised):** `AdminResumeRequests.vue` and `AdminLayout.vue` queried `exam_support_requests` globally without an `admin_id` filter. In a multi-admin/multi-institute deployment, Admin A would see Admin B's students' PII (names, roll numbers) in the pending appeals list, and could approve/reject requests for exams they don't own.

**What the first draft of the fix got wrong:** an earlier draft RPC had three bugs verified against `schema.sql` that would have made it fail to create (or fail at call time):
- `p_admin_id`/`student_id` typed `UUID` — `admins.admin_id` and `students.student_id` are actually `integer`.
- `ts.temp_id` — `temp_students`' primary key is `temp_student_id`, not `temp_id`. This column doesn't exist.
- `es.admin_id` — `exam_sessions` (the regular-exam table) has **no `admin_id` column at all**. Regular self-serve student exams aren't owned by any admin — there's no ownership concept to filter on for that path. This also settles the "business rule" question: regular-exam appeals stay visible to all admins (unchanged), and only the live-exam path (which does have a real owner via `live_exam_sessions.admin_id`) gets scoped.

**The corrected RPC that is actually running** (`add-admin-scoped-appeals-rpc.sql`, confirmed run in Supabase):
```sql
CREATE OR REPLACE FUNCTION get_admin_pending_appeals(p_admin_id INTEGER)
RETURNS TABLE (
  request_id INTEGER,
  session_id INTEGER,
  student_session_id INTEGER,
  student_id INTEGER,
  reason TEXT,
  custom_message TEXT,
  remaining_time_seconds INTEGER,
  answers JSONB,
  status TEXT,
  created_at TIMESTAMPTZ,
  exam_type TEXT,
  student_name TEXT,
  student_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    esr.request_id,
    esr.session_id,
    esr.student_session_id,
    esr.student_id,
    esr.reason,
    esr.custom_message,
    esr.remaining_time_seconds,
    esr.answers,
    esr.status,
    esr.created_at,
    COALESCE(es.exam_type, 'Live Exam') AS exam_type,
    COALESCE(st.student_name, ts.student_name) AS student_name,
    COALESCE(st.email_id, 'Roll: ' || COALESCE(ts.roll_number, '-')) AS student_email
  FROM exam_support_requests esr
  -- Join path for live exams
  LEFT JOIN student_exam_sessions ses ON esr.student_session_id = ses.student_session_id
  LEFT JOIN live_exam_sessions les ON ses.live_session_id = les.live_session_id
  LEFT JOIN temp_students ts ON ses.temp_student_id = ts.temp_student_id
  -- Join path for regular exams
  LEFT JOIN exam_sessions es ON esr.session_id = es.session_id
  LEFT JOIN students st ON esr.student_id = st.student_id
  WHERE
    -- Live-exam appeal: only visible to the admin who owns that live session
    (esr.student_session_id IS NOT NULL AND les.admin_id = p_admin_id)
    -- Regular-exam appeal: no admin ownership exists in the schema for this path,
    -- so it stays visible to all admins (unchanged from before this fix)
    OR (esr.student_session_id IS NULL AND esr.session_id IS NOT NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_pending_appeals(integer) TO anon, authenticated;
```

**Client-side wiring (done, then superseded — see below):**
- `AdminResumeRequests.vue`'s `loadRequests()` calls `get_admin_pending_appeals` with `p_admin_id: adminStore.adminProfile.admin_id` instead of the old unfiltered `.from('exam_support_requests').select(...)`. The RPC already returns the flat `exam_type`/`student_name`/`student_email` shape the template expects, so no template changes were needed.
- `AdminLayout.vue`'s badge count is now derived from the same scoped RPC (`fetchPendingCount()` calls it and filters `status === 'pending'` client-side), guarded against `adminStore.adminProfile` not being loaded yet.
- The Realtime subscription on `exam_support_requests` (which can't filter on the deep join needed for scoping) was changed from an unscoped optimistic increment to a pure "something changed → refetch the scoped count" trigger (`event: '*'` → `fetchPendingCount()`), so the displayed number is always correctly scoped even though the trigger itself fires for every admin's activity.

---

---

# ✅ SECURITY HARDENING: Token-Verified Admin RPCs (Complete)

**Why this was needed even after the scoping fix above:** scoping the *query results* by
`admin_id` doesn't help if the RPC itself trusts a client-supplied `admin_id` integer
instead of verifying who's actually calling. This app has no Supabase Auth session for
admins (`auth.uid()` doesn't exist here) — admins authenticate via a custom 64-char token
(`admin_login`/`verify_admin_session`, stored in `localStorage`). Every admin RPC in the
codebase (12 call sites, confirmed via grep — including the 3 I added in earlier fixes)
passed `admin_id` as a plain parameter:

```js
supabase.rpc('cancel_live_exam_session', { input_admin_id: adminStore.adminProfile.admin_id, ... })
```

Since these RPCs are `SECURITY DEFINER` and granted to `anon`, and `admin_id` is a small
sequential integer, anyone holding the public anon key (trivially extractable from the
bundled JS) can skip the login page entirely and call these RPCs directly via `fetch`/curl
with a guessed `admin_id` (1, 2, 3...). This is a well-known Supabase misconfiguration
class: an RPC that trusts a client-supplied identity parameter instead of deriving identity
from a verified session.

**Also found while fixing this:** `AdminResumeRequests.vue`'s `approveRequest()`/`confirmReject()`
were raw client-side `.update()` calls with **zero ownership check** — even the read-scoped
version from the previous fix only hid other admins' requests from the *list view*; the
actual approve/reject actions had no check preventing a call with any `request_id` at all.

**The fix (`harden-admin-rpc-security.sql`):** every RPC I control now takes a session
`p_token TEXT` instead of `admin_id`, and derives `admin_id` itself by calling the existing
`verify_admin_session(p_token)` internally — reusing it as the single source of truth for
"is this a real, current admin session" rather than re-implementing token validation:

- `get_admin_pending_appeals(p_token)` — signature changed from `(p_admin_id INTEGER)`, old one dropped.
- `approve_appeal(p_token, p_request_id)` / `reject_appeal(p_token, p_request_id)` — **new**, replace the unchecked raw updates. For live-exam appeals, verifies the caller owns the underlying `live_exam_sessions` row before touching anything; regular-exam appeals still have no ownership concept in the schema, but now at least require a valid admin session (previously required no authentication at all).
- `set_live_session_exam_type`, `set_live_session_batch_label`, `cancel_live_exam_session` — retrofitted the same way (these are mine from earlier phases, so safe to rewrite with full knowledge of their prior bodies).

**`adminStore.js`** gained `getToken()` (reads `localStorage.getItem('adminToken')`) so components pass the token instead of reaching into `adminProfile.admin_id`.

**Deliberately NOT done — RLS as defense-in-depth:** I considered enabling Row Level
Security with deny-all policies on `exam_support_requests`/`student_exam_sessions`/
`live_exam_sessions`/`temp_students` so that even a bypassed-RPC attack couldn't read/write
these tables directly. Checked first, and found concrete reasons not to rush it:
`examSessionStore.js` and `ExamWaitingRoom.vue` do several **direct, unguarded** client-side
reads/writes on these exact tables from the student side (`submitSupportRequest`,
`restoreResumedSession`, the `personalEndTime` fetch, the lobby status/exam-type fallback
reads) — and temp-students have the identical "no real Supabase Auth session" problem
admins had. A blanket deny-all policy would break these live student flows, which I can't
test interactively in this environment. Properly closing this requires giving temp-students
the same kind of verified-session mechanism admins now have — a separate, dedicated design
task, not a policy bolted on here.

**Still NOT fixed — outside my control:** `admin_start_exam`, `create_live_exam_session_custom`,
`admin_end_exam_and_calculate_ranks`, `get_admin_live_sessions`, `get_session_results` are
pre-existing RPCs whose bodies aren't in this codebase, called by every admin page the exact
same `input_admin_id: adminStore.adminProfile.admin_id` way — meaning they almost certainly
have the identical vulnerability. I can't safely rewrite functions I've never seen the body
of. The fix is mechanical and identical for each: change the first parameter from
`input_admin_id INTEGER` to `p_token TEXT`, add
`SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1; IF v_admin_id
IS NULL THEN RAISE EXCEPTION ...` at the top of the function body, then replace every use of
the old parameter with `v_admin_id`. Whoever owns those five RPCs needs to apply this same
three-line change to each before this is fully closed.

---

---

# 📜 Historical Implementation Log

> **Note:** The sections below this point represent the historical, phase-by-phase implementation log that built the system described above. They are preserved here for context on why certain architectural decisions were made.

## Phase Status Tracker

| Phase | Goal | Status |
|---|---|---|
| **Phase 1** | Make exam work end-to-end | ✅ Complete |
| **Phase 2** | Data integrity (credentials, results, appeals, submit) | ✅ Complete |
| **Phase 3** | Fairness & quality (subjects, shuffle, redirect loop) | ✅ Complete |
| **Phase 4** | Admin UX overhaul (Dashboard, results, monitoring) | ✅ Complete |
| **Phase 5** | Polish & production hardening | ✅ Complete |
| **Pre-Deploy Review** | Multi-angle code review + bug fixes before shipping | ✅ Complete |

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

### RPC-4: `get_student_live_detailed_results` — Detailed question answers (Phase 6+)
```sql
-- Secure SECURITY DEFINER function to fetch student question orders and answer details
SELECT q.question_id, q.question_type, q.question_content, c.choice1, ...
FROM student_exam_sessions ses
JOIN LATERAL unnest(ses.question_order) WITH ORDINALITY AS ord(q_id, idx) ON true
JOIN questions q ON q.question_id = ord.q_id
```

### RPC-5: `get_student_session_id_by_username` — Security RLS Bypass (Phase 6+)
```sql
-- Security Definer to resolve student session IDs by username + live session code
SELECT ses.student_session_id 
FROM student_exam_sessions ses
JOIN temp_students ts ON ses.temp_student_id = ts.temp_student_id
WHERE ses.live_session_id = p_live_session_id AND ts.username = p_username
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
