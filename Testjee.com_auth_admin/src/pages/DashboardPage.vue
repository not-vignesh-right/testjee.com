<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-sm mt-1">Manage student approvals and test allocations</p>
    </div>

    <!-- Stats -->
    <StatsBar
      :totalStudents="students.length"
      :pendingCount="pendingStudents.length"
      :approvedCount="approvedStudents.length"
      :totalTests="totalTestsAllocated"
    />

    <!-- Pending Approvals Section -->
    <section v-if="pendingStudents.length > 0">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          Pending Approvals
          <span class="text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{{ pendingStudents.length }}</span>
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PendingCard
          v-for="student in pendingStudents"
          :key="student.student_id"
          :student="student"
          :actionLoading="actionLoading"
          @approve="approveStudent"
          @reject="rejectStudent"
        />
      </div>
    </section>

    <!-- All Students Table -->
    <section>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 class="text-lg font-bold text-gray-900">All Students</h2>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Search -->
          <div class="relative flex-1 sm:w-72">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name, email, or mobile..."
              class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <!-- Filter -->
          <select
            v-model="filterStatus"
            class="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-16">
          <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" @click="sortBy('student_name')">
                  Name
                  <span v-if="sortField === 'student_name'" class="ml-1 text-blue-600">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-600 hidden md:table-cell">Mobile</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" @click="sortBy('number_of_tests')">
                  Tests
                  <span v-if="sortField === 'number_of_tests'" class="ml-1 text-blue-600">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors" @click="sortBy('creation_date')">
                  Created
                  <span v-if="sortField === 'creation_date'" class="ml-1 text-blue-600">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="7" class="text-center py-12 text-gray-400">
                  <svg class="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  No students found
                </td>
              </tr>
              <tr
                v-for="student in filteredStudents"
                :key="student.student_id"
                @click="goToDetail(student.student_id)"
                class="border-b border-gray-100 hover:bg-blue-50/40 cursor-pointer transition-colors group"
              >
                <td class="py-3 px-4">
                  <span class="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{{ student.student_name }}</span>
                </td>
                <td class="py-3 px-4 text-gray-600">{{ student.email_id }}</td>
                <td class="py-3 px-4 text-gray-500 hidden md:table-cell">{{ student.mobile_number || '—' }}</td>
                <td class="py-3 px-4 text-center">
                  <span class="inline-flex items-center gap-1">
                    <span class="font-bold text-gray-900">{{ student.number_of_tests || 0 }}</span>
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    :class="student.is_approved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'"
                    class="text-xs font-bold px-2.5 py-1 rounded-full"
                  >
                    {{ student.is_approved ? 'Approved' : 'Pending' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center text-gray-500 text-xs">{{ formatDate(student.creation_date) }}</td>
                <td class="py-3 px-4 text-center" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button
                      v-if="!student.is_approved"
                      @click="approveStudent(student)"
                      :disabled="actionLoading"
                      class="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button
                      v-if="student.is_approved"
                      @click="revokeStudent(student)"
                      :disabled="actionLoading"
                      class="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Revoke Approval"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                    </button>
                    <button
                      @click="incrementTests(student)"
                      :disabled="actionLoading"
                      class="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Add 1 Test"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </button>
                    <button
                      @click="decrementTests(student)"
                      :disabled="actionLoading || (student.number_of_tests || 0) <= 0"
                      class="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-30"
                      title="Remove 1 Test"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import StatsBar from '../components/StatsBar.vue'
import PendingCard from '../components/PendingCard.vue'

const router = useRouter()
const showToast = inject('showToast')
const refreshTrigger = inject('refreshTrigger')

const students = ref([])
const loading = ref(true)
const actionLoading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const sortField = ref('creation_date')
const sortDir = ref('desc')

// Computed
const pendingStudents = computed(() => students.value.filter(s => !s.is_approved))
const approvedStudents = computed(() => students.value.filter(s => s.is_approved))
const totalTestsAllocated = computed(() => students.value.reduce((sum, s) => sum + (s.number_of_tests || 0), 0))

const filteredStudents = computed(() => {
  let result = [...students.value]

  // Filter
  if (filterStatus.value === 'pending') result = result.filter(s => !s.is_approved)
  else if (filterStatus.value === 'approved') result = result.filter(s => s.is_approved)

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      (s.student_name || '').toLowerCase().includes(q) ||
      (s.email_id || '').toLowerCase().includes(q) ||
      (s.mobile_number || '').toLowerCase().includes(q)
    )
  }

  // Sort
  result.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]
    if (sortField.value === 'creation_date') {
      aVal = new Date(aVal || 0).getTime()
      bVal = new Date(bVal || 0).getTime()
    }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()
    if (aVal < bVal) return sortDir.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

// Methods
async function fetchStudents() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('creation_date', { ascending: false })

    if (error) throw error
    students.value = data || []
  } catch (err) {
    console.error('Failed to fetch students:', err)
    showToast('Failed to load students', 'error')
  } finally {
    loading.value = false
  }
}

function sortBy(field) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

function goToDetail(id) {
  router.push(`/students/${id}`)
}

async function approveStudent(student) {
  actionLoading.value = true
  try {
    const { error } = await supabase
      .from('students')
      .update({ is_approved: true, modification_date: new Date().toISOString() })
      .eq('student_id', student.student_id)

    if (error) throw error

    student.is_approved = true
    showToast(`${student.student_name} has been approved!`)
  } catch (err) {
    console.error('Approve error:', err)
    showToast('Failed to approve student', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function revokeStudent(student) {
  actionLoading.value = true
  try {
    const { error } = await supabase
      .from('students')
      .update({ is_approved: false, modification_date: new Date().toISOString() })
      .eq('student_id', student.student_id)

    if (error) throw error

    student.is_approved = false
    showToast(`${student.student_name}'s approval has been revoked`)
  } catch (err) {
    console.error('Revoke error:', err)
    showToast('Failed to revoke approval', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function rejectStudent(student) {
  if (!confirm(`Are you sure you want to reject and delete ${student.student_name}? This cannot be undone.`)) return

  actionLoading.value = true
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('student_id', student.student_id)

    if (error) throw error

    students.value = students.value.filter(s => s.student_id !== student.student_id)
    showToast(`${student.student_name} has been rejected and removed`)
  } catch (err) {
    console.error('Reject error:', err)
    showToast('Failed to reject student', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function incrementTests(student) {
  actionLoading.value = true
  const newCount = (student.number_of_tests || 0) + 1
  try {
    const { error } = await supabase
      .from('students')
      .update({ number_of_tests: newCount, modification_date: new Date().toISOString() })
      .eq('student_id', student.student_id)

    if (error) throw error

    student.number_of_tests = newCount
    showToast(`${student.student_name} now has ${newCount} test(s)`)
  } catch (err) {
    console.error('Increment tests error:', err)
    showToast('Failed to update tests', 'error')
  } finally {
    actionLoading.value = false
  }
}

async function decrementTests(student) {
  if ((student.number_of_tests || 0) <= 0) return
  actionLoading.value = true
  const newCount = student.number_of_tests - 1
  try {
    const { error } = await supabase
      .from('students')
      .update({ number_of_tests: newCount, modification_date: new Date().toISOString() })
      .eq('student_id', student.student_id)

    if (error) throw error

    student.number_of_tests = newCount
    showToast(`${student.student_name} now has ${newCount} test(s)`)
  } catch (err) {
    console.error('Decrement tests error:', err)
    showToast('Failed to update tests', 'error')
  } finally {
    actionLoading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// Lifecycle
onMounted(fetchStudents)

// Watch refresh trigger from header
watch(refreshTrigger, () => {
  fetchStudents()
})
</script>
