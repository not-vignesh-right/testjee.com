<template>
  <div class="min-h-screen bg-gta-light">
    <!-- Show message if exam is submitted/expired -->
    <div v-if="examStore.isSubmitted" class="min-h-screen flex items-center justify-center">
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

    <!-- Normal exam view -->
    <div v-else class="exam-container">
      <!-- Submission Reason Modal -->
      <div v-if="autoSubmitReason" class="fixed inset-0 z-[100] bg-gray-900/95 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fadeIn">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Exam Auto-Submitted</h2>
          <p class="text-gray-600 mb-4">Your exam has been automatically submitted because you <strong class="text-red-600">{{ autoSubmitReason }}</strong>.</p>
          <p class="text-sm text-gray-500 mb-8 border-t pt-4">As per the instructions, exiting full-screen mode or switching tabs is strictly prohibited.</p>
          <button 
            @click="forceExitToDashboard" 
            class="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Return to Dashboard
          </button>
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

import HeaderBar from './HeaderBar.vue'
import QuestionArea from './QuestionArea.vue'
import QuestionPalette from './QuestionPalette.vue'
import ExamInstructions from './ExamInstructions.vue'

const examStore = useExamStore()
const auth = useAuthStore()
const router = useRouter()

const showInstructions = ref(true)
const autoSubmitReason = ref('')

// Exam initialization
onMounted(async () => {
  // 🔐 Ensure user is authenticated before loading exam
  if (!auth.isAuthenticated) return

  // 🛑 Prevent exam from reloading if already initialized AND not submitted
  if (examStore.questions.length > 0 && !examStore.isSubmitted) {
    showInstructions.value = false // Skip instructions if resuming
  }

  // 🔑 Initialize or resume exam session (prevents timer reset exploit)
  const sessionId = await examStore.initializeSession()
  
  // If session is null (expired/submitted), don't load exam
  if (!sessionId) {
    console.log('⚠️ Session expired or submitted, not loading exam')
    return
  }

  // 🚀 Load exam data once
  await examStore.fetchExamData()

  if (!showInstructions.value) {
    // 🕒 Start global exam timer if resuming directly
    examStore.startTimer()
    enforceFullScreen()
  }

  // Setup security listeners
  setupSecurityListeners()
})

onUnmounted(() => {
  removeSecurityListeners()
})

// --- Exam Flow Mechanics ---

async function beginExamFullScreen() {
  showInstructions.value = false
  
  // Try to go fullscreen
  await enforceFullScreen()
  
  // Start the timer
  examStore.startTimer()
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
  if (!document.fullscreenElement && !examStore.isSubmitted && !showInstructions.value && !autoSubmitReason.value) {
    // Student exited full screen mid-exam - STRICT AUTO SUBMIT
    examStore.isFullScreen = false
    autoSubmitReason.value = 'exited full-screen mode'
    if (examStore.emergencySubmit) {
      examStore.emergencySubmit()
    }
    await examStore.submitExam()
  } else if (document.fullscreenElement) {
    examStore.isFullScreen = true
  }
}

const handleBeforeUnload = (e) => {
  if (!examStore.isSubmitted && !showInstructions.value) {
    e.preventDefault()
    e.returnValue = '' // Shows browser default warning
    
    // Emergency submit attempt
    if (examStore.emergencySubmit) {
      examStore.emergencySubmit()
    } else {
      examStore.submitExam() // Best effort
    }
  }
}

const handleVisibilityChange = async () => {
  if (document.hidden && !examStore.isSubmitted && !showInstructions.value && !autoSubmitReason.value) {
    // If tab becomes hidden (switched away) - STRICT AUTO SUBMIT
    console.warn("Tab hidden - STRICT AUTO SUBMIT")
    autoSubmitReason.value = 'switched tabs or minimized the window'
    if (examStore.emergencySubmit) {
      examStore.emergencySubmit()
    }
    await examStore.submitExam()
  }
}

const handleWindowBlur = async () => {
  if (!examStore.isSubmitted && !showInstructions.value && !autoSubmitReason.value && !examStore.isManuallySubmitting) {
    // If window loses focus (clicked outside window/tab) - STRICT AUTO SUBMIT
    console.warn("Window blurred - STRICT AUTO SUBMIT")
    autoSubmitReason.value = 'clicked outside the exam window or opened another application'
    if (examStore.emergencySubmit) {
      examStore.emergencySubmit()
    }
    await examStore.submitExam()
  }
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
