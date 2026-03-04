<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Header Bar -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200/50 group-hover:shadow-lg group-hover:shadow-blue-200/60 transition-shadow">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <span class="text-lg font-bold text-gray-900 tracking-tight">TESTJEE</span>
              <span class="text-xs font-semibold text-blue-600 ml-1.5 bg-blue-50 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </router-link>

          <div class="flex items-center gap-3">
            <button @click="refreshData" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Refresh Data">
              <svg class="w-5 h-5" :class="{ 'animate-spin': refreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
            <div class="h-8 w-px bg-gray-200"></div>
            <div class="text-xs text-gray-400 font-medium">Private Admin Panel</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Toast Notifications -->
    <div class="fixed top-20 right-4 z-[100] space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast-enter flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm',
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        ]"
      >
        <svg v-if="toast.type === 'success'" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <svg v-else class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        {{ toast.message }}
      </div>
    </div>

    <!-- Page Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'

const refreshing = ref(false)
const toasts = ref([])
let toastId = 0

function showToast(message, type = 'success') {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

// Provide toast function globally
provide('showToast', showToast)

// Provide a refresh trigger
const refreshTrigger = ref(0)
provide('refreshTrigger', refreshTrigger)

function refreshData() {
  refreshing.value = true
  refreshTrigger.value++
  setTimeout(() => { refreshing.value = false }, 1000)
}
</script>
