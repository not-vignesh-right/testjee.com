<template>
  <div class="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Professional Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 pointer-events-none"></div>

    <!-- Main Card -->
    <div class="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] overflow-hidden relative z-10 p-8 md:p-10 border border-white/60 animate-fade-in-up">
      
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Almost there! ✅</h2>
        <p class="text-gray-500 text-sm">Complete the steps below to get full access.</p>
      </div>

      <!-- ACTION REQUIRED: Email Verification -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 animate-fade-in" style="animation-delay: 100ms;">
        <div class="flex items-start gap-3">
          <span class="text-2xl">📧</span>
          <div>
            <h4 class="font-bold text-amber-800 text-sm uppercase tracking-wide">Step 1 — Verify Your Email</h4>
            <p class="text-amber-700 text-sm mt-1">
              We sent a confirmation email to your inbox. <strong>You must click the link in that email</strong> to verify your account before admin can approve you.
            </p>
            <p class="text-amber-600 text-xs mt-2 font-medium">📌 Check your spam/junk folder if you don't see it.</p>
          </div>
        </div>
      </div>

      <!-- ACTION REQUIRED: Admin Approval -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 animate-fade-in" style="animation-delay: 200ms;">
        <div class="flex items-start gap-3">
          <span class="text-2xl">👨‍💼</span>
          <div>
            <h4 class="font-bold text-blue-800 text-sm uppercase tracking-wide">Step 2 — Wait for Admin Approval</h4>
            <p class="text-blue-700 text-sm mt-1">
              After you verify your email, our admin will manually review your payment and <strong>approve your account</strong>. This usually takes <span class="font-bold text-blue-900">less than 24 hours</span>.
            </p>
            <p class="text-blue-600 text-xs mt-2 font-medium">📌 You don't need to do anything — we'll email you when approved.</p>
          </div>
        </div>
      </div>

      <!-- Payment confirmed notice -->
      <div v-if="hasAttemptedPayment" class="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 animate-fade-in" style="animation-delay: 300ms;">
        <div class="flex items-center gap-3">
          <span class="text-2xl">✅</span>
          <div>
            <h4 class="font-bold text-green-800 text-sm uppercase tracking-wide">Payment Submitted</h4>
            <p class="text-green-700 text-sm mt-0.5">You've confirmed your payment. The admin has been notified and will verify it shortly.</p>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex flex-col gap-3 animate-fade-in" style="animation-delay: 400ms;">
        <button 
          @click="checkStatus" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200/50 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Checking...' : 'Check Approval Status' }}
        </button>

        <button 
          @click="logoutAndReturn" 
          class="w-full px-4 py-3.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors hover:shadow-sm"
        >
          Return to Login
        </button>
      </div>
      
      <!-- Contact Support -->
      <div class="mt-8 text-center animate-fade-in" style="animation-delay: 500ms;">
        <p class="text-sm text-gray-500 mb-2">Paid but still waiting? Contact us directly on WhatsApp 👇</p>
        <a href="https://wa.me/917353560013" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-100 transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
          +91 7353560013
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const hasAttemptedPayment = ref(false)

onMounted(() => {
  hasAttemptedPayment.value = localStorage.getItem('paymentAttempted') === 'true'
  // Clean up if desired, but retaining it is fine for persistence
})

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
  localStorage.removeItem('paymentAttempted')
  router.push('/')
}
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
  opacity: 0;
}
.animate-slide-in-left {
  animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}
</style>
