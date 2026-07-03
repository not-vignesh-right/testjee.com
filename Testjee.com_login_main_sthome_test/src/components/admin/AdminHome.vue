<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="adminStore.adminProfile">
        <!-- Dashboard Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Dashboard Overview</h2>
          <p class="mt-1 text-sm text-gray-500">Monitor your institute's test and student capacity.</p>
        </div>

        <!-- Live Now Banner -->
        <div v-if="liveSession" class="mb-8 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg shadow-red-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-3 h-3 bg-white rounded-full animate-pulse shrink-0"></div>
            <div>
              <p class="text-red-200 text-xs font-bold uppercase tracking-widest">Live Now</p>
              <h3 class="text-xl font-black">{{ liveSession.session_name }}</h3>
              <p class="text-red-200 text-sm mt-0.5">
                {{ liveSession.students_submitted }} / {{ liveSession.total_students_enrolled }} submitted
                · Elapsed: {{ liveElapsedDisplay }}
              </p>
            </div>
          </div>
          <button @click="router.push(`/admin/sessions/${liveSession.live_session_id}/monitor`)"
            class="shrink-0 px-5 py-2.5 bg-white text-red-700 font-bold rounded-xl text-sm hover:bg-red-50 transition-colors shadow-sm">
            → Open Monitor
          </button>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <!-- Tests Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden group">
            <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg class="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            
            <dt class="text-sm font-medium text-gray-500 mb-1">Tests Created</dt>
            <dd class="text-3xl font-bold text-gray-900 mb-4">{{ adminStore.adminProfile.tests_created }} <span class="text-lg font-medium text-gray-400">/ {{ adminStore.adminProfile.max_tests }}</span></dd>
            
            <div class="mt-auto w-full">
              <div class="flex justify-between items-end mb-1">
                <span class="text-xs font-medium text-gray-500">Usage</span>
                <span class="text-xs font-bold text-blue-600">{{ testsPercentage }}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2.5">
                <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out" :style="{ width: testsPercentage + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Students Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden group">
             <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            
            <dt class="text-sm font-medium text-gray-500 mb-1">Students Created</dt>
            <dd class="text-3xl font-bold text-gray-900 mb-4">{{ adminStore.adminProfile.students_created }} <span class="text-lg font-medium text-gray-400">/ {{ adminStore.adminProfile.max_students }}</span></dd>
            
            <div class="mt-auto w-full">
              <div class="flex justify-between items-end mb-1">
                <span class="text-xs font-medium text-gray-500">Usage</span>
                <span class="text-xs font-bold text-green-600">{{ studentsPercentage }}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2.5">
                <div class="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-1000 ease-out" :style="{ width: studentsPercentage + '%' }"></div>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Quick Actions -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              @click="router.push('/admin/sessions/new')"
              class="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors bg-white group"
            >
               <svg class="mx-auto h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span class="mt-2 block text-sm font-bold text-gray-900">
                Schedule Live Exam
              </span>
            </button>
            
            <button 
              @click="router.push('/admin/sessions')"
              class="relative block w-full border border-gray-200 rounded-lg p-6 text-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all bg-white group"
            >
              <svg class="mx-auto h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              <span class="mt-2 block text-sm font-bold text-gray-900">
                View All Sessions
              </span>
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

