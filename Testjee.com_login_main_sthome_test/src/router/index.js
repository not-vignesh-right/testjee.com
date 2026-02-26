import { createRouter, createWebHistory } from 'vue-router'
import ExamLayout from '../components/ExamLayout.vue'
import StudentLayout from '../components/StudentLayout.vue'
import Results from '../components/Results.vue'
import Dashboard from '../components/Dashboard.vue'
import ResultsDetails from '../components/ResultsDetails.vue'
import ResetPassword from '../components/ResetPassword.vue'

// --- Live Exam Components ---
// Admin
import ScheduleExam from '../components/admin/ScheduleExam.vue'
import SessionCredentials from '../components/admin/SessionCredentials.vue'
import AdminLiveSessions from '../components/admin/AdminLiveSessions.vue'
import LiveExamMonitor from '../components/admin/LiveExamMonitor.vue'
import ExamResults from '../components/admin/ExamResults.vue'

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
      { path: 'settings', name: 'Settings', component: () => import('../components/Settings.vue') }
    ]
  },

  // Settings alias for backward compatibility (optional, or just remove)
  { path: '/settings', redirect: '/sthome/settings' },

  // Admin Routes
  {
    path: '/admin',
    meta: { requiresAdminAuth: true },
    children: [
      { path: 'home', name: 'AdminHome', component: () => import('../components/admin/AdminHome.vue') },
      { path: 'sessions', name: 'AdminLiveSessions', component: AdminLiveSessions },
      { path: 'sessions/new', name: 'ScheduleExam', component: ScheduleExam },
      { path: 'sessions/:id/credentials', name: 'SessionCredentials', component: SessionCredentials },
      { path: 'sessions/:id/monitor', name: 'LiveExamMonitor', component: LiveExamMonitor },
      { path: 'sessions/:id/results', name: 'ExamResults', component: ExamResults }
    ]
  },

  // Student Live Exam Routes (No global auth guard, custom component-level guards applied)
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

    // Check if email is verified for protected routes
    if (auth.user && !auth.user.email_confirmed_at) {
      alert('Please verify your email before accessing this page.')
      await auth.logout()
      return next('/')
    }

    // Load student profile if authenticated and not already loaded
    if (!auth.studentProfile) {
      try {
        await auth.fetchOrCreateStudent()
      } catch (error) {
        console.error('Error fetching student profile:', error)
        return next('/')
      }
    }

    // ========== EXAM SUBMISSION LOGIC ==========
    try {
      if (examStore.isSubmitted && to.name === 'Exam') {
        console.log('Exam already submitted, redirecting to dashboard')
        return next({ name: 'Dashboard' })
      }

      // Only prevent access to results details if exam not submitted
      // Allow access to sthome (student home) even without submitted exam
      if (!examStore.isSubmitted && to.name === 'ResultsDetails') {
        return next({ name: 'Dashboard' })
      }
    } catch (e) {
      // ignore examStore not ready
    }
  }

  next()
})

export default router