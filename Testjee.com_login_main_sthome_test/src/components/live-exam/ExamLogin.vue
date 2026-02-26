<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center pb-20 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
       <div class="flex justify-center flex-col items-center">
         <!-- Brand -->
          <div class="font-bold text-3xl text-gray-900 tracking-tight flex items-center gap-2 mb-2">
            <span class="bg-blue-600 text-white rounded-lg px-2 py-1 shadow-sm font-black">T</span>
            TestJEE <span class="text-blue-600 font-light">Live Exam</span>
          </div>
          <p class="text-gray-500 font-medium text-sm">Secure Examination Portal</p>
       </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
        
        <!-- Decorative Header Strip -->
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <h2 class="text-center text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">Student Login</h2>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <div v-if="errorMsg" class="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200 text-center flex items-center justify-center gap-2 animate-shake">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {{ errorMsg }}
          </div>

          <!-- Step 1: Initial Login Form -->
          <template v-if="!needsDetails">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Session Code</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input 
                  v-model="loginForm.sessionCode" 
                  type="text" 
                  required 
                  :disabled="!!route.params.sessionCode"
                  class="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors uppercase font-mono disabled:opacity-75 disabled:bg-gray-100 text-gray-900" 
                  placeholder="EXAM..."
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div class="mt-1">
                <input 
                  v-model="loginForm.username" 
                  type="text" 
                  required 
                  class="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors text-gray-900" 
                  placeholder="student001"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="mt-1">
                <input 
                  v-model="loginForm.password" 
                  type="password" 
                  required 
                  autocomplete="off"
                  class="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors text-gray-900 font-mono tracking-widest text-lg" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                :disabled="loading"
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 mt-2"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Authenticating...' : 'Enter Session' }}
              </button>
            </div>
          </template>

          <!-- Step 2: Student Details Form (Only shown if has_filled_details is false) -->
          <template v-else>
            <div class="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
               <h3 class="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-2">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 First-Time Setup
               </h3>
               <p class="text-xs text-yellow-700">Please provide your real credentials for the result card. This cannot be changed later.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name <span class="text-red-500">*</span></label>
              <input 
                v-model="detailsForm.fullName" 
                type="text" 
                required 
                class="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors" 
                placeholder="Rahul Kumar"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Roll / Identifier Number <span class="text-red-500">*</span></label>
              <input 
                v-model="detailsForm.rollNumber" 
                type="text" 
                required 
                class="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors font-mono" 
                placeholder="2024CS045"
              />
            </div>

            <div>
              <button 
                type="button" 
                @click="submitDetails"
                :disabled="loading || !detailsForm.fullName || !detailsForm.rollNumber"
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-70 mt-2"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Save & Continue to Lobby
              </button>
            </div>
          </template>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamSessionStore } from '../../stores/examSessionStore'
import { supabase } from '../../lib/supabase'

const router = useRouter()
const route = useRoute()
const examStore = useExamSessionStore()

const loading = ref(false)
const errorMsg = ref('')

const needsDetails = ref(false)

const loginForm = ref({
  sessionCode: route.params.sessionCode || '',
  username: '',
  password: ''
})

const detailsForm = ref({
  fullName: '',
  rollNumber: ''
})

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  
  try {
    const res = await examStore.loginToExam(
      loginForm.value.sessionCode.trim().toUpperCase(), 
      loginForm.value.username.trim(), 
      loginForm.value.password.trim()
    )
    
    if (!res.success) {
      errorMsg.value = res.error || 'Invalid session code or credentials.'
      loading.value = false
      return
    }
    
    // Check if details are needed
    if (!examStore.sessionDetails.hasFilledDetails) {
      needsDetails.value = true
      loading.value = false
      return
    }
    
    // Proceed to router guard
    redirectBasedOnStatus()

  } catch (err) {
    errorMsg.value = 'An unexpected error occurred. Please check connection.'
    loading.value = false
  }
}

const submitDetails = async () => {
  errorMsg.value = ''
  loading.value = true
  
  try {
    const { error } = await supabase.rpc('update_student_details', {
      input_temp_student_id: examStore.tempStudentId,
      input_student_name: detailsForm.value.fullName.trim(),
      input_roll_number: detailsForm.value.rollNumber.trim()
    })
    
    if (error) throw error
    
    examStore.sessionDetails.hasFilledDetails = true
    examStore.sessionDetails.studentName = detailsForm.value.fullName.trim()
    examStore.sessionDetails.rollNumber = detailsForm.value.rollNumber.trim()
    
    redirectBasedOnStatus()
    
  } catch (err) {
    console.error('Failed details update', err)
    errorMsg.value = 'Failed to save details. Try again.'
  } finally {
    loading.value = false
  }
}

const redirectBasedOnStatus = () => {
  const code = loginForm.value.sessionCode.trim().toUpperCase()
  
  if (examStore.examStatus === 'submitted' || examStore.examStatus === 'auto_submitted' || examStore.sessionDetails.sessionStatus === 'completed') {
    router.push(`/live-exam/${code}/results`)
  } 
  else if (examStore.examStatus === 'in_progress') {
    router.push(`/live-exam/${code}/active`)
  } 
  else {
    // not_started / scheduled / lobby
    router.push(`/live-exam/${code}/lobby`)
  }
}

// Auto focus UX
onMounted(() => {
  examStore.resetStore() // Clear any old sessions
  if (route.params.sessionCode && document.querySelector('input[type="text"]:nth-of-type(2)')) {
    // Hacky focus on unmounted DOM but Vue refs usually better
    setTimeout(() => {
      document.querySelectorAll('input')[1]?.focus()
    }, 100)
  }
})
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
