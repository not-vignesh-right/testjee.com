# TESTJEE Codebase Context Report

## 1. Project Overview
**Application**: TestJEE Mock Exam Platform — NTA JEE Main replica  
**Live URL**: `https://login.testjee.com`  
**Tech Stack**: Vue 3 (Composition API) + Vite + Pinia + Vue Router + Tailwind CSS + Supabase

## 2. Folder Structure
```
src/
├── main.js                  # Entry point — Vue, Pinia, Router init
├── App.vue                  # Root component
├── style.css                # Global styles + Tailwind directives
├── lib/supabase.js          # Supabase client initialization
├── router/index.js          # Routes + auth guards
├── data/quotes.js           # Motivational quotes array
├── stores/
│   ├── authStore.js         # Auth, profile, login/signup/logout
│   └── examStore.js         # Exam session, questions, timer, results
└── components/
    ├── Login.vue             # Email + password login/signup
    ├── AuthCallback.vue      # Email verification redirect handler
    ├── ResetPassword.vue     # Password reset flow
    ├── StudentLayout.vue     # Sidebar + navbar layout for /sthome
    ├── Dashboard.vue         # Student dashboard (quotes, chart, stats)
    ├── Results.vue           # Legacy results view (still available)
    ├── ResultsDetails.vue    # Detailed question analysis per subject
    ├── Settings.vue          # Editable profile + password change
    ├── ExamLayout.vue        # NTA exam interface wrapper
    ├── QuestionArea.vue      # Question display + answer input
    ├── QuestionPalette.vue   # Question navigation sidebar
    ├── LandingPage.vue       # Public landing / marketing page
    ├── AboutPage.vue         # About page
    ├── ContactPage.vue       # Contact page
    ├── HeaderBar.vue         # Public page header
    └── FooterNav.vue         # Public page footer
```

## 3. Authentication System (Password-Based)
**Current**: Email + password via Supabase Auth (`signUpWithPassword`, `signInWithPassword`).

### A. Login Flow (`Login.vue`)
1. User enters **Name**, **Email**, **Mobile**, **Password**
2. Sign Up → `authStore.signUpWithPassword()` → Supabase `signUp()` with user metadata
3. Sign In → `authStore.signInWithPassword()` → `fetchOrCreateStudent()` syncs profile
4. Redirects to `/sthome/dashboard`

### B. Auth Store (`authStore.js`)
- `signUpWithPassword(email, password, name, mobile)` — creates auth user + stores metadata
- `signInWithPassword(email, password)` — authenticates + fetches profile
- `resetPassword(email)` — sends password reset email
- `updatePassword(newPassword)` — changes password
- `updateStudentProfile(updates)` — updates `students` table fields
- `fetchOrCreateStudent()` — syncs auth.users ↔ students table:
  1. Finds by `supabase_user_id`
  2. Fallback: finds by `email_id` and links
  3. Creates new if neither found
- `logout()` — signs out and clears state

### C. Auth Callback (`AuthCallback.vue`)
Handles email verification redirect after signup. Loads session + syncs profile → redirects to `/sthome`.

## 4. Routes (`router/index.js`)
| Path | Component | Auth Required |
|------|-----------|:---:|
| `/` | LandingPage | ❌ |
| `/login` | Login | ❌ |
| `/auth/callback` | AuthCallback | ❌ |
| `/auth/reset-password` | ResetPassword | ❌ |
| `/about` | AboutPage | ❌ |
| `/contact` | ContactPage | ❌ |
| `/sthome` | StudentLayout (wrapper) | ✅ |
| `/sthome/dashboard` | Dashboard | ✅ |
| `/sthome/details` | ResultsDetails | ✅ |
| `/sthome/settings` | Settings | ✅ |
| `/exam` | ExamLayout | ✅ |

Global guard checks `auth.isAuthenticated` → redirects to `/login` if unauthenticated.

## 5. Database Schema

### Table: `students`
| Column | Type | Notes |
|--------|------|-------|
| `student_id` | SERIAL PK | Auto-increment |
| `supabase_user_id` | UUID UNIQUE | Links to auth.users |
| `student_name` | TEXT | |
| `email_id` | TEXT UNIQUE | |
| `mobile_number` | TEXT | |
| `student_class` | TEXT | '11th', '12th', 'Dropper' |
| `school_name` | TEXT | |
| `target_year` | TEXT | |
| `creation_date` | TIMESTAMPTZ | |
| `modification_date` | TIMESTAMPTZ | |

### Table: `questions`
| Column | Type |
|--------|------|
| `question_id` | PK |
| `subject_id`, `topic_id` | FKs |
| `question_type` | 'multiple_choice' / 'numeric' |
| `question_content` | Text |
| `image_url` | Text |
| Relations: `subjects`, `topics`, `choices` | |

### Table: `exam_sessions`
| Column | Type |
|--------|------|
| `session_id` | PK |
| `student_id` | FK → students |
| `exam_type` | Text |
| `start_time`, `end_time` | Timestamptz |
| `is_submitted` | Boolean |
| `total_duration_seconds` | Integer (default 10800) |

### Table: `results`
| Column | Type |
|--------|------|
| `result_id` | PK |
| `student_id`, `session_id` | FKs |
| `score` | Float |
| `answers` | JSON (per-question data) |

## 6. Key Features by Component

| Component | Key Features |
|-----------|-------------|
| **Dashboard** | Rotating motivational quotes, score trend chart (vue-chartjs), stats cards, exam type modal, exam history list |
| **Settings** | Editable name/mobile/class/school/target year, read-only email, password change |
| **ResultsDetails** | Overall summary banner, subject performance cards with progress bars, color-coded question grid |
| **ExamLayout** | NTA-style interface, server-validated timer, question palette, auto-submit |

## 7. Dependencies
- `vue` 3.x, `vue-router`, `pinia`
- `@supabase/supabase-js`
- `tailwindcss`, `autoprefixer`, `postcss`
- `vue-chartjs`, `chart.js`
- `vite`
