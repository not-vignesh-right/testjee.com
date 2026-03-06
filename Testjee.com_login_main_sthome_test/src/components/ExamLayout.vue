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
      <!-- Fullscreen warning overlay -->
      <div v-if="showFullscreenWarning" class="fixed inset-0 z-[100] bg-gray-900/95 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fadeIn">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Full Screen Required</h2>
          <p class="text-gray-600 mb-8">You have exited full-screen mode. To maintain exam integrity, you must return to full-screen mode immediately.</p>
          <button 
            @click="enforceFullScreen" 
            class="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            Return to Exam
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
const showFullscreenWarning = ref(false)

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
    showFullscreenWarning.value = false
    examStore.isFullScreen = true
  } catch (err) {
    console.warn("Fullscreen request failed. Proceeding anyway.", err)
    showFullscreenWarning.value = false // Don't block if browser prevents it
  }
}

// --- Security & Enforcement ---

const handleFullscreenChange = () => {
  if (!document.fullscreenElement && !examStore.isSubmitted && !showInstructions.value) {
    // Student exited full screen mid-exam
    showFullscreenWarning.value = true
    examStore.isFullScreen = false
  } else if (document.fullscreenElement) {
    showFullscreenWarning.value = false
    examStore.isFullScreen = true
  }
}

const handleBeforeUnload = (e) => {
  if (!examStore.isSubmitted && !showInstructions.value) {
    e.preventDefault()
    e.returnValue = '' // Shows browser default warning
    
    // Emergency submit attempt
    // In many browsers, async fetch fails here. navigator.sendBeacon is better, 
    // but we'll try the emergency submit in the store.
    if (examStore.emergencySubmit) {
      examStore.emergencySubmit()
    } else {
      examStore.submitExam() // Best effort
    }
  }
}

const handleVisibilityChange = () => {
  // If tab becomes hidden (switched away), we could auto-submit here, 
  // but just warning/submitting on actual leave is safer.
  if (document.hidden && !examStore.isSubmitted && !showInstructions.value) {
    // You could trigger an auto-submit here: 
    // examStore.submitExam()
    // router.push('/sthome')
    console.warn("Tab hidden - potentially cheating")
  }
}

function setupSecurityListeners() {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
}

function removeSecurityListeners() {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
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
}
</style>
