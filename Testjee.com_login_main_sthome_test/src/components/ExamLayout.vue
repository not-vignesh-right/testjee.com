<template>
  <div class="min-h-screen bg-gta-light">
    <!-- Submission Reason Modal / Appeal System (Prioritized to avoid unmounting when submitted) -->
    <div v-if="autoSubmitReason" class="fixed inset-0 z-[100] bg-gray-900/95 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100 animate-fadeIn">
        
        <!-- Standard Auto-Submit Message -->
        <template v-if="!showAppealForm">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Exam Auto-Submitted</h2>
          <p class="text-gray-600 mb-4">Your exam has been automatically submitted because you <strong class="text-red-600">{{ autoSubmitReason }}</strong>.</p>
          <p class="text-sm text-gray-500 mb-8 border-t pt-4">As per the instructions, exiting full-screen mode or switching tabs is strictly prohibited.</p>
          
          <div class="flex flex-col gap-3">
            <!-- If already resumed once, no more appeals -->
            <template v-if="isResumedSession">
              <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left mb-2">
                <p class="text-sm font-bold text-amber-800 mb-1">⚠️ Resume Limit Reached</p>
                <p class="text-xs text-amber-700 leading-relaxed">You have already used your one allowed resume for this session. The exam has been submitted with your current progress. No further resumptions are permitted.</p>
              </div>
            </template>
            <template v-else>
              <button 
                @click="showAppealForm = true" 
                class="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              >
                🙋‍♂️ Need Help / Request Resume
              </button>
            </template>
            <button 
              @click="forceExitToDashboard" 
              class="w-full py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold border border-gray-200 transition-all active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        </template>

        <!-- Appeal / Support Form -->
        <template v-else-if="showAppealForm && appealStatus === 'idle'">
          <div class="text-left">
            <h3 class="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              🙋‍♂️ Support & Resume Request
            </h3>
            <p class="text-xs text-gray-500 mb-6">If this auto-submit was accidental, request Gyan Edge admins to reopen your session.</p>
            
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Select Reason</label>
                <select v-model="appealReason" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all cursor-pointer font-medium text-gray-800 text-sm">
                  <option value="My computer went to sleep/locked screen">💻 My computer went to sleep / locked screen</option>
                  <option value="I had a power failure / network drop">🔌 I had a power failure / network drop</option>
                  <option value="I exited fullscreen / switched tabs accidentally">⚠️ I exited fullscreen / switched tabs accidentally</option>
                  <option value="Other technical glitch">⚙️ Other technical glitch</option>
                </select>
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Additional details (optional)</label>
                <textarea 
                  v-model="appealCustomMessage"
                  rows="3" 
                  placeholder="Briefly describe what happened..."
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
                ></textarea>
              </div>
            </div>

            <div v-if="appealError" class="mb-4 p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-medium">
              {{ appealError }}
            </div>

            <div class="flex gap-3">
              <button 
                @click="showAppealForm = false" 
                class="flex-1 py-3 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                @click="submitAppeal" 
                class="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-200/50"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </template>

        <!-- Submitting appeal state -->
        <template v-else-if="appealStatus === 'submitting'">
          <div class="py-12 flex flex-col items-center justify-center">
            <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm font-bold text-gray-700">Submitting your request...</p>
          </div>
        </template>

        <!-- Pending admin approval -->
        <template v-else-if="appealStatus === 'pending'">
          <div class="py-4 text-center">
            <div class="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100 animate-pulse">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Waiting for Admin Approval</h3>
            <p class="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
              Your appeal for the session resume has been sent. Gyan Edge admins will review your request shortly. 
            </p>
            
            <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left mb-6 space-y-2">
              <div class="flex justify-between text-xs text-gray-500"><span class="font-medium">Reason:</span> <span class="font-bold text-gray-800">{{ appealReason }}</span></div>
              <div class="flex justify-between text-xs text-gray-500"><span class="font-medium">Time Submitted:</span> <span class="font-bold text-gray-800">Just now</span></div>
              <div class="flex justify-between text-xs text-gray-500"><span class="font-medium">Status:</span> <span class="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider text-[9px]">Pending</span></div>
            </div>

            <div class="flex flex-col gap-2">
              <button 
                @click="forceExitToDashboard" 
                class="w-full py-3 px-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold border border-gray-200 transition-all active:scale-95"
              >
                Close & Go to Dashboard
              </button>
              <p class="text-[10px] text-gray-400 mt-2">You can close this. You'll also be able to check approval status and resume directly from the Dashboard.</p>
            </div>
          </div>
        </template>

        <!-- Approved resumed session -->
        <template v-else-if="appealStatus === 'approved'">
          <div class="py-4 text-center animate-fadeIn">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-green-100">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Resume Request Approved!</h3>
            <p class="text-sm text-gray-500 mb-8">Click the button below to return to your exam with your saved progress and remaining time.</p>
            
            <button 
              @click="resumeTest" 
              class="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              🚀 Resume Test Now
            </button>
          </div>
        </template>

        <!-- Rejected request -->
        <template v-else-if="appealStatus === 'rejected'">
          <div class="py-4 text-center animate-fadeIn">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-red-100">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Resume Request Denied</h3>
            <p class="text-sm text-gray-500 mb-8">Unfortunately, the administrators did not approve your resume request.</p>
            
            <button 
              @click="forceExitToDashboard" 
              class="w-full py-3.5 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </template>

      </div>
    </div>

    <!-- Show message if exam is submitted/expired naturally -->
    <div v-else-if="examStore.isSubmitted" class="min-h-screen flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div class="text-6xl mb-4">⏰</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Exam Time Expired</h2>
        <p class="text-gray-600 mb-6">
          Your exam session has ended. Your answers have been automatically submitted.
        </p>
        <button 
          @click="$router.push('/sthome')"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Results
        </button>
      </div>
    </div>

    <!-- Instruction Screen (Shown initially) -->
    <ExamInstructions 
      v-else-if="showInstructions" 
      @start="beginExamFullScreen" 
    />

    <!-- Page-Reload Resume Overlay: requires user gesture to re-enter fullscreen -->
    <div v-else-if="showResumeOverlay" class="fixed inset-0 z-[100] bg-gray-900/95 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100" style="animation: fadeIn 0.4s ease-out">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-3">Exam In Progress</h2>
        <p class="text-gray-600 mb-2">Your exam session is still active with <strong class="text-blue-600">{{ examStore.formatTime(examStore.remainingTime) }}</strong> remaining.</p>
        <p class="text-sm text-gray-500 mb-8">Click the button below to return to your exam in full-screen mode.</p>
        <button
          @click="resumeFromOverlay"
          :disabled="examStore.isLoadingQuestions"
          class="w-full py-3.5 px-6 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
          :class="examStore.isLoadingQuestions ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-[1.02] active:scale-95'"
        >
          <svg v-if="examStore.isLoadingQuestions" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ examStore.isLoadingQuestions ? 'Restoring exam...' : '▶ Continue Exam in Full Screen' }}
        </button>
      </div>
    </div>

    <!-- Normal exam view -->
    <div v-else class="exam-container">
      <!-- Grace Period Warning Overlay -->
      <div v-if="showGraceWarning" class="fixed inset-0 z-[110] bg-gray-900/90 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-amber-200" style="animation: fadeIn 0.3s ease-out">
          <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-amber-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-3">Security Warning: Focus Lost!</h2>
          <p class="text-gray-600 text-sm mb-6 leading-relaxed">
            <template v-if="graceReason === 'fullscreen'">
              You have exited full-screen mode. Please click the button below to return to full-screen.
            </template>
            <template v-else-if="graceReason === 'visibility'">
              You switched tabs or minimized the window. Please return to the exam immediately.
            </template>
            <template v-else>
              You clicked outside the exam window or opened another app. Please click back inside.
            </template>
          </p>
          <div class="bg-amber-50 rounded-xl py-3 px-4 mb-6 border border-amber-100 flex items-center justify-between">
            <span class="text-xs text-amber-800 font-semibold uppercase tracking-wider">Auto-Submitting In</span>
            <span class="text-2xl font-mono font-bold text-amber-700 animate-pulse">{{ graceSecondsLeft }}s</span>
          </div>
          <button 
            v-if="graceReason === 'fullscreen'"
            @click="enforceFullScreen" 
            class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            Return to Full Screen
          </button>
          <p v-else class="text-xs text-gray-400">Click anywhere inside this window to resume the exam.</p>
        </div>
      </div>

      <!-- Header Bar -->
      <HeaderBar />
      
      <!-- Main Content Area -->
      <div class="flex h-[calc(100vh-80px)]">
        <!-- Question Area (Left) -->
        <div class="flex-1 p-6 overflow-y-auto bg-[#F0F7FF]">
          <QuestionArea />
        </div>
        
        <!-- Question Palette (Right) -->
        <div class="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
          <QuestionPalette />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

