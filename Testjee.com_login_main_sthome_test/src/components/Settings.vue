<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-white p-6 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p class="text-gray-600 mt-2">Manage your profile and security preferences</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <!-- Profile Section -->
        <div class="p-8 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Profile Information
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                {{ studentName }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                {{ studentEmail }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
              <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                {{ studentMobile || 'Not provided' }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Account Created</label>
              <div class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                {{ creationDate }}
              </div>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Security
          </h2>

          <div class="max-w-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  v-model="newPassword" 
                  type="password" 
                  placeholder="Minimum 8 characters"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  v-model="confirmPassword" 
                  type="password" 
                  placeholder="Re-enter new password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div v-if="message" :class="['p-3 rounded-lg text-sm', messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                {{ message }}
              </div>

              <button 
                @click="handleChangePassword" 
                :disabled="loading"
                class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageType = ref('')

const studentName = computed(() => auth.studentProfile?.student_name || 'Student')
const studentEmail = computed(() => auth.studentProfile?.email_id || 'N/A')
const studentMobile = computed(() => auth.studentProfile?.mobile_number || '')
const creationDate = computed(() => {
  if (!auth.studentProfile?.creation_date) return 'N/A'
  return new Date(auth.studentProfile.creation_date).toLocaleDateString()
})

async function handleChangePassword() {
  if (newPassword.value.length < 8) {
    showMessage('Password must be at least 8 characters long', 'error')
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    showMessage('Passwords do not match', 'error')
    return
  }
  
  loading.value = true
  
  const result = await auth.updatePassword(newPassword.value)
  
  loading.value = false
  
  if (result.success) {
    showMessage('Password updated successfully!', 'success')
    newPassword.value = ''
    confirmPassword.value = ''
  } else {
    showMessage(result.error, 'error')
  }
}

function showMessage(msg, type) {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}
</script>
