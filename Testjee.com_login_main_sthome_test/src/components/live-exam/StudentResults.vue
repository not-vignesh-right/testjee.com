<template>
  <div class="min-h-screen bg-gray-50 flex flex-col pt-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto w-full">
       
       <!-- Global Status State -->
       <div v-if="loading" class="flex flex-col items-center justify-center py-20">
         <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <h2 class="text-xl font-bold text-gray-900">Loading Result Data...</h2>
       </div>

       <!-- Main Wrapper -->
       <div v-else-if="resultMeta" class="space-y-6">
         
         <!-- Header Box -->
         <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-center relative">
            <div class="bg-blue-600 h-24 absolute top-0 w-full z-0"></div>
            
            <div class="relative z-10 pt-16 pb-8 px-6">
               <div class="w-24 h-24 mx-auto bg-white border-4 border-gray-50 rounded-full shadow-lg flex items-center justify-center flex-col shrink-0 mb-4 text-4xl">
                 <span v-if="resultMeta.rank === 1">🥇</span>
                 <span v-else-if="resultMeta.rank === 2">🥈</span>
                 <span v-else-if="resultMeta.rank === 3">🥉</span>
                 <span v-else>🎓</span>
               </div>
               
               <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{{ resultMeta.student_name || 'Student' }}</h1>
               <p class="text-gray-500 font-mono font-medium mb-4">{{ resultMeta.roll_number || 'No Roll Code' }}</p>

               <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-bold shadow-sm">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Exam Assessed Successfully
               </div>
            </div>
         </div>

         <!-- Statistics Grid -->
         <!-- Note: Real Ranks require exam to be ended. Show loader banner if ranks not calc'd yet -->
         <div v-if="!resultMeta.rank && store.sessionDetails?.sessionStatus !== 'completed'" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-blue-800">
           <svg class="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <div class="text-sm">
             <strong>Pending Final Rankings</strong>
             <p>Your score is calculated, but ranks and percentiles will only be available after the instructor fully completes the entire session.</p>
           </div>
         </div>

         <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
           
           <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
             <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Score</div>
             <div class="text-3xl font-black text-gray-900">{{ resultMeta.score || 0 }} <span class="text-sm font-semibold text-gray-400">/ {{ resultMeta.max_score || 0 }}</span></div>
           </div>

           <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
             <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Percentage</div>
             <div class="text-3xl font-black text-blue-600">{{ Number(resultMeta.percentage || 0).toFixed(1) }}%</div>
           </div>

           <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
             <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Final Rank</div>
             <div class="text-3xl font-black text-purple-600">{{ resultMeta.rank || '-' }}</div>
           </div>

           <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
             <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Time Taken</div>
             <div class="text-xl font-bold font-mono py-1 text-gray-700">{{ formatDuration(resultMeta.time_taken_seconds) }}</div>
           </div>

         </div>

         <!-- Detailed Breakdown List (Unlocked when session is completed) -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
             <div class="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Attempt Analysis</h3>
                  <p class="text-xs text-gray-500 mt-1">Review specific question data once answers are released by administration.</p>
                </div>
                <div v-if="loadingDetails" class="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                  <svg class="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Loading analysis...</span>
                </div>
             </div>
             
             <!-- Locked State: Session is still live -->
             <div v-if="store.sessionDetails?.sessionStatus !== 'completed'" class="p-10 text-center text-gray-500 flex flex-col items-center">
                <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <h4 class="font-bold text-gray-800 text-lg mb-2">Detailed Answer Key Hidden</h4>
                <p class="max-w-md text-sm">To maintain exam integrity, individual question answers and solutions are temporarily restricted until the session is universally concluded by the admin.</p>
                <div class="mt-4 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg animate-pulse border border-blue-200">
                  Waiting for instructor to end the live session...
                </div>
                
                <button 
                  @click="store.resetStore(); router.push('/')"
                  class="mt-6 px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Exit & Return Home
                </button>
             </div>

             <!-- Unlocked State: Detailed analysis list -->
             <div v-else-if="detailedResults.length > 0" class="p-6 space-y-6">
               <div v-for="(questions, subject) in groupedBySubject" :key="subject" class="space-y-3">
                 <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                   <div class="w-6 h-6 rounded bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">{{ subject.charAt(0) }}</div>
                   <h4 class="font-bold text-gray-800">{{ subject }}</h4>
                   <span class="text-xs text-gray-400 font-normal">({{ questions.length }} questions)</span>
                 </div>
                 
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   <div
                     v-for="q in questions"
                     :key="q.question_id"
                     @click="selectedQuestion = q"
                     class="p-4 border rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                     :class="getCardClass(q)"
                   >
                     <div class="flex items-center justify-between mb-3">
                       <div class="flex items-center gap-2">
                         <span class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" :class="getQNumberClass(q)">
                           {{ q.originalIndex + 1 }}
                         </span>
                         <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" :class="getStatusBadgeClass(q)">
                           {{ getQuestionStatusText(q) }}
                         </span>
                       </div>
                       <span class="text-[11px] font-mono text-gray-400 flex items-center gap-0.5">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         {{ formatDuration(q.time_spent_seconds) }}
                       </span>
                     </div>
                     
                     <div class="flex items-center justify-between text-xs font-semibold">
                       <div class="flex items-center gap-1">
                         <span class="text-gray-400">You:</span>
                         <span :class="getAnswerTextColor(q)">{{ q.selected_answer ? q.selected_answer.toUpperCase() : '—' }}</span>
                       </div>
                       <div class="flex items-center gap-1">
                         <span class="text-gray-400">Correct:</span>
                         <span class="text-green-600">{{ q.correct_answer ? q.correct_answer.toUpperCase() : '—' }}</span>
                       </div>
                     </div>
                     
                     <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end text-[10px] font-bold uppercase tracking-wider text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity">
                       View Analysis &rarr;
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Fallback if no questions are loaded -->
             <div v-else class="p-10 text-center text-gray-500">
               <p class="text-sm font-medium">No question breakdown is available for this session.</p>
             </div>
          </div>
          
          <!-- Helper copyright / meta pad -->
          <div class="py-10"></div>

        </div>
     </div>

     <!-- Modal for Question Details -->
     <Teleport to="body">
       <div v-if="selectedQuestion" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="selectedQuestion = null">
         <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
           
           <!-- Modal Header -->
           <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
             <div class="flex items-center gap-2">
               <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">Q{{ selectedQuestion.originalIndex + 1 }}</span>
               <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{{ selectedQuestion.subject_name }}</span>
               <span v-if="selectedQuestion.topic_name" class="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{{ selectedQuestion.topic_name }}</span>
               <span class="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full font-mono">{{ selectedQuestion.question_type === 'multiple_choice' ? 'MCQ' : 'Numeric' }}</span>
             </div>
             <button @click="selectedQuestion = null" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
           </div>

           <!-- Modal Body -->
           <div class="p-6 space-y-6">
             <!-- Status banner -->
             <div class="rounded-xl p-4 flex items-center justify-between border" :class="getQuestionModalBannerClass(selectedQuestion)">
               <div>
                 <p class="text-xs font-black uppercase tracking-wider">{{ getQuestionModalStatusText(selectedQuestion) }}</p>
                 <p class="text-sm font-medium text-gray-700 mt-0.5">{{ getQuestionModalStatusSubtitle(selectedQuestion) }}</p>
               </div>
               <div class="text-right">
                 <p class="text-[10px] text-gray-400 font-semibold uppercase">Time Spent</p>
                 <p class="text-lg font-black font-mono">{{ formatDuration(selectedQuestion.time_spent_seconds) }}</p>
               </div>
             </div>

             <!-- Question Stem -->
             <div class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
               <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
                 <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Question Stem</h3>
               </div>
               <div class="p-4">
                 <img v-if="selectedQuestion.image_url" :src="selectedQuestion.image_url" alt="Question" class="max-w-full h-auto object-contain bg-white rounded-lg mx-auto max-h-80" />
                 <p v-else class="text-gray-800 text-base leading-relaxed whitespace-pre-line">{{ selectedQuestion.question_content?.text || selectedQuestion.question_content?.stem || selectedQuestion.external_reference || 'No content.' }}</p>
               </div>
             </div>

             <!-- Choices / Numeric Answer -->
             <div v-if="selectedQuestion.question_type === 'multiple_choice'" class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
               <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
                 <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Options</h3>
               </div>
               <div class="p-4 space-y-3">
                 <div v-for="opt in getQuestionModalOptions(selectedQuestion)" :key="opt.id" class="flex items-start gap-3 p-3 rounded-lg border bg-white" :class="getModalOptClass(selectedQuestion, opt.id)">
                   <div class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0" :class="getModalOptBadgeClass(selectedQuestion, opt.id)">
                     {{ opt.id.toUpperCase() }}
                   </div>
                   <div class="flex-1 min-w-0">
                     <img v-if="isUrl(opt.text)" :src="opt.text" class="max-w-full h-auto object-contain bg-white max-h-32" />
                     <p v-else class="text-sm font-medium leading-relaxed text-gray-700">{{ opt.text || '—' }}</p>
                   </div>
                   <!-- Status tags -->
                   <div class="shrink-0 flex items-center gap-1.5 text-xs font-bold">
                     <span v-if="opt.id === selectedQuestion.correct_answer" class="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Correct</span>
                     <span v-if="opt.id === selectedQuestion.selected_answer && opt.id !== selectedQuestion.correct_answer" class="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Your Answer</span>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Numeric Field -->
             <div v-else-if="selectedQuestion.question_type === 'numeric'" class="grid grid-cols-2 gap-4">
               <div class="rounded-xl p-4 text-center border bg-white" :class="selectedQuestion.is_correct ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'">
                 <p class="text-[10px] font-black uppercase tracking-wide text-gray-500">Your Answer</p>
                 <p class="text-2xl font-mono font-bold mt-1" :class="selectedQuestion.is_correct ? 'text-green-700' : 'text-red-700'">{{ selectedQuestion.selected_answer ?? '—' }}</p>
               </div>
               <div class="rounded-xl p-4 text-center border border-green-300 bg-green-50/30 bg-white">
                 <p class="text-[10px] font-black uppercase tracking-wide text-green-600">Correct Answer</p>
                 <p class="text-2xl font-mono font-bold text-green-700 mt-1">{{ selectedQuestion.correct_answer ?? '—' }}</p>
               </div>
             </div>

             <!-- Solution -->
             <div class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
               <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
                 <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Solution / Explanation</h3>
               </div>
               <div class="p-4">
                 <img v-if="selectedQuestion.solution && isUrl(selectedQuestion.solution)" :src="selectedQuestion.solution" alt="Solution" class="max-w-full h-auto object-contain bg-white rounded-lg mx-auto max-h-80" />
                 <p v-else-if="selectedQuestion.solution" class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{{ selectedQuestion.solution }}</p>
                 <p v-else class="text-gray-400 text-sm text-center py-2">No detailed explanation configured for this question.</p>
               </div>
             </div>
           </div>
           
         </div>
       </div>
     </Teleport>
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

