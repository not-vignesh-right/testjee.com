import { createRouter, createWebHistory } from 'vue-router'
import ExamLayout from '../components/ExamLayout.vue'
import StudentLayout from '../components/StudentLayout.vue'
import Results from '../components/Results.vue'
import Dashboard from '../components/Dashboard.vue'
import ResultsDetails from '../components/ResultsDetails.vue'
import QuestionDetail from '../components/QuestionDetail.vue'
import ResetPassword from '../components/ResetPassword.vue'
import WaitingApproval from '../components/WaitingApproval.vue'
import PaymentPage from '../components/PaymentPage.vue'

// --- Live Exam Components ---
// Admin
import AdminLayout from '../components/admin/AdminLayout.vue'
import ScheduleExam from '../components/admin/ScheduleExam.vue'
import SessionCredentials from '../components/admin/SessionCredentials.vue'
import AdminLiveSessions from '../components/admin/AdminLiveSessions.vue'
import LiveExamMonitor from '../components/admin/LiveExamMonitor.vue'
import ExamResults from '../components/admin/ExamResults.vue'
import AdminResumeRequests from '../components/admin/AdminResumeRequests.vue'

// Student
import ExamLogin from '../components/live-exam/ExamLogin.vue'
import ExamWaitingRoom from '../components/live-exam/ExamWaitingRoom.vue'
import LiveExamInterface from '../components/live-exam/LiveExamInterface.vue'
import StudentResults from '../components/live-exam/StudentResults.vue'
// ----------------------------

import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'
import { useExamSessionStore } from '../stores/examSessionStore'
import { supabase } from '../lib/supabase'

const routes = [
  // Login is the root page of this app (served at /login/ via router base)

  // Public pages
  { path: '/about', name: 'About', component: () => import('../components/AboutPage.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../components/ContactPage.vue') },

  // Student Dashboard Routes (Wrapped in Layout)
  {
    path: '/sthome',
    component: StudentLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: 'dashboard' }, // Default redirect
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'details', name: 'ResultsDetails', component: ResultsDetails },
      { path: 'details/:id', name: 'QuestionDetail', component: QuestionDetail },
      { path: 'settings', name: 'Settings', component: () => import('../components/Settings.vue') }
    ]
  },

  // Settings alias for backward compatibility (optional, or just remove)
  { path: '/settings', redirect: '/sthome/settings' },

  // Admin Routes
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdminAuth: true },
    children: [
      { path: '', redirect: 'home' }, // /admin → /admin/home
      { path: 'home', name: 'AdminHome', component: () => import('../components/admin/AdminHome.vue') },
      { path: 'sessions', name: 'AdminLiveSessions', component: AdminLiveSessions },
      { path: 'sessions/new', name: 'ScheduleExam', component: ScheduleExam },
      { path: 'sessions/:id/credentials', name: 'SessionCredentials', component: SessionCredentials },
      { path: 'sessions/:id/monitor', name: 'LiveExamMonitor', component: LiveExamMonitor },
      { path: 'sessions/:id/results', name: 'ExamResults', component: ExamResults },
      { path: 'resume-requests', name: 'AdminResumeRequests', component: AdminResumeRequests }
    ]
  },

  // Student Live Exam Routes (No global auth guard, custom component-level guards applied)
  { path: '/live-exam', name: 'LiveExamLoginDirect', component: ExamLogin },
  { path: '/live-exam/:sessionCode', name: 'LiveExamLogin', component: ExamLogin },
  { path: '/live-exam/:sessionCode/lobby', name: 'LiveExamLobby', component: ExamWaitingRoom },
  { path: '/live-exam/:sessionCode/active', name: 'LiveExamActive', component: LiveExamInterface },
  { path: '/live-exam/:sessionCode/results', name: 'LiveExamResults', component: StudentResults },

  // Protected exam routes (Independent of Dashboard Layout for full screen focus)
  { path: '/exam', name: 'Exam', component: ExamLayout, meta: { requiresAuth: true } },

  // Public routes - Login is at root since router base is /login
  { path: '/', name: 'Login', component: () => import('../components/Login.vue') },
  { path: '/auth/callback', name: 'AuthCallback', component: () => import('../components/AuthCallback.vue') },
  { path: '/auth/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/waiting-approval', name: 'WaitingApproval', component: WaitingApproval },
  { path: '/payment', name: 'Payment', component: PaymentPage },

  // Catch-all/Redirects
  { path: '/dashboard', redirect: '/sthome/dashboard' },
  { path: '/:pathMatch(.*)*', redirect: '/' } // Redirect unknown routes to login
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})

