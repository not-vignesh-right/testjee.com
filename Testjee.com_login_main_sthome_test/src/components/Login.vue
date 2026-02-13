<template>
  <div class="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Professional Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 pointer-events-none"></div>
    
    <!-- Animated Orbs (Subtle) -->
    <div class="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-200/20 rounded-full blur-[100px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-300/20 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s;"></div>

    <div class="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative z-10 flex flex-col md:flex-row border border-white/50">
      
      <!-- Left Side: Hero/Branding (Light Blue Gradient) -->
      <div class="md:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 left-0 w-full h-full opacity-10">
           <svg class="absolute right-[-20%] bottom-[-20%] w-[150%] h-[150%]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.4,82.2,23.1,70.6,33.5C59,43.9,47.1,51,35.1,56.7C23.1,62.4,11.1,66.7,-2.4,70.9C-15.9,75.1,-30.3,79.2,-41.8,72.3C-53.3,65.4,-61.9,47.5,-68.6,30.8C-75.3,14.1,-80.1,-1.4,-76.8,-15.5C-73.5,-29.6,-62.1,-42.3,-49.4,-50C-36.7,-57.7,-22.7,-60.4,-9.4,-60.8C3.9,-61.2,17.7,-59.3,30.5,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-8">
            <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <img :src="logo" alt="Logo" class="w-10 h-10 object-contain brightness-0 invert" />
            </div>
            <span class="text-xl font-bold tracking-wide">TESTJEE</span>
          </div>
          
          <div class="space-y-6">
            <h1 class="text-4xl md:text-5xl font-bold leading-tight">
              Master Your <br/>
              <span class="text-blue-100">Exam Preparation</span>
            </h1>
            <p class="text-blue-100 text-lg leading-relaxed opacity-90">
              Join thousands of students achieving their goals with our intelligent testing platform.
            </p>
          </div>
        </div>

        <div class="relative z-10 mt-12">
          <div class="flex items-center gap-4 text-sm font-medium text-blue-100">
            <div class="flex -space-x-3">
              <div class="w-10 h-10 rounded-full bg-blue-400 border-2 border-blue-600"></div>
              <div class="w-10 h-10 rounded-full bg-blue-300 border-2 border-blue-600"></div>
              <div class="w-10 h-10 rounded-full bg-blue-200 border-2 border-blue-600 flex items-center justify-center text-blue-800 text-xs">+2k</div>
            </div>
            <span>Trusted by students</span>
          </div>
        </div>
      </div>

      <!-- Right Side: Forms (White/Clean) -->
      <div class="md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
        <!-- Auth Toggle -->
        <div class="flex p-1 bg-gray-50 rounded-xl mb-8 w-max mx-auto md:mx-0">
          <button 
            @click="isSignUpMode = false"
            class="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
            :class="!isSignUpMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            Sign In
          </button>
          <button 
            @click="isSignUpMode = true"
            class="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
            :class="isSignUpMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            Sign Up
          </button>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {{ isSignUpMode ? 'Create an Account' : 'Welcome Back' }}
          </h2>
          <p class="text-gray-500">
            {{ isSignUpMode ? 'Start your journey with us today.' : 'Please enter your details to sign in.' }}
          </p>
        </div>

        <!-- Forms -->
        <form @submit.prevent="isSignUpMode ? handleSignUp() : handleSignIn()" class="space-y-5">
          
          <div v-if="isSignUpMode">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input 
              v-model="signUpData.name" 
              type="text" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="John Doe"
            />
          </div>

          <!-- Email Field -->
          <div v-if="isSignUpMode">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input 
              v-model="signUpData.email" 
              type="email" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="student@example.com"
            />
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input 
              v-model="signInData.email" 
              type="email" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="student@example.com"
            />
          </div>

          <!-- Password Field -->
          <div v-if="isSignUpMode">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input 
              v-model="signUpData.password" 
              type="password" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input 
              v-model="signInData.password" 
              type="password" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <div v-if="isSignUpMode">
             <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input 
              v-model="signUpData.confirmPassword" 
              type="password" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          
           <div v-if="isSignUpMode">
             <label class="block text-sm font-medium text-gray-700 mb-1.5">Mobile (Optional)</label>
            <input 
              v-model="signUpData.mobile" 
              type="tel" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="1234567890"
            />
          </div>

          <div v-if="!isSignUpMode" class="flex justify-end">
             <a @click="showForgotPassword = true" class="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-4"
          >
            {{ loading ? 'Processing...' : (isSignUpMode ? 'Create Account' : 'Sign In') }}
          </button>
        </form>

        <div v-if="message" :class="['mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2', messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']">
           <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path v-if="messageType === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
             <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
           </svg>
           {{ message }}
        </div>

      </div>
    </div>
    
     <!-- FORGOT PASSWORD MODAL (Same as before but styled) -->
    <div v-if="showForgotPassword" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="showForgotPassword = false">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl scale-100 transition-all" @click.stop>
        <div class="text-center mb-6">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 19l-1 1-1 1-2-2m-2-2l-2-2-1-1-1-1m2-2a6 6 0 016-6h9z"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900">Reset Password</h3>
          <p class="text-gray-500 text-sm mt-1">Enter your email and we'll send you a link.</p>
        </div>
        
        <input 
          v-model="resetEmail" 
          type="email" 
          placeholder="name@example.com"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none mb-6"
        />
        
        <div class="flex gap-3">
           <button 
            @click="showForgotPassword = false"
            class="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="handlePasswordReset" 
            :disabled="loading"
            class="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
             Send Link
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