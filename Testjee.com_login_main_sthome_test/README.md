# TestJEE Full Exam UI

A full-fledged mock exam UI that replicates the NTA JEE Main environment, styled with TestJEE branding. This project includes a complete student authentication system, exam session management, and result tracking.

## 🎯 Features

### Authentication & User Management
- **Magic Link Login**: Passwordless authentication via email (Supabase Auth).
- **Student Profiles**: Automatic profile creation with name persistence.
- **Secure Sessions**: Row Level Security (RLS) ensures students access only their own data.
- **Data Privacy**: Strict separation of student data.

### Core Exam Functionality
- **NTA-Exact Layout**: Pixel-perfect replica of the official NTA exam interface.
- **Strict Mode**: Simulates real exam conditions (auto-submit on timer end, one active session).
- **Timer System**: Server-side time calculation to prevent exploits (refresh/reset protection).
- **Question Palette**: Real-time status tracking (Visited, Answered, Marked for Review).
- **Offline Resilience**: Answers saved to `localStorage` for instant recovery on refresh.

### TestJEE Branding
- **Custom UI**: Phoenix-inspired logo and blue-based color scheme (`tailwind.config.js`).
- **Responsive Design**: Optimized for desktop but mobile-friendly.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Supabase Project

### Installation
```bash
# Clone the repository
git clone https://github.com/vigneshbs33/GTA TestJEE-Web-App
cd TestJEE-Web-App

# Install dependencies
npm install

# Start development server
npm run dev
```
The app will open at `http://localhost:3000`.

### Build for Production
```bash
npm run build
npm run preview
```

### Environment Configuration
Create a `.env` file (or set in Vercel/Netlify):
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Update **Supabase Auth Redirect URL**:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

---

## 🗄️ Database & SQL

The project uses Supabase (PostgreSQL). You must run the following SQL scripts in your Supabase SQL Editor to set up the schema, RLS policies, and triggers.

### 1. Main Schema & Auth (`supabase-migration.sql`)
Sets up the `students` table linked to Supabase Auth and the `results` table.

```sql
-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
  student_id SERIAL PRIMARY KEY,
  supabase_user_id UUID UNIQUE, -- Links to auth.users
  student_name TEXT NOT NULL,
  email_id TEXT NOT NULL UNIQUE,
  creation_date TIMESTAMPTZ DEFAULT NOW(),
  modification_date TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Students can only view/edit their own profile
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile" ON public.students 
FOR SELECT TO authenticated USING (auth.uid() = supabase_user_id);

CREATE POLICY "Students can update own profile" ON public.students 
FOR UPDATE TO authenticated USING (auth.uid() = supabase_user_id);

CREATE POLICY "Allow insert for authenticated users" ON public.students 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = supabase_user_id);

-- Results Table
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own results" ON public.results 
FOR SELECT TO authenticated USING (
  student_id IN (SELECT student_id FROM public.students WHERE supabase_user_id = auth.uid())
);

CREATE POLICY "Students can insert own results" ON public.results 
FOR INSERT TO authenticated WITH CHECK (
  student_id IN (SELECT student_id FROM public.students WHERE supabase_user_id = auth.uid())
);
```

### 2. Exam Sessions & Timer Logic (`exam-session-migration.sql`)
Prevents timer resets by tracking sessions on the server.

```sql
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  session_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL DEFAULT 'JEE_MAIN_FULL',
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  total_duration_seconds INTEGER NOT NULL DEFAULT 10800, -- 3 hours
  is_submitted BOOLEAN DEFAULT FALSE
);

-- Index & Unique Constraint (One active session per student)
CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_id ON public.exam_sessions(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_session 
ON public.exam_sessions (student_id, exam_type) WHERE is_submitted = FALSE;

-- RLS for Sessions
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own sessions" ON public.exam_sessions 
FOR SELECT TO authenticated USING (
  student_id IN (SELECT student_id FROM public.students WHERE supabase_user_id = auth.uid())
);

-- Function to calculate remaining time
CREATE OR REPLACE FUNCTION get_remaining_time(p_session_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_total_duration INTEGER;
  v_elapsed_seconds INTEGER;
BEGIN
  SELECT start_time, total_duration_seconds INTO v_start_time, v_total_duration
  FROM exam_sessions WHERE session_id = p_session_id;
  
  IF NOT FOUND THEN RETURN NULL; END IF;
  
  v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_start_time))::INTEGER;
  RETURN GREATEST(0, v_total_duration - v_elapsed_seconds);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Cleanup & Fixes
- **Stuck Sessions**: If a student is stuck (e.g., timer expired but not submitted), run:
```sql
UPDATE exam_sessions SET is_submitted = TRUE 
WHERE is_submitted = FALSE AND EXTRACT(EPOCH FROM (NOW() - start_time)) > total_duration_seconds;
```
- **Fix RLS Blocking**: If you see "Row Level Security" errors, re-run the RLS policies above.

---

## 🏗️ Architecture

### User Flow
1. **Login**: User enters Name + Email → Name stored in `localStorage` → Magic Link sent.
2. **Auth Callback**: User clicks link → `fetchOrCreateStudent()` called.
   - Checks if `supabase_user_id` exists in `students` table.
   - If **Yes**: Fetches profile.
   - If **No**: Creates new student record using name from `localStorage`.
3. **Exam Start**: `initializeSession()` checks for active session.
   - **New**: Creates session with `start_time`.
   - **Existing**: Resumes session, calculates legitimate remaining time.
4. **During Exam**:
   - Answers saved instantly to `localStorage`.
   - Timer counts down locally but validated against server `start_time` on refresh.
5. **Submit**: `submitExam()` sends results to DB + marks session as `is_submitted = TRUE`.

### Data Store (Pinia)
- **`authStore.js`**: Manages user session, student profile, and name persistence.
- **`examStore.js`**: Manages questions, user answers, and timer logic.

---

## ❓ Troubleshooting

### Name Shows "Student" Instead of Name
- **Cause**: `localStorage` cleared or different domain usage (localhost vs 127.0.0.1).
- **Fix**: Login again using the exact same domain. Ensure `fetchOrCreateStudent()` is called in `AuthCallback.vue`.

### Timer Resets on Refresh
- **Cause**: Database session tracking not working.
- **Fix**: Ensure `exam-session-migration.sql` was run. Check `examStore.initializeSession()` logs.

### "No API Key" or 406 Error
- **Cause**: RLS policies blocking access.
- **Fix**: Re-run the RLS policy SQL blocks. Ensure policies are `TO authenticated`.

### Duplicate Student Records
- **Cause**: Missing `UNIQUE` constraint on `supabase_user_id`.
- **Fix**: Run `ALTER TABLE public.students ADD CONSTRAINT students_supabase_user_id_unique UNIQUE (supabase_user_id);`.

---

## 📦 Deployment Checklist

- [ ] **Database**: Migration SQL executed in Supabase.
- [ ] **Env Vars**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set.
- [ ] **Auth**: Redirect URLs configured in Supabase (Development & Production).
- [ ] **RLS**: Policies enabled for `students`, `results`, `exam_sessions`.
- [ ] **Build**: `npm run build` passes without errors.

---

**Built for Gyan-edge Testing Agency**
