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

    <!-- Normal exam view -->
    <div v-else>
      <!-- Header Bar -->
      <HeaderBar />
      
      <!-- Main Content Area -->
      <div class="flex h-[calc(100vh-80px)]">
        <!-- Question Area (Left) -->
        <div class="flex-1 p-6 overflow-y-auto">
          <QuestionArea />
        </div>
        
        <!-- Question Palette (Right) -->
        <div class="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <QuestionPalette />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'

import HeaderBar from './HeaderBar.vue'
import QuestionArea from './QuestionArea.vue'
import QuestionPalette from './QuestionPalette.vue'

const examStore = useExamStore()
const auth = useAuthStore()

onMounted(async () => {
  // 🔐 Ensure user is authenticated before loading exam
  if (!auth.isAuthenticated) return

  // 🛑 Prevent exam from reloading if already initialized AND not submitted
  if (examStore.questions.length > 0 && !examStore.isSubmitted) return

  // 🔑 Initialize or resume exam session (prevents timer reset exploit)
  const sessionId = await examStore.initializeSession()
  
  // If session is null (expired/submitted), don't load exam
  if (!sessionId) {
    console.log('⚠️ Session expired or submitted, not loading exam')
    return
  }

  // 🚀 Load exam data once
  await examStore.fetchExamData()

  // 🕒 Start global exam timer
  examStore.startTimer()
})
</script>
