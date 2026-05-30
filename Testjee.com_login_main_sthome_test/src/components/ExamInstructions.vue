<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <div class="font-bold text-xl">TESTJEE</div>
      <div class="bg-white/20 px-4 py-1 rounded-full text-sm">Instructions</div>
    </header>

    <div class="max-w-4xl mx-auto p-6 md:p-8">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Please read the instructions carefully</h2>

      <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 h-[50vh] overflow-y-auto custom-scrollbar text-sm text-gray-700 space-y-4">
        <h3 class="font-bold text-lg text-gray-900 border-b pb-2">General Instructions:</h3>
        <ol class="list-decimal pl-5 space-y-2">
          <li>Total duration of examination is <strong>{{ durationText }}</strong>.</li>
          <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
          <li>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
            <ul class="mt-2 space-y-2 list-none pl-0">
              <li class="flex items-center gap-2">
                <div class="w-6 h-6 bg-gray-100 border border-gray-300 rounded text-center leading-6 text-xs text-transparent">1</div>
                <span>You have not visited the question yet.</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-6 h-6 bg-red-500 text-white rounded text-center leading-6 text-xs font-bold">2</div>
                <span>You have not answered the question.</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-6 h-6 bg-green-500 text-white rounded text-center leading-6 text-xs font-bold">3</div>
                <span>You have answered the question.</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-6 h-6 bg-purple-500 text-white rounded text-center leading-6 text-xs font-bold">4</div>
                <span>You have NOT answered the question, but have marked the question for review.</span>
              </li>
              <li class="flex items-center gap-2">
                <div class="w-6 h-6 bg-purple-500 border border-green-500 text-white rounded text-center leading-6 text-xs font-bold relative"><span class="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>5</div>
                <span>The question(s) "Answered and Marked for Review" will be considered for evaluation.</span>
              </li>
            </ul>
          </li>
          <li>You can click on the "&gt;" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "&lt;" which appears on the right side of question window.</li>
        </ol>

        <h3 class="font-bold text-lg text-gray-900 border-b pb-2 mt-6">Navigating to a Question:</h3>
        <ol class="list-decimal pl-5 space-y-2">
          <li>To answer a question, do the following:
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Click on the question number in the Question Palette to go to that question directly. Note that using this option does NOT save your answer to the current question.</li>
              <li>Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
              <li>Click on <strong>Mark for Review & Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
            </ul>
          </li>
        </ol>

        <h3 class="font-bold text-lg text-gray-900 border-b pb-2 mt-6">Answering a Question:</h3>
        <ol class="list-decimal pl-5 space-y-2">
          <li>Procedure for answering a multiple choice type question:
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>To select your answer, click on the button of one of the options.</li>
              <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button.</li>
              <li>To change your chosen answer, click on the button of another option.</li>
              <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
              <li>To mark the question for review, click on the <strong>Mark for Review & Next</strong> button.</li>
            </ul>
          </li>
          <li>Procedure for answering a numerical value type question:
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>To enter a number as your answer, use the provided input box.</li>
              <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
            </ul>
          </li>
        </ol>

        <div class="bg-blue-50 p-4 rounded-lg mt-6 border border-blue-100">
          <h4 class="font-bold text-blue-800 mb-2">Important Note on Full Screen:</h4>
          <p class="text-blue-700">The exam will be conducted in <strong>Full Screen mode</strong>. Please do not exit full screen or switch tabs. Navigating away from the exam page (closing the tab, returning to dashboard) will result in <strong>automatic submission</strong> of your test.</p>
        </div>
      </div>

      <!-- Consent Footer -->
      <div class="bg-white border-t border-gray-200 pt-6">
        <label class="flex items-start space-x-3 cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 mb-6">
          <div class="flex-shrink-0 mt-1">
            <input 
              type="checkbox" 
              v-model="hasReadInstructions"
              class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
          <div class="text-sm text-gray-700">
            <p>I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I agree that I will not carry any prohibited items into the exam. I understand that my exam is in full-screen and <strong>EXITING FULL SCREEN OR SWITCHING TABS WILL RESULT IN IMMEDIATE AUTOMATIC SUBMISSION</strong>.</p>
          </div>
        </label>

        <div class="flex justify-between items-center">
          <button 
            @click="$router.push('/sthome/dashboard')"
            :disabled="isDecrementing"
            class="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <div class="flex flex-col items-end gap-2">
            <p v-if="decrementError" class="text-xs text-red-600 font-medium">⚠️ {{ decrementError }}</p>
            <button 
              @click="startExam"
              :disabled="!hasReadInstructions || isDecrementing"
              class="px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center gap-2"
              :class="hasReadInstructions && !isDecrementing
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer transform hover:scale-[1.02]' 
                : 'bg-gray-400 cursor-not-allowed opacity-70'"
            >
              <svg v-if="isDecrementing" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isDecrementing ? 'Starting...' : 'I am ready to begin' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const examStore = useExamStore()
const authStore = useAuthStore()
const router = useRouter()
const emit = defineEmits(['start'])
const hasReadInstructions = ref(false)
const isDecrementing = ref(false)
const decrementError = ref('')

// Compute human-readable duration from seconds
const durationText = computed(() => {
  const secs = examStore.examConfig?.durationSeconds ?? 180 * 60
  const mins = Math.round(secs / 60)
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  if (hrs > 0 && remainMins > 0) return `${mins} minutes (${hrs} hour${hrs > 1 ? 's' : ''} ${remainMins} minutes)`
  if (hrs > 0) return `${mins} minutes (${hrs} hour${hrs > 1 ? 's' : ''})`
  return `${mins} minutes`
})

onMounted(() => {
  // Request full screen as soon as instructions load
  try {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else if (el.msRequestFullscreen) el.msRequestFullscreen()
  } catch (err) {
    console.error('Initial fullscreen request failed:', err)
  }
})

async function startExam() {
  if (!hasReadInstructions.value || isDecrementing.value) return
  isDecrementing.value = true
  decrementError.value = ''

  try {
    const testsRemaining = authStore.studentProfile?.number_of_tests || 0
    if (testsRemaining <= 0) {
      decrementError.value = 'You have no tests remaining. Please purchase more.'
      return
    }

    // Decrement now — student is actually starting the exam
    const { error } = await supabase
      .from('students')
      .update({
        number_of_tests: testsRemaining - 1,
        modification_date: new Date().toISOString()
      })
      .eq('student_id', authStore.studentProfile.student_id)

    if (error) {
      console.error('Failed to decrement test count:', error)
      decrementError.value = 'Something went wrong. Please try again.'
      return
    }

    // Update local profile
    authStore.studentProfile.number_of_tests = testsRemaining - 1
    emit('start')
  } catch (err) {
    console.error('Error decrementing tests:', err)
    decrementError.value = 'Something went wrong. Please try again.'
  } finally {
    isDecrementing.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
