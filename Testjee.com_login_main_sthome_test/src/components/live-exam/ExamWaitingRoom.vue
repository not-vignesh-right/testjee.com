<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
    
    <!-- Background Design -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
       <div class="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 mix-blend-multiply filter blur-3xl opacity-50"></div>
       <div class="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100 mix-blend-multiply filter blur-3xl opacity-50"></div>
    </div>

    <!-- Mobile Block Overlay -->
    <div v-if="isMobile" class="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-8 text-center">
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
      <div class="mt-8 px-5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
        📵 Mobile &amp; Tablet access is not permitted
      </div>
    </div>

    <!-- Main Card -->
    <div v-if="store.sessionDetails" class="max-w-3xl w-full bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden z-10 border border-gray-100">
       
       <!-- Header Status Strip -->
       <div class="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
         <div class="flex items-center gap-3">
            <svg class="w-6 h-6 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span class="font-semibold tracking-wide uppercase text-sm">Exam Waiting Room</span>
         </div>
         <span class="font-mono bg-blue-700/50 px-3 py-1 rounded text-sm text-blue-100 border border-blue-500">CODE: {{ route.params.sessionCode }}</span>
       </div>

       <!-- Body -->
       <div class="p-8 md:p-12">
          
          <div class="text-center mb-10">
             <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{{ store.sessionDetails.sessionName }}</h1>
             <p class="text-lg text-gray-600 font-medium">
               Welcome, <span class="text-blue-600 font-bold border-b-2 border-blue-200">{{ store.sessionDetails.studentName }}</span> ({{ store.sessionDetails.rollNumber }})
             </p>
          </div>

          <!-- Countdown Widget / Status -->
          <div class="max-w-md mx-auto bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center mb-10 relative overflow-hidden">
             
             <!-- Scheduled / Counting Down -->
             <div v-if="!canStartExam" class="animate-fade-in relative z-10">
                <span class="block text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">Starting In</span>
                <div class="text-4xl md:text-5xl font-mono font-black text-gray-900 tabular-nums">
                   {{ startCountdownDisplay }}
                </div>
                <div class="mt-4 text-sm text-gray-500 font-medium">
                   Scheduled Start: <strong class="text-gray-900">{{ formatTimeOnly(store.sessionDetails.scheduledStartTime) }}</strong>
                </div>
             </div>

             <!-- Live! Start Button Area -->
             <div v-else class="animate-fade-in relative z-10 py-2">
                <div class="mb-6">
                   <span class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                   </span>
                   <h3 class="text-xl font-bold text-gray-900">Exam is now LIVE</h3>
                   <p class="text-gray-500 text-sm mt-1">Instructor has authorized the session start.</p>
                </div>

                <button 
                  @click="beginExam"
                  :disabled="loadingStart"
                  class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-green-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg relative overflow-hidden group"
                >
                  <span class="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
                  <template v-if="!loadingStart">
                    Start Exam Now
                    <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </template>
                  <template v-else>
                     <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Loading Questions...
                  </template>
                </button>
             </div>
             
             <!-- Decorative bg for widget -->
             <div v-show="canStartExam" class="absolute inset-0 bg-gradient-to-t from-green-50 to-transparent pointer-events-none opacity-50 z-0"></div>
          </div>

          <!-- Instructions Panel -->
          <div class="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
             <h4 class="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Important Instructions
             </h4>
             <ul class="text-sm text-blue-800/80 space-y-3 font-medium">
               <li class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 -mx-1">
                  <span class="text-red-500 mt-0.5 shrink-0">🖥️</span>
                  <span class="text-red-700 font-semibold">This exam must be attended on a <strong>laptop or desktop only</strong>. Mobile phones and tablets are not permitted.</span>
               </li>
               <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0 block"></span>
                  Duration: {{ store.sessionDetails.durationMinutes }} minutes. The timer will begin exactly when you click 'Start Exam'.
               </li>
               <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0 block"></span>
                  The exam will automatically submit when the allotted time runs out.
               </li>
               <li class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0 block"></span>
                  If your browser crashes or you get disconnected, simply log back in immediately. Your progress is auto-saved.
               </li>
             </ul>
          </div>

       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamSessionStore } from '../../stores/examSessionStore'
