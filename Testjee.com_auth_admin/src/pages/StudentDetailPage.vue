<template>
  <div class="animate-fade-in">
    <!-- Back button -->
    <button @click="router.push({ name: 'Dashboard' })" class="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 text-sm font-medium transition-colors group">
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
            <div class="flex items-center gap-2 flex-wrap">
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
              <!-- Genuine User Toggle -->
              <span
                :class="student.is_genuine_user !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'"
                class="text-sm font-bold px-3 py-1.5 rounded-full"
              >
                {{ student.is_genuine_user !== false ? '👤 Genuine User' : '⚙️ Dev/Internal' }}
              </span>
              <button
                @click="toggleGenuineUser"
                :disabled="saving"
                :class="student.is_genuine_user !== false
                  ? 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'"
                class="px-4 py-2 text-sm font-semibold rounded-xl border transition-all disabled:opacity-50"
              >
                {{ student.is_genuine_user !== false ? 'Mark as Dev' : 'Mark as Genuine' }}
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
            <tr 
              v-for="session in examSessions" 
              :key="session.session_id" 
              class="border-b border-gray-100 transition-colors"
              :class="session.is_submitted ? 'hover:bg-gray-50/80 cursor-pointer' : 'opacity-75 bg-gray-50/20'"
              @click="session.is_submitted && viewSessionAttempt(session)"
            >
              <td class="py-3 px-4 font-medium text-gray-900 flex items-center gap-1.5">
                {{ session.exam_type }}
                <svg v-if="session.is_submitted" class="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </td>
              <td class="py-3 px-4 text-gray-500">{{ formatDateTime(session.start_time) }}</td>
              <td class="py-3 px-4 text-center">
                <span :class="session.is_submitted ? 'text-green-600' : 'text-amber-600'" class="font-semibold">{{ session.is_submitted ? 'Yes' : 'No' }}</span>
              </td>
              <td class="py-3 px-4 text-center font-bold text-gray-900">{{ session.score ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Support logs / appeals -->
      <div class="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536-3.536m0 5.656L11.293 4.17a1 1 0 010-1.414l1.414-1.414a1 1 0 011.414 0l1.414 1.414a1 1 0 010 1.414l-1.414 1.414zm-5.656 5.656l-3.536-3.536m0 5.656L3.293 8.17a1 1 0 010-1.414l1.414-1.414a1 1 0 011.414 0l1.414 1.414a1 1 0 010 1.414l-1.414 1.414z"></path></svg>
            Resumption Request Logs
          </h3>
        </div>
        <div v-if="supportRequests.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg class="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <p class="text-sm">No support logs for this student</p>
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-200">
              <th class="text-left py-3 px-4 font-semibold text-gray-600">Appeal Reason</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-600">Note</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600">Remaining Time</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600">Submitted At</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in supportRequests" :key="req.request_id" class="border-b border-gray-100">
              <td class="py-3 px-4 font-medium text-gray-900">{{ req.reason }}</td>
              <td class="py-3 px-4 text-gray-500 italic">{{ req.custom_message || '—' }}</td>
              <td class="py-3 px-4 text-center font-mono font-semibold">{{ formatSeconds(req.remaining_time_seconds) }}</td>
              <td class="py-3 px-4 text-center text-gray-500 text-xs">{{ formatDateTime(req.created_at) }}</td>
              <td class="py-3 px-4 text-center">
                <span 
                  :class="[
                    req.status === 'pending' ? 'bg-amber-100 text-amber-700' : '',
                    req.status === 'approved' ? 'bg-green-100 text-green-700' : '',
                    req.status === 'rejected' ? 'bg-red-100 text-red-700' : '',
                  ]"
                  class="text-xs font-bold px-2.5 py-0.5 rounded-full border inline-block"
                >
                  {{ req.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <div v-if="req.status === 'pending'" class="flex items-center justify-center gap-1">
                  <button 
                    @click="approveResumeRequest(req)" 
                    :disabled="saving"
                    class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    @click="rejectResumeRequest(req)" 
                    :disabled="saving"
                    class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold transition-all"
                  >
                    Reject
                  </button>
                </div>
                <span v-else class="text-xs text-gray-400 font-medium">Resolved</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Drawer for Student's Detailed Practice Attempt Breakdown -->
  <Teleport to="body">
    <div v-if="selectedSession" class="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm" @click="selectedSession = null">
      <div class="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col" @click.stop>
        <!-- Drawer Header -->
        <div class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <span class="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Practice Exam Review</span>
            <h3 class="text-xl font-bold text-gray-900 mt-1">{{ selectedSession.exam_type }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">Attempted by: {{ student.student_name }} • Date: {{ formatDateTime(selectedSession.start_time) }}</p>
          </div>
          <button @click="selectedSession = null" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Drawer Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div v-if="loadingSessionDetails" class="flex flex-col items-center justify-center py-20">
            <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-gray-500 font-medium">Fetching detailed questions & responses...</p>
          </div>
          
          <template v-else-if="selectedSessionDetails.length > 0">
            <!-- Detailed stats row -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
                <div class="text-xs font-bold text-gray-400 uppercase">Score</div>
                <div class="text-xl font-bold text-gray-900 mt-1">{{ selectedSession.score ?? '-' }}</div>
              </div>
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center">
                <div class="text-xs font-bold text-gray-400 uppercase">Total Questions</div>
                <div class="text-xl font-bold text-blue-600 mt-1">{{ selectedSessionDetails.length }}</div>
              </div>
              <div class="bg-gray-50 p-4 border border-gray-200 rounded-xl text-center col-span-2 md:col-span-1">
                <div class="text-xs font-bold text-gray-400 uppercase">Submitted</div>
                <div class="text-xl font-bold text-green-600 mt-1">Yes</div>
              </div>
            </div>

            <!-- Grouped Grid breakdown -->
            <div v-for="(questions, subject) in selectedSessionGroupedBySubject" :key="subject" class="space-y-3">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div class="w-6 h-6 rounded bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">{{ subject.charAt(0) }}</div>
                <h4 class="font-bold text-gray-800">{{ subject }}</h4>
                <span class="text-xs text-gray-400">({{ questions.length }} questions)</span>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  v-for="q in questions"
                  :key="q.question_id"
                  @click="selectedQuestion = q"
                  class="p-3 border rounded-xl hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  :class="getCardClass(q)"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" :class="getQNumberClass(q)">
                      {{ q.originalIndex + 1 }}
                    </span>
                    <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" :class="getStatusBadgeClass(q)">
                      {{ getQuestionStatusText(q) }}
                    </span>
                  </div>
                  
                  <div class="flex items-center justify-between text-xs font-semibold mt-1">
                    <div>
                      <span class="text-gray-400">Student: </span>
                      <span :class="getAnswerTextColor(q)">{{ q.selected_answer ? q.selected_answer.toUpperCase() : '—' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Correct: </span>
                      <span class="text-green-600">{{ q.correct_answer ? q.correct_answer.toUpperCase() : '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <div v-else class="text-center py-20 text-gray-400">
             <p>No details found for this practice session.</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal for Question Details -->
  <Teleport to="body">
    <div v-if="selectedQuestion" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="selectedQuestion = null">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">Q{{ selectedQuestion.originalIndex + 1 }}</span>
            <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{{ selectedQuestion.subject_name }}</span>
            <span v-if="selectedQuestion.topic_name" class="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{{ selectedQuestion.topic_name }}</span>
            <span class="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full font-mono">{{ selectedQuestion.question_type === 'multiple_choice' ? 'MCQ' : 'Numeric' }}</span>
          </div>
          <button @click="selectedQuestion = null" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Status banner -->
          <div class="rounded-xl p-4 flex items-center justify-between border" :class="getQuestionModalBannerClass(selectedQuestion)">
            <div>
              <p class="text-xs font-black uppercase tracking-wider">{{ getQuestionModalStatusText(selectedQuestion) }}</p>
              <p class="text-sm font-medium text-gray-700 mt-0.5">{{ getQuestionModalStatusSubtitle(selectedQuestion) }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-400 font-semibold uppercase">Time Spent</p>
              <p class="text-lg font-black font-mono">{{ formatSeconds(selectedQuestion.time_spent_seconds) }}</p>
            </div>
          </div>

          <!-- Question Stem -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
              <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Question Stem</h3>
            </div>
            <div class="p-4">
              <img v-if="selectedQuestion.image_url" :src="selectedQuestion.image_url" alt="Question" class="max-w-full h-auto object-contain bg-white rounded-lg mx-auto max-h-80" />
              <p v-else class="text-gray-800 text-base leading-relaxed whitespace-pre-line">{{ selectedQuestion.question_content?.text || selectedQuestion.question_content?.stem || selectedQuestion.external_reference || 'No content.' }}</p>
            </div>
          </div>

          <!-- Choices / Numeric Answer -->
          <div v-if="selectedQuestion.question_type === 'multiple_choice'" class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
              <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Options</h3>
            </div>
            <div class="p-4 space-y-3">
              <div v-for="opt in getQuestionModalOptions(selectedQuestion)" :key="opt.id" class="flex items-start gap-3 p-3 rounded-lg border bg-white" :class="getModalOptClass(selectedQuestion, opt.id)">
                <div class="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0" :class="getModalOptBadgeClass(selectedQuestion, opt.id)">
                  {{ opt.id.toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <img v-if="isUrl(opt.text)" :src="opt.text" class="max-w-full h-auto object-contain bg-white max-h-32" />
                  <p v-else class="text-sm font-medium leading-relaxed text-gray-700">{{ opt.text || '—' }}</p>
                </div>
                <!-- Status tags -->
                <div class="shrink-0 flex items-center gap-1.5 text-xs font-bold">
                  <span v-if="opt.id === selectedQuestion.correct_answer" class="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Correct</span>
                  <span v-if="opt.id === selectedQuestion.selected_answer && opt.id !== selectedQuestion.correct_answer" class="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Student Answer</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Numeric Field -->
          <div v-else-if="selectedQuestion.question_type === 'numeric'" class="grid grid-cols-2 gap-4">
            <div class="rounded-xl p-4 text-center border bg-white" :class="selectedQuestion.is_correct ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'">
              <p class="text-[10px] font-black uppercase tracking-wide text-gray-500">Student's Answer</p>
              <p class="text-2xl font-mono font-bold mt-1" :class="selectedQuestion.is_correct ? 'text-green-700' : 'text-red-700'">{{ selectedQuestion.selected_answer ?? '—' }}</p>
            </div>
            <div class="rounded-xl p-4 text-center border border-green-300 bg-green-50/30 bg-white">
              <p class="text-[10px] font-black uppercase tracking-wide text-green-600">Correct Answer</p>
              <p class="text-2xl font-mono font-bold text-green-700 mt-1">{{ selectedQuestion.correct_answer ?? '—' }}</p>
            </div>
          </div>

          <!-- Solution -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-100/50">
              <h3 class="text-xs font-black uppercase text-gray-500 tracking-wider">Solution / Explanation</h3>
            </div>
            <div class="p-4">
              <img v-if="selectedQuestion.solution && isUrl(selectedQuestion.solution)" :src="selectedQuestion.solution" alt="Solution" class="max-w-full h-auto object-contain bg-white rounded-lg mx-auto max-h-80" />
              <p v-else-if="selectedQuestion.solution" class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{{ selectedQuestion.solution }}</p>
              <p v-else class="text-gray-400 text-sm text-center py-2">No detailed explanation configured for this question.</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </Teleport>
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
const supportRequests = ref([])

const selectedSession = ref(null)
const selectedSessionDetails = ref([])
const loadingSessionDetails = ref(false)
const selectedQuestion = ref(null)

const selectedSessionGroupedBySubject = computed(() => {
  const groups = {}
  selectedSessionDetails.value.forEach((q, idx) => {
    const subject = q.subject_name || 'General'
    if (!groups[subject]) groups[subject] = []
    groups[subject].push({
      ...q,
      originalIndex: idx
    })
  })
  return groups
})

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
    await fetchSupportRequests(data.student_id)
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

async function toggleGenuineUser() {
  saving.value = true
  try {
    const newVal = student.value.is_genuine_user === false ? true : false
    const { error } = await supabase
      .from('students')
      .update({ is_genuine_user: newVal, modification_date: new Date().toISOString() })
      .eq('student_id', student.value.student_id)

    if (error) throw error
    student.value.is_genuine_user = newVal
    showToast(newVal ? 'Marked as Genuine User' : 'Marked as Dev/Internal')
  } catch (err) {
    console.error('Toggle genuine user error:', err)
    showToast('Failed to update user type', 'error')
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

async function fetchSupportRequests(studentId) {
  try {
    const { data, error } = await supabase
      .from('exam_support_requests')
      .select('request_id, session_id, reason, custom_message, status, created_at, remaining_time_seconds, resolved_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    supportRequests.value = data || []
  } catch (err) {
    console.error('Failed to fetch support requests:', err)
  }
}

async function approveResumeRequest(req) {
  if (!confirm(`Are you sure you want to approve resumption? This will clear their scorecard and reopen the exam.`)) return
  
  saving.value = true
  try {
    // 1. Update support request status
    const { error: reqError } = await supabase
      .from('exam_support_requests')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('request_id', req.request_id)
      
    if (reqError) throw reqError

    // 2. Delete result row
    const { error: resultErr } = await supabase
      .from('results')
      .delete()
      .eq('session_id', req.session_id)
      
    if (resultErr) {
      console.warn('Results deletion warning:', resultErr)
    }

    // 3. Reopen exam session in DB
    const { error: sessErr } = await supabase
      .from('exam_sessions')
      .update({
        is_submitted: false,
        start_time: new Date().toISOString(),
        total_duration_seconds: req.remaining_time_seconds,
        end_time: null
      })
      .eq('session_id', req.session_id)

    if (sessErr) throw sessErr

    showToast(`Test resumed successfully!`)
    await fetchSupportRequests(student.value.student_id)
    await fetchExamHistory(student.value.student_id)
  } catch (err) {
    console.error('Approve resumption error:', err)
    showToast('Failed to approve resumption request', 'error')
  } finally {
    saving.value = false
  }
}

async function rejectResumeRequest(req) {
  if (!confirm(`Reject resume request?`)) return
  
  saving.value = true
  try {
    const { error } = await supabase
      .from('exam_support_requests')
      .update({ status: 'rejected', resolved_at: new Date().toISOString() })
      .eq('request_id', req.request_id)

    if (error) throw error

    showToast(`Resume request rejected`)
    await fetchSupportRequests(student.value.student_id)
  } catch (err) {
    console.error('Reject resumption error:', err)
    showToast('Failed to reject request', 'error')
  } finally {
    saving.value = false
  }
}

async function viewSessionAttempt(session) {
  selectedSession.value = session
  loadingSessionDetails.value = true
  selectedSessionDetails.value = []
  
  try {
    // 1. Fetch result row
    const { data: latestResult, error: resultErr } = await supabase
      .from('results')
      .select('result_id, score, answers')
      .eq('session_id', session.session_id)
      .maybeSingle()

    if (resultErr) throw resultErr
    if (!latestResult || !latestResult.answers || !Array.isArray(latestResult.answers)) {
      throw new Error('Result details not found or incomplete')
    }

    const answers = latestResult.answers
    const questionIds = answers.filter(a => a && a.question_id).map(a => a.question_id)

    if (questionIds.length === 0) {
      selectedSessionDetails.value = []
      return
    }

    // 2. Fetch question details + choices from DB
    const { data: questionsData, error: qErr } = await supabase
      .from('questions')
      .select('question_id,question_type,question_content,image_url,solution,external_reference,difficulty,subjects(subject_name),topics(topic_name),choices(choice1,choice2,choice3,choice4,correct_answer)')
      .in('question_id', questionIds)

    if (qErr) throw qErr

    // 3. Build maps
    const questionMap = {}
    const correctById = {}
    ;(questionsData || []).forEach(q => {
      questionMap[q.question_id] = q
      const choicesObj = Array.isArray(q.choices) ? q.choices[0] : q.choices
      if (choicesObj?.correct_answer) {
        correctById[q.question_id] = choicesObj.correct_answer
      }
    })

    // 4. Build per-question analysis array
    selectedSessionDetails.value = answers.map((a, idx) => {
      if (!a || !a.question_id) return null
      const qInfo = questionMap[a.question_id] || {}
      const correctAnswer = correctById[a.question_id]
      
      let isCorrect = false
      if (a.answer && correctAnswer) {
        isCorrect = qInfo.question_type === 'numeric'
          ? Number(a.answer) === Number(correctAnswer)
          : a.answer === correctAnswer
      }

      return {
        question_id: a.question_id,
        question_type: qInfo.question_type,
        question_content: qInfo.question_content,
        image_url: qInfo.image_url,
        solution: qInfo.solution,
        external_reference: qInfo.external_reference,
        difficulty: qInfo.difficulty,
        subject_name: qInfo.subjects?.subject_name || 'General',
        topic_name: qInfo.topics?.topic_name || '',
        choice1: qInfo.choices?.choice1,
        choice2: qInfo.choices?.choice2,
        choice3: qInfo.choices?.choice3,
        choice4: qInfo.choices?.choice4,
        correct_answer: correctAnswer,
        selected_answer: a.answer,
        time_spent_seconds: a.time_taken || 0,
        is_marked_for_review: false,
        is_correct: isCorrect
      }
    }).filter(Boolean)

  } catch (err) {
    console.error('Failed to load session details:', err)
    alert('Failed to load detailed results for this attempt.')
    selectedSession.value = null
  } finally {
    loadingSessionDetails.value = false
  }
}

// UI & Modal helpers for detailed practice attempt review
const getCardClass = (q) => {
  if (q.is_correct) return 'bg-green-50/60 border-green-200/70 shadow-sm'
  if (q.selected_answer) return 'bg-red-50/60 border-red-200/70 shadow-sm'
  return 'bg-gray-50/60 border-gray-200/70'
}
const getQNumberClass = (q) => {
  if (q.is_correct) return 'bg-green-500 text-white'
  if (q.selected_answer) return 'bg-red-500 text-white'
  return 'bg-gray-300 text-white'
}
const getStatusBadgeClass = (q) => {
  if (q.is_correct) return 'bg-green-100 text-green-700'
  if (q.selected_answer) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-500'
}
const getQuestionStatusText = (q) => {
  if (q.is_correct) return 'Correct'
  if (q.selected_answer) return 'Wrong'
  return 'Skipped'
}
const getAnswerTextColor = (q) => {
  if (!q.selected_answer) return 'text-gray-400'
  return q.is_correct ? 'text-green-600' : 'text-red-600'
}
const getQuestionModalBannerClass = (q) => {
  if (!q.selected_answer) return 'bg-gray-50 border-gray-200 text-gray-500'
  if (q.is_correct) return 'bg-green-50 border-green-200 text-green-700'
  return 'bg-red-50 border-red-200 text-red-700'
}
const getQuestionModalStatusText = (q) => {
  if (!q.selected_answer) return 'Not Attempted'
  if (q.is_correct) return 'Correct'
  return 'Incorrect'
}
const getQuestionModalStatusSubtitle = (q) => {
  if (!q.selected_answer) return 'Student skipped this question.'
  if (q.is_correct) return `Student answered: ${String(q.selected_answer).toUpperCase()}`
  return `Student answered: ${String(q.selected_answer).toUpperCase()}  ·  Correct: ${String(q.correct_answer || '?').toUpperCase()}`
}
const getQuestionModalOptions = (q) => {
  return ['choice1', 'choice2', 'choice3', 'choice4'].map((col, i) => {
    const rawVal = q[col]
    let text = ''
    if (rawVal) {
      try {
        const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal
        text = parsed?.text || parsed || ''
      } catch {
        text = String(rawVal)
      }
    }
    return {
      id: ['a', 'b', 'c', 'd'][i],
      text
    }
  })
}
const getModalOptClass = (q, optId) => {
  if (optId === q.correct_answer) return 'border-green-400 bg-green-50/50 shadow-sm ring-1 ring-green-400'
  if (optId === q.selected_answer && !q.is_correct) return 'border-red-400 bg-red-50/50 shadow-sm ring-1 ring-red-400'
  return 'border-gray-200 hover:bg-gray-50'
}
const getModalOptBadgeClass = (q, optId) => {
  if (optId === q.correct_answer) return 'bg-green-500 text-white'
  if (optId === q.selected_answer && !q.is_correct) return 'bg-red-500 text-white'
  return 'bg-gray-200 text-gray-600'
}
const isUrl = (str) => {
  if (!str) return false
  return /^https?:\/\//i.test(str.trim())
}

function formatSeconds(secs) {
  if (secs === undefined || secs === null) return '—'
  const minutes = Math.floor(secs / 60)
  const seconds = secs % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

onMounted(fetchStudent)
</script>