import HeaderBar from './HeaderBar.vue'
import QuestionArea from './QuestionArea.vue'
import QuestionPalette from './QuestionPalette.vue'
import ExamInstructions from './ExamInstructions.vue'

const examStore = useExamStore()
const auth = useAuthStore()
const router = useRouter()

const showInstructions = ref(true)
const autoSubmitReason = ref('')

// --- Appeal / Support State Variables ---
const showAppealForm = ref(false)
const appealSubmitted = ref(false)
const appealStatus = ref('idle') // 'idle' | 'submitting' | 'pending' | 'approved' | 'rejected'
const appealReason = ref('My computer went to sleep/locked screen')
const appealCustomMessage = ref('')
const appealError = ref('')
const activeRequest = ref(null)
let statusPollInterval = null

// Track if this is a RESUMED session (already used one resume chance)
// If true: student forfeits the right to appeal again on another exit
const isResumedSession = ref(false)

const showGraceWarning = ref(false)
const graceSecondsLeft = ref(10)
const graceReason = ref('') // 'blur' | 'fullscreen' | 'visibility'
let graceTimer = null
let wakeLock = null
// BUG 8 FIX: Flag to suppress grace period while re-entering fullscreen programmatically on resume
const isEnteringFullscreenOnResume = ref(false)
// Flag to suppress proctoring while the page-reload resume overlay is shown
const showResumeOverlay = ref(false)

