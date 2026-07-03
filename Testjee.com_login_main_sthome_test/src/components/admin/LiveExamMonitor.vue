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
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900 transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to sessions
        </button>
      </div>

      <!-- War Room panel: session identity, stats, and the progress gauge unified into one
           dark surface instead of two stacked dark boxes — the "mission control" moment
           deserves one coherent read, not a stack of boxed metrics. -->
      <div class="bg-ink-900 rounded-2xl overflow-hidden mb-6 text-white">
        <div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span class="text-red-400 font-semibold tracking-wide text-xs uppercase">Live session</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold leading-tight truncate">{{ sessionMeta.session_name }}</h1>
            <p class="text-slate-400 text-sm font-mono mt-1">{{ sessionMeta.session_code }}</p>
          </div>
          <div class="flex items-center gap-6 shrink-0">
            <div class="text-right">
              <p class="text-xs text-slate-400 uppercase tracking-wide">Elapsed</p>
              <p class="text-lg font-bold font-mono tabular-nums">{{ timerDisplay }}</p>
            </div>
            <button
              @click="endExamEarly"
              :disabled="loadingAction"
              class="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors duration-200 ease-out-quart disabled:opacity-60"
            >
              <svg v-if="!loadingAction" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <svg v-else class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              End exam early
            </button>
          </div>
        </div>

        <!-- Stat row: color carried by the number itself, not a colored box around it -->
        <div class="grid grid-cols-3 divide-x divide-white/10">
          <div class="px-6 py-4 text-center">
            <p class="text-2xl font-bold tabular-nums">{{ sessionMeta.students_not_started ?? (sessionMeta.total_students_enrolled - sessionMeta.students_in_progress - sessionMeta.students_submitted) }}</p>
            <p class="text-xs text-slate-400 uppercase tracking-wide mt-0.5">Waiting</p>
          </div>
          <div class="px-6 py-4 text-center">
            <p class="text-2xl font-bold tabular-nums text-blue-400">{{ sessionMeta.students_in_progress }}</p>
            <p class="text-xs text-slate-400 uppercase tracking-wide mt-0.5">In progress</p>
          </div>
          <div class="px-6 py-4 text-center">
            <p class="text-2xl font-bold tabular-nums text-emerald-400">{{ sessionMeta.students_submitted }}</p>
            <p class="text-xs text-slate-400 uppercase tracking-wide mt-0.5">Submitted</p>
          </div>
        </div>

        <!-- Progress gauge -->
        <div class="px-6 pb-6 pt-1">
          <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden flex gap-px">
            <div class="bg-emerald-500 h-full transition-all duration-700 ease-out-expo rounded-l-full"
              :style="`width: ${progressPct(sessionMeta.students_submitted)}%`">
            </div>
            <div class="bg-blue-500 h-full transition-all duration-700 ease-out-expo"
              :style="`width: ${progressPct(sessionMeta.students_in_progress)}%`">
            </div>
          </div>
          <p class="text-xs text-slate-500 mt-2">{{ sessionMeta.students_submitted }} of {{ sessionMeta.total_students_enrolled }} submitted · ends automatically at {{ formatTimeOnly(sessionMeta.scheduled_end_time) }}</p>
        </div>
      </div>

      <!-- Live Activities Log & Table -->
      <div class="flex flex-col lg:flex-row gap-6 mb-6">

        <!-- Activity feed -->
        <div class="w-full lg:w-1/3">
          <div class="bg-surface rounded-xl border border-slate-200 p-5">
             <h3 class="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-4 flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-gta-danger rounded-full animate-pulse"></span>
               Activity
             </h3>

             <TransitionGroup
               tag="div"
               class="space-y-2 text-sm"
               enter-active-class="transition duration-300 ease-out-expo"
               enter-from-class="opacity-0 -translate-y-1"
               enter-to-class="opacity-100 translate-y-0"
             >
                <div v-for="i in sessionMeta.students_submitted" :key="`submitted-${i}`" class="flex gap-2.5 items-center text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span class="font-medium">A student submitted their exam</span>
                </div>
                <div v-if="sessionMeta.students_in_progress > 0" key="in-progress" class="flex gap-2.5 items-center text-ink-500 px-3 py-2">
                   <svg class="w-4 h-4 shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                   <span>{{ sessionMeta.students_in_progress }} still writing</span>
                </div>
             </TransitionGroup>
          </div>
          <p class="text-xs text-ink-500 mt-2 px-1">"Force end" instantly auto-submits every active test and locks the session — cannot be undone.</p>
        </div>

        <!-- Student Master Table list View -->
        <div class="w-full lg:w-2/3 bg-surface rounded-xl border border-slate-200 flex flex-col h-[600px]">
           <div class="p-4 border-b border-slate-200 flex items-center justify-between">
             <h3 class="font-semibold text-ink-900 text-sm">Live status tracker</h3>
             <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Live</span>
           </div>

           <div class="flex-1 overflow-auto relative p-0">
             <table class="w-full text-left border-collapse text-sm">
               <thead class="bg-surface sticky top-0 z-10">
                 <tr>
                   <th class="p-4 font-semibold text-ink-500 uppercase tracking-wide text-xs border-b border-slate-200">Student</th>
                   <th class="p-4 font-semibold text-ink-500 uppercase tracking-wide text-xs border-b border-slate-200">Status</th>
                   <th class="p-4 font-semibold text-ink-500 uppercase tracking-wide text-xs border-b border-slate-200 text-right">Time taken</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-100">
                  <tr v-for="student in liveResults" :key="student.username" class="hover:bg-slate-50 transition-colors duration-150">
                     <td class="p-4">
                       <div class="font-semibold text-ink-900">{{ student.student_name || 'Anonymous' }}</div>
                       <div class="text-xs text-ink-500 font-mono mt-0.5">{{ student.username }} · {{ student.roll_number || 'No roll' }}</div>
                     </td>
                     <td class="p-4">
                       <span
                        class="px-2 py-1 rounded-md text-xs font-semibold"
                        :class="{
                          'bg-slate-100 text-ink-500': student.status === 'not_started',
                          'bg-blue-50 text-blue-700': student.status === 'in_progress',
                          'bg-emerald-50 text-emerald-700': student.status === 'submitted' || student.status === 'auto_submitted'
                        }"
                       >
                        {{ student.status.replace('_', ' ') }}
                       </span>
                     </td>
                     <td class="p-4 text-right font-mono text-ink-500 tabular-nums">
                       <template v-if="student.status === 'in_progress'">
                         &mdash;
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
