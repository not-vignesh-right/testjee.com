import { createRouter, createWebHistory } from 'vue-router'
import ExamLayout from '../components/ExamLayout.vue'
import StudentLayout from '../components/StudentLayout.vue'
import Results from '../components/Results.vue'
import ResultsDetails from '../components/ResultsDetails.vue'
import ResetPassword from '../components/ResetPassword.vue'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'

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
      { path: 'dashboard', name: 'Dashboard', component: Results },
      { path: 'details', name: 'ResultsDetails', component: ResultsDetails },
      { path: 'settings', name: 'Settings', component: () => import('../components/Settings.vue') }
    ]
  },

  // Settings alias for backward compatibility (optional, or just remove)
  { path: '/settings', redirect: '/sthome/settings' },

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

  // Load session
  await auth.loadSession()

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