# TestJEE Full Exam UI

A full-fledged mock exam platform that replicates the NTA JEE Main environment, styled with TestJEE branding. Includes student authentication, exam sessions, detailed analytics, and result tracking.

## Recent Updates (Feb 2026)
- **Dashboard v2**: Rotating motivational quotes, Score Trend chart (vue-chartjs), redesigned stats cards
- **Editable Profile**: Settings page now lets students edit name, mobile, class, school/coaching, and target year
- **Results Redesign**: Glassmorphism cards, color-coded question cards, gradient summary banner
- **Password Auth**: Full email + password login/signup with password reset flow (replaces magic link)
- **Layout**: JEE Main-inspired student portal with sidebar navigation and top navbar logout
- **Animations**: Smooth entrance animations and hover effects throughout

---

## 🎯 Features

### Authentication & User Management
- **Email + Password**: Sign up, sign in, password reset via Supabase Auth
- **Student Profiles**: Automatic profile creation, editable fields (name, mobile, class, school, target year)
- **Secure Sessions**: Row Level Security (RLS) — students access only their own data
- **Auth Callback**: Handles email verification redirect flow

### Student Dashboard
- **Motivational Quotes**: Random JEE quotes rotating every 8 seconds
- **Score Trend Chart**: Line chart showing exam score progression (vue-chartjs)
- **Stats Cards**: Total exams, best score, average score, accuracy
- **Exam History**: Chronological list with score, attempt count, duration
- **Quick Start**: Exam type modal (Full Mock / Subject-wise coming soon)

### Core Exam Functionality
- **NTA-Exact Layout**: Pixel-perfect replica of the official NTA exam interface
- **Strict Mode**: Auto-submit on timer end, one active session per student
- **Timer System**: Server-side time calculation (refresh/reset protection)
- **Question Palette**: Real-time status tracking (Visited, Answered, Marked for Review)
- **Offline Resilience**: Answers saved to `localStorage` for instant recovery

### Results & Analytics
- **Question Analysis**: Subject-wise breakdown with per-question status (correct/wrong/skipped)
- **Subject Performance**: Progress bars, accuracy percentages, quick stat grids
- **Overall Summary**: Total correct, wrong, unattempted, time spent

### Settings
- **Editable Profile**: Name, mobile, class (11th/12th/Dropper), school/coaching, target year
- **Password Change**: In-app password update with validation
- **Read-only Fields**: Email and account creation date

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Supabase Project

### Installation
```bash
git clone https://github.com/not-vignesh-right/testjee.com
cd Testjee.com_login_main_sthome_test

npm install
npm run dev
```
The app opens at `http://localhost:5173`.

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

Update **Supabase Auth Redirect URLs**:
- Development: `http://localhost:5173/auth/callback`
- Production: `https://login.testjee.com/auth/callback`

---

## 🗄️ Database & SQL

The project uses Supabase (PostgreSQL). Run the following SQL in your Supabase SQL Editor.

### 1. Students Table
```sql
CREATE TABLE IF NOT EXISTS public.students (
  student_id SERIAL PRIMARY KEY,
  supabase_user_id UUID UNIQUE,
  student_name TEXT NOT NULL,
  email_id TEXT NOT NULL UNIQUE,
  mobile_number TEXT,
  student_class TEXT,        -- '11th', '12th', 'Dropper'
  school_name TEXT,
  target_year TEXT,
  creation_date TIMESTAMPTZ DEFAULT NOW(),
  modification_date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile" ON public.students 
FOR SELECT TO authenticated USING (auth.uid() = supabase_user_id);

CREATE POLICY "Students can update own profile" ON public.students 
FOR UPDATE TO authenticated USING (auth.uid() = supabase_user_id);

CREATE POLICY "Allow insert for authenticated users" ON public.students 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = supabase_user_id);
```

### 2. Exam Sessions
```sql
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  session_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES public.students(student_id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL DEFAULT 'JEE_MAIN_FULL',
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  total_duration_seconds INTEGER NOT NULL DEFAULT 10800,
  is_submitted BOOLEAN DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_session 
ON public.exam_sessions (student_id, exam_type) WHERE is_submitted = FALSE;

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own sessions" ON public.exam_sessions 
FOR SELECT TO authenticated USING (
  student_id IN (SELECT student_id FROM public.students WHERE supabase_user_id = auth.uid())
);
```

### 3. Results Table
```sql
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

### Cleanup: Stuck Sessions
```sql
UPDATE exam_sessions SET is_submitted = TRUE 
WHERE is_submitted = FALSE AND EXTRACT(EPOCH FROM (NOW() - start_time)) > total_duration_seconds;
```

---

## 🏗️ Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API) |
| Build | Vite |
| State | Pinia |
| Routing | Vue Router |
| Styling | Tailwind CSS |
| Backend | Supabase (Auth + PostgreSQL) |
| Charts | vue-chartjs / Chart.js |

### User Flow
1. **Login**: Email + password signup/signin → `fetchOrCreateStudent()` syncs profile
2. **Dashboard**: Stats, score chart, motivational quotes, start exam CTA
3. **Exam**: NTA-style interface with timer, question palette, auto-submit
4. **Results**: Score + detailed question analysis per subject
5. **Settings**: Edit profile fields, change password

### Data Stores (Pinia)
- **`authStore.js`**: User session, student profile, login/signup/logout, profile updates
- **`examStore.js`**: Questions, answers, timer logic, session management, results

---

## ❓ Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Name shows "Student" | localStorage cleared | Login again; `fetchOrCreateStudent()` re-syncs |
| Timer resets on refresh | Session tracking not set up | Run exam session migration SQL |
| RLS / 406 errors | Missing RLS policies | Re-run policy SQL blocks |
| Duplicate students | Missing UNIQUE constraint | `ALTER TABLE students ADD CONSTRAINT students_supabase_user_id_unique UNIQUE (supabase_user_id)` |

---

## 📦 Deployment Checklist

- [ ] Migration SQL executed in Supabase (students, sessions, results)
- [ ] New columns added: `student_class`, `school_name`, `target_year`, `mobile_number`
- [ ] Env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Auth redirect URLs configured (dev + production)
- [ ] RLS enabled on `students`, `results`, `exam_sessions`
- [ ] `npm run build` passes

---

**Built for Gyan-edge Testing Agency (GTA)**