import { supabase } from '../../lib/supabase'

const router = useRouter()
const route = useRoute()
const store = useExamSessionStore()

const loadingStart = ref(false)
const pollInterval = ref(null)
const countdownInterval = ref(null)
const startCountdownDisplay = ref('00:00:00')

// Detect mobile/tablet devices — block from starting exam
const isMobile = ref(false)
const checkDevice = () => {
  const w = window.innerWidth
  const ua = navigator.userAgent || ''
  const touchDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  // Block if screen width < 1024px OR is a known touch/mobile user-agent
  isMobile.value = w < 1024 || touchDevice
}
window.addEventListener('resize', checkDevice)
checkDevice()

const canStartExam = computed(() => store.sessionDetails?.sessionStatus === 'live' || store.sessionDetails?.canStart)

onMounted(() => {
  if (!store.studentSessionId) {
    router.push(`/live-exam/${route.params.sessionCode}`)
    return
  }
  
  // Guard logic against already active tests
  if (store.examStatus === 'in_progress') {
    router.push(`/live-exam/${route.params.sessionCode}/active`)
    return
  }

  startCountdownTimers()
  startStatusPolling()
})

onUnmounted(() => {
  if (pollInterval.value) clearInterval(pollInterval.value)
  if (countdownInterval.value) clearInterval(countdownInterval.value)
  window.removeEventListener('resize', checkDevice)
})

const startStatusPolling = () => {
  pollInterval.value = setInterval(async () => {
     if (canStartExam.value) {
       clearInterval(pollInterval.value) // stop polling once live
       return
     }
     
     // Soft check DB status to see if admin forced live
     const { data } = await supabase.rpc('student_exam_login', {
       input_session_code: route.params.sessionCode,
       input_username: '', // Empty means skip core auth, just returning pure session meta
       input_password: ''
     }).select('status, session_status, can_start')
     // NOTE: Because student_exam_login strictly requires UN & PW for auth,
     // we'll actually query the public live_exam_sessions table directly 
     // securely if possible, OR we just re-run the login function silently utilizing stored creds
  }, 10000)
}

// Override poll logic: Better to just re-trigger store validation if we had password,
// For this waiting room, we check table directly assuming RLS allows read of status by session code
const checkStatusSafely = async () => {
  try {
    const { data } = await supabase
      .from('live_exam_sessions')
      .select('status')
      .eq('session_code', route.params.sessionCode)
      .single()
      
    if (data && data.status === 'live') {
      store.sessionDetails.sessionStatus = 'live'
      store.sessionDetails.canStart = true
    }
  } catch(e) {}
}

pollInterval.value = setInterval(checkStatusSafely, 5000)

const startCountdownTimers = () => {
  countdownInterval.value = setInterval(() => {
    if (canStartExam.value) return
    
    const start = new Date(store.sessionDetails?.scheduledStartTime).getTime()
    const now = Date.now()
    const diff = Math.floor((start - now) / 1000)
    
    if (diff <= 0) {
      // Time arrived! Check status strictly
      checkStatusSafely()
      startCountdownDisplay.value = '00:00:00'
    } else {
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      startCountdownDisplay.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
  }, 1000)
}

const beginExam = async () => {
  loadingStart.value = true
  try {
    // Attempt store API call to start
    const res = await store.startExam()
    if (!res.success) throw new Error(res.error)
    
    router.push(`/live-exam/${route.params.sessionCode}/active`)
    
  } catch(err) {
    console.error('Failed to begin', err)
    alert(err.message || 'Failed to start exam. Server might still be preparing.')
    loadingStart.value = false
  }
}

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('en-US', { 
    hour: 'numeric', minute: '2-digit'
  }).format(new Date(dateStr))
}
</script>