// --- Screen Wake Lock API ---
const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen')
      console.log('Screen Wake Lock acquired successfully')
    }
  } catch (err) {
    console.warn('Failed to acquire Screen Wake Lock:', err)
  }
}

const releaseWakeLock = async () => {
  try {
    if (wakeLock) {
      await wakeLock.release()
      wakeLock = null
      console.log('Screen Wake Lock released successfully')
    }
  } catch (err) {
    console.warn('Failed to release Screen Wake Lock:', err)
  }
}

// --- Grace Period Manager ---
const startGracePeriod = (reason) => {
  if (graceTimer) {
    return
  }

  graceReason.value = reason
  showGraceWarning.value = true
  graceSecondsLeft.value = 10

  graceTimer = setInterval(async () => {
    if (graceSecondsLeft.value > 1) {
      graceSecondsLeft.value--
    } else {
      clearInterval(graceTimer)
      graceTimer = null
      showGraceWarning.value = false

      // Log auto-submit reason
      if (graceReason.value === 'blur') {
        autoSubmitReason.value = 'clicked outside the exam window for too long'
      } else if (graceReason.value === 'fullscreen') {
        autoSubmitReason.value = 'stayed out of full-screen mode for too long'
      }

      await releaseWakeLock()

      if (examStore.emergencySubmit) {
        examStore.emergencySubmit()
      }
      await examStore.submitExam()
    }
  }, 1000)
}

const clearGracePeriod = () => {
  if (graceReason.value === 'fullscreen' && !document.fullscreenElement) {
    return
  }
  if (graceTimer) {
    clearInterval(graceTimer)
    graceTimer = null
  }
  showGraceWarning.value = false
  graceReason.value = ''
}

