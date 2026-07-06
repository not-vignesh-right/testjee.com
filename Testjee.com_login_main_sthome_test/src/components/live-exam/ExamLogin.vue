<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center pb-20 sm:px-6 lg:px-8">

    <!-- Mobile Block -->
    <Teleport to="body">
      <div v-if="isMobile" class="fixed inset-0 bg-white flex flex-col items-center justify-center px-8 text-center" style="z-index:99999">
        <div class="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-black text-gray-900 mb-3">Mobile Not Allowed</h1>
        <p class="text-gray-500 text-base leading-relaxed max-w-sm">
          This exam must be taken on a <strong class="text-gray-800">laptop or desktop computer</strong>.<br/>
          Please switch to a desktop browser to continue.
        </p>
        <div class="mt-6 px-5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
          📵 Mobile &amp; Tablet access is not permitted
        </div>
      </div>
    </Teleport>
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
       <div class="flex justify-center flex-col items-center">
         <!-- Brand -->
          <img
            :src="logo"
            alt="TestJEE"
            class="h-16 w-auto object-contain mb-2"
          />
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

          <!-- SQL Ambiguity Developer Helper -->
          <div v-if="isSqlAmbiguityError" class="bg-slate-905 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-xl mt-2 animate-fade-in text-left">
            <div class="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>Supabase SQL Ambiguity Error Detected</span>
            </div>
            <p class="text-slate-300 text-xs mb-4 leading-relaxed">
              The RPC function <code class="bg-slate-800 px-1 py-0.5 rounded text-red-300 font-mono text-[11px]">student_exam_login</code> in your Supabase dashboard contains a join query with an ambiguous reference to <code>temp_student_id</code>.
            </p>
            <div class="mb-3">
              <div class="flex justify-between items-center bg-slate-800 px-3 py-1.5 rounded-t-lg border-b border-slate-700">
                <span class="text-[10px] uppercase font-mono text-slate-400 font-bold">SQL Fix Script</span>
                <button 
                  type="button" 
                  @click="copySqlToClipboard" 
                  class="text-xs flex items-center gap-1.5 font-bold transition-all px-2.5 py-1 rounded"
                  :class="copiedSql ? 'text-green-400 bg-green-950/40 border border-green-800' : 'text-blue-400 hover:text-blue-300 bg-slate-700 border border-slate-600'"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                  <span>{{ copiedSql ? 'Copied!' : 'Copy SQL' }}</span>
                </button>
              </div>
              <pre class="bg-slate-900 p-3 rounded-b-lg text-[10px] font-mono overflow-x-auto max-h-48 border border-slate-750 text-red-200">{{ sqlFixSnippet }}</pre>
            </div>
            <div class="text-[10px] text-slate-400 leading-relaxed">
              💡 <strong>How to apply:</strong> Go to your <strong>Supabase Dashboard</strong> &rarr; <strong>SQL Editor</strong> &rarr; Paste this script &rarr; Click <strong>Run</strong>. Then refresh this page and log in!
            </div>
          </div>

          <!-- Step 1: Initial Login Form -->
          <template v-if="!needsDetails && !needsVerification">
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

          <!-- Step 3: Roll Number Verification (Only shown if needsVerification is true) -->
          <template v-else-if="needsVerification">
            <div class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
               <h3 class="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                 Verification Required
               </h3>
               <p class="text-xs text-blue-700">This student ({{ examStore.sessionDetails.studentName }}) has already entered the lobby or is active in the exam. If this is you, enter your Roll Number to verify your identity. Otherwise, please enter your correct assigned username.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Verify Roll Number <span class="text-red-500">*</span></label>
              <input 
                v-model="verificationRollNumber" 
                type="text" 
                required 
                class="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors font-mono" 
                placeholder="Enter Roll Number..."
              />
            </div>

            <div>
              <button 
                type="button" 
                @click="submitVerification"
                :disabled="loading || !verificationRollNumber"
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 mt-2"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Verify & Enter Exam
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
import logo from '../../assets/logo_test_jee_original.png'

const router = useRouter()
const route = useRoute()
const examStore = useExamSessionStore()

const loading = ref(false)
const errorMsg = ref('')

