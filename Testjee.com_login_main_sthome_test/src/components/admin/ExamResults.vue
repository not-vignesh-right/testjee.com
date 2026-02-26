<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    
    <div v-if="loading" class="flex justify-center my-20">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Main Results View -->
    <div v-else-if="sessionMeta" class="space-y-6">
      
      <!-- Header / Nav -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button @click="router.push('/admin/sessions')" class="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border bg-green-200">Completed</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 leading-tight flex items-center gap-3">
               {{ sessionMeta.session_name }} Results
               <span class="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 font-normal">CODE: {{ sessionMeta.session_code }}</span>
            </h1>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
           <button class="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-colors gap-2 cursor-pointer">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Export Excel (WIP)
           </button>
        </div>
      </div>

      <!-- Quick Stats Strip -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-gray-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             <h3 class="text-sm font-medium">Students Appeared</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ results.length }} <span class="text-sm font-normal text-gray-500">of {{ sessionMeta.total_students_enrolled }}</span></div>
        </div>
        
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-blue-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             <h3 class="text-sm font-medium">Average Score</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ averageScore.toFixed(1) }} <span class="text-sm font-normal text-gray-500">/ {{ maxScore }}</span></div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-green-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
             <h3 class="text-sm font-medium">Highest Score</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ highestScore }} <span class="text-sm font-normal text-gray-500">/ {{ maxScore }}</span></div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
           <div class="flex items-center gap-2 text-purple-500 mb-2">
             <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
             <h3 class="text-sm font-medium">Pass Rate (>40%)</h3>
           </div>
           <div class="text-2xl font-bold text-gray-900">{{ passRateText }}%</div>
        </div>
      </div>

      <!-- Master Leaderboard Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 class="text-lg font-bold text-gray-900">Student Rankings & Leaderboard</h2>
          <!-- Search omitted for now, UI scaffolding placeholder -->
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
             <thead class="bg-gray-50 border-b border-gray-200">
               <tr>
                 <th class="p-4 font-semibold text-gray-600 w-24 text-center">Rank</th>
                 <th class="p-4 font-semibold text-gray-600">Student Name</th>
                 <th class="p-4 font-semibold text-gray-600 w-32">Status</th>
                 <th class="p-4 font-semibold text-gray-600 text-right w-32">Score</th>
                 <th class="p-4 font-semibold text-gray-600 text-right w-32">%</th>
                 <th class="p-4 font-semibold text-gray-600 text-right w-40">Time Taken</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-gray-100">
                <tr v-for="student in results" :key="student.username" class="hover:bg-gray-50/80 transition-colors group">
                   
                   <td class="p-4 text-center">
                     <div class="flex items-center justify-center">
                       <span v-if="student.rank === 1" class="w-8 h-8 flex items-center justify-center bg-yellow-100 text-yellow-700 font-bold rounded-full shadow-sm text-lg">🥇</span>
                       <span v-else-if="student.rank === 2" class="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 font-bold rounded-full shadow-sm text-lg">🥈</span>
                       <span v-else-if="student.rank === 3" class="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-700 font-bold rounded-full shadow-sm text-lg">🥉</span>
                       <span v-else class="text-gray-500 font-semibold">{{ student.rank || '-' }}</span>
                     </div>
                   </td>
                   
                   <td class="p-4">
                     <div class="font-bold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors">{{ student.student_name || 'Anonymous' }}</div>
                     <div class="text-xs text-gray-500 font-mono">{{ student.username }} • {{ student.roll_number || 'No Roll' }}</div>
                   </td>
                   
                   <td class="p-4">
                     <span 
                      class="px-2 py-1 rounded text-xs font-bold uppercase"
                      :class="{
                        'bg-gray-100 text-gray-600': student.status === 'not_started',
                        'bg-blue-100 text-blue-800 border-blue-200': student.status === 'in_progress',
                        'bg-green-100 text-green-800 border-green-200': student.status === 'submitted',
                        'bg-orange-100 text-orange-800 border-orange-200': student.status === 'auto_submitted'
                      }"
                     >
                      {{ student.status === 'auto_submitted' ? 'Auto-Sub' : student.status.replace('_', ' ') }}
                     </span>
                   </td>
                   
                   <td class="p-4 text-right">
                     <span class="font-bold text-gray-900 text-base" :class="{'text-red-600': (student.percentage||0) < 40}">{{ student.score ?? '-' }}</span> 
                     <span class="text-gray-400 text-xs">/ {{ maxScore }}</span>
                   </td>
                   
                   <td class="p-4 text-right font-semibold text-gray-700">
                     {{ student.percentage ? Number(student.percentage).toFixed(1) + '%' : '-' }}
                   </td>
                   
                   <td class="p-4 text-right font-mono text-gray-600">
                     {{ formatDuration(student.time_taken_seconds) }}
                   </td>
                   
                </tr>
                <tr v-if="results.length === 0">
                   <td colspan="6" class="p-12 text-center text-gray-500">
                      No results data found.
                   </td>
                </tr>
             </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAdminStore } from '../../stores/adminStore'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const loading = ref(true)
const sessionMeta = ref(null)
const results = ref([])

const sessionId = parseInt(route.params.id)

onMounted(async () => {
  if (!adminStore.adminProfile?.admin_id) return
  
  try {
    // 1. Fetch meta
    const { data: metaData } = await supabase.rpc('get_admin_live_sessions', {
      input_admin_id: adminStore.adminProfile.admin_id
    })
    
    // Safety check map
    const theSession = metaData?.find(m => m.live_session_id === sessionId)
    if (!theSession) {
      router.push('/admin/sessions')
      return
    }

    sessionMeta.value = theSession
    
    // 2. Fetch specific results
    const { data: resultsData } = await supabase.rpc('get_session_results', {
       input_admin_id: adminStore.adminProfile.admin_id,
       input_live_session_id: sessionId
    })
    
    results.value = resultsData?.filter(r => r.status === 'submitted' || r.status === 'auto_submitted') || []

  } catch (err) {
    console.error('Results load error:', err)
  } finally {
    loading.value = false
  }
})

// Computed Analytics
const maxScore = computed(() => {
   if (results.value.length === 0) return 0
   return results.value[0].max_score // Assume uniformly fetched
})

const averageScore = computed(() => {
   if (results.value.length === 0) return 0
   const sum = results.value.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0)
   return sum / results.value.length
})

const highestScore = computed(() => {
  if (results.value.length === 0) return 0
  return Math.max(...results.value.map(s => Number(s.score) || 0))
})

const passRateText = computed(() => {
  if (results.value.length === 0) return 0
  const passes = results.value.filter(s => (Number(s.percentage) || 0) >= 40)
  return ((passes.length / results.value.length) * 100).toFixed(1)
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
