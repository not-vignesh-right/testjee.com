import { createRouter, createWebHistory } from 'vue-router'
import ExamLayout from '../components/ExamLayout.vue'
import Results from '../components/Results.vue'
import ResultsDetails from '../components/ResultsDetails.vue'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'

const routes = [
  // Login is the root page of this app (served at /login/ via router base)

  // Public pages
  { path: '/about', name: 'About', component: () => import('../components/AboutPage.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../components/ContactPage.vue') },

  // Student home (results page - homepage after login)
  { path: '/sthome', name: 'StHome', component: Results, meta: { requiresAuth: true } },
  { path: '/sthome/details', name: 'ResultsDetails', component: ResultsDetails, meta: { requiresAuth: true } },

  // Protected exam routes
  { path: '/exam', name: 'Exam', component: ExamLayout, meta: { requiresAuth: true } },

  // Public routes - Login is at root since router base is /login
  { path: '/', name: 'Login', component: () => import('../components/Login.vue') },
  { path: '/auth/callback', name: 'AuthCallback', component: () => import('../components/AuthCallback.vue') },
]


const router = createRouter({
  history: createWebHistory('/login'),
  routes,
})

// COMBINED AUTH + EXAM LOGIC GUARD
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  const examStore = useExamStore()

  // Load session
  await auth.loadSession()

  // ========== AUTH PROTECTION ==========
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/')
  }

  // Load student profile if authenticated and not already loaded
  if (auth.isAuthenticated && !auth.studentProfile) {
    await auth.fetchOrCreateStudent()
  }

  // ========== EXAM SUBMISSION LOGIC ==========
  try {
    if (examStore.isSubmitted && to.name === 'Exam') {
      console.log('Exam already submitted, redirecting to sthome')
      return next({ name: 'StHome' })
    }

    // Only prevent access to results details if exam not submitted
    // Allow access to sthome (student home) even without submitted exam
    if (!examStore.isSubmitted && to.name === 'ResultsDetails') {
      return next({ name: 'StHome' })
    }
  } catch (e) {
    // ignore examStore not ready
  }

  next()
})

export default router