// Exam initialization
onMounted(async () => {
  // 🔐 Ensure user is authenticated before loading exam
  if (!auth.isAuthenticated) return

  // Setup security listeners immediately to prevent early fullscreen exit or tab switch bypass
  setupSecurityListeners()

  // BUG 2 FIX: If we just restored a session (isResuming = true),
  // skip initializeSession + fetchExamData entirely — state is already loaded
  if (examStore.isResuming) {
    console.log('🔄 Resuming restored session — skipping initializeSession & fetchExamData')
    showInstructions.value = false
    isResumedSession.value = true
    // Use overlay so the fullscreen request has a proper user gesture
    showResumeOverlay.value = true
    examStore.startTimer()
    return
  }

  // 🛑 Prevent exam from reloading if already initialized AND not submitted
  if (examStore.questions.length > 0 && !examStore.isSubmitted) {
    showInstructions.value = false // Skip instructions if resuming
  }

  // 🔑 Check if there is an active session to resume
  const sessionId = await examStore.initializeSession()
  
  if (sessionId) {
    // Active session found (page reload / resumption): DON'T programmatically enforce fullscreen
    // because the browser blocks it without a user gesture, which triggers blur/visibility events
    // and causes instant auto-submit. Instead, show the resume overlay requiring a user click.
    showInstructions.value = false
    showResumeOverlay.value = true

    // Check if a support request already exists for this session to enforce resume request limit
    try {
      const { data: existingApp } = await supabase
        .from('exam_support_requests')
        .select('request_id')
        .eq('session_id', sessionId)
        .maybeSingle()
      if (existingApp) {
        isResumedSession.value = true
      }
    } catch (err) {
      console.warn('Error checking existing support request:', err)
    }

    // Start the timer while overlay is shown — time must keep ticking honestly
    examStore.startTimer()

    // If questions weren't in localStorage (e.g. after a crash/clear), fetch them now.
    // The overlay acts as a loading screen — the Continue button is disabled until ready.
    if (examStore.questions.length === 0) {
      examStore.fetchExamData()
    }
  } else {
    // Fresh exam start: fetch questions in the background so they are ready when student clicks start
    await examStore.fetchExamData()
  }
})

onUnmounted(async () => {
  removeSecurityListeners()
  if (graceTimer) {
    clearInterval(graceTimer)
  }
  if (statusPollInterval) {
    clearInterval(statusPollInterval)
  }
  await releaseWakeLock()
})

// --- Appeal / Resumption Actions ---
const submitAppeal = async () => {
  appealStatus.value = 'submitting'
  appealError.value = ''
  
  // Use remaining time tracked in the store
  const remainingSeconds = examStore.remainingTime
  
  const res = await examStore.submitSupportRequest(
    appealReason.value,
    appealCustomMessage.value,
    remainingSeconds
  )
  
  if (res.success) {
    if (res.alreadyExists) {
      // A request already exists for this session (duplicate click or race condition)
      // Fetch it and start polling its status
      try {
        const { data: existing } = await supabase
          .from('exam_support_requests')
          .select('*')
          .eq('session_id', examStore.sessionId)
          .maybeSingle()
        if (existing) {
          activeRequest.value = existing
          appealStatus.value = existing.status // 'pending', 'approved', or 'rejected'
          if (existing.status === 'pending') {
            startPollingRequestStatus()
          }
        } else {
          appealStatus.value = 'idle'
          appealError.value = 'Could not find your request. Please try again.'
        }
      } catch {
        appealStatus.value = 'idle'
        appealError.value = 'Could not find your request. Please try again.'
      }
    } else {
      appealStatus.value = 'pending'
      appealSubmitted.value = true
      activeRequest.value = res.data[0]
      // Start polling status
      startPollingRequestStatus()
    }
  } else {
    appealStatus.value = 'idle'
    appealError.value = res.error || 'Failed to submit appeal. Please try again.'
  }
}