const loading = ref(true)
const resultMeta = ref(null)

const detailedResults = ref([])
const loadingDetails = ref(false)
const selectedQuestion = ref(null)
const statusPollInterval = ref(null)

const groupedBySubject = computed(() => {
  const groups = {}
  detailedResults.value.forEach((q, idx) => {
    const subject = q.subject_name || 'General'
    if (!groups[subject]) groups[subject] = []
    groups[subject].push({
      ...q,
      originalIndex: idx
    })
  })
  return groups
})

const pollSessionStatus = async () => {
  try {
    let liveSessionId = store.liveSessionId
    if (!liveSessionId && store.studentSessionId) {
      const { data: sesRow } = await supabase
        .from('student_exam_sessions')
        .select('live_session_id')
        .eq('student_session_id', store.studentSessionId)
        .maybeSingle()
      if (sesRow) {
        liveSessionId = sesRow.live_session_id
      }
    }
    if (!liveSessionId) return

    const { data } = await supabase
      .from('live_exam_sessions')
      .select('status')
      .eq('live_session_id', liveSessionId)
      .maybeSingle()

    if (data) {
      if (store.sessionDetails) {
        store.sessionDetails.sessionStatus = data.status
      }
      if (data.status === 'completed') {
        // Stop polling
        if (statusPollInterval.value) {
          clearInterval(statusPollInterval.value)
          statusPollInterval.value = null
        }
        // Fetch detailed results & ranking summary
        await loadDetailedResults()
        await fetchRankingSummary()
      }
    }
  } catch (err) {
    console.warn('Failed polling session status:', err)
  }
}

