<template>
  <div class="animate-fade-in">
    <!-- Back button -->
    <button @click="router.push('/')" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 text-sm font-medium transition-colors group">
      <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back to Dashboard
    </button>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Not found -->
    <div v-else-if="!student" class="text-center py-24">
      <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h3 class="text-lg font-bold text-gray-700 mb-1">Student Not Found</h3>
      <p class="text-gray-500 text-sm">The student with this ID does not exist.</p>
    </div>

    <!-- Student Detail -->
    <div v-else class="space-y-6">
      <!-- Student Header Card -->
      <div class="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div class="p-6 md:p-8 border-b border-gray-100">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-200/50">
                {{ initials }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ student.student_name }}</h2>
                <p class="text-sm text-gray-500">{{ student.email_id }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="student.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                class="text-sm font-bold px-3 py-1.5 rounded-full"
              >
                {{ student.is_approved ? '✓ Approved' : '⏳ Pending' }}
              </span>
              <button
                @click="toggleApproval"
                :disabled="saving"
                :class="student.is_approved
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-green-600 text-white hover:bg-green-700'"
                class="px-4 py-2 text-sm font-semibold rounded-xl border transition-all disabled:opacity-50"
              >
                {{ student.is_approved ? 'Revoke' : 'Approve Now' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Personal Info -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Personal Info
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input v-model="form.student_name" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Email (Read Only)</label>
                <div class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed">{{ student.email_id }}</div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Mobile Number</label>
                <input v-model="form.mobile_number" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="e.g. 9876543210" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Class</label>
                <select v-model="form.class" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer transition-all">
                  <option value="">Not Set</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                  <option value="Dropper">Dropper</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Parent / Guardian Info -->
          <div class="space-y-4">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Parent / Guardian
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Parent Name</label>
                <input v-model="form.parent_name" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="Parent name" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Parent Mobile</label>
                <input v-model="form.parent_number" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="Parent mobile" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1">Parent Email</label>
                <input v-model="form.parent_email_id" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="parent@example.com" />
              </div>
            </div>
          </div>
        </div>

        <!-- Test Count Adjuster -->
        <div class="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
          <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Test Allocation
          </h3>
          <div class="flex items-center gap-4">
            <button
              @click="form.number_of_tests = Math.max(0, form.number_of_tests - 1)"
              class="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-bold text-lg"
            >−</button>
            <input
              v-model.number="form.number_of_tests"
              type="number"
              min="0"
              class="w-24 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-center text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
            />
            <button
              @click="form.number_of_tests++"
              class="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all font-bold text-lg"
            >+</button>
            <span class="text-sm text-gray-500 font-medium">test(s)</span>
          </div>
        </div>

        <!-- Save Button -->
        <div class="p-6 md:p-8 border-t border-gray-100 flex items-center gap-4">
          <button
            @click="saveChanges"
            :disabled="saving"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-200/50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ saving ? 'Saving...' : 'Save All Changes' }}
          </button>
          <span v-if="saveMsg" :class="saveMsgType === 'success' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">{{ saveMsg }}</span>
        </div>
      </div>

      <!-- Metadata -->
      <div class="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          System Info
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-gray-500 block text-xs font-semibold mb-0.5">Student ID</span>
            <span class="text-gray-900 font-medium">{{ student.student_id }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-xs font-semibold mb-0.5">Supabase UID</span>
            <span class="text-gray-900 font-medium text-xs break-all">{{ student.supabase_user_id || '—' }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-xs font-semibold mb-0.5">Created</span>
            <span class="text-gray-900 font-medium">{{ formatDateTime(student.creation_date) }}</span>
          </div>
          <div>
            <span class="text-gray-500 block text-xs font-semibold mb-0.5">Last Modified</span>
            <span class="text-gray-900 font-medium">{{ formatDateTime(student.modification_date) }}</span>
          </div>
        </div>
      </div>

      <!-- Exam History -->
      <div class="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Exam History
          </h3>
        </div>
        <div v-if="examSessions.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg class="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <p class="text-sm">No exam sessions yet</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200">
              <th class="text-left py-3 px-4 font-semibold text-gray-600">Exam Type</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-600">Started</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600">Submitted</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in examSessions" :key="session.session_id" class="border-b border-gray-100">
              <td class="py-3 px-4 font-medium text-gray-900">{{ session.exam_type }}</td>
              <td class="py-3 px-4 text-gray-500">{{ formatDateTime(session.start_time) }}</td>
              <td class="py-3 px-4 text-center">
                <span :class="session.is_submitted ? 'text-green-600' : 'text-amber-600'" class="font-semibold">{{ session.is_submitted ? 'Yes' : 'No' }}</span>
              </td>
              <td class="py-3 px-4 text-center font-bold text-gray-900">{{ session.score ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const route = useRoute()
const router = useRouter()
const showToast = inject('showToast')

const student = ref(null)
const loading = ref(true)
const saving = ref(false)
const saveMsg = ref('')
const saveMsgType = ref('')
const examSessions = ref([])

const form = reactive({
  student_name: '',
  mobile_number: '',
  class: '',
  parent_name: '',
  parent_number: '',
  parent_email_id: '',
  number_of_tests: 0
})

const initials = computed(() => {
  if (!student.value?.student_name) return '?'
  const parts = student.value.student_name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase()
})

async function fetchStudent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', parseInt(route.params.id))
      .maybeSingle()

    if (error) throw error
    if (!data) { loading.value = false; return }

    student.value = data
    form.student_name = data.student_name || ''
    form.mobile_number = data.mobile_number || ''
    form.class = data.class || ''
    form.parent_name = data.parent_name || ''
    form.parent_number = data.parent_number || ''
    form.parent_email_id = data.parent_email_id || ''
    form.number_of_tests = data.number_of_tests || 0

    // Fetch exam sessions + results
    await fetchExamHistory(data.student_id)
  } catch (err) {
    console.error('Failed to fetch student:', err)
    showToast('Failed to load student', 'error')
  } finally {
    loading.value = false
  }
}

async function fetchExamHistory(studentId) {
  try {
    const { data: sessions, error: sessError } = await supabase
      .from('exam_sessions')
      .select('session_id, exam_type, start_time, end_time, is_submitted')
      .eq('student_id', studentId)
      .order('start_time', { ascending: false })

    if (sessError) throw sessError

    // Fetch results for these sessions
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map(s => s.session_id)
      const { data: results } = await supabase
        .from('results')
        .select('session_id, score')
        .in('session_id', sessionIds)

      const resultMap = {}
      if (results) {
        results.forEach(r => { resultMap[r.session_id] = r.score })
      }

      examSessions.value = sessions.map(s => ({
        ...s,
        score: resultMap[s.session_id] ?? null
      }))
    }
  } catch (err) {
    console.error('Failed to fetch exam history:', err)
  }
}

async function toggleApproval() {
  saving.value = true
  try {
    const newVal = !student.value.is_approved
    const { error } = await supabase
      .from('students')
      .update({ is_approved: newVal, modification_date: new Date().toISOString() })
      .eq('student_id', student.value.student_id)

    if (error) throw error
    student.value.is_approved = newVal
    showToast(newVal ? 'Student approved!' : 'Approval revoked')
  } catch (err) {
    console.error('Toggle approval error:', err)
    showToast('Failed to update approval', 'error')
  } finally {
    saving.value = false
  }
}

async function saveChanges() {
  saving.value = true
  saveMsg.value = ''
  try {
    const updates = {
      student_name: form.student_name.trim() || student.value.student_name,
      mobile_number: form.mobile_number?.trim() || null,
      class: form.class || null,
      parent_name: form.parent_name?.trim() || null,
      parent_number: form.parent_number?.trim() || null,
      parent_email_id: form.parent_email_id?.trim() || null,
      number_of_tests: form.number_of_tests,
      modification_date: new Date().toISOString()
    }

    const { error } = await supabase
      .from('students')
      .update(updates)
      .eq('student_id', student.value.student_id)

    if (error) throw error

    // Update local
    Object.assign(student.value, updates)
    saveMsg.value = 'Changes saved successfully!'
    saveMsgType.value = 'success'
    showToast('All changes saved!')
    setTimeout(() => { saveMsg.value = '' }, 4000)
  } catch (err) {
    console.error('Save error:', err)
    saveMsg.value = err.message || 'Failed to save'
    saveMsgType.value = 'error'
    showToast('Failed to save changes', 'error')
  } finally {
    saving.value = false
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(fetchStudent)
</script>