const startPollingRequestStatus = () => {
  if (statusPollInterval) clearInterval(statusPollInterval)
  
  statusPollInterval = setInterval(async () => {
    if (!activeRequest.value) return
    
    try {
      const { data, error } = await supabase
        .from('exam_support_requests')
        .select('*')
        .eq('request_id', activeRequest.value.request_id)
        .single()
      
      if (error) throw error
      
      if (data) {
        activeRequest.value = data
        appealStatus.value = data.status
        
        if (data.status === 'approved') {
          clearInterval(statusPollInterval)
          statusPollInterval = null
        } else if (data.status === 'rejected') {
          clearInterval(statusPollInterval)
          statusPollInterval = null
        }
      }
    } catch (err) {
      console.error('Error polling request status:', err)
    }
  }, 5000)
}

const resumeTest = async () => {
  if (statusPollInterval) {
    clearInterval(statusPollInterval)
    statusPollInterval = null
  }
  
  if (!activeRequest.value) return
  
  const res = await examStore.restoreResumedSession(activeRequest.value)
  if (res.success) {
    // Mark: this is now a resumed session — no more appeals if they exit again
    isResumedSession.value = true

    // BUG 8 FIX: Temporarily suppress fullscreen-change grace period
    // while we are programmatically re-entering fullscreen after resume
    isEnteringFullscreenOnResume.value = true
    
    // Re-enter full screen
    await enforceFullScreen()
    
    // Short delay to let the fullscreenchange event fire and settle
    // before re-enabling the grace period listener
    setTimeout(() => { isEnteringFullscreenOnResume.value = false }, 1500)
    
    // Restart timer (remainingTime already set by restoreResumedSession)
    examStore.startTimer()
    
    // Clear overlay state
    autoSubmitReason.value = ''
    showAppealForm.value = false
    appealSubmitted.value = false
    appealStatus.value = 'idle'
    activeRequest.value = null
  } else {
    alert(res.error || 'Failed to resume session. Please try refreshing.')
  }
}

// --- Page-Reload Resume Handler ---
async function resumeFromOverlay() {
  showResumeOverlay.value = false
  // Now we have a user gesture — safe to request fullscreen
  isEnteringFullscreenOnResume.value = true
  await enforceFullScreen()
  setTimeout(() => { isEnteringFullscreenOnResume.value = false }, 1500)
  await requestWakeLock()
}

// --- Exam Flow Mechanics ---

async function beginExamFullScreen() {
  // CRITICAL: Disable instructions screen FIRST so proctoring handlers (fullscreen/tab)
  // are active immediately. If the student exits fullscreen during the async DB call below,
  // the grace period will trigger correctly instead of being silently ignored.
  showInstructions.value = false

  // If no session exists yet, create it now! (Fresh start after accepting instructions)
  if (!examStore.sessionId) {
    const sessionId = await examStore.createNewSession()
    if (!sessionId) {
      // Roll back — show instructions again so student can retry
      showInstructions.value = true
      alert('Failed to initialize exam session. Please try again.')
      return
    }
  }

  // Try to go fullscreen
  await enforceFullScreen()
  
  // Start the timer
  examStore.startTimer()

  // Acquire wake lock to prevent sleep
  await requestWakeLock()
}

async function enforceFullScreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }
    examStore.isFullScreen = true
  } catch (err) {
    console.warn("Fullscreen request failed. Proceeding anyway.", err)
  }
}

function forceExitToDashboard() {
  autoSubmitReason.value = ''
  router.push('/sthome')
}

// --- Security & Enforcement ---

const handleFullscreenChange = async () => {
  // BUG 8 FIX: Don't trigger grace period while we are programmatically entering fullscreen on resume
  if (isEnteringFullscreenOnResume.value) return
  // Don't trigger during the page-reload resume overlay
  if (showResumeOverlay.value) return

  if (!document.fullscreenElement && !examStore.isSubmitted && !showInstructions.value && !autoSubmitReason.value && !examStore.isManuallySubmitting) {
    examStore.isFullScreen = false
    startGracePeriod('fullscreen')
  } else if (document.fullscreenElement) {
    examStore.isFullScreen = true
    clearGracePeriod()
  }
}

