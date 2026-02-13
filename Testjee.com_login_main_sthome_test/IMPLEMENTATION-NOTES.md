# Student Name Persistence Implementation

## Overview
This implementation ensures that student names entered during login persist throughout the application and are properly stored in the Supabase `students` table.

## Changes Made

### 1. **authStore.js** - Enhanced Authentication Store
- Added `studentProfile` ref to store complete student data
- Added `studentName` computed property (replaces hardcoded value)
- Added `studentId` computed property for use in exam submission
- Added `fetchOrCreateStudent()` function that:
  - Checks if student exists by `supabase_user_id`
  - Creates new student record if not found
  - Retrieves name from user metadata or localStorage
  - Stores complete student profile in state

### 2. **AuthCallback.vue** - Post-Login Handler
- Now calls `auth.fetchOrCreateStudent()` after session loads
- Ensures student record exists before redirecting to exam

### 3. **Login.vue** - Login Page
- Stores student name in localStorage before sending magic link
- Provides fallback if user metadata doesn't persist

### 4. **examStore.js** - Exam State Management
- Removed hardcoded `studentName` ref
- Imports `useAuthStore` to access student data
- Updated `submitExam()` to use `authStore.studentId` instead of `null`

### 5. **HeaderBar.vue** - UI Component
- Changed from `examStore.studentName` to `authStore.studentName`
- Now displays actual logged-in student name

## Database Requirements

### Required Schema Changes
Run the SQL in `supabase-migration.sql` to:
1. Add `supabase_user_id` column to `students` table
2. Create unique constraint and index
3. Enable Row Level Security (RLS) on `students` and `results` tables
4. Add policies for secure data access

### Students Table Schema
```sql
create table public.students (
  student_id serial primary key,
  supabase_user_id uuid unique,  -- Links to auth.users.id
  student_name text not null,
  email_id text not null unique,
  mobile_number text,
  class text,
  parent_name text,
  parent_number text,
  parent_email_id text,
  creation_date timestamp default now(),
  modification_date timestamp default now(),
  created_by text,
  modified_by text
);
```

## Authentication Flow

1. **Login Page** (`/login`)
   - User enters name + email
   - Name stored in localStorage
   - Magic link sent via Supabase Auth

2. **Magic Link Click**
   - User clicks link in email
   - Redirects to `/auth/callback`

3. **Auth Callback** (`/auth/callback`)
   - Loads Supabase session
   - Calls `fetchOrCreateStudent()`:
     - Checks if student exists with `supabase_user_id`
     - If not, creates new student record with name from metadata/localStorage
     - Stores student profile in authStore
   - Redirects to `/exam`

4. **Exam Page** (`/exam`)
   - HeaderBar displays `authStore.studentName`
   - On submit, uses `authStore.studentId` for results

## Testing Checklist

- [ ] Run Supabase migration SQL
- [ ] Clear localStorage and test fresh signup
- [ ] Verify student name appears in HeaderBar
- [ ] Submit exam and verify `student_id` is not null in results table
- [ ] Test returning user (should fetch existing profile)
- [ ] Verify RLS policies work (students can only see their own data)

## Next Steps (Optional Enhancements)

1. **Student Dashboard**
   - Show student profile
   - Display exam history
   - Edit profile information

2. **Multi-Exam History**
   - List all past exams
   - Compare scores over time

3. **Parent Portal**
   - Add parent login
   - View child's results

4. **Enhanced Profile**
   - Add profile photo
   - Add class/grade selection
   - Add parent contact info during signup
