<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
    
    <!-- 1. Header (Sticky) -->
    <header class="bg-white shadow-sm border-b border-gray-200 shrink-0 z-20">
       <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
         
         <div class="flex items-center gap-4">
           <!-- Subject / Exam Title Area -->
           <div>
              <h1 class="text-sm md:text-lg font-bold text-gray-900 leading-tight line-clamp-1 w-48 md:w-auto" :title="store.sessionDetails?.sessionName">
                {{ store.sessionDetails?.sessionName || 'Live Exam' }}
              </h1>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ store.sessionDetails?.studentName }} &bull; {{ store.sessionDetails?.rollNumber }}
              </p>
           </div>
         </div>

         <!-- Warning + Submit Wrapper -->
         <div class="flex items-center gap-4 md:gap-8">
            <!-- Timer Focus Container -->
            <div 
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-colors tabular-nums"
              :class="{
                'bg-red-50 border-red-200 text-red-700 animate-pulse': isTimerRed,
                'bg-gray-100 border-gray-200 text-gray-800': !isTimerRed
              }"
            >
               <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span class="font-bold text-lg tracking-wider">{{ store.formattedTimeRemaining }}</span>
            </div>

            <!-- Submit Button Trigger -->
            <button 
              @click="showSubmitWarning = true"
              class="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors active:scale-95"
            >
               Submit Exam
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
         </div>

       </div>
    </header>

    <!-- 2. Main Workspace Layout -->
    <main class="flex-1 flex overflow-hidden relative">
       
       <!-- Loader -->
       <div v-if="loadingQuestions" class="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
          <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-blue-900 font-semibold tracking-wide animate-pulse">Establishing Secure Session & Loading Database...</span>
       </div>

       <!-- LEFT: Question Display Area -->
       <div class="flex-1 flex flex-col bg-white overflow-hidden relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
         
         <template v-if="currentQuestion">
            <!-- Question Header Information -->
            <div class="px-6 md:px-10 py-4 border-b border-gray-100 flex justify-between items-center text-sm font-semibold text-gray-600 bg-gray-50/50 shrink-0">
               <span>Question {{ store.currentQuestionNumber }} / {{ store.totalQuestions }}</span>
               <div class="flex items-center gap-3">
                 <span class="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-700 font-mono">{{ currentQuestion.question_type === 'multiple_choice' ? 'MCQ (+4/-0)' : 'NUMERIC (+4/-0)' }}</span>
               </div>
            </div>

            <!-- Scrollable Question Content -->
            <div class="flex-1 overflow-y-auto px-6 md:px-10 py-8 custom-scrollbar">
              
              <!-- Content Blocks -->
              <div class="prose max-w-none mb-10 text-gray-800 text-lg leading-relaxed select-none question-content-renderer">
                 <!-- Directly using text for now, but should support HTML ideally if JSONB implies markdown/html -->
                 {{ currentQuestion.question_content?.text || currentQuestion.question_content }}
              </div>

               <div v-if="currentQuestion.image_url" class="mb-10 max-w-lg mx-auto border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                 <img :src="currentQuestion.image_url" alt="Question Related Graphic" class="w-full h-auto object-contain bg-white" />
               </div>

              <!-- Answer Input Mechanism -->
              <div class="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200">
                 
                 <!-- Option Type: multiple_choice -->
                 <div v-if="currentQuestion.question_type === 'multiple_choice'" class="space-y-4">
                    <label 
                      v-for="(label, key) in ['a', 'b', 'c', 'd']" 
                      :key="key"
                      class="flex items-center p-4 border rounded-xl cursor-pointer transition-all hover:bg-blue-50/50 hover:border-blue-200"
                      :class="{'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm': localSelectedAnswer === label, 'bg-white border-gray-200': localSelectedAnswer !== label}"
                    >
                       <div class="w-6 h-6 border-2 rounded-full flex items-center justify-center shrink-0 mr-4 transition-colors"
                         :class="localSelectedAnswer === label ? 'border-blue-500' : 'border-gray-300'"
                       >
                         <div v-if="localSelectedAnswer === label" class="w-3 h-3 bg-blue-500 rounded-full animate-fade-in-scale"></div>
                       </div>
                       
                       <span class="font-bold text-gray-700 w-8">{{ label.toUpperCase() }}.</span>
                       <span class="text-gray-800 prose">
                         {{ currentQuestion[`choice${key+1}`]?.text || currentQuestion[`choice${key+1}`] }}
                       </span>
                       
                       <input 
                         type="radio" 
                         :name="`q_${currentQuestion.question_id}`" 
                         :value="label" 
                         v-model="localSelectedAnswer" 
                         @change="handleAnswerChange"
                         class="hidden" 
                       />
                    </label>
                 </div>

                 <!-- Option Type: numeric -->
                 <div v-if="currentQuestion.question_type === 'numeric'" class="max-w-xs">
                   <label class="block text-sm font-semibold text-gray-700 mb-2">Enter Numerical Value:</label>
                   <input 
                      type="number" 
                      v-model="localSelectedAnswer"
                      @input="handleAnswerChange"
                      step="any"
                      class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-gray-900 text-lg font-mono placeholder-gray-400 shadow-sm transition-colors"
                      placeholder="e.g. 10.5"
                   />
                 </div>
              </div>
            </div>

            <!-- Bottom Actions Bar (Navigation) -->
            <div class="px-6 md:px-10 py-4 bg-white border-t border-gray-200 shrink-0 flex flex-wrap items-center justify-between gap-4">
                <button 
                  @click="store.navigateToQuestion(store.currentQuestionNumber - 1)" 
                  :disabled="store.currentQuestionNumber === 1"
                  class="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                  Previous
                </button>

                <!-- Core center actions -->
                <div class="flex items-center gap-3 w-full md:w-auto order-last md:order-none justify-center">
                   <button 
                     @click="toggleMarkForReview"
                     class="px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2"
                     :class="localIsMarked ? 'bg-yellow-100 text-yellow-800 border bg-yellow-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'"
                   >
                     <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                     {{ localIsMarked ? 'Marked for Review' : 'Mark for Review' }}
                   </button>
                   
                   <button 
                     @click="clearResponse"
                     :disabled="localSelectedAnswer === null"
                     class="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-red-600 font-semibold hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-400"
                   >
                     Clear Response
                   </button>
                </div>

                <div class="flex gap-3">
                   <button 
                     v-if="store.currentQuestionNumber < store.totalQuestions"
                     @click="saveAndNext()" 
                     class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                   >
                     Save & Next
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                   </button>

                   <!-- Submit proxy on last question to aid flow -->
                   <button 
                     v-else
                     @click="showSubmitWarning = true" 
                     class="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2"
                   >
                     Submit Exam
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                   </button>
                </div>
            </div>
         </template>
       </div>

       <!-- RIGHT: Question Palette Tracker -->
       <div class="hidden md:flex flex-col w-80 bg-gray-50 border-l border-gray-200 shrink-0 select-none">
          
          <div class="p-6 pb-4">
             <div class="flex items-center justify-between mb-2">
                 <h3 class="font-bold text-gray-900 tracking-wide text-sm">Question Palette</h3>
             </div>
             <!-- Quick visual map of progress out of 100% -->
             <div class="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full transition-all" :style="{ width: `${(store.answeredCount / store.totalQuestions) * 100}%` }"></div>
             </div>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
             <!-- Interactive Grid -->
             <div class="grid grid-cols-4 gap-3">
               <button
                 v-for="i in store.totalQuestions" 
                 :key="i"
                 @click="store.navigateToQuestion(i)"
                 class="w-full aspect-square text-sm font-bold rounded-lg flex items-center justify-center transition-all relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-1"
                 :class="{
                    // Active ring
                    'ring-2 ring-blue-500 ring-offset-1': store.currentQuestionNumber === i,

                    // Logic Priority 1: Answered & Marked (Rare but possible in JEE) -> Usually green with purple corner, we'll use Green here with Review style
                    'bg-green-100 text-green-800 border-green-300 border-2': getIsAnswered(i) && !store.markedForReview.has(i),
                    
                    // Logic Priority 2: Not Answered but Marked -> Yellow Review
                    'bg-purple-100 text-purple-800 border-purple-300 border-2': !getIsAnswered(i) && store.markedForReview.has(i),

                    // Logic Priority 3: Answered AND Marked for Review -> Green with Review indication
                     'bg-green-100 text-green-800 border-purple-400 border-[3px]': getIsAnswered(i) && store.markedForReview.has(i),

                    // Default Default
                    'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100': !getIsAnswered(i) && !store.markedForReview.has(i)
                 }"
               >
                 {{ i }}
                 <!-- Small top right visual for marked answered -->
                 <div v-if="getIsAnswered(i) && store.markedForReview.has(i)" class="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-bl-lg"></div>
               </button>
             </div>
          </div>

          <!-- Legend Footer -->
          <div class="p-4 bg-white border-t border-gray-200 text-xs font-semibold text-gray-600 grid grid-cols-2 gap-y-3">
             <div class="flex items-center gap-2"><span class="w-4 h-4 bg-green-100 border-2 border-green-300 rounded inline-block"></span> Answered</div>
             <div class="flex items-center gap-2"><span class="w-4 h-4 bg-white border border-gray-300 rounded inline-block"></span> Not Answered</div>
             <div class="flex items-center gap-2"><span class="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded inline-block"></span> Marked Return</div>
             <div class="flex items-center gap-2"><span class="w-4 h-4 bg-green-100 border-purple-400 border-[3px] rounded inline-block flex-shrink-0"></span> Ans + Mark</div>
          </div>
          
          <!-- Mobile Specific quick submit -->
          <button @click="showSubmitWarning = true" class="md:hidden mt-auto m-4 bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm focus:outline-none">
             Options & Submit
          </button>
       </div>

    </main>

    <!-- Overlays -->
    <ExamSubmitConfirmation 
      v-if="showSubmitWarning" 
      @cancel="showSubmitWarning = false"
      @submitted="handlePostSubmit" 
    />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamSessionStore } from '../../stores/examSessionStore'
