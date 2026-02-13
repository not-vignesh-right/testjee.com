# TESTJEE Codebase Context Report

## 1. Project Overview
**Application**: GTA Mock Exam UI - NTA JEE Main replica
**Tech Stack**:
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (Auth + Postgres)

## 2. Architecture & Folder Structure
- `src/main.js`: Entry point, initializes Vue, Pinia, Router.
- `src/App.vue`: Root component, handles layout.
- `src/lib/supabase.js`: Supabase client initialization (configured with URL and Anon Key).
- `src/router/index.js`: Defines routes and navigation guards (`beforeEach` checks `auth.isAuthenticated`).
- `src/stores/`: Pinia stores.
  - `authStore.js`: Manages user session, login/logout, and profile syncing.
  - `examStore.js`: Manages exam session, questions, answers, timer, and results.
- `src/components/`:
  - `Login.vue`: Entry page, currently implements Magic Link auth.
  - `AuthCallback.vue`: Handles the redirect from magic link email.
  - `Results.vue`: Student Dashboard (`/sthome`).
  - `ResultsDetails.vue`: Detailed exam analysis (`/sthome/details`).
  - `ExamLayout.vue`: The actual exam interface.

## 3. Current Authentication System (Magic Link)
**Status**: Currently uses Supabase Magic Link (`signInWithOtp`).

### A. Login Flow (`src/components/Login.vue`)
1. User enters **Full Name** and **Email**.
2. on `login()`:
   - Stores name in `localStorage` key `pendingStudentName`.
   - Calls `supabase.auth.signInWithOtp({ email, options: { data: { name } } })`.
   - Redirects to `/auth/callback`.

### B. Callback Handling (`src/components/AuthCallback.vue`)
1. Triggered on page load (`onMounted`).
2. Calls `auth.loadSession()` to retrieve Supabase session from URL fragment/cookie.
3. Calls `auth.fetchOrCreateStudent()` to sync the `auth.users` record with the public `students` table.
4. Redirects to `/sthome`.

### C. Auth Store Logic (`src/stores/authStore.js`)
- **`loadSession()`**: Wrapper around `supabase.auth.getSession()`.
- **`fetchOrCreateStudent()`**: Critical syncing logic.
  1. Gets `user.id` (Supabase Auth ID) and `user.email`.
  2. Tries to find a row in `students` table by `supabase_user_id`.
  3. **Fallback**: If not found by ID, searches by `email_id`.
     - If found by email (legacy user), it UPDATES the record with the new `supabase_user_id` and name.
  4. **Creation**: If neither found, INSERTS a new row into `students` table.
     - `student_name`: From user metadata or `localStorage`.
     - `email_id`: From user email.
     - `supabase_user_id`: From auth user ID.

## 4. Protected Routes (`src/router/index.js`)
- Routes with `meta: { requiresAuth: true }`: `/sthome`, `/sthome/details`, `/exam`.
- **Global Guard**:
  - Checks `auth.isAuthenticated`.
  - If authenticated but `auth.studentProfile` is missing, awaits `auth.fetchOrCreateStudent()`.
  - Redirects unauthenticated users to `/`.

## 5. Database Schema (Inferred)
Based on usage in code:

### Table: `students`
- `student_id` (Primary Key)
- `student_name` (Text)
- `email_id` (Text)
- `supabase_user_id` (UUID, Foreign Key to `auth.users`)
- `modification_date` (Timestamp)

### Table: `questions`
- `question_id` (PK)
- `subject_id`, `topic_id` (FKs)
- `question_type` ('multiple_choice' or 'numeric')
- `question_content` (JSON/Text)
- `image_url` (Text, URL)
- `external_reference` (Text)
- `subjects` (Relation)
- `topics` (Relation)
- `choices` (Relation - `choice1`...`choice4`, `correct_answer`)

### Table: `exam_sessions`
- `session_id` (PK)
- `student_id` (FK to students)
- `exam_type` (Text)
- `start_time`, `end_time`
- `is_submitted` (Boolean)
- `total_duration_seconds` (Int)

### Table: `results`
- `result_id` (PK)
- `student_id` (FK)
- `session_id` (FK)
- `score` (Float)
- `answers` (JSON - stores per-question answer data)
- `creation_date` (Timestamp)

## 6. Migration Objectives (Magic Link -> Password Auth)
To switch to Username/Password Auth, the following changes are needed:

1.  **Frontend (`Login.vue`)**:
    -   Replace "Send Magic Link" with **Email & Password** inputs.
    -   Add toggle between **Sign In** and **Sign Up** modes.
    -   **Sign Up**: Collect Name, Email, Password. Call `supabase.auth.signUp()`.
    -   **Sign In**: Collect Email, Password. Call `supabase.auth.signInWithPassword()`.

2.  **Auth Store (`authStore.js`)**:
    -   Add `loginWithPassword(email, password)` action.
    -   Add `registerWithPassword(email, password, name)` action.
    -   Update `fetchOrCreateStudent` (logic largely remains valid as it relies on `user.id`, but ensure it runs after registration/login).

3.  **Router/Callback**:
    -   `AuthCallback.vue` becomes obsolete for Password login (no redirect needed), but might still be needed if email confirmation is enabled in Supabase.
    -   Direct redirect to `/sthome` after successful login/register.

4.  **Supabase Config**:
    -   Ensure "Email provider" is enabled in Supabase dashboard.
    -   Ensure "Confirm email" setting matches desired flow (if enabled, user needs to verify email before login).

## 7. Key Considerations
- **Student Profile Sync**: The `fetchOrCreateStudent` logic is robust and should be preserved. It correctly links the Auth User (managed by Supabase) to the public `students` table data.
- **LocalStorage**: Current magic link flow relies on `localStorage` to persist the user's name across the email redirect. With password auth, this is simpler as we have the name in memory during the session, but preserving it during sign-up is still good practice.
