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
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            @click="copyLink"
            class="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex-1 sm:flex-none justify-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            {{ copySuccess ? 'Copied!' : 'Copy Link' }}
          </button>
          <button
            @click="shareWhatsApp"
            class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex-1 sm:flex-none justify-center"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.83 14.11c-.24.68-1.4 1.3-1.93 1.36-.52.06-1 .27-3.36-.7-2.85-1.18-4.68-4.05-4.82-4.24-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.57.81 1.98.88 2.13.07.14.11.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.36-.23.6-.14.24.09 1.55.73 1.81.86.26.14.44.2.5.31.06.12.06.65-.18 1.33z"/></svg>
            Share on WhatsApp
          </button>
          <button
            @click="printCredentials"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex-1 sm:flex-none justify-center"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <!-- Admin Controls: kept visually distinct from the Copy/WhatsApp/Print row above,
           since those are distribution actions and these are session lifecycle actions.
           Only shown while the session hasn't started yet. -->
      <div v-if="meta.status === 'scheduled'" class="mb-6 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="text-sm font-bold text-gray-700">Admin Controls</p>
            <p class="text-xs text-gray-500 mt-0.5">
              Scheduled start: <strong class="text-gray-700">{{ formatDateTime(meta.scheduledStartTime) }}</strong> — manage this session directly from here, no need to go back to the sessions list.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              @click="nudgeStart(5)"
              :disabled="actionLoading"
              title="Push the start time back by 5 minutes"
              class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              +5 min
            </button>
            <button
              @click="openReschedule"
              :disabled="actionLoading"
              class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Reschedule
            </button>
            <button
              @click="cancelSession"
              :disabled="actionLoading"
              class="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Cancel Session
            </button>
            <button
              @click="forceStartExam"
              :disabled="actionLoading"
              class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              Force Start Exam
            </button>
          </div>
        </div>

        <!-- Reschedule inline form -->
        <div v-if="showReschedule" class="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-end gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">New start date &amp; time</label>
            <input
              v-model="rescheduleForm.startTime"
              type="datetime-local"
              class="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Duration (minutes)</label>
            <input
              v-model.number="rescheduleForm.durationMinutes"
              type="number"
              min="30" max="300"
              class="w-28 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
            />
          </div>
          <button
            @click="submitReschedule"
            :disabled="actionLoading || !rescheduleForm.startTime"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
      <div v-if="actionError" class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
        {{ actionError }}
      </div>
      <div v-if="actionSuccess" class="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
        {{ actionSuccess }}
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
               <div class="flex items-center gap-2 mt-1">
                 <strong class="text-2xl font-mono text-blue-600 tracking-widest bg-white px-3 py-1 rounded inline-block border border-blue-100 shadow-sm">{{ meta.sessionCode }}</strong>
                 <button
                   type="button"
                   @click="copyLink"
                   class="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                   title="Copy exam link for students"
                 >
                   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                   <span>{{ copySuccess ? 'Copied Link!' : 'Copy Link' }}</span>
                 </button>
               </div>
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
import { ref, computed, onMounted } from 'vue'
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
  credentials: [],
  status: null,
  scheduledStartTime: null,
  durationMinutes: null
})
const actionLoading = ref(false)
const actionError = ref('')
const actionSuccess = ref('')
const showReschedule = ref(false)
const rescheduleForm = ref({ startTime: '', durationMinutes: null })

const sessionId = parseInt(route.params.id)

// Converts an ISO/timestamptz string to the local "YYYY-MM-DDTHH:mm" format <input
// type="datetime-local"> expects, so the field prefills with the current scheduled time.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(async () => {
  // 1. Try sessionStorage first (fast path — just after creation)
  const savedData = sessionStorage.getItem('newSessionCredentials')
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData)
      // Validate the stored data is for THIS session via code presence
      if (parsed.sessionCode && parsed.credentials?.length > 0) {
        meta.value = { ...parsed, status: meta.value.status }
        loading.value = false
        // NEW-05 fix: clear immediately so a later, unrelated session doesn't
        // accidentally pick up these stale credentials from sessionStorage.
        sessionStorage.removeItem('newSessionCredentials')
        await fetchStatus()
        return
      }
    } catch {
      // Corrupt data — fall through to DB fetch
    }
  }

  // 2. Fallback: fetch from Supabase using the session ID
  await fetchFromDatabase()
})

// Fetched separately (and always, regardless of which path populated `meta`) so the Admin
// Controls bar reflects the session's real current status even if it was started/cancelled
// in another tab since this page first loaded its credentials.
const fetchStatus = async () => {
  try {
    const { data } = await supabase
      .from('live_exam_sessions')
      .select('status, scheduled_start_time, duration_minutes')
      .eq('live_session_id', sessionId)
      .maybeSingle()
    meta.value.status = data?.status ?? null
    meta.value.scheduledStartTime = data?.scheduled_start_time ?? null
    meta.value.durationMinutes = data?.duration_minutes ?? null
  } catch (err) {
    console.warn('Could not fetch session status (non-fatal):', err)
  }
}

