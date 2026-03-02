<template>
  <div class="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Professional Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 pointer-events-none"></div>

    <!-- Main Card -->
    <div class="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden relative z-10 p-8 md:p-12 text-center border border-white/60 animate-fade-in-up">
      
      <!-- Icon -->
      <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 ring-8 ring-blue-50">
        <svg class="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>

      <h2 class="text-3xl font-bold text-gray-900 mb-4">Pending Approval</h2>
      
      <p class="text-gray-600 mb-8 leading-relaxed">
        Your registration request has been successfully submitted! An administrator is currently reviewing your account. You will be able to access the platform once your account is approved.
      </p>

      <div class="bg-blue-50 rounded-xl p-4 mb-8 text-sm text-blue-800 border border-blue-100 flex items-start gap-3 text-left">
        <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p>You can safely close this window. Try logging in again later to check your status.</p>
      </div>

      <div class="flex flex-col gap-3">
        <button 
          @click="checkStatus" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200/50 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Checking Status...' : 'Check Approval Status' }}
        </button>

        <button 
          @click="logoutAndReturn" 
          class="w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors hover:shadow-sm"
        >
          Return to Login
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

async function checkStatus() {
  loading.value = true
  
  try {
    // Force refresh student profile from DB
    await authStore.fetchOrCreateStudent()
    
    // Check if approved now
    if (authStore.studentProfile?.is_approved) {
      router.push('/sthome')
    } else {
      // Simulate delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  } catch (error) {
    console.error('Error checking status:', error)
  } finally {
    loading.value = false
  }
}

async function logoutAndReturn() {
  await authStore.logout()
  router.push('/')
}
</script>
