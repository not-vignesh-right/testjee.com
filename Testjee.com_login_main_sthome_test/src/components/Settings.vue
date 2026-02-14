<template>
  <div class="min-h-full pb-10">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8 animate-fade-in-up">
        <h1 class="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p class="text-gray-500 mt-1 text-sm">Update your profile and security preferences</p>
      </div>

      <!-- Profile Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden mb-6 animate-fade-in-up" style="animation-delay:50ms">
        <div class="p-6 md:p-8 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Profile Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Name (editable) -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input 
                v-model="form.student_name" 
                type="text"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Your full name"
              />
            </div>
            
            <!-- Email (read-only) -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Email Address</label>
              <div class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed">
                {{ auth.studentProfile?.email_id || 'N/A' }}
              </div>
              <p class="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <!-- Mobile (editable) -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Mobile Number</label>
              <input 
                v-model="form.mobile_number" 
                type="tel"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="e.g. 9876543210"
              />
            </div>
            
            <!-- Class (editable dropdown) -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Class</label>
              <select 
                v-model="form.class"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select class</option>
                <option value="11th">11th</option>
                <option value="12th">12th</option>
                <option value="Dropper">Dropper</option>
              </select>
            </div>

            <!-- Account Created (read-only) -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Account Created</label>
              <div class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed">
                {{ creationDate }}
              </div>
            </div>
          </div>

          <!-- Save Button + message -->
          <div class="mt-6 flex items-center gap-4">
            <button 
              @click="saveProfile" 
              :disabled="saving"
              class="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
              <span v-if="profileMsg" :class="profileMsgType === 'success' ? 'text-green-600' : 'text-red-600'" class="text-sm font-medium">
                {{ profileMsg }}
              </span>
            </transition>
          </div>
        </div>

        <!-- Parent / Guardian Section -->
        <div class="p-6 md:p-8 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Parent / Guardian Details
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Parent Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Parent Name</label>
              <input 
                v-model="form.parent_name" 
                type="text"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Parent / Guardian name"
              />
            </div>

            <!-- Parent Number -->
            <div>
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Parent Mobile</label>
              <input 
                v-model="form.parent_number" 
                type="tel"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="e.g. 9876543210"
              />
            </div>

            <!-- Parent Email -->
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-600 mb-1.5">Parent Email</label>
              <input 
                v-model="form.parent_email_id" 
                type="email"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                placeholder="parent@example.com"
              />
            </div>
          </div>

          <!-- Save Parent Button -->
          <div class="mt-6 flex items-center gap-4">
            <button 
              @click="saveProfile" 
              :disabled="saving"
              class="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Security Section -->
        <div class="p-6 md:p-8">
          <h2 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Change Password
          </h2>

          <div class="max-w-md space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">New Password</label>
              <input 
                v-model="newPassword" 
                type="password" 
                placeholder="Minimum 8 characters"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
              <input 
                v-model="confirmPassword" 
                type="password" 
                placeholder="Re-enter new password"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div v-if="pwMessage" :class="['p-3 rounded-xl text-sm font-medium', pwMessageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200']">
              {{ pwMessage }}
            </div>

            <button 
              @click="handleChangePassword" 
              :disabled="pwLoading"
              class="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ pwLoading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

// Profile form — matches actual DB columns
const form = reactive({
  student_name: '',
  mobile_number: '',
  class: '',
  parent_name: '',
  parent_number: '',
  parent_email_id: ''
})

const saving = ref(false)
const profileMsg = ref('')
const profileMsgType = ref('')

// Password
const newPassword = ref('')
const confirmPassword = ref('')
const pwLoading = ref(false)
const pwMessage = ref('')
const pwMessageType = ref('')

const creationDate = computed(() => {
  if (!auth.studentProfile?.creation_date) return 'N/A'
  return new Date(auth.studentProfile.creation_date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
})

// Initialize form with current profile data
onMounted(() => {
  if (auth.studentProfile) {
    form.student_name = auth.studentProfile.student_name || ''
    form.mobile_number = auth.studentProfile.mobile_number || ''
    form.class = auth.studentProfile.class || ''
    form.parent_name = auth.studentProfile.parent_name || ''
    form.parent_number = auth.studentProfile.parent_number || ''
    form.parent_email_id = auth.studentProfile.parent_email_id || ''
  }
})

async function saveProfile() {
  saving.value = true
  profileMsg.value = ''

  const updates = {}
  if (form.student_name) updates.student_name = form.student_name.trim()
  updates.mobile_number = form.mobile_number?.trim() || null
  updates.class = form.class || null
  updates.parent_name = form.parent_name?.trim() || null
  updates.parent_number = form.parent_number?.trim() || null
  updates.parent_email_id = form.parent_email_id?.trim() || null

  const result = await auth.updateStudentProfile(updates)
  saving.value = false

  if (result.success) {
    showProfileMsg('Profile updated successfully!', 'success')
  } else {
    showProfileMsg(result.error || 'Failed to update profile', 'error')
  }
}

function showProfileMsg(msg, type) {
  profileMsg.value = msg
  profileMsgType.value = type
  setTimeout(() => { profileMsg.value = '' }, 4000)
}

async function handleChangePassword() {
  if (newPassword.value.length < 8) {
    showPwMsg('Password must be at least 8 characters long', 'error')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    showPwMsg('Passwords do not match', 'error')
    return
  }

  pwLoading.value = true
  const result = await auth.updatePassword(newPassword.value)
  pwLoading.value = false

  if (result.success) {
    showPwMsg('Password updated successfully!', 'success')
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    showPwMsg(result.error, 'error')
  }
}

function showPwMsg(msg, type) {
  pwMessage.value = msg
  pwMessageType.value = type
  setTimeout(() => { pwMessage.value = '' }, 5000)
}
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out both;
}
</style>
