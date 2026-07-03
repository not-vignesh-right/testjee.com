<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <svg class="animate-spin h-8 w-8 text-gta-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="adminStore.adminProfile">
        <!-- Dashboard Header -->
        <div class="mb-10">
          <h2 class="text-2xl font-semibold text-ink-900 tracking-tight">Dashboard</h2>
          <p class="mt-1 text-sm text-ink-500">{{ adminStore.adminProfile.institute_name }}</p>
        </div>

        <!-- Live Now: dominant hero element when a session is running, otherwise the
             primary action takes its place. Only one of these two commands attention. -->
        <transition
          enter-active-class="transition duration-300 ease-out-expo"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="liveSession" class="mb-10 bg-red-700 rounded-2xl p-6 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div class="flex items-center gap-4 min-w-0">
              <span class="relative shrink-0 flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <div class="min-w-0">
                <p class="text-red-100 text-xs font-semibold uppercase tracking-wide">Live now</p>
                <h3 class="text-xl font-bold truncate">{{ liveSession.session_name }}</h3>
                <p class="text-red-100 text-sm mt-0.5 tabular-nums">
                  {{ liveSession.students_submitted }} / {{ liveSession.total_students_enrolled }} submitted · {{ liveElapsedDisplay }} elapsed
                </p>
              </div>
            </div>
            <button @click="router.push(`/admin/sessions/${liveSession.live_session_id}/monitor`)"
              class="shrink-0 px-5 py-2.5 bg-white text-gta-danger font-semibold rounded-xl text-sm hover:bg-red-50 transition-colors duration-200 ease-out-quart">
              Open monitor
            </button>
          </div>

          <div v-else class="mb-10 rounded-2xl p-6 sm:p-7 bg-gta-secondary text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p class="text-blue-100 text-xs font-semibold uppercase tracking-wide">Get started</p>
              <h3 class="text-xl font-bold mt-0.5">Schedule your next live exam</h3>
              <p class="text-blue-100 text-sm mt-0.5">Pick an exam type, set a time, and credentials generate automatically.</p>
            </div>
            <button
              @click="router.push('/admin/sessions/new')"
              class="shrink-0 px-5 py-2.5 bg-white text-gta-primary font-semibold rounded-xl text-sm hover:bg-blue-50 transition-colors duration-200 ease-out-quart"
            >
              Schedule exam
            </button>
          </div>
        </transition>

        <!-- Capacity: one panel, not two identical boxed cards. Structure via a divider and
             typography, not by wrapping each metric in its own bordered/shadowed box. -->
        <div class="mb-10">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-4">Capacity</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-y border-slate-200">
            <div class="py-5 sm:pr-8">
              <div class="flex items-baseline justify-between mb-2">
                <span class="text-sm font-medium text-ink-700">Tests created</span>
                <span class="text-sm tabular-nums text-ink-500">{{ adminStore.adminProfile.tests_created }} <span class="text-ink-500">/ {{ adminStore.adminProfile.max_tests }}</span></span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5">
                <div class="bg-gta-primary h-1.5 rounded-full transition-all duration-700 ease-out-expo" :style="{ width: testsPercentage + '%' }"></div>
              </div>
            </div>
            <div class="py-5 sm:pl-8">
              <div class="flex items-baseline justify-between mb-2">
                <span class="text-sm font-medium text-ink-700">Students created</span>
                <span class="text-sm tabular-nums text-ink-500">{{ adminStore.adminProfile.students_created }} <span class="text-ink-500">/ {{ adminStore.adminProfile.max_students }}</span></span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5">
                <div class="bg-gta-success h-1.5 rounded-full transition-all duration-700 ease-out-expo" :style="{ width: studentsPercentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-4">Quick actions</h3>
          <div class="flex flex-wrap gap-3">
            <button
              v-if="liveSession"
              @click="router.push('/admin/sessions/new')"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gta-primary hover:bg-gta-secondary transition-colors duration-200 ease-out-quart"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Schedule live exam
            </button>
            <button
              @click="router.push('/admin/sessions')"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-ink-700 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 ease-out-quart"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              View all sessions
            </button>
          </div>
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'
import { supabase } from '../../lib/supabase'

const router = useRouter()
const adminStore = useAdminStore()
const loading = ref(true)

// Live Now banner
const liveSession = ref(null)
const liveElapsedDisplay = ref('00:00:00')
let liveTimerInterval = null

async function fetchLiveSession() {
  if (!adminStore.adminProfile?.admin_id) return
  try {
    const { data } = await supabase.rpc('get_admin_live_sessions', {
      input_admin_id: adminStore.adminProfile.admin_id
    })
    liveSession.value = data?.find(s => s.status === 'live') ?? null

    if (liveTimerInterval) {
      clearInterval(liveTimerInterval)
      liveTimerInterval = null
    }
    // Note: uses scheduled_start_time, so like BUG-04, "Start Early" makes this elapsed
    // display run ahead of the student's actual start — informational only, not scoring.
    if (liveSession.value?.scheduled_start_time) {
      const start = new Date(liveSession.value.scheduled_start_time).getTime()
      liveTimerInterval = setInterval(() => {
        const diff = Math.max(0, Math.floor((Date.now() - start) / 1000))
        const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60
        liveElapsedDisplay.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      }, 1000)
    }
  } catch (err) {
    console.error('Failed to fetch live session for banner:', err)
  }
}

const testsPercentage = computed(() => {
  if (!adminStore.adminProfile || adminStore.adminProfile.max_tests === 0) return 0
  const pct = (adminStore.adminProfile.tests_created / adminStore.adminProfile.max_tests) * 100
  return Math.min(Math.max(Math.round(pct), 0), 100)
})

const studentsPercentage = computed(() => {
  if (!adminStore.adminProfile || adminStore.adminProfile.max_students === 0) return 0
  const pct = (adminStore.adminProfile.students_created / adminStore.adminProfile.max_students) * 100
  return Math.min(Math.max(Math.round(pct), 0), 100)
})

onMounted(async () => {
  try {
    // Refresh session to get latest stats when component loads
    await adminStore.loadSession()
    await fetchLiveSession()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (liveTimerInterval) clearInterval(liveTimerInterval)
})

</script>