const handleBeforeUnload = (e) => {
  if (!examStore.isSubmitted && !showInstructions.value && !examStore.isManuallySubmitting) {
    // ONLY save state locally — do NOT submit to DB here.
    // Reason: Ctrl+R (page refresh) fires beforeunload and we want the session to survive.
    // Tab-close is caught by visibilitychange (fires before beforeunload) → instant auto-submit.
    // Address-bar navigation is caught by the blur grace period.
    if (examStore.emergencySubmit) {
      examStore.emergencySubmit()
    }
    e.preventDefault()
    e.returnValue = '' // Shows browser's native "Leave site?" dialog
  }
}

const handleVisibilityChange = async () => {
  if (document.hidden) {
    if (!examStore.isSubmitted && !showInstructions.value && !showResumeOverlay.value && !autoSubmitReason.value && !examStore.isManuallySubmitting) {
      console.warn("Tab hidden - instant auto-submit")
      
      // Clear any existing grace period (e.g. from blur)
      if (graceTimer) {
        clearInterval(graceTimer)
        graceTimer = null
      }
      showGraceWarning.value = false
      graceReason.value = ''

      autoSubmitReason.value = 'switched tabs or minimized the window'
      
      await releaseWakeLock()
      
      if (examStore.emergencySubmit) {
        examStore.emergencySubmit()
      }
      await examStore.submitExam()
    }
  } else {
    clearGracePeriod()
    if (!examStore.isSubmitted && !showInstructions.value) {
      await requestWakeLock()
    }
  }
}

const handleWindowBlur = async () => {
  if (!examStore.isSubmitted && !showInstructions.value && !showResumeOverlay.value && !autoSubmitReason.value && !examStore.isManuallySubmitting) {
    console.warn("Window blurred - starting blur grace period")
    startGracePeriod('blur')
  }
}

const handleWindowFocus = () => {
  console.log("Window focused - clearing grace period")
  clearGracePeriod()
}

const handleContextMenu = (e) => {
  if (!examStore.isSubmitted && !showInstructions.value) {
    e.preventDefault()
  }
}

const handleKeyDown = (e) => {
  if (examStore.isSubmitted || showInstructions.value) return

  // Prevent F12 (DevTools)
  if (e.key === 'F12') {
    e.preventDefault()
    return
  }

  // Prevent Ctrl/Cmd modifiers for specific actions
  if (e.ctrlKey || e.metaKey) {
    const key = e.key.toLowerCase()
    const blockList = [
      'c', // Copy
      'v', // Paste
      'x', // Cut
      'a', // Select All
      's', // Save
      'p', // Print
      'f', // Find
      'i', // DevTools (Ctrl+Shift+I)
      'j', // DevTools (Ctrl+Shift+J)
      'u', // View Source
    ]
    if (blockList.includes(key)) {
      e.preventDefault()
    }
  }

  // Prevent Alt toggling (Alt+Tab usually handled by OS but block alt key menus)
  if (e.altKey) {
    e.preventDefault()
  }
}

const handleDragSelect = (e) => {
  if (!examStore.isSubmitted && !showInstructions.value) {
    e.preventDefault()
  }
}

function setupSecurityListeners() {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('keydown', handleKeyDown)
  
  // Prevent dragging and copy/pasting
  document.addEventListener('dragstart', handleDragSelect)
  document.addEventListener('copy', handleDragSelect)
  document.addEventListener('cut', handleDragSelect)
  document.addEventListener('paste', handleDragSelect)
}

function removeSecurityListeners() {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('contextmenu', handleContextMenu)
  document.removeEventListener('keydown', handleKeyDown)
  
  document.removeEventListener('dragstart', handleDragSelect)
  document.removeEventListener('copy', handleDragSelect)
  document.removeEventListener('cut', handleDragSelect)
  document.removeEventListener('paste', handleDragSelect)
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

/* Ensure blur doesn't allow scrolling/interaction */
.exam-container {
  min-height: 100vh;
  position: relative;
  /* Prevent text selection in the entire exam container */
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

/* Allow text selection in the Submission Modal, but not the question body */
:deep(input[type="number"]) {
  -webkit-user-select: auto;
  user-select: auto;
}
</style>
