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

         <!-- Detailed Breakdown List (Iterating stored questions vs answers if logic permits direct analysis) -->
         <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div class="px-6 py-5 border-b border-gray-100 bg-gray-50">
               <h3 class="text-lg font-bold text-gray-900">Attempt Analysis (WIP)</h3>
               <p class="text-xs text-gray-500 mt-1">Review specific question data once answers are released by administration.</p>
            </div>
            
            <div class="p-10 text-center text-gray-500 flex flex-col items-center">
               <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               <h4 class="font-bold text-gray-800 text-lg mb-2">Detailed Answer Key Hidden</h4>
               <p class="max-w-md text-sm">To maintain exam integrity, individual question answers and solutions are temporarily restricted until the session is universally concluded.</p>
               
               <button 
                 @click="store.resetStore(); router.push('/')"
                 class="mt-6 px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
               >
                 Exit & Return Home
               </button>
            </div>
         </div>
         
         <!-- Helper copyright / meta pad -->
         <div class="py-10"></div>

       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamSessionStore } from '../../stores/examSessionStore'
import { supabase } from '../../lib/supabase'

const router = useRouter()
const route = useRoute()
const store = useExamSessionStore()

const loading = ref(true)
const resultMeta = ref(null)

onMounted(async () => {
  if (!store.studentSessionId) {
    router.push(`/live-exam/${route.params.sessionCode}`)
    return
  }

  try {
    // BUG-11 fix: use a SECURITY DEFINER RPC instead of a direct table select — live-exam
    // students aren't Supabase-authenticated, so a direct select depends on anon RLS policies
    // that may not be (or may stop being) in place on student_exam_sessions.
    const { data, error } = await supabase.rpc('get_student_live_result', {
      input_student_session_id: store.studentSessionId
    })

    if (error) throw error
    if (!data || data.length === 0) throw new Error('No result found for this session')

    resultMeta.value = data[0]

  } catch (err) {
    console.error('Failed fetching results', err)
  } finally {
    loading.value = false
  }
})

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
