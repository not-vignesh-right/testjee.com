<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div v-if="loadingMeta" class="flex justify-center my-20">
      <svg class="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Main Live Interface -->
    <div v-else-if="sessionMeta">
      
      <!-- Back Button to standard sessions list -->
      <div class="mb-4">
        <button 
          @click="router.push('/admin/sessions')"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Sessions List
        </button>
      </div>

      <!-- Top Monitor Strip -->
      <div class="bg-gray-900 rounded-2xl shadow-xl overflow-hidden mb-6 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-800 text-white">
        
        <!-- Live Alert Area -->
        <div class="p-6 md:w-1/3 flex items-start gap-4">
          <div class="bg-red-500/20 p-3 rounded-xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <svg class="w-8 h-8 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse block"></span>
              <span class="text-red-400 font-bold tracking-widest text-xs uppercase">Live Session</span>
            </div>
            <h1 class="text-2xl font-bold leading-tight line-clamp-2 truncate">{{ sessionMeta.session_name }}</h1>
            <p class="text-gray-400 text-sm font-mono mt-1 w-max bg-gray-800 px-2 py-0.5 rounded border border-gray-700">CODE: {{ sessionMeta.session_code }}</p>
          </div>
        </div>

        <!-- Global Stats Box -->
        <div class="p-6 md:w-2/3 flex flex-col justify-center">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div class="flex flex-col">
               <span class="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Time Elapsed</span>
               <div class="text-xl lg:text-3xl font-bold font-mono text-gray-100">{{ timerDisplay }}</div>
            </div>

            <div class="flex flex-col">
               <span class="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Students Enrolled</span>
               <div class="text-xl lg:text-3xl font-bold text-gray-100">{{ sessionMeta.total_students_enrolled }}</div>
            </div>

            <div class="flex flex-col">
               <span class="text-xs font-medium text-blue-400 uppercase tracking-widest mb-1">In Progress</span>
               <div class="text-xl lg:text-3xl font-bold text-blue-100 bg-blue-900/40 py-1 rounded-lg border border-blue-800/50">{{ sessionMeta.students_in_progress }}</div>
            </div>

            <div class="flex flex-col">
               <span class="text-xs font-medium text-green-400 uppercase tracking-widest mb-1">Submitted</span>
               <div class="text-xl lg:text-3xl font-bold text-green-100 bg-green-900/40 py-1 rounded-lg border border-green-800/50">{{ sessionMeta.students_submitted }}</div>
            </div>

          </div>
        </div>
      </div>

      <!-- Real Progress Bar -->
      <div class="bg-gray-900 rounded-xl px-6 py-4 mb-6 border border-gray-800">
        <div class="flex justify-between text-xs font-semibold text-gray-400 mb-2">
          <span>Exam Progress</span>
          <span>{{ sessionMeta.students_submitted }} of {{ sessionMeta.total_students_enrolled }} submitted</span>
        </div>
        <div class="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex gap-0.5">
          <div class="bg-green-500 h-full transition-all duration-700 ease-out rounded-l-full"
            :style="`width: ${progressPct(sessionMeta.students_submitted)}%`">
          </div>
          <div class="bg-blue-500 h-full transition-all duration-700 ease-out"
            :style="`width: ${progressPct(sessionMeta.students_in_progress)}%`">
          </div>
        </div>
        <div class="flex gap-4 text-xs text-gray-500 mt-2">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500 block"></span>Submitted</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500 block"></span>In Progress</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-600 block"></span>Waiting</span>
        </div>
      </div>

      <!-- Live Activities Log & Control -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">
        
        <!-- Controls Column -->
        <div class="w-full lg:w-1/3 space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Command Center</h3>
            
            <p class="text-sm text-gray-600 mb-6">The exam will automatically end and auto-submit all pending students at <strong>{{ formatTimeOnly(sessionMeta.scheduled_end_time) }}</strong>.</p>
            
            <button 
              @click="endExamEarly"
              :disabled="loadingAction"
              class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md shadow-red-200"
            >
              <svg v-if="!loadingAction" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              FORCE END EXAM EARLY
            </button>
            <p class="text-xs text-red-500 font-medium text-center mt-2">Will instantly auto-submit all active tests. CANNOT BE UNDONE.</p>
          </div>

          <!-- Dummy alert feed to simulate real-time activity for the visual effect until websocket logs push here in future iterations -->
          <div class="bg-gray-50 rounded-xl border border-gray-200 p-6">
             <h3 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
               Activity Feed Snapshot
             </h3>

             <div class="space-y-4 text-sm font-medium">
                <div v-for="s in (sessionMeta?.students_submitted > 0 ? Array(sessionMeta.students_submitted).fill('Submitted') : [])" class="flex gap-3 text-green-700 bg-green-50 p-2 rounded">
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>A student successfully submitted their exam.</span>
                </div>
                <!-- Default loader lines -->
                <div v-if="sessionMeta.students_in_progress > 0" class="flex gap-3 text-blue-700 opacity-60">
                   <svg class="w-5 h-5 shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                   <span>Waiting for completion... {{ sessionMeta.students_in_progress }} remaining.</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Student Master Table list View -->
        <div class="w-full lg:w-2/3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
           <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
             <h3 class="font-bold text-gray-900">Live Status Tracker</h3>
             <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Live</span>
           </div>

           <div class="flex-1 overflow-auto relative p-0">
             <table class="w-full text-left border-collapse text-sm">
               <thead class="bg-white sticky top-0 shadow-sm z-10">
                 <tr>
                   <th class="p-4 font-semibold text-gray-500 uppercase tracking-wider border-b">Student</th>
                   <th class="p-4 font-semibold text-gray-500 uppercase tracking-wider border-b">Status</th>
                   <th class="p-4 font-semibold text-gray-500 uppercase tracking-wider border-b text-right">Time Taken</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-gray-100">
                  <tr v-for="student in liveResults" :key="student.username" class="hover:bg-gray-50 transition-colors">
                     <td class="p-4">
                       <div class="font-semibold text-gray-900">{{ student.student_name || 'Anonymous' }}</div>
                       <div class="text-xs text-gray-500 font-mono mt-0.5">{{ student.username }} • {{ student.roll_number || 'No Roll' }}</div>
                     </td>
                     <td class="p-4">
                       <span 
                        class="px-2 py-1 rounded text-xs font-bold uppercase"
                        :class="{
                          'bg-gray-100 text-gray-600': student.status === 'not_started',
                          'bg-blue-100 text-blue-800 border-blue-200': student.status === 'in_progress',
                          'bg-green-100 text-green-800 border-green-200': student.status === 'submitted' || student.status === 'auto_submitted'
                        }"
                       >
                        {{ student.status.replace('_', ' ') }}
                       </span>
                     </td>
                     <td class="p-4 text-right font-mono text-gray-600">
                       <template v-if="student.status === 'in_progress'">
                         ...
                       </template>
                       <template v-else-if="student.time_taken_seconds">
                          {{ formatDuration(student.time_taken_seconds) }}
                       </template>
                       <template v-else>
                         -
                       </template>
                     </td>
                  </tr>
               </tbody>
             </table>
           </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAdminStore } from '../../stores/adminStore'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const loadingMeta = ref(true)