// COMBINED AUTH + EXAM LOGIC GUARD
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  const examStore = useExamStore()
  const adminStore = useAdminStore()

  if (to.path === '/exam' && to.query.mode === 'live') {
    const liveStore = useExamSessionStore()
    if (!liveStore.studentSessionId) {
      const username = sessionStorage.getItem('student_username')
      const sessionCode = to.query.sessionCode
      if (username && sessionCode) {
        console.log(`🔄 Restoring live exam session on reload for username: ${username}, session: ${sessionCode}`)
        const loginRes = await liveStore.loginToExam(sessionCode, username)
        if (loginRes.success) {
          const loadRes = await liveStore.loadQuestions()
          if (loadRes.success) {
            // Bug fix: this reload-recovery path predates the bridge's examType parameter
            // (added for BUG-09/NEW-06) and was never updated to pass it — every reload of
            // a NEET/KCET live exam was silently falling back to the JEE_MAIN_FULL subject
            // layout. Fetch it the same best-effort way ExamWaitingRoom.vue's beginExam() does.
            let examType
            try {
              const { data: examTypeData } = await supabase
                .from('live_exam_sessions')
                .select('exam_type')
                .eq('session_code', sessionCode)
                .maybeSingle()
              examType = examTypeData?.exam_type
            } catch (typeErr) {
              console.warn('Could not fetch exam_type on reload (non-fatal):', typeErr)
            }
            const { bridgeLiveSessionToExamStore } = await import('../stores/liveExamBridge')
            bridgeLiveSessionToExamStore(sessionCode, examType)
            examStore.isLiveReload = true
            return next()
          }
        }
      }
      return next('/live-exam')
    }
    return next()
  }

  // Admin route protection
  if (to.meta.requiresAdminAuth) {
    await adminStore.loadSession()

    if (!adminStore.isAuthenticated) {
      return next('/')
    }
    return next()
  }

  // Load session
  await auth.loadSession()

  // Bypasses global auth constraints for the standalone live-exam system
  // (live-exam system uses its own session codes and temp-student tokens mapped in examSessionStore and RLS functions)
  if (to.path.startsWith('/live-exam')) {
    return next()
  }

  // Redirect if visiting login page while authenticated
  if (to.path === '/' && auth.isAuthenticated) {
    return next('/sthome/dashboard')
  }

  // ========== AUTH PROTECTION ==========
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      // Not logged in → Redirect to login
      return next('/')
    }

    // Admin approval replaces email verification in this system
    // No email_confirmed_at check needed

    // Load student profile if authenticated and not already loaded
    if (!auth.studentProfile) {
      try {
        await auth.fetchOrCreateStudent()
      } catch (error) {
        console.error('Error fetching student profile:', error)
        await auth.logout() // Fix infinite loop: clear invalid session
        return next('/')
      }
    }

    // CHECK ADMIN APPROVAL
    if (!auth.studentProfile?.is_approved && to.name !== 'WaitingApproval') {
      return next({ name: 'WaitingApproval' })
    }

    // ========== EXAM SUBMISSION LOGIC ==========
      try {
        if (examStore.isSubmitted && to.name === 'Exam') {
          console.log('Exam already submitted, redirecting to dashboard')
          return next({ name: 'Dashboard' })
        }
      } catch (e) {
        // ignore examStore not ready
      }
  }

  next()
})

export default router