const fetchFromDatabase = async () => {
  try {
    if (!adminStore.adminProfile?.admin_id) {
      errorMsg.value = 'Admin session expired. Please log in again.'
      return
    }

    // Fetch session metadata (session_code, session_name, admin_test_id, status)
    const { data: sessionData, error: sessionError } = await supabase
      .from('live_exam_sessions')
      .select('session_code, session_name, admin_id, admin_test_id, status, scheduled_start_time, duration_minutes')
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

    // Student credentials live in temp_students (keyed by admin_test_id) — fetched via a
    // token-verified RPC (get_session_credentials) instead of a direct client-side
    // `.from('temp_students')` read. That table has no RLS policies in this project by
    // design (see harden-admin-rpc-security.sql), so a raw client SELECT silently returns
    // zero rows with no error the moment RLS is enabled for any reason — which is exactly
    // the "0 Student Slots after refresh" bug this replaces.
    const { data: studentsData, error: studentsError } = await supabase.rpc('get_session_credentials', {
      p_token: adminStore.getToken(),
      input_live_session_id: sessionId
    })

    if (studentsError) {
      errorMsg.value = 'Failed to load student credentials from the database.'
      return
    }

    meta.value = {
      sessionCode: sessionData.session_code,
      sessionName: sessionData.session_name,
      credentials: studentsData || [],
      status: sessionData.status,
      scheduledStartTime: sessionData.scheduled_start_time,
      durationMinutes: sessionData.duration_minutes
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

// Item 2 (Upcoming Enhancements): session lifecycle controls right on this page, so the
// admin doesn't have to navigate back to the sessions list right after creating a session.
const cancelSession = async () => {
  if (!confirm(`Cancel "${meta.value.sessionName}"? Students will no longer be able to log in with these credentials.`)) return
  actionLoading.value = true
  actionError.value = ''
  try {
    // cancel_live_exam_session is token-verified (see harden-admin-rpc-security.sql)
    const { data, error } = await supabase.rpc('cancel_live_exam_session', {
      p_token: adminStore.getToken(),
      input_live_session_id: sessionId
    })
    if (error) throw error
    if (!data) throw new Error('Session could not be cancelled (it may have already started).')
    router.push('/admin/sessions')
  } catch (err) {
    console.error('Failed to cancel session:', err)
    actionError.value = err.message || 'Failed to cancel session'
  } finally {
    actionLoading.value = false
  }
}

// Reschedule / nudge — see reschedule-live-exam-session-rpc.sql. Both RPCs return the
// session's updated scheduled_start_time/duration so the Admin Controls bar reflects the
// new time immediately without a full refetch. Students already in the lobby pick this up
// live too — see ExamWaitingRoom.vue's checkStatusSafely(), which re-reads the current
// scheduled time on every poll/Realtime tick rather than only reacting to status changes.
function openReschedule() {
  if (!showReschedule.value) {
    rescheduleForm.value = {
      startTime: toDatetimeLocalValue(meta.value.scheduledStartTime),
      durationMinutes: meta.value.durationMinutes
    }
  }
  showReschedule.value = !showReschedule.value
}

const nudgeStart = async (minutes) => {
  actionLoading.value = true
  actionError.value = ''
  actionSuccess.value = ''
  try {
    const { data, error } = await supabase.rpc('nudge_live_exam_session_start', {
      p_token: adminStore.getToken(),
      input_live_session_id: sessionId,
      input_minutes: minutes
    })
    if (error) throw error
    const row = data?.[0]
    if (row) {
      meta.value.scheduledStartTime = row.scheduled_start_time
      actionSuccess.value = `Start time pushed back ${minutes} minutes.`
      setTimeout(() => { actionSuccess.value = '' }, 4000)
    }
  } catch (err) {
    console.error('Failed to nudge session start:', err)
    actionError.value = err.message || 'Failed to adjust start time'
  } finally {
    actionLoading.value = false
  }
}

const submitReschedule = async () => {
  if (!rescheduleForm.value.startTime) return
  actionLoading.value = true
  actionError.value = ''
  actionSuccess.value = ''
  try {
    const { data, error } = await supabase.rpc('reschedule_live_exam_session', {
      p_token: adminStore.getToken(),
      input_live_session_id: sessionId,
      input_new_start_time: new Date(rescheduleForm.value.startTime).toISOString(),
      input_duration_minutes: rescheduleForm.value.durationMinutes || null
    })
    if (error) throw error
    const row = data?.[0]
    if (row) {
      meta.value.scheduledStartTime = row.scheduled_start_time
      meta.value.durationMinutes = row.duration_minutes
      actionSuccess.value = 'Session rescheduled.'
      showReschedule.value = false
      setTimeout(() => { actionSuccess.value = '' }, 4000)
    }
  } catch (err) {
    console.error('Failed to reschedule session:', err)
    actionError.value = err.message || 'Failed to reschedule session'
  } finally {
    actionLoading.value = false
  }
}

function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(new Date(isoString))
}

const forceStartExam = async () => {
  if (!confirm('Start this exam now? All enrolled students will be able to begin immediately.')) return
  actionLoading.value = true
  actionError.value = ''
  try {
    // admin_start_exam has been upgraded to be token-verified (via fix-admin-start-exam-time.sql)
    // and correctly syncs scheduled_start_time so the student sees the exam as started.
    const { error } = await supabase.rpc('admin_start_exam', {
      p_token: adminStore.getToken(),
      input_live_session_id: sessionId
    })
    if (error) throw error
    router.push(`/admin/sessions/${sessionId}/monitor`)
  } catch (err) {
    console.error('Failed to start exam:', err)
    actionError.value = err.message || 'Failed to start exam'
  } finally {
    actionLoading.value = false
  }
}

// 4.5: Copy link + WhatsApp share
const sessionLink = computed(() => `https://login.testjee.com/live-exam/${meta.value.sessionCode}`)
const copySuccess = ref(false)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(sessionLink.value)
    copySuccess.value = true
    setTimeout(() => { copySuccess.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

const shareWhatsApp = () => {
  const text = encodeURIComponent(
    `📝 *Exam Session: ${meta.value.sessionName}*\n` +
    `🔗 Link: ${sessionLink.value}\n` +
    `🔑 Session Code: ${meta.value.sessionCode}\n\n` +
    `Login with your assigned User ID.`
  )
  window.open(`https://wa.me/?text=${text}`, '_blank')
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
