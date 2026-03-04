<template>
  <div class="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 pointer-events-none"></div>

    <div class="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] relative z-10 p-8 border border-white/60 animate-fade-in-up">

      <!-- ===== MODE A: Verify Email (step=email or default after signup) ===== -->
      <div v-if="step === 'email'">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <span class="text-3xl">📧</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-1">Check Your Email</h2>
          <p class="text-gray-500 text-sm">We sent a confirmation link to your inbox.</p>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <p class="text-amber-800 text-sm font-semibold mb-1">👆 Action Required</p>
          <p class="text-amber-700 text-sm">Click the verification link in your email to continue to payment. <strong>Without this step, your account won't be activated.</strong></p>
          <p class="text-amber-600 text-xs mt-3">📌 Check your <strong>spam / junk</strong> folder if you don't see it.</p>
        </div>

        <div class="bg-gray-50 rounded-2xl p-4 mb-6 text-sm text-gray-600 space-y-1.5">
          <p>✅ Account created successfully</p>
          <p>⏳ Waiting for email verification</p>
          <p class="text-gray-400">⏳ Payment (after verification)</p>
          <p class="text-gray-400">⏳ Admin approval</p>
        </div>

        <button
          @click="logoutAndReturn"
          class="w-full px-4 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          Back to Login
        </button>
      </div>

      <!-- ===== MODE B: Waiting for Admin Approval (step=admin, after payment) ===== -->
      <div v-else>
        <div class="text-center mb-8">
          <div class="relative inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <span class="text-3xl">👨‍💼</span>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-60"></span>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full"></span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-1">Waiting for Approval</h2>
          <p class="text-gray-500 text-sm">Your payment is being reviewed by admin.</p>
        </div>

        <!-- Live status -->
        <div class="rounded-2xl border mb-5 overflow-hidden"
          :class="isApproved ? 'border-green-200 bg-green-50' : 'border-blue-100 bg-blue-50/50'">
          <div class="px-4 py-3 border-b" :class="isApproved ? 'border-green-200' : 'border-blue-100'">
            <p class="text-xs font-bold uppercase tracking-widest" :class="isApproved ? 'text-green-700' : 'text-blue-700'">
              Account Status
            </p>
          </div>
          <div class="px-4 py-4 space-y-3 text-sm">
            <div class="flex items-center gap-2.5">
              <span class="text-green-500 text-base">✅</span>
              <span class="text-gray-700">Email verified</span>
            </div>
            <div class="flex items-center gap-2.5">
              <span class="text-green-500 text-base">✅</span>
              <span class="text-gray-700">Payment submitted</span>
            </div>
            <div class="flex items-center gap-2.5">
              <template v-if="isApproved">
                <span class="text-green-500 text-base">✅</span>
                <span class="font-semibold text-green-700">Admin approved — redirecting you in...</span>
              </template>
              <template v-else>
                <span class="inline-flex relative w-4 h-4">
                  <span class="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50 animate-ping"></span>
                  <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                </span>
                <span class="text-gray-600">Waiting for admin approval...</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Approved: countdown -->
        <div v-if="isApproved" class="text-center mb-5">
          <p class="text-green-700 font-bold text-lg">🎉 You're approved!</p>
          <p class="text-gray-500 text-sm mt-1">Redirecting to your dashboard in <strong>{{ countdown }}s</strong></p>
          <button @click="goToDashboard" class="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:opacity-90">
            Go to Dashboard →
          </button>
        </div>

        <!-- Not approved: check + info -->
        <div v-else>
          <div class="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mb-5 text-xs text-gray-500">
            📌 Usually takes <strong class="text-gray-700">less than 24 hours</strong>. You'll receive an email when approved. You can safely close this window.
          </div>
          <button
            @click="checkStatus"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200/50 transition-all disabled:opacity-70 flex justify-center items-center gap-2 mb-3"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Checking...' : 'Check Approval Status' }}
          </button>
          <button @click="logoutAndReturn" class="w-full px-4 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Back to Login
          </button>
        </div>

        <!-- WhatsApp -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400 mb-2">Paid but still waiting? Message us directly</p>
          <a href="https://wa.me/917353560013" target="_blank" rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 font-bold text-sm px-4 py-2 rounded-full hover:bg-green-100 transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
            +91 7353560013
          </a>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const isApproved = ref(false)
const countdown = ref(5)

// Determine which mode to show based on ?step= query param
const step = computed(() => route.query.step || 'admin')

let pollInterval = null
let countdownInterval = null

onMounted(async () => {
  // If in admin-approval mode, start polling every 15 seconds
  if (step.value === 'admin') {
    await checkStatus()
    pollInterval = setInterval(checkStatus, 15000)
  }
})

onUnmounted(() => {
  clearInterval(pollInterval)
  clearInterval(countdownInterval)
})

async function checkStatus() {
  loading.value = true
  try {
    await authStore.fetchOrCreateStudent()
    if (authStore.studentProfile?.is_approved) {
      isApproved.value = true
      clearInterval(pollInterval)
      startCountdown()
    }
  } catch (e) {
    console.error('Status check error:', e)
  } finally {
    loading.value = false
  }
}

function startCountdown() {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      goToDashboard()
    }
  }, 1000)
}

function goToDashboard() {
  clearInterval(countdownInterval)
  router.push('/sthome')
}

async function logoutAndReturn() {
  await authStore.logout()
  localStorage.removeItem('paymentAttempted')
  localStorage.removeItem('pendingPaymentTests')
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
.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
  opacity: 0;
}
</style>