import ExamSubmitConfirmation from './ExamSubmitConfirmation.vue'

const router = useRouter()
const route = useRoute()
const store = useExamSessionStore()

const loadingQuestions = ref(true)
const showSubmitWarning = ref(false)

// Local proxy refs for the exact active question to prevent jumping forms if db slow
const localSelectedAnswer = ref(null)
const localIsMarked = ref(false)

const currentQuestion = computed(() => store.currentQuestion)

// When question changes, sync local proxy with store memory
watch(() => store.currentQuestionNumber, (newVal) => {
  if (currentQuestion.value) {
    localSelectedAnswer.value = store.answers[currentQuestion.value.question_id] ?? null
    localIsMarked.value = store.markedForReview.has(newVal)
  }
})

// Fast CSS feedback checks
const getIsAnswered = (num) => {
  if (store.questions[num - 1]) {
     return store.answers[store.questions[num-1].question_id] !== undefined
  }
  return false
}

const isTimerRed = computed(() => {
  return store.timeRemainingSeconds > 0 && store.timeRemainingSeconds <= 300 // 5 minutes
})

// Unified trigger to store 
// NOTE: always pass the CURRENT localIsMarked so state is accurate.
const handleAnswerChange = () => {
   if (!currentQuestion.value) return
   store.saveAnswer(currentQuestion.value.question_id, localSelectedAnswer.value, localIsMarked.value)
}

