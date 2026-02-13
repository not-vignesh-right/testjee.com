# Architecture Diagram - Student Authentication & Profile Flow

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN PHASE
   ┌──────────────┐
   │  Login.vue   │
   │              │
   │ [Name Input] │ ──┐
   │ [Email Input]│   │ Store name in localStorage
   └──────┬───────┘   │ as backup
          │           ↓
          │    localStorage.setItem('pendingStudentName', name)
          │
          ↓
   supabase.auth.signInWithOtp({
     email: email,
     options: {
       data: { name: name }  ← Sent in user metadata
     }
   })
          │
          ↓
   📧 Magic Link Email Sent


2. AUTHENTICATION PHASE
   
   User clicks magic link in email
          │
          ↓
   ┌──────────────────┐
   │ AuthCallback.vue │
   └──────────────────┘
          │
          ├─→ auth.loadSession()
          │        │
          │        ↓
          │   Supabase Auth creates session
          │   user.id = UUID (supabase_user_id)
          │
          ├─→ auth.fetchOrCreateStudent()
          │        │
          │        ↓
          │   ┌─────────────────────────────────┐
          │   │ Check if student exists:        │
          │   │ WHERE supabase_user_id = user.id│
          │   └─────────────────────────────────┘
          │        │
          │        ├─→ EXISTS? → Fetch profile
          │        │                    │
          │        │                    ↓
          │        │         studentProfile = {
          │        │           student_id: 123,
          │        │           student_name: "John Doe",
          │        │           supabase_user_id: UUID
          │        │         }
          │        │
          │        └─→ NOT EXISTS? → Create new
          │                              │
          │                              ↓
          │                    Get name from:
          │                    1. user.user_metadata.name
          │                    2. localStorage.getItem('pendingStudentName')
          │                    3. Default: "Student"
          │                              │
          │                              ↓
          │                    INSERT INTO students (
          │                      supabase_user_id,
          │                      student_name,
          │                      email_id
          │                    )
          │                              │
          │                              ↓
          │                    studentProfile = new record
          │
          └─→ router.push('/exam')


3. EXAM PHASE
   ┌──────────────────┐
   │  ExamLayout.vue  │
   └──────────────────┘
          │
          ├─→ HeaderBar.vue
          │        │
          │        └─→ Display: authStore.studentName ✅
          │                     (from studentProfile)
          │
          ├─→ User answers questions
          │
          └─→ Click "Submit Exam"
                   │
                   ↓
          examStore.submitExam()
                   │
                   ├─→ Calculate score
                   │
                   └─→ INSERT INTO results (
                         student_id: authStore.studentId, ✅
                         answers: [...],
                         score: 85
                       )
                   │
                   ↓
          router.push('/results')


4. RESULTS PHASE
   ┌──────────────────┐
   │   Results.vue    │
   └──────────────────┘
          │
          └─→ Display score and details
              (RLS ensures only own results visible)
```

## Data Store Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PINIA STORES                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│       authStore.js           │
├──────────────────────────────┤
│ STATE:                       │
│  • user (Supabase Auth)      │
│  • studentProfile {          │
│      student_id,             │
│      student_name,           │
│      email_id,               │
│      supabase_user_id        │
│    }                         │
│  • loading                   │
│                              │
│ COMPUTED:                    │
│  • isAuthenticated           │
│  • studentName ──────────────┼──┐
│  • studentId ────────────────┼──┼──┐
│                              │  │  │
│ ACTIONS:                     │  │  │
│  • loadSession()             │  │  │
│  • fetchOrCreateStudent()    │  │  │
│  • logout()                  │  │  │
└──────────────────────────────┘  │  │
                                  │  │
                                  │  │
┌──────────────────────────────┐  │  │
│       examStore.js           │  │  │
├──────────────────────────────┤  │  │
│ STATE:                       │  │  │
│  • questions                 │  │  │
│  • userAnswers               │  │  │
│  • remainingTime             │  │  │
│  • isSubmitted               │  │  │
│                              │  │  │
│ ACTIONS:                     │  │  │
│  • fetchExamData()           │  │  │
│  • saveAnswer()              │  │  │
│  • submitExam() {            │  │  │
│      student_id: ────────────┼──┘  │
│        authStore.studentId   │     │
│    }                         │     │
└──────────────────────────────┘     │
                                     │
┌──────────────────────────────┐     │
│       HeaderBar.vue          │     │
├──────────────────────────────┤     │
│ TEMPLATE:                    │     │
│  {{ authStore.studentName }} ├─────┘
│                              │
│ SCRIPT:                      │
│  const authStore =           │
│    useAuthStore()            │
└──────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE TABLES                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│     auth.users           │  (Managed by Supabase Auth)
├──────────────────────────┤
│ id (UUID) ───────────────┼──┐
│ email                    │  │
│ user_metadata {          │  │
│   name: "John Doe"       │  │
│ }                        │  │
└──────────────────────────┘  │
                              │
                              │ LINKS TO
                              │
┌──────────────────────────┐  │
│   public.students        │  │
├──────────────────────────┤  │
│ student_id (PK)          │  │
│ supabase_user_id (UNIQUE)├──┘ ← FOREIGN KEY
│ student_name             │
│ email_id                 │
│ mobile_number            │
│ class                    │
│ parent_name              │
│ creation_date            │
└────────┬─────────────────┘
         │
         │ ONE-TO-MANY
         │
         ↓
┌──────────────────────────┐
│   public.results         │
├──────────────────────────┤
│ result_id (PK)           │
│ student_id (FK) ─────────┼──┘
│ answers (JSONB)          │
│ score                    │
│ created_at               │
└──────────────────────────┘
```

## Security: Row Level Security (RLS)

```
┌─────────────────────────────────────────────────────────────────┐
│                      RLS POLICIES                                │
└─────────────────────────────────────────────────────────────────┘

STUDENTS TABLE:
  ✓ SELECT: WHERE auth.uid() = supabase_user_id
  ✓ INSERT: WHERE auth.uid() = supabase_user_id
  ✓ UPDATE: WHERE auth.uid() = supabase_user_id

RESULTS TABLE:
  ✓ SELECT: WHERE student_id IN (
              SELECT student_id FROM students 
              WHERE supabase_user_id = auth.uid()
            )
  ✓ INSERT: WHERE student_id IN (
              SELECT student_id FROM students 
              WHERE supabase_user_id = auth.uid()
            )

EFFECT:
  • Students can only access their own data
  • No cross-student data leakage
  • Automatic enforcement at database level
```

## Key Benefits

1. **Data Integrity**: Every result is linked to a real student
2. **Security**: RLS prevents unauthorized access
3. **User Experience**: Name persists across sessions
4. **Scalability**: Supports multiple exams per student
5. **Maintainability**: Clear separation of auth vs profile data
