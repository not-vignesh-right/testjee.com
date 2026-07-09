-- Signup / approval lifecycle fix
-- Run this once in the Supabase SQL Editor before deploying the app changes.
--
-- Adds two columns to `students` so the approval pipeline has real states instead of
-- overloading the single `is_approved` boolean + hard-deleting rows on reject:
--
--   is_rejected        -- true once an admin explicitly rejects the application.
--                          Row is KEPT (not deleted) so the student sees a clear
--                          "rejected" message on login/status-check instead of the
--                          app silently re-creating a fresh pending row for them.
--                          Email stays reserved; only an admin "Reopen" clears this.
--
--   payment_confirmed  -- true once the student clicks "I have completed the payment".
--                          Rows with payment_confirmed = false are "leads" (signed up
--                          or Google-authed, phone captured, but haven't paid yet) and
--                          are kept OUT of the admin "Pending Approvals" queue so that
--                          queue only ever contains genuine, payment-confirmed requests.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS is_rejected boolean NOT NULL DEFAULT false;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS payment_confirmed boolean NOT NULL DEFAULT false;

-- Backfill: any existing approved student obviously already "paid" in the old flow.
UPDATE public.students
SET payment_confirmed = true
WHERE is_approved = true;
