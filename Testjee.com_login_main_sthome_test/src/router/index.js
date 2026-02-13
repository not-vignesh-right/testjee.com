import { createRouter, createWebHistory } from 'vue-router'
import ExamLayout from '../components/ExamLayout.vue'
import Results from '../components/Results.vue'
import ResultsDetails from '../components/ResultsDetails.vue'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'

const routes = [
  // Landing page (public home)
  { path: '/', name: 'Home', component: () => import('../components/LandingPage.vue') },
  
  // Public pages
  { path: '/about', name: 'About', component: () => import('../components/AboutPage.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../components/ContactPage.vue') },

  // Dashboard (homepage after login)
  { path: '/dashboard', name: 'Dashboard', component: () => import('../components/Dashboard.vue'), meta: { requiresAuth: true } },

  // Protected exam routes
  { path: '/exam', name: 'Exam', component: ExamLayout, meta: { requiresAuth: true } },
  { path: '/results', name: 'Results', component: Results, meta: { requiresAuth: true } },
  { path: '/results/details', name: 'ResultsDetails', component: ResultsDetails, meta: { requiresAuth: true } },

  // Public routes
  { path: '/login', name: 'Login', component: () => import('../components/Login.vue') },
  { path: '/auth/callback', name: 'AuthCallback', component: () => import('../components/AuthCallback.vue') },
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
  
  // ========== AUTH PROTECTION ==========
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  // Load student profile if authenticated and not already loaded
  if (auth.isAuthenticated && !auth.studentProfile) {
    await auth.fetchOrCreateStudent()
  }

  // ========== EXAM SUBMISSION LOGIC ==========
  try {
    if (examStore.isSubmitted && to.name === 'Exam') {
      console.log('Exam already submitted, redirecting to results')
      return next({ name: 'Results' })
    }

    if (!examStore.isSubmitted && (to.name === 'Results' || to.name === 'ResultsDetails')) {
      return next({ name: 'Exam' })
    }
  } catch (e) {
    // ignore examStore not ready
  }

  next()
})

export default router