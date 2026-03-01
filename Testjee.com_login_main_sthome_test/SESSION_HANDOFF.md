# TESTJEE — Session Handoff: Features & Deployment Issue

## Current Production Issue 🚨

**Problem:** The `/admin-approve` route returns a **Vercel 404** on production (`https://www.testjee.com/admin-approve?...`), even though:
- The route exists in `src/router/index.js` (line 80)
- `vercel.json` has the correct SPA catch-all rewrite
- The code is pushed to `main` and the deployment is confirmed
- **It works perfectly on `localhost:3000`**

**The 404 error looks like this:**
```
404: NOT_FOUND
Code: NOT_FOUND
ID: bom1::t5bx6-1772352980696-5fcc2e9e0b31
```

**Root cause:** Vercel is NOT serving `index.html` for the `/admin-approve` path. This is a classic SPA routing issue. The `vercel.json` has the correct config:

```json
{
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ]
}
```

**Things to check on Vercel dashboard:**

1. **Framework Preset:** Ensure the project's framework preset is set to **Vite** (not "Other" or "Create React App"). Go to: Project → Settings → General → Framework Preset.

2. **Output Directory:** Should be `dist` (Vite's default). Check: Project → Settings → General → Output Directory.

3. **Build Command:** Should be `npm run build`. Check: Project → Settings → General → Build Command.

4. **Root Directory:** If the repo has multiple folders, make sure the root directory points to the correct one (`Testjee.com_login_main_sthome_test`).

5. **vercel.json location:** The `vercel.json` file MUST be at the **root of the deployed directory** (same level as `package.json`). If the Vercel project root is different from the Git repo root, the `vercel.json` might not be picked up.

6. **Redeploy:** Try a manual redeploy from the Vercel dashboard: Deployments → ... → Redeploy (with "Use existing Build Cache" **unchecked**).

> [!IMPORTANT]
> The simplest fix if vercel.json isn't being picked up: Go to **Project Settings → General** and set the **Framework Preset** to `Vite`. Vercel will then automatically handle SPA fallback routing without needing vercel.json.

---

## Features Implemented This Session

### 1. Email-Based Signup Approval Flow

**How it works:**
1. Student fills signup form (name, email, password, mobile, number of tests)
2. An email is sent to the admin via **EmailJS** (NOT Formspree — Formspree was going to spam)
3. The email contains all student details + an **approval link**
4. Admin clicks the link → lands on `/admin-approve` page
5. The page creates the Supabase Auth user + student record in the `students` table
6. Student can now log in with their credentials

**Files modified:**
- `src/components/Login.vue` — Signup form sends via EmailJS instead of Formspree
- `src/components/AdminApprove.vue` — Handles approval (creates auth user + student record)
- `src/router/index.js` — `/admin-approve` route, removed `email_confirmed_at` check

**EmailJS Configuration:**
- Service ID: `service_testjee`
- Template ID: `template_approval`
- Public Key: `I9eXY3TayX67uR-3R`
- Admin email: configured in EmailJS template (To Email / Cc fields)
- Dependency: `@emailjs/browser` (in package.json)

**Approval Link Format:**
```
https://www.testjee.com/admin-approve?name=...&email=...&pwd=<base64>&mobile=...&tests=N
```

### 2. Duplicate Signup Prevention

**How it works:**
- Before sending the approval email, the signup form calls a Supabase RPC function `check_email_exists()` to check if the email is already in the `students` table
- If it exists → shows "This email is already registered. Please sign in instead."
- No duplicate email is sent to the admin

**Supabase function required** (must exist in the database):
```sql
CREATE OR REPLACE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM students WHERE email_id = check_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> [!WARNING]
> This function MUST exist in Supabase. Without it, the signup form will error when checking for duplicates.

### 3. Timer Bug Fix

**Problem:** The exam timer was running 2x, 3x faster with each subsequent exam attempt in the same browser session.

**Root cause:** `startTimer()` in `examStore.js` used `setInterval()` but never cleared the previous interval. Each exam added a NEW interval on top of the old one(s).

**Fix:** Added `globalTimerInterval` ref to track the interval. Both `startTimer()` and `resetExamState()` now clear existing intervals before creating new ones.

**File:** `src/stores/examStore.js`

### 4. Test Count Decrement

**How it works:**
- When a student clicks "Start Exam", the `number_of_tests` field in the `students` table is decremented by 1
- If `number_of_tests` is 0, the exam is blocked
- The local student profile is updated immediately to stay in sync

**Files:** `src/components/Dashboard.vue`, `src/components/Results.vue`

### 5. Request More Tests Flow

**How it works:**
1. When a student tries to start an exam with 0 tests remaining, a **modal** appears
2. Student selects how many tests they need (1, 3, 5, or 10)
3. An email is sent to the admin via EmailJS with a **restore link**
4. Admin clicks the link → `/admin-approve` page with `action=restore`
5. The page updates the student's `number_of_tests` in Supabase

**Restore Link Format:**
```
https://www.testjee.com/admin-approve?action=restore&email=...&tests=N&name=...&sid=<student_id>
```

**Files:** `src/components/Dashboard.vue`, `src/components/Results.vue`, `src/components/AdminApprove.vue`

### 6. Removed Email Confirmation Requirement

**What changed:** Removed `email_confirmed_at` checks from:
- `src/components/Login.vue` (sign-in flow)
- `src/router/index.js` (navigation guard)

**Why:** In this system, **admin approval IS the verification**. The old checks were blocking approved students from logging in because Supabase's email confirmation was never completed by the student.

> [!IMPORTANT]
> **Supabase Setting Required:** In Supabase Dashboard → Authentication → Providers → Email → **"Confirm email" must be DISABLED (toggled OFF)**. Otherwise, students won't be able to log in even after admin approval.

---

## Summary of All Modified Files

| File | Changes |
|------|---------|
| `src/components/Login.vue` | EmailJS signup, duplicate check via RPC, removed email_confirmed_at check |
| `src/components/AdminApprove.vue` | Full rewrite: handles new signup + test restore |
| `src/components/Dashboard.vue` | Test decrement, "Request More Tests" modal, EmailJS restore |
| `src/components/Results.vue` | Same test decrement + restore modal as Dashboard |
| `src/components/ContactPage.vue` | Updated Formspree endpoint to `xyzbrzwq` |
| `src/stores/examStore.js` | Timer stacking fix (globalTimerInterval) |
| `src/router/index.js` | Removed email_confirmed_at guard |
| `vercel.json` | SPA catch-all rewrite (was already there) |

## Dependencies Added
- `@emailjs/browser` — for sending emails via EmailJS

---

## Quick Test Checklist

Once the Vercel 404 is fixed:

- [ ] Sign up with a new email → email arrives in admin Gmail
- [ ] Click approve link on production URL → shows "Student Approved!"
- [ ] Log in with the new student credentials → redirects to dashboard
- [ ] Try signing up with the same email again → shows "Already registered"
- [ ] Start exam → test count decrements by 1
- [ ] Use all tests → "No Tests Remaining" modal appears
- [ ] Send restore request → admin gets email
- [ ] Click restore link → shows "Tests Restored!"
- [ ] Timer runs at normal speed across multiple exam attempts
