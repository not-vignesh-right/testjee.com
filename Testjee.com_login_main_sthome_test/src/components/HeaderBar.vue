<template>
  <header class="bg-white border-b-2 border-gta-primary shadow-lg">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- Left Section: Logo and Title -->
      <div class="flex items-center space-x-4">
        <!-- Gyan-edge Logo -->
        <div class="flex items-center space-x-3">
          <img :src="logo" alt="Gyan-Edge" class="w-12 h-12 object-contain rounded" />
          <div>
            <h1 class="text-xl font-bold text-gta-primary">Gyan-Edge</h1>
            <p class="text-sm text-gray-600">Testing Agency</p>
          </div>
        </div>
        
        <!-- Exam Title -->
        <div class="border-l-2 border-gray-300 pl-4">
          <h2 class="text-lg font-semibold text-gray-800">{{ examStore.examTitle }}</h2>
          <p class="text-sm text-gray-600">Mock Test Session</p>
        </div>
      </div>
      
      <!-- Center Section: Student Info -->
      <div class="text-center">
        <p class="text-sm text-gray-600">Student Name</p>
        <p class="font-medium text-gray-800">{{ authStore.studentName }}</p>
      </div>
      
      <!-- Right Section: Timer and Controls -->
      <div class="flex items-center space-x-4">
        <!-- Timer -->
        <div class="bg-gta-primary text-white px-4 py-2 rounded-lg">
          <div class="text-center">
            <p class="text-xs text-blue-100">Time Remaining</p>
            <p class="text-lg font-mono font-bold">{{ examStore.formatTime(examStore.remainingTime) }}</p>
          </div>
        </div>
        
        <!-- Full Screen Toggle -->
        <button
          @click="examStore.toggleFullScreen"
          class="p-2 text-gray-600 hover:text-gta-primary hover:bg-blue-50 rounded-lg transition-colors"
          :title="examStore.isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'"
        >
          <svg v-if="!examStore.isFullScreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        
        <!-- Submit Exam Button -->
        <button
          @click="handleSubmit"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium submit-btn"
        >
          Submit Exam
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import logo from '../../logo.png'
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