const loadingAction = ref(false)
const sessionMeta = ref(null)
const liveResults = ref([])
const pollInterval = ref(null)
const timerInterval = ref(null)
let realtimeSub = null

const timerDisplay = ref('00:00:00')

const sessionId = parseInt(route.params.id)

// Guards against NaN% width when total_students_enrolled is 0 (e.g. a session created
// with no students yet)
const progressPct = (count) => {
  const total = sessionMeta.value?.total_students_enrolled
  if (!total) return 0
  return (count / total) * 100
}

const fetchRealtimeSnapshot = async () => {
  if (!adminStore.adminProfile?.admin_id) return
  
  try {
    // 1. Fetch main meta
    const { data: metaData } = await supabase.rpc('get_admin_live_sessions', {
      input_admin_id: adminStore.adminProfile.admin_id
    })
    
    // Check if it's no longer live -> Redirect immediately to results
    const theSession = metaData.find(m => m.live_session_id === sessionId)
    if (!theSession) {
      router.push('/admin/sessions')
      return
    }
    if (theSession.status === 'completed') {
       router.push(`/admin/sessions/${sessionId}/results`)
       return
    }

    sessionMeta.value = theSession
    
    // 2. Fetch specific snapshot array
    const { data: resultsData } = await supabase.rpc('get_session_results', {
       input_admin_id: adminStore.adminProfile.admin_id,
       input_live_session_id: sessionId
    })
    liveResults.value = resultsData || []

  } catch (err) {
    console.error('Snapshot error:', err)
  } finally {
    loadingMeta.value = false
  }
}

onMounted(async () => {
  // BUG-13 / NEW-04: mark this live session as "seen" the moment the monitor is visited
  // (by any path — auto-redirect or a direct link), so AdminLiveSessions.vue's guard won't
  // force-redirect back here when the admin clicks "Back to Sessions List".
  sessionStorage.setItem(`seen_live_redirect_${sessionId}`, '1')

  await fetchRealtimeSnapshot()
  
  if (sessionMeta.value && sessionMeta.value.scheduled_start_time) {
     const startTime = new Date(sessionMeta.value.scheduled_start_time).getTime()
     timerInterval.value = setInterval(() => {
       const now = Date.now()
       const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000))
       timerDisplay.value = formatDuration(diffSecs)
     }, 1000)
  }

  // 4.3: Realtime subscription for near-instant updates on student status changes
  realtimeSub = supabase
    .channel(`monitor-${sessionId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'student_exam_sessions',
      filter: `live_session_id=eq.${sessionId}`
    }, () => fetchRealtimeSnapshot())
    .subscribe()

  // Safety-net fallback poll — Realtime requires replication enabled on this table in the
  // Supabase dashboard (Database → Replication); keep polling (slower) in case it isn't.
  pollInterval.value = setInterval(() => {
    fetchRealtimeSnapshot()
  }, 15000)
})

onUnmounted(() => {
  if (pollInterval.value) clearInterval(pollInterval.value)
  if (timerInterval.value) clearInterval(timerInterval.value)
  if (realtimeSub) supabase.removeChannel(realtimeSub)
})

const endExamEarly = async () => {
  if (!confirm('CAUTION: This will immediately auto-submit all pending exams and generate final ranks. Students will be instantly locked out. Proceed?')) return
  
  loadingAction.value = true
  try {
    const { error } = await supabase.rpc('admin_end_exam_and_calculate_ranks', {
      input_admin_id: adminStore.adminProfile.admin_id,
      input_live_session_id: sessionId
    })
    
    if (error) throw error
    
    // Successfully ended
    router.push(`/admin/sessions/${sessionId}/results`)
  } catch (err) {
    console.error('Failed to end exam:', err)
    alert(err.message || 'Error executing action')
    loadingAction.value = false
  }
}

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('en-US', { 
    hour: 'numeric', minute: '2-digit'
  }).format(new Date(dateStr))
}

const formatDuration = (totalSeconds) => {
  if (totalSeconds == null) return '-'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>
