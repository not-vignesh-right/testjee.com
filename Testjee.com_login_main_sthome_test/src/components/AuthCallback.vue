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

      <!-- Mandatory phone number step (mainly catches Google sign-in, which never asks for a phone) -->
      <div v-else-if="needsPhone" class="space-y-4 text-left">
        <div class="text-center">
          <div class="inline-block p-5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4">
            <svg class="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">One last thing</h2>
          <p class="text-gray-600 text-sm mt-1">We need a mobile number to reach you about your exam approval and support — this is required for every account, including Google sign-in.</p>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Mobile Number</label>
          <input
            v-model="phoneInput"
            type="tel"
            inputmode="numeric"
            maxlength="10"
            placeholder="9876543210"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none text-sm"
            @keyup.enter="submitPhone"
          />
          <p v-if="phoneError" class="text-red-600 text-xs mt-1.5">{{ phoneError }}</p>
        </div>
        <button
          @click="submitPhone"
          :disabled="submittingPhone"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
        >
          {{ submittingPhone ? 'Saving...' : 'Continue' }}
        </button>
      </div>

      <div v-else class="space-y-4">
        <div class="inline-block p-5 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl mb-4">
          <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-green-800">Signed in! ✅</h2>
        <p class="text-gray-600">{{ redirectMessage }}</p>
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

const VALID_PHONE_REGEX = /^[6-9]\d{9}$/

const loading = ref(true)
const error = ref('')
const needsPhone = ref(false)
const phoneInput = ref('')
const phoneError = ref('')
const submittingPhone = ref(false)
const redirectMessage = ref('Redirecting...')

let studentRef = null

onMounted(async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) throw sessionError
    if (!session) throw new Error('Invalid or expired verification link')

    const student = await auth.fetchOrCreateStudent()
    studentRef = student

    loading.value = false
    routeStudent(student)
  } catch (err) {
    loading.value = false
    error.value = err.message
    console.error('Verification error:', err)
  }
})

function routeStudent(student) {
  if (student?.is_rejected) {
    redirectMessage.value = 'Redirecting...'
    setTimeout(() => router.push({ name: 'WaitingApproval' }), 1000)
    return
  }

  if (student?.is_approved) {
    redirectMessage.value = 'Redirecting you to your dashboard...'
    setTimeout(() => router.push('/sthome/dashboard'), 1000)
    return
  }

  // Not yet approved: mobile number is mandatory before we let them proceed to payment.
  // This is the same requirement the manual sign-up form enforces — Google sign-in must not bypass it.
  if (!VALID_PHONE_REGEX.test(student?.mobile_number || '')) {
    needsPhone.value = true
    return
  }

  const pendingTests = localStorage.getItem('pendingPaymentTests') || '5'
  redirectMessage.value = 'Redirecting you to payment...'
  setTimeout(() => router.push({ path: '/payment', query: { tests: pendingTests } }), 1000)
}

async function submitPhone() {
  phoneError.value = ''
  if (!VALID_PHONE_REGEX.test(phoneInput.value)) {
    phoneError.value = 'Please enter a valid 10-digit Indian mobile number.'
    return
  }

  submittingPhone.value = true
  try {
    const result = await auth.updateStudentProfile({ mobile_number: phoneInput.value })
    if (!result.success) {
      phoneError.value = result.error || 'Failed to save phone number. Please try again.'
      return
    }
    needsPhone.value = false
    routeStudent(auth.studentProfile || studentRef)
  } catch (err) {
    phoneError.value = err.message || 'Failed to save phone number. Please try again.'
  } finally {
    submittingPhone.value = false
  }
}
</script>
