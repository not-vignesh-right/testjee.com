<template>
  <header class="bg-gradient-to-r from-white to-blue-50/30 border-b-2 border-blue-200 shadow-xl backdrop-blur-sm sticky top-0 z-50">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- Left Section: Logo and Title -->
      <div class="flex items-center space-x-4">
        <!-- TESTJEE Logo -->
        <div class="flex items-center space-x-3 group">
          <div class="relative">
            <img :src="logo" alt="TESTJEE Logo" class="w-14 h-14 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
            <div class="absolute inset-0 bg-blue-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TESTJEE</h1>
            <p class="text-xs text-gray-600 font-medium">Gyan Edge Testing</p>
          </div>
        </div>
        
        <!-- Exam Title -->
        <div class="border-l-2 border-gray-300 pl-4 hidden md:block">
          <h2 class="text-lg font-semibold text-gray-800">{{ examStore.examTitle }}</h2>
          <p class="text-xs text-gray-600">Mock Test Session</p>
        </div>
      </div>
      
      <!-- Center Section: Student Info -->
      <div class="text-center hidden lg:block">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
          <p class="text-xs text-gray-600 font-medium">Student Name</p>
          <p class="font-semibold text-gray-800 mt-0.5">{{ authStore.studentName }}</p>
        </div>
      </div>
      
      <!-- Right Section: Timer and Controls -->
      <div class="flex items-center space-x-3">
        <!-- Student Name (Mobile) -->
        <div class="lg:hidden text-right mr-2">
          <p class="text-xs text-gray-600">Student</p>
          <p class="font-semibold text-gray-800 text-sm truncate max-w-[80px]">{{ authStore.studentName }}</p>
        </div>
        
        <!-- Timer -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg border border-blue-500/20 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer"></div>
          <div class="text-center relative z-10">
            <p class="text-xs text-blue-100 font-medium mb-0.5">Time Remaining</p>
            <p class="text-xl font-mono font-bold tracking-wider">{{ examStore.formatTime(examStore.remainingTime) }}</p>
          </div>
        </div>
        

        <!-- Submit Exam Button -->
        <button
          @click="handleSubmit"
          class="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold transform hover:scale-105 border border-red-500/20 relative overflow-hidden group"
        >
          <span class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
          <span class="relative z-10 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Submit Exam
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import logo from '../assets/logo_test_jee.png'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const examStore = useExamStore()
const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  if (!confirm("Are you sure you want to submit the exam?")) {
    return
  }
  const result = await examStore.submitExam()
  if (result.success) {
    router.push("/sthome")
  } else {
    alert("Failed to submit exam. Please try again.")
  }
}

</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 3s infinite;
}
</style>
