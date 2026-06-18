# Completed Changes: Exam Stability & Support Resumption Appeal System

This document provides a summary of the stability updates and support features implemented to prevent accidental auto-submissions and allow students to resume mock exams.

--- 

## 1. Exam Stability & Sleep Prevention

* **Screen Wake Lock API**: Integrated screen wake locks in [ExamLayout.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/ExamLayout.vue) and [LiveExamInterface.vue](file:///c:/Users/admin/Desktop/testjee/Testjee.com_login_main_sthome_test/src/components/live-exam/LiveExamInterface.vue) to block OS screen savers, screen dimming, and locks when students are inactive.
* **10-Second Grace Warning vs. Instant Auto-Submit**: Configured the proctoring enforcement rules:
  - **Tab switching / minimizing the window**: Triggers **instant auto-submission** without a grace period, as this is an intentional cheating action.
  - **Exiting fullscreen / window blur (losing focus)**: Retains the **10-second warning countdown grace period** overlay to allow recovery, since these can be triggered accidentally by system dialogs or notifications.

---

## 2. Resumption & Support Appeal System

We created a custom workflow allowing students to appeal accidental auto-submits and resume tests with progress intact:
* **Database Table (`exam_support_requests`)**: Logs requests including student ID, session ID, reason, remaining time, and a JSONB snapshot of `answers`.
* **Appeal UI in Exam view**: Redesigned the auto-submit overlay in `ExamLayout.vue` to allow students to submit appeals and automatically poll the database for approval updates.
* **Dashboard Banner (`Dashboard.vue`)**: Displays a banner for **10 minutes** post-auto-submission. Students can request resumption, check approval status, and click **"Resume Test Now"** to reload their exam session answers and route back to `/exam`.
* **Pinia Store Updates (`examStore.js`)**:
  - `submitSupportRequest(...)`: Creates support requests with the active answers snapshot.
  - `restoreResumedSession(...)`: Restores the exam session progress (answers, status, time spent) from the request database payload back into Pinia state and localStorage.
* **Admin Dashboard Support Logs (`DashboardPage.vue`)**:
  - Displays all pending and resolved resumption appeals.
  - **Approve**: Sets status to `approved`, deletes the temporary scorecard from the `results` table, and reopens the session (`is_submitted = false`, resets `start_time` and set `total_duration_seconds = remaining_time`).
  - **Reject**: Sets request status to `rejected`.
  - **Proxy Parse Fix**: Replaced the multiline PostgREST query parameter with a single-line string without spaces/newlines to work correctly with the custom admin REST proxy API.
* **Student History Log (`StudentDetailPage.vue`)**: Shows resumption request histories for full student diagnostic records.
