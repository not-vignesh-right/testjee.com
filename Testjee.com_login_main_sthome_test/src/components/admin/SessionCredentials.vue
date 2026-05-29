<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-red-50 p-4 rounded-xl border border-red-200 text-red-700 max-w-md">
        <svg class="w-8 h-8 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="font-semibold">{{ errorMsg }}</p>
        <button @click="router.push('/admin/sessions')" class="mt-4 text-sm text-blue-600 hover:underline font-medium">
          ← Back to Sessions
        </button>
      </div>
    </div>

    <!-- Credentials content -->
    <template v-else-if="meta.sessionCode">
      
      <!-- Page header -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Session Credentials</h1>
          <p class="text-sm text-gray-500 mt-0.5">Distribute these User IDs to students before the exam.</p>
        </div>
        <button
          @click="printCredentials"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors w-full sm:w-auto justify-center"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print / Save PDF
        </button>
      </div>

      <!-- Printable Area Start -->
      <div id="credentials-printable-area" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">

        <!-- Top Overview Box -->
        <div class="p-8 bg-[#F4F7FB] border-b-2 border-blue-500 print:bg-white print:border-black print:pb-4">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide print:text-black">LIVE EXAM CREDENTIALS</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <span class="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Session Name</span>
               <strong class="text-lg text-gray-900">{{ meta.sessionName }}</strong>
            </div>
            <div>
               <span class="block text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Session Code <span class="text-xs font-normal lowercase">(For students)</span></span>
               <strong class="text-2xl font-mono text-blue-600 tracking-widest bg-white px-3 py-1 rounded inline-block border border-blue-100 shadow-sm">{{ meta.sessionCode }}</strong>
            </div>
            <div class="md:col-span-2 mt-2">
              <span class="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Instructions For Students</span>
              <div class="bg-white p-4 rounded-lg border border-gray-200 text-gray-700 text-sm">
                <ol class="list-decimal pl-5 space-y-1">
                  <li>Visit <strong class="text-blue-600">login.testjee.com/live-exam/{{ meta.sessionCode }}</strong></li>
                  <li>Enter the session code and your unique User ID assigned below.</li>
                  <li>Write your real Full Name and Roll Code accurately if prompted.</li>
                  <li>Wait in the lobby for the instructor to begin the exam dynamically.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- Credentials Grid -->
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-semibold text-gray-700">{{ meta.credentials.length }} Student Slots</span>
            <span class="text-xs text-gray-400">User IDs are case-sensitive</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <!-- Loop generation of cards -->
            <div
              v-for="(cred, index) in meta.credentials"
              :key="index"
              class="flex items-center gap-4 p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-blue-400 hover:shadow-sm transition-all print:border-solid print:border-gray-400"
            >
              <div class="bg-blue-100 text-blue-800 font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm">
                {{ index + 1 }}
              </div>
              <div class="overflow-hidden min-w-0">
                 <div class="text-xs text-gray-500 uppercase tracking-wide mb-0.5">User ID</div>
                 <div class="font-mono font-bold text-gray-900 text-base truncate">{{ cred.username }}</div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
      <!-- Printable Area End -->

    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAdminStore } from '../../stores/adminStore'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

const loading = ref(true)
const errorMsg = ref('')
const meta = ref({
  sessionCode: '',
  sessionName: '',
  credentials: []
})

const sessionId = parseInt(route.params.id)

onMounted(async () => {
  // 1. Try sessionStorage first (fast path — just after creation)
  const savedData = sessionStorage.getItem('newSessionCredentials')
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)
      // Validate the stored data is for THIS session via code presence
      if (parsed.sessionCode && parsed.credentials?.length > 0) {
        meta.value = parsed
        loading.value = false
        return
      }
    } catch {
      // Corrupt data — fall through to DB fetch
    }
  }

  // 2. Fallback: fetch from Supabase using the session ID
  await fetchFromDatabase()
})

const fetchFromDatabase = async () => {
  try {
    if (!adminStore.adminProfile?.admin_id) {
      errorMsg.value = 'Admin session expired. Please log in again.'
      return
    }

    // Fetch session metadata (session_code, session_name)
    const { data: sessionData, error: sessionError } = await supabase
      .from('live_exam_sessions')
      .select('session_code, session_name, admin_id')
      .eq('live_session_id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      errorMsg.value = 'Session not found. It may have been deleted.'
      return
    }

    // Security check — confirm this session belongs to this admin
    if (sessionData.admin_id !== adminStore.adminProfile.admin_id) {
      errorMsg.value = 'Access denied. This session belongs to another admin.'
      return
    }

    // Fetch student credentials for this session
    const { data: studentsData, error: studentsError } = await supabase
      .from('live_exam_students')
      .select('username')
      .eq('live_session_id', sessionId)
      .order('created_at', { ascending: true })

    if (studentsError) {
      errorMsg.value = 'Failed to load student credentials from the database.'
      return
    }

    meta.value = {
      sessionCode: sessionData.session_code,
      sessionName: sessionData.session_name,
      credentials: studentsData || []
    }

  } catch (err) {
    console.error('Credentials fetch error:', err)
    errorMsg.value = 'An unexpected error occurred while loading credentials.'
  } finally {
    loading.value = false
  }
}

const printCredentials = () => {
  window.print()
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #credentials-printable-area, #credentials-printable-area * {
    visibility: visible;
  }
  #credentials-printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none !important;
    border: none !important;
  }
  .bg-gray-50 {
    background-color: transparent !important;
  }
}
</style>
