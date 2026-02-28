<template>
  <div class="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Admin Approval</h2>
      
      <div v-if="loading" class="flex flex-col items-center justify-center">
        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Approving student...</p>
      </div>

      <div v-else-if="success" class="text-green-600">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h3 class="text-xl font-semibold mb-2">Student Approved Successfully!</h3>
        <p class="text-gray-600">The account for {{ studentName }} has been created with {{ numberOfTests }} test(s).</p>
        <p class="mt-4 font-medium">You can now ask the student to login.</p>
        
        <router-link to="/" class="mt-6 inline-block bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition">
          Go to Login
        </router-link>
      </div>

      <div v-else class="text-red-600">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-xl font-semibold mb-2">Approval Failed</h3>
        <p class="text-gray-600">{{ errorMessage }}</p>
        
        <router-link to="/" class="mt-6 inline-block bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg hover:bg-gray-300 transition">
          Return Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')
const studentName = ref('')
const numberOfTests = ref(1)

onMounted(async () => {
  try {
    const { name, email, mobile, tests, pwd } = route.query
    if (!email || !pwd) {
      throw new Error("Missing required approval parameters.")
    }

    studentName.value = name || 'Student'
    numberOfTests.value = parseInt(tests) || 1
    const decodedPassword = atob(pwd)

    // Attempt to register the student
    const result = await authStore.signUpWithPassword(email, decodedPassword, studentName.value, mobile, numberOfTests.value)
    
    if (result.success) {
      // Automatically log out so admin isn't accidentally logged in as the new user
      await authStore.logout()
      success.value = true
    } else {
      // If error contains username already taken
      if (result.error.toLowerCase().includes('already registered') || result.error.includes('already taken')) {
         errorMessage.value = "This user is already registered and approved."
      } else {
         errorMessage.value = result.error
      }
    }
  } catch (err) {
    errorMessage.value = err.message || "An unexpected error occurred."
  } finally {
    loading.value = false
  }
})
</script>
