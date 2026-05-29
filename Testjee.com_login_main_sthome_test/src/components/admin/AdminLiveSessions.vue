<template>
  <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Exam Sessions</h1>
        <p class="mt-2 text-sm text-gray-500 max-w-2xl">Manage your scheduled exams, monitor live activity, and review completed results.</p>
      </div>
      <button 
        @click="router.push('/admin/sessions/new')"
        class="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto gap-2"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Schedule New Exam
      </button>
    </div>

    <!-- Filters/Tabs -->
    <div class="bg-white rounded-t-xl border-b border-gray-200 px-6 pt-4 flex gap-6 overflow-x-auto no-scrollbar shadow-sm">
      <button 
        v-for="tab in ['All', 'Scheduled', 'Live', 'Completed']" 
        :key="tab"
        @click="activeTab = tab.toLowerCase()"
        class="pb-4 text-sm font-medium transition-colors relative whitespace-nowrap"
        :class="activeTab === tab.toLowerCase() ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab }}
        <div v-if="activeTab === tab.toLowerCase()" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t"></div>
      </button>
    </div>

    <!-- Session List -->
    <div class="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 overflow-hidden min-h-[400px] relative">
      
      <!-- Loading State -->
      <div v-if="loading" class="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="filteredSessions.length === 0" class="flex flex-col items-center justify-center py-20 text-center px-4">
        <div class="bg-gray-50 rounded-full p-4 mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No sessions found</h3>
        <p class="text-gray-500 max-w-sm">You haven't scheduled any exams yet. Click 'Schedule New Exam' to get started.</p>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <!-- Session Card -->
        <div 
          v-for="session in filteredSessions" 
          :key="session.live_session_id"
          class="p-6 hover:bg-gray-50/50 transition-colors group relative"
        >
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <!-- Left Info -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  :class="{
                    'bg-yellow-100 text-yellow-800 border-yellow-200': session.status === 'scheduled',
                    'bg-red-100 text-red-800 border-red-200 animate-pulse': session.status === 'live',
                    'bg-green-100 text-green-800 border-green-200': session.status === 'completed'
                  }"
                >
                  <span v-if="session.status === 'live'" class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 align-middle"></span>
                  {{ session.status }}
                </span>
                
                <span class="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                   Code: {{ session.session_code }}
                </span>
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                {{ session.session_name }}
              </h3>
              <p class="text-sm text-gray-500 font-medium mb-4 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Template: {{ session.test_name }}
              </p>
              
              <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                <div class="flex items-center gap-2 text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span>Start: <strong class="text-gray-900">{{ formatDate(session.scheduled_start_time) }}</strong></span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>End: <strong class="text-gray-900">{{ formatTimeOnly(session.scheduled_end_time) }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Right Activity/Action -->
            <div class="flex flex-col sm:flex-row lg:flex-col items-center sm:items-end gap-6 w-full lg:w-auto shrink-0">
               
               <!-- Mini Progress Stats -->
               <div class="w-full sm:w-48 lg:w-full bg-gray-50 rounded-lg p-3 border border-gray-100">
                 <div class="flex justify-between text-xs font-medium text-gray-500 mb-1">
                   <span>Enrolled: {{ session.total_students_enrolled }}</span>
                   <span class="text-green-600">Sub: {{ session.students_submitted }}</span>
                 </div>
                 
                 <div class="w-full h-1.5 flex rounded-full overflow-hidden bg-gray-200">
                   <div class="bg-green-500 h-full" :style="`width: ${(session.students_submitted / session.total_students_enrolled) * 100}%`"></div>
                   <div class="bg-blue-400 h-full" :style="`width: ${(session.students_in_progress / session.total_students_enrolled) * 100}%`"></div>
                   <div class="bg-gray-300 h-full" :style="`width: ${(session.students_not_started / session.total_students_enrolled) * 100}%`"></div>
                 </div>
                 
                 <div class="flex justify-between text-xs font-medium text-gray-500 mt-1.5">
                   <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-400 block"></span> In Prog: {{ session.students_in_progress }}</span>
                   <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-300 block"></span> Wait: {{ session.students_not_started }}</span>
                 </div>
               </div>

               <!-- Primary Interaction Buttons -->
               <div class="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
                 
                 <!-- Scheduled State Actions -->
                 <template v-if="session.status === 'scheduled'">
                   <button 
                     @click="startExam(session.live_session_id)"
                     class="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2"
                   >
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     Start Early
                   </button>
                   <button 
                     @click="router.push(`/admin/sessions/${session.live_session_id}/credentials`)"
                     class="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center"
                   >
                     View Setup
                   </button>
                 </template>

                 <!-- Live State Actions -->
                 <template v-else-if="session.status === 'live'">
                   <button 
                     @click="router.push(`/admin/sessions/${session.live_session_id}/monitor`)"
                     class="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-700 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                   >
                     <svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                     Monitor Live
                   </button>
                 </template>

                 <!-- Completed State Actions -->
                 <template v-else-if="session.status === 'completed'">
                   <button 
                     @click="router.push(`/admin/sessions/${session.live_session_id}/results`)"
                     class="flex-1 sm:flex-none px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold rounded-lg hover:bg-green-100 transition-all flex items-center justify-center gap-2"
                   >
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                     View Results
                   </button>
                 </template>

               </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAdminStore } from '../../stores/adminStore'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()
const loading = ref(true)
const rawSessions = ref([])
const activeTab = ref('all')
const pollInterval = ref(null)

const filteredSessions = computed(() => {
  if (activeTab.value === 'all') return rawSessions.value
  return rawSessions.value.filter(s => s.status === activeTab.value)
})

const fetchSessions = async () => {
  try {
    if (!adminStore.adminProfile?.admin_id) return
    const { data, error } = await supabase.rpc('get_admin_live_sessions', {
      input_admin_id: adminStore.adminProfile.admin_id
    })
    if (error) throw error
    rawSessions.value = data || []
  } catch (err) {
    console.error('Failed fetching live sessions:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchSessions()
  
  // If there is an active live session, and we are not explicitly bypassing the redirection,
  // automatically redirect straight to the live monitor page!
  if (route.query.noRedirect !== 'true') {
    const liveSession = rawSessions.value.find(s => s.status === 'live')
    if (liveSession) {
      router.replace(`/admin/sessions/${liveSession.live_session_id}/monitor`)
      return
    }
  }
  
  // Set up polling interval to keep stats fresh without hard reload
  pollInterval.value = setInterval(() => {
    fetchSessions()
  }, 10000)
})

onUnmounted(() => {
  if (pollInterval.value) clearInterval(pollInterval.value)
})

const startExam = async (sessionId) => {
  if (!confirm('Are you sure you want to FORCE start this exam now? All enrolled students will be able to begin immediately.')) return
  
  loading.value = true
  try {
    const { error } = await supabase.rpc('admin_start_exam', {
      input_admin_id: adminStore.adminProfile.admin_id,
      input_live_session_id: sessionId
    })
    if (error) throw error
    await fetchSessions()
    
    // Quick redirect to monitoring screen
    router.push(`/admin/sessions/${sessionId}/monitor`)
  } catch (err) {
    console.error('Failed to start exam:', err)
    alert(err.message || 'Failed to start exam')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(new Date(dateStr))
}

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '-'
  return new Intl.DateTimeFormat('en-US', { 
    hour: 'numeric', minute: '2-digit'
  }).format(new Date(dateStr))
}
</script>