const isSqlAmbiguityError = ref(false)
const sqlFixSnippet = ref(`-- Supabase SQL Editor Fix for ambiguous column "temp_student_id"
-- First, drop the existing function to avoid "cannot change return type of existing function" (error 42P13):
DROP FUNCTION IF EXISTS public.student_exam_login(text, text);

-- Copy and run this script in your Supabase SQL Editor:
CREATE OR REPLACE FUNCTION public.student_exam_login(
  input_session_code text,
  input_username text
)
RETURNS TABLE(
  student_session_id integer,
  temp_student_id integer,
  live_session_id integer,
  status text,
  session_name text,
  scheduled_start_time timestamp with time zone,
  scheduled_end_time timestamp with time zone,
  duration_minutes integer,
  student_name text,
  roll_number text,
  has_filled_details boolean,
  session_status text,
  can_start boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ses.student_session_id,
    ts.temp_student_id,
    les.live_session_id,
    ses.status::text,
    les.session_name::text,
    les.scheduled_start_time,
    les.scheduled_end_time,
    les.duration_minutes,
    ts.student_name::text,
    ts.roll_number::text,
    (ts.student_name IS NOT NULL AND ts.student_name <> '' AND ts.roll_number IS NOT NULL AND ts.roll_number <> '')::boolean AS has_filled_details,
    les.status::text AS session_status,
    (les.status = 'live')::boolean AS can_start
  FROM public.live_exam_sessions les
  JOIN public.temp_students ts ON ts.admin_test_id = les.admin_test_id
  LEFT JOIN public.student_exam_sessions ses ON ses.temp_student_id = ts.temp_student_id AND ses.live_session_id = les.live_session_id
  WHERE les.session_code = input_session_code
    AND ts.username = input_username;
END;
$$;`)

const copiedSql = ref(false)
const copySqlToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(sqlFixSnippet.value)
    copiedSql.value = true
    setTimeout(() => {
      copiedSql.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to copy text', err)
  }
}

const needsDetails = ref(false)
const needsVerification = ref(false)
const verificationRollNumber = ref('')

const loginForm = ref({
  sessionCode: route.params.sessionCode || '',
  username: ''
})

const detailsForm = ref({
  fullName: '',
  rollNumber: ''
})

const handleLogin = async () => {
  errorMsg.value = ''
  isSqlAmbiguityError.value = false
  loading.value = true
  
  try {
    const res = await examStore.loginToExam(
      loginForm.value.sessionCode.trim().toUpperCase(), 
      loginForm.value.username.trim()
    )
    
    if (!res.success) {
      errorMsg.value = res.error || 'Invalid session code or credentials.'
      if (res.error && (res.error.includes('temp_student_id') || res.error.toLowerCase().includes('ambiguous'))) {
        isSqlAmbiguityError.value = true
      }
      loading.value = false
      return
    }
    
    // Check if details are needed (first-time login)
    if (!examStore.sessionDetails.hasFilledDetails) {
      needsDetails.value = true
      loading.value = false
      return
    }

    // Check if student credential is already claimed by checking current sessionStorage.
    // If logging in from a different device/session, enforce Roll Number verification to block hijacks.
    const savedUser = sessionStorage.getItem('student_username')
    if (savedUser !== loginForm.value.username.trim()) {
      needsVerification.value = true
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

const submitVerification = () => {
  errorMsg.value = ''
  const expectedRoll = examStore.sessionDetails.rollNumber
  if (!expectedRoll || verificationRollNumber.value.trim().toUpperCase() === expectedRoll.trim().toUpperCase()) {
    // Valid verification! Persist in sessionStorage to claim this tab session.
    sessionStorage.setItem('student_username', loginForm.value.username.trim())
    needsVerification.value = false
    verificationRollNumber.value = ''
    redirectBasedOnStatus()
  } else {
    errorMsg.value = 'Username already taken and active in the lobby/exam. Enter your correct username as assigned by your teacher!'
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
  else {
    // in_progress / not_started / scheduled / lobby
    router.push(`/live-exam/${code}/lobby`)
  }
}

// Auto focus UX
const isMobile = ref(false)

onMounted(() => {
  // Mobile detection — block phone/tablet users at the login gate
  const ua = navigator.userAgent || ''
  const touchDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  isMobile.value = window.innerWidth < 1024 || touchDevice
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 1024 || /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  })

  examStore.resetStore() // Clear any old sessions
  if (route.params.sessionCode && document.querySelector('input[type="text"]:nth-of-type(2)')) {
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