// toggleMarkForReview is the ONLY function that changes the mark state.
// After toggling, it immediately saves to DB.
const toggleMarkForReview = () => {
   localIsMarked.value = !localIsMarked.value
   handleAnswerChange()
}

// saveAndNext: save with CURRENT mark state, then navigate.
// This preserves the user's intent: if they marked it, it stays marked after save.
// If they want to unmark, they should click 'Mark for Review' again BEFORE saving.
const saveAndNext = async () => {
  await handleAnswerChange()
  store.navigateToQuestion(store.currentQuestionNumber + 1)
}

const clearResponse = () => {
  localSelectedAnswer.value = null
  // Clearing a response also clears the mark flag — makes logical sense.
  localIsMarked.value = false
  handleAnswerChange()
}

onMounted(async () => {
  if (!store.studentSessionId) {
    router.push(`/live-exam/${route.params.sessionCode}`)
    return
  }
  
  // Guard -> If already submitted, boot out.
  if (store.examStatus === 'submitted' || store.examStatus === 'auto_submitted') {
    router.push(`/live-exam/${route.params.sessionCode}/results`)
    return
  }

  // Double check it's actually in_progress. If not, startExam() was never called or failed. WaitRoom guarantees startExam.
  if (store.examStatus !== 'in_progress') {
     console.warn('Exam not officially in progress yet. Waiting room may have failed tracking.')
     // Attempt a direct boot just in case
     await store.startExam() 
  }

  // Load question definitions over network
  await store.loadQuestions()
  
  // Trigger initial proxy sync
  if (currentQuestion.value) {
    localSelectedAnswer.value = store.answers[currentQuestion.value.question_id] ?? null
    localIsMarked.value = store.markedForReview.has(store.currentQuestionNumber)
  }
  
  loadingQuestions.value = false
})

// Safety Check Unmount - store handles syncing active time on route leave generally, but let's be explicit
onUnmounted(() => {
  if (document.visibilityState === 'hidden') {
     // Push whatever last pending was. 
  }
})

const handlePostSubmit = () => {
  showSubmitWarning.value = false
  // Router happens in modal logic, but we can do teardowns here.
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}

@keyframes fadeInScale {
  0% { transform: scale(0); opacity: 0;}
  100% { transform: scale(1); opacity: 1;}
}
.animate-fade-in-scale {
  animation: fadeInScale 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.question-content-renderer {
  font-family: inherit;
}
</style>
