<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 leading-tight">Resume Requests</h2>
        <p class="mt-1 text-sm text-gray-500">Review and approve student exam resumption appeals.</p>
      </div>
      <button
        @click="loadRequests"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
      >
        <svg class="w-4 h-4" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 relative"
        :class="activeTab === tab.value
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'"
      >
        {{ tab.label }}
        <span
          v-if="tab.value === 'pending' && pendingCount > 0"
          class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >{{ pendingCount }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRequests.length === 0" class="text-center py-20 bg-white rounded-2xl border border-gray-200">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p class="text-gray-500 font-medium">No {{ activeTab }} requests</p>
      <p class="text-gray-400 text-sm mt-1">{{ activeTab === 'pending' ? 'All caught up! No pending resume appeals.' : 'No requests with this status yet.' }}</p>
    </div>

    <!-- Request Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="req in filteredRequests"
        :key="req.request_id"
        class="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
        :class="{
          'border-amber-200': req.status === 'pending',
          'border-green-200': req.status === 'approved',
          'border-red-200': req.status === 'rejected',
          'border-gray-200': req.status === 'completed',
        }"
      >
        <!-- Card Header -->
        <div class="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <!-- Status badge -->
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider"
              :class="{
                'bg-amber-100 text-amber-700': req.status === 'pending',
                'bg-green-100 text-green-700': req.status === 'approved',
                'bg-red-100 text-red-700': req.status === 'rejected',
                'bg-gray-100 text-gray-600': req.status === 'completed',
              }"
            >
              <span class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-amber-500 animate-pulse': req.status === 'pending',
                  'bg-green-500': req.status === 'approved',
                  'bg-red-500': req.status === 'rejected',
                  'bg-gray-400': req.status === 'completed',
                }"
              ></span>
              {{ req.status }}
            </span>
            <div>
              <p class="font-bold text-gray-900 text-sm">{{ req.student_name || req.student_id }}</p>
              <p class="text-xs text-gray-500">{{ req.student_email || '' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span class="font-medium text-gray-700">{{ getExamLabel(req.exam_type) }}</span>
            <span>·</span>
            <span>{{ formatDateTime(req.created_at) }}</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Reason -->
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reason</p>
            <p class="text-sm text-gray-800 font-medium">{{ req.reason }}</p>
            <p v-if="req.custom_message" class="text-xs text-gray-500 mt-1 italic">"{{ req.custom_message }}"</p>
          </div>
          <!-- Time Info -->
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remaining Time at Appeal</p>
            <p class="text-sm font-bold text-gray-800">{{ formatSeconds(req.remaining_time_seconds) }}</p>
          </div>
          <!-- Answers snapshot count -->
          <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Answers Snapshot</p>
            <p class="text-sm text-gray-700">
              {{ req.answers ? req.answers.filter(a => a?.answer).length : 0 }}
              / {{ req.answers?.length || 0 }} answered
            </p>
          </div>
        </div>

        <!-- Action Buttons (only for pending) -->
        <div v-if="req.status === 'pending'" class="px-6 pb-5 flex gap-3">
          <button
            @click="approveRequest(req)"
            :disabled="actionLoadingId === req.request_id"
            class="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="actionLoadingId === req.request_id" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Approve &amp; Reopen
          </button>
          <button
            @click="rejectRequest(req)"
            :disabled="actionLoadingId === req.request_id"
            class="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Reject
          </button>
        </div>

        <!-- Confirm modal inline (shown per card) -->
        <div v-if="confirmingRejectId === req.request_id" class="mx-6 mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-sm font-semibold text-red-700 mb-3">Are you sure you want to reject this request? The student will not be able to resume.</p>
          <div class="flex gap-3">
            <button @click="confirmReject(req)" class="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">Yes, Reject</button>
            <button @click="confirmingRejectId = null" class="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>

        <!-- Action Result Banner -->
        <div v-if="actionResult[req.request_id]"
          class="mx-6 mb-5 px-4 py-2.5 rounded-xl text-sm font-semibold"
          :class="actionResult[req.request_id].success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'"
        >
          {{ actionResult[req.request_id].message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../../lib/supabase'

const loading = ref(true)
const requests = ref([])
const activeTab = ref('pending')
const actionLoadingId = ref(null)
const confirmingRejectId = ref(null)
const actionResult = ref({}) // { [request_id]: { success, message } }
let autoRefreshInterval = null

const tabs = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
]

const pendingCount = computed(() => requests.value.filter(r => r.status === 'pending').length)

const filteredRequests = computed(() => {
  return requests.value.filter(r => r.status === activeTab.value)
})

async function loadRequests() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('exam_support_requests')
      .select(`
        request_id,
        session_id,
        student_id,
        reason,
        custom_message,
        remaining_time_seconds,
        answers,
        status,
        created_at,
        exam_sessions (
          exam_type,
          start_time,
          total_duration_seconds
        ),
        students (
          student_name,
          email_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    requests.value = (data || []).map(r => ({
      ...r,
      exam_type: r.exam_sessions?.exam_type,
      student_name: r.students?.student_name,
      student_email: r.students?.email_id,
    }))
  } catch (err) {
    console.error('Error loading resume requests:', err)
  } finally {
    loading.value = false
  }
}

async function approveRequest(req) {
  actionLoadingId.value = req.request_id
  actionResult.value[req.request_id] = null
  try {
    // 1. Update support request status to 'approved'
    const { error: reqErr } = await supabase
      .from('exam_support_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('request_id', req.request_id)
    if (reqErr) throw reqErr

    // 2. CRITICAL (BUG 2 FIX): Reopen the exam session in the DB
    //    Without this, initializeSession() would create a brand-new session
    const { error: sessErr } = await supabase
      .from('exam_sessions')
      .update({ is_submitted: false, end_time: null })
      .eq('session_id', req.session_id)
    if (sessErr) throw sessErr

    actionResult.value[req.request_id] = {
      success: true,
      message: '✅ Approved! Session reopened. Student can now resume their exam.'
    }
    // Update local state
    const idx = requests.value.findIndex(r => r.request_id === req.request_id)
    if (idx !== -1) requests.value[idx].status = 'approved'
  } catch (err) {
    console.error('Approve error:', err)
    actionResult.value[req.request_id] = {
      success: false,
      message: `❌ Failed to approve: ${err.message}`
    }
  } finally {
    actionLoadingId.value = null
  }
}

function rejectRequest(req) {
  confirmingRejectId.value = req.request_id
}

async function confirmReject(req) {
  confirmingRejectId.value = null
  actionLoadingId.value = req.request_id
  actionResult.value[req.request_id] = null
  try {
    const { error } = await supabase
      .from('exam_support_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('request_id', req.request_id)
    if (error) throw error

    actionResult.value[req.request_id] = {
      success: true,
      message: '❌ Request rejected. Student has been notified.'
    }
    const idx = requests.value.findIndex(r => r.request_id === req.request_id)
    if (idx !== -1) requests.value[idx].status = 'rejected'
  } catch (err) {
    console.error('Reject error:', err)
    actionResult.value[req.request_id] = {
      success: false,
      message: `Failed to reject: ${err.message}`
    }
  } finally {
    actionLoadingId.value = null
  }
}

function getExamLabel(examType) {
  const map = {
    JEE_MAIN_FULL: 'JEE Main',
    NEET_UG_FULL: 'NEET UG',
    KCET_PHYSICS: 'KCET Physics',
    KCET_CHEMISTRY: 'KCET Chemistry',
    KCET_MATHEMATICS: 'KCET Maths',
    KCET_BIOLOGY: 'KCET Biology',
  }
  return map[examType] || examType || 'Mock Test'
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatSeconds(secs) {
  if (!secs && secs !== 0) return '—'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

onMounted(async () => {
  await loadRequests()
  // Auto-refresh every 30 seconds to catch new requests
  autoRefreshInterval = setInterval(loadRequests, 30000)
})

onUnmounted(() => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval)
})
</script>
