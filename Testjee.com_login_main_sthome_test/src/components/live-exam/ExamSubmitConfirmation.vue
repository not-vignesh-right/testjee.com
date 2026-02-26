<template>
  <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
        <div class="bg-orange-100 text-orange-600 p-2 rounded-full">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-orange-800">Submit Exam?</h3>
      </div>

      <!-- Modal Body (Summary) -->
      <div class="p-6 space-y-4">
        
        <p class="text-sm text-gray-600 mb-6 font-medium">
          Are you sure you want to submit? You cannot change your answers after submission.
        </p>

        <div class="grid grid-cols-2 gap-4">
          <!-- Answered Stat -->
          <div class="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Answered</div>
              <div class="text-2xl font-black text-green-800">{{ store.answeredCount }}</div>
            </div>
            <div class="bg-green-200 text-green-700 w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>

          <!-- Unanswered Stat -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1">Not Visited</div>
              <div class="text-2xl font-black text-gray-800">{{ store.totalQuestions - store.answeredCount }}</div>
            </div>
            <div class="bg-gray-200 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path></svg>
            </div>
          </div>
        </div>

        <!-- Marked For Review Alert -->
        <div v-if="store.markedForReview.size > 0" class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
          <svg class="w-5 h-5 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
          <div class="text-sm text-yellow-800 font-medium">You have <strong>{{ store.markedForReview.size }}</strong> questions marked for review. They will be submitted as-is.</div>
        </div>

        <!-- Time Warning -->
        <div class="flex items-center gap-2 mt-4 text-sm text-gray-500 justify-center">
           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           You still have <strong class="text-gray-900">{{ store.formattedTimeRemaining }}</strong> remaining.
        </div>

      </div>

      <!-- Actions Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
        <button 
          @click="$emit('cancel')"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50"
        >
          Go Back
        </button>
        <button 
          @click="confirmSubmit"
          :disabled="loading"
          class="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 flex justify-center items-center gap-2 relative overflow-hidden"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-else>Confirm Submit</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamSessionStore } from '../../stores/examSessionStore'

const emit = defineEmits(['cancel', 'submitted'])
const router = useRouter()
const route = useRoute()
const store = useExamSessionStore()

const loading = ref(false)

const confirmSubmit = async () => {
  loading.value = true
  try {
    const res = await store.submitExam(false)
    if (!res.success) throw new Error(res.error)
    
    emit('submitted') // Tell parent so it can clean up
    router.push(`/live-exam/${route.params.sessionCode}/results`)
    
  } catch (err) {
    console.error('Submit Failed', err)
    alert('Submission failed: ' + err.message)
    loading.value = false
  }
}
</script>