const fetchRankingSummary = async () => {
  try {
    const { data, error } = await supabase.rpc('get_student_live_result', {
      input_student_session_id: store.studentSessionId
    })
    if (!error && data?.length) {
      resultMeta.value = data[0]
    }
  } catch (err) {
    console.warn('Failed fetching rankings summary:', err)
  }
}

const loadDetailedResults = async () => {
  loadingDetails.value = true
  try {
    const { data, error } = await supabase.rpc('get_student_live_detailed_results', {
      input_student_session_id: store.studentSessionId
    })
    if (error) throw error
    detailedResults.value = data || []
  } catch (err) {
    console.error('Failed to load detailed results:', err)
  } finally {
    loadingDetails.value = false
  }
}

onMounted(async () => {
  if (!store.studentSessionId) {
    router.push(`/live-exam/${route.params.sessionCode}`)
    return
  }

  try {
    // BUG-11 fix: use a SECURITY DEFINER RPC
    const { data, error } = await supabase.rpc('get_student_live_result', {
      input_student_session_id: store.studentSessionId
    })

    if (error) throw error
    if (!data || data.length === 0) throw new Error('No result found for this session')

    resultMeta.value = data[0]

    // Resolve live session ID
    let liveSessionId = store.liveSessionId
    if (!liveSessionId && store.studentSessionId) {
      const { data: sesRow } = await supabase
        .from('student_exam_sessions')
        .select('live_session_id')
        .eq('student_session_id', store.studentSessionId)
        .maybeSingle()
      if (sesRow) {
        liveSessionId = sesRow.live_session_id
      }
    }

    if (liveSessionId) {
      const { data: sessionData } = await supabase
        .from('live_exam_sessions')
        .select('status')
        .eq('live_session_id', liveSessionId)
        .maybeSingle()

      if (sessionData) {
        if (store.sessionDetails) {
          store.sessionDetails.sessionStatus = sessionData.status
        }
        if (sessionData.status === 'completed') {
          await loadDetailedResults()
        } else {
          // Poll status every 5 seconds
          statusPollInterval.value = setInterval(pollSessionStatus, 5000)
        }
      }
    }

  } catch (err) {
    console.error('Failed fetching results', err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (statusPollInterval.value) {
    clearInterval(statusPollInterval.value)
  }
})

// UI Helpers
const isUrl = (str) => {
  if (!str) return false
  return /^https?:\/\//i.test(str.trim())
}

const getCardClass = (q) => {
  if (q.is_correct) return 'bg-green-50/60 border-green-200/70'
  if (q.selected_answer) return 'bg-red-50/60 border-red-200/70'
  return 'bg-gray-50/60 border-gray-200/70'
}

const getQNumberClass = (q) => {
  if (q.is_correct) return 'bg-green-500 text-white'
  if (q.selected_answer) return 'bg-red-500 text-white'
  return 'bg-gray-300 text-white'
}

const getStatusBadgeClass = (q) => {
  if (q.is_correct) return 'bg-green-100 text-green-700'
  if (q.selected_answer) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-500'
}

const getQuestionStatusText = (q) => {
  if (q.is_correct) return 'Correct'
  if (q.selected_answer) return 'Wrong'
  return 'Skipped'
}

const getAnswerTextColor = (q) => {
  if (!q.selected_answer) return 'text-gray-400'
  return q.is_correct ? 'text-green-600' : 'text-red-600'
}

// Modal Helpers
const getQuestionModalBannerClass = (q) => {
  if (!q.selected_answer) return 'bg-gray-50 border-gray-200 text-gray-500'
  if (q.is_correct) return 'bg-green-50 border-green-200 text-green-700'
  return 'bg-red-50 border-red-200 text-red-700'
}

const getQuestionModalStatusText = (q) => {
  if (!q.selected_answer) return 'Not Attempted'
  if (q.is_correct) return 'Correct'
  return 'Incorrect'
}

const getQuestionModalStatusSubtitle = (q) => {
  if (!q.selected_answer) return 'You skipped this question.'
  if (q.is_correct) return `You answered: ${String(q.selected_answer).toUpperCase()}`
  return `You answered: ${String(q.selected_answer).toUpperCase()}  ·  Correct: ${String(q.correct_answer || '?').toUpperCase()}`
}

const getQuestionModalOptions = (q) => {
  return ['choice1', 'choice2', 'choice3', 'choice4'].map((col, i) => {
    const rawVal = q[col]
    let text = ''
    if (rawVal) {
      try {
        // Handle either JSON object or raw string
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal
        text = parsed?.text || parsed || ''
      } catch {
        text = String(rawVal)
      }
    }
    return {
      id: ['a', 'b', 'c', 'd'][i],
      text
    }
  })
}

const getModalOptClass = (q, optId) => {
  if (optId === q.correct_answer) return 'border-green-400 bg-green-50/50 shadow-sm ring-1 ring-green-400'
  if (optId === q.selected_answer && !q.is_correct) return 'border-red-400 bg-red-50/50 shadow-sm ring-1 ring-red-400'
  return 'border-gray-200 hover:bg-gray-50'
}

const getModalOptBadgeClass = (q, optId) => {
  if (optId === q.correct_answer) return 'bg-green-500 text-white'
  if (optId === q.selected_answer && !q.is_correct) return 'bg-red-500 text-white'
  return 'bg-gray-200 text-gray-600'
}

const formatDuration = (totalSeconds) => {
  if (totalSeconds == null) return '-'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
</script>
