<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-white flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl"></div>
    </div>
    
    <div class="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden relative z-10 border border-white/50">
      
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center relative overflow-hidden">
        <!-- Animated background decoration -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
        </div>
        
        <div class="relative z-10">
          <div class="mb-4 flex justify-center">
            <div class="relative">
              <img 
                :src="logo" 
                alt="TESTJEE Logo" 
                class="w-28 h-28 mx-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
              >
              <div class="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
            </div>
          </div>
          
          <h2 class="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            TESTJEE
          </h2>
          
          <p class="text-lg text-blue-100 font-medium mb-1">
            Gyan Edge Testing Agency
          </p>
          
          <p class="text-sm text-blue-200 italic mt-2">
            "Exam se pehle original"
          </p>
        </div>
      </div>

      <div class="p-8">
        <!-- Toggle between Sign Up and Sign In -->
        <div class="flex gap-4 mb-6 border-b border-gray-200">
          <button 
            @click="isSignUpMode = true" 
            :class="['flex-1 pb-3 text-lg font-semibold transition-all duration-200', 
                     isSignUpMode ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600']"
          >
            Sign Up
          </button>
          <button 
            @click="isSignUpMode = false" 
            :class="['flex-1 pb-3 text-lg font-semibold transition-all duration-200',
                     !isSignUpMode ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600']"
          >
            Sign In
          </button>
        </div>

        <!-- SIGN UP MODE -->
        <div v-if="isSignUpMode" class="space-y-4">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">Create Your Account</h3>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input 
              v-model="signUpData.name" 
              type="text" 
              placeholder="Enter your full name"
              class="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
            <input 
              v-model="signUpData.email" 
              type="email" 
              placeholder="student@university.edu"
              class="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
            <div class="relative">
              <input 
                v-model="signUpData.password" 
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
            <label class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
            <div class="relative">
              <input 
                v-model="signUpData.confirmPassword" 
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
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Mobile Number (Optional)</label>
            <input 
              v-model="signUpData.mobile" 
              type="tel" 
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              class="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
            />
          </div>
          
          <button 
            @click="handleSignUp" 
            :disabled="loading" 
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
          
          <p class="text-center text-gray-600 text-sm mt-4">
            Already have an account? 
            <a @click="isSignUpMode = false" class="text-blue-600 font-semibold hover:underline cursor-pointer">Sign In</a>
          </p>
        </div>

        <!-- SIGN IN MODE -->
        <div v-else class="space-y-4">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">Sign In to TESTJEE</h3>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input 
              v-model="signInData.email" 
              type="email" 
              placeholder="student@university.edu"
              class="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div class="relative">
              <input 
                v-model="signInData.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Enter your password"
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
          
          <button 
            @click="handleSignIn" 
            :disabled="loading" 
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
          
          <p class="text-right text-sm mt-2">
            <a @click="showForgotPassword = true" class="text-blue-600 hover:underline cursor-pointer font-medium">Forgot Password?</a>
          </p>
          
          <p class="text-center text-gray-600 text-sm mt-4">
            Don't have an account? 
            <a @click="isSignUpMode = true" class="text-blue-600 font-semibold hover:underline cursor-pointer">Sign Up</a>
          </p>
        </div>

        <!-- SUCCESS/ERROR MESSAGES -->
        <div v-if="message" :class="['mt-6 p-4 rounded-xl text-sm font-medium', messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200']">
          {{ message }}
        </div>
      </div>
    </div>

    <!-- FORGOT PASSWORD MODAL -->
    <div v-if="showForgotPassword" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showForgotPassword = false">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" @click.stop>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Reset Password</h3>
        <p class="text-gray-600 mb-6">Enter your email to receive a password reset link</p>
        
        <input 
          v-model="resetEmail" 
          type="email" 
          placeholder="Email Address"
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none mb-4"
        />
        
        <div class="flex gap-3">
          <button 
            @click="handlePasswordReset" 
            :disabled="loading"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
          
          <button 
            @click="showForgotPassword = false"
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import logo from '../../assets/logo_test_jee.png'

const router = useRouter()
const auth = useAuthStore()

// State
const isSignUpMode = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showForgotPassword = ref(false)
const message = ref('')
const messageType = ref('') // 'success' or 'error'
const resetEmail = ref('')

const signUpData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  mobile: ''
})

const signInData = ref({
  email: '',
  password: ''
})

// Validation
function validateSignUp() {
  if (!signUpData.value.name.trim()) {
    showMessage('Please enter your full name', 'error')
    return false
  }
  
  if (!signUpData.value.email.trim() || !isValidEmail(signUpData.value.email)) {
    showMessage('Please enter a valid email address', 'error')
    return false
  }
  
  if (signUpData.value.password.length < 8) {
    showMessage('Password must be at least 8 characters long', 'error')
    return false
  }
  
  if (signUpData.value.password !== signUpData.value.confirmPassword) {
    showMessage('Passwords do not match', 'error')
    return false
  }
  
  if (signUpData.value.mobile && !/^[6-9]\d{9}$/.test(signUpData.value.mobile)) {
    showMessage('Please enter a valid 10-digit mobile number', 'error')
    return false
  }
  
  return true
}

function validateSignIn() {
  if (!signInData.value.email.trim() || !isValidEmail(signInData.value.email)) {
    showMessage('Please enter a valid email address', 'error')
    return false
  }
  
  if (!signInData.value.password) {
    showMessage('Please enter your password', 'error')
    return false
  }
  
  return true
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function showMessage(msg, type) {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Handlers
async function handleSignUp() {
  if (!validateSignUp()) return
  
  loading.value = true
  
  const result = await auth.signUpWithPassword(
    signUpData.value.email,
    signUpData.value.password,
    signUpData.value.name,
    signUpData.value.mobile
  )
  
  loading.value = false
  
  if (result.success) {
    showMessage(
      `Verification email sent to ${signUpData.value.email}! Please check your inbox and click the verification link.`,
      'success'
    )
    // Clear form
    signUpData.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: ''
    }
  } else {
    if (result.error.includes('already registered')) {
      showMessage('This email is already registered. Please sign in instead.', 'error')
    } else {
      showMessage(result.error, 'error')
    }
  }
}

async function handleSignIn() {
  if (!validateSignIn()) return
  
  loading.value = true
  
  const result = await auth.signInWithPassword(
    signInData.value.email,
    signInData.value.password
  )
  
  loading.value = false
  
  if (result.success) {
    // Check if email is verified
    if (!result.data.user.email_confirmed_at) {
      showMessage('Please verify your email before signing in. Check your inbox for the verification link.', 'error')
      await auth.logout()
      return
    }
    
    showMessage('Sign in successful! Redirecting...', 'success')
    setTimeout(() => {
      router.push('/sthome')
    }, 1000)
  } else {
    if (result.error.includes('Invalid login credentials')) {
      showMessage('Invalid email or password. Please try again.', 'error')
    } else {
      showMessage(result.error, 'error')
    }
  }
}

async function handlePasswordReset() {
  if (!resetEmail.value.trim() || !isValidEmail(resetEmail.value)) {
    showMessage('Please enter a valid email address', 'error')
    return
  }
  
  loading.value = true
  
  const result = await auth.resetPassword(resetEmail.value)
  
  loading.value = false
  
  if (result.success) {
    showMessage(`Password reset email sent to ${resetEmail.value}! Check your inbox.`, 'success')
    showForgotPassword.value = false
    resetEmail.value = ''
  } else {
    showMessage(result.error, 'error')
  }
}
</script>