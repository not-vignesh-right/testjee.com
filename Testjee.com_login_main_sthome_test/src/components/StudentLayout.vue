<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    <!-- Sidebar -->
    <aside 
      class="bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:relative md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo Area -->
      <div class="h-20 flex items-center px-6 border-b border-gray-100">
        <img :src="logo" alt="TESTJEE Logo" class="h-10 w-auto mr-3" />
        <span class="text-xl font-bold text-gray-800 tracking-tight">TESTJEE</span>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1 overflow-y-auto h-[calc(100vh-5rem)] flex flex-col">
        <div class="flex-1">
          <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Menu</p>
          
          <router-link 
            to="/sthome/dashboard" 
            class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group"
            :class="$route.path.includes('/dashboard') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            @click="isSidebarOpen = false"
          >
            <svg class="w-5 h-5 mr-3 transition-colors" :class="$route.path.includes('/dashboard') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            Dashboard
          </router-link>

          <router-link 
            to="/sthome/settings" 
            class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group"
            :class="$route.path.includes('/settings') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            @click="isSidebarOpen = false"
          >
            <svg class="w-5 h-5 mr-3 transition-colors" :class="$route.path.includes('/settings') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Settings
          </router-link>
        </div>

        <!-- User Profile Component in Sidebar -->
        <div class="border-t border-gray-100 pt-4 mt-auto">
          <div class="flex items-center px-3 mb-3">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                {{ userInitials }}
              </div>
            </div>
            <div class="ml-3 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ studentName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ studentEmail }}</p>
            </div>
          </div>
          
          <button 
            @click="handleLogout"
            class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden relative">
      <!-- Mobile Header -->
      <header class="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 z-40">
        <div class="flex items-center">
          <button @click="isSidebarOpen = true" class="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <span class="ml-3 text-lg font-bold text-gray-800">TESTJEE</span>
        </div>
        <div>
          <!-- Mobile Profile/Avatar could go here -->
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- Overlay for mobile sidebar -->
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false"
        class="fixed inset-0 bg-black/50 z-40 md:hidden glass-overlay"
      ></div>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 relative">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import logo from '../../assets/logo_test_jee.png'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const studentName = computed(() => authStore.studentProfile?.student_name || 'Student')
const studentEmail = computed(() => authStore.studentProfile?.email_id || '')

const userInitials = computed(() => {
  const name = studentName.value
  if (!name) return 'S'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/')
  }
}
</script>

<style scoped>
.glass-overlay {
  backdrop-filter: blur(2px);
}
</style>
