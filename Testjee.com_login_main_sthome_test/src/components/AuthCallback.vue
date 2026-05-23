<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-white flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 text-center border border-white/50">
      <div v-if="loading" class="space-y-4">
        <div class="inline-block p-5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4">
          <svg class="w-16 h-16 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800">Completing sign in...</h2>
        <p class="text-gray-600">Please wait while we set up your account.</p>
      </div>
      
      <div v-else-if="error" class="space-y-4">
        <div class="inline-block p-5 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-4">
          <svg class="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-red-800">Verification Failed</h2>
        <p class="text-gray-600">{{ error }}</p>
        <button 
          @click="router.push('/')"
          class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
        >
          Back to Login
        </button>
      </div>
      
      <div v-else class="space-y-4">
        <div class="inline-block p-5 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl mb-4">
          <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-green-800">Email Verified! ✅</h2>
        <p class="text-gray-600">Redirecting you to payment...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // Get session from URL (after clicking verification link)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    
    if (!session) {
      throw new Error('Invalid or expired verification link')
    }
    
    // User is now verified, create/update student profile
    const student = await auth.fetchOrCreateStudent()
    
    loading.value = false
    
    if (student && student.is_approved) {
      // Approved student goes directly to dashboard
      setTimeout(() => {
        router.push('/sthome/dashboard')
      }, 1000)
    } else {
      // Unapproved/new student goes to payment first
      const pendingTests = localStorage.getItem('pendingPaymentTests') || '5'
      setTimeout(() => {
        router.push({ path: '/payment', query: { tests: pendingTests } })
      }, 1500)
    }
    
  } catch (err) {
    loading.value = false
    error.value = err.message
    console.error('Verification error:', err)
  }
})
</script>
