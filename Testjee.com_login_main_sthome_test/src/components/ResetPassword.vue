<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-white flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/50">
      <div v-if="!validToken" class="text-center space-y-4">
        <div class="inline-block p-5 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-4">
          <svg class="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-red-800">Invalid Reset Link</h2>
        <p class="text-gray-600">This password reset link is invalid or has expired.</p>
        <button 
          @click="router.push('/')"
          class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
        >
          Back to Login
        </button>
      </div>
      
      <div v-else class="space-y-6">
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold text-gray-800">Reset Your Password</h2>
          <p class="text-gray-600 mt-2">Create a new password for your account</p>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
          <div class="relative">
            <input 
              v-model="newPassword" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Minimum 8 characters"
              class="w-full px-4 py-3.5 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
            <button 
              @click="showPassword = !showPassword" 
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
          <div class="relative">
            <input 
              v-model="confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="Re-enter your password"
              class="w-full px-4 py-3.5 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
            <button 
              @click="showConfirmPassword = !showConfirmPassword" 
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
            >
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <button 
          @click="handleResetPassword" 
          :disabled="loading" 
          class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {{ loading ? 'Resetting...' : 'Reset Password' }}
        </button>
        
        <div v-if="message" :class="['p-4 rounded-xl text-sm font-medium', messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200']">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

const router = useRouter()
const auth = useAuthStore()

const validToken = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageType = ref('')
let authSubscription = null

onMounted(async () => {
  // Listen for PASSWORD_RECOVERY auth state change (for hash fragment flow or late code exchange)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
      validToken.value = true
    }
  })
  authSubscription = subscription

  // CRITICAL FIX: Check if we already have a session.
  // The router guard (beforeEach) calls loadSession(), which triggers Supabase to parse the URL
  // and exchange the code/hash. By the time this component mounts, we might ALREADY be authenticated.
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    console.log('Session found on mount:', session)
    validToken.value = true
    // If we have a session, we don't need to do manual code exchange
    return 
  }

  // PKCE Flow (Supabase v2+): Manual exchange if not auto-handled yet
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Code exchange error:', error)
        // Don't set validToken=false yet, waiting for listener might still work
      } else if (data.session) {
        validToken.value = true
      }
    } catch (err) {
      console.error('Code exchange failed:', err)
    }
    return
  }

  // Fallback: Hash fragment flow
  const hash = window.location.hash
  if (hash && hash.includes('type=recovery')) {
    setTimeout(async () => {
      if (!validToken.value) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) validToken.value = true
      }
    }, 1000)
    return
  }
})

onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
})

function showMessage(msg, type) {
  message.value = msg
  messageType.value = type
}

async function handleResetPassword() {
  if (newPassword.value.length < 8) {
    showMessage('Password must be at least 8 characters long', 'error')
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    showMessage('Passwords do not match', 'error')
    return
  }
  
  loading.value = true
  
  const result = await auth.updatePassword(newPassword.value)
  
  loading.value = false
  
  if (result.success) {
    showMessage('Password updated successfully! Redirecting to login...', 'success')
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } else {
    showMessage(result.error, 'error')
  }
}
</script>
