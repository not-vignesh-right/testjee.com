<template>
  <div class="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 font-sans overflow-hidden relative">
    
    <!-- Animated Background Decor -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
       <div class="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-gradient-to-br from-blue-200/30 to-cyan-200/20 rounded-full blur-[120px] animate-pulse"></div>
       <div class="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-gradient-to-tl from-blue-300/20 to-white/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>
       <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-gradient-to-r from-cyan-100/10 to-blue-100/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 4s;"></div>
    </div>

    <!-- Sidebar -->
    <aside 
      class="bg-white/90 backdrop-blur-xl border-r border-blue-100/50 fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:relative md:translate-x-0 shadow-[4px_0_32px_rgba(59,130,246,0.08)]"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo Area -->
      <div class="h-20 flex items-center px-6 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
        <img :src="logo" alt="TESTJEE Logo" class="h-10 w-auto mr-3 drop-shadow-md" />
        <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">TESTJEE</span>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1 overflow-y-auto h-[calc(100vh-5rem)] flex flex-col">
        <div class="flex-1">
          <p class="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-4">Menu</p>
          
          <router-link 
            to="/sthome/dashboard" 
            class="flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden"
            :class="$route.path.includes('/dashboard') ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-300/50' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700'"
            @click="isSidebarOpen = false"
          >
            <svg class="w-5 h-5 mr-3 transition-colors" :class="$route.path.includes('/dashboard') ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            <span class="relative z-10">Dashboard</span>
          </router-link>

          <router-link 
            to="/sthome/settings" 
            class="flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden mt-1"
            :class="$route.path.includes('/settings') ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-300/50' : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700'"
            @click="isSidebarOpen = false"
          >
            <svg class="w-5 h-5 mr-3 transition-colors" :class="$route.path.includes('/settings') ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="relative z-10">Settings</span>
          </router-link>

          <button 
            @click="handleLogout" 
            class="w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 group relative overflow-hidden mt-1 text-red-600 hover:bg-red-50"
          >
            <svg class="w-5 h-5 mr-3 text-red-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span class="relative z-10">Logout</span>
          </button>
        </div>

        <!-- User Profile in Sidebar -->
        <div class="border-t border-blue-100 pt-4 mt-auto">
          <div class="flex items-center px-3 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100/50">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                {{ userInitials }}
              </div>
            </div>
            <div class="ml-3 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ studentName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ studentEmail }}</p>
            </div>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden relative z-10">
      <!-- Professional Top Navbar -->
      <header class="hidden md:block bg-white/80 backdrop-blur-xl border-b border-blue-100/50 shadow-sm sticky top-0 z-40">
        <div class="px-8 py-4">
          <div class="flex items-center justify-between">
            <!-- Breadcrumb / Page Title -->
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {{ pageTitle }}
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">{{ pageSubtitle }}</p>
            </div>
            
            <!-- Right Side Actions -->
            <div class="flex items-center gap-3">
              <!-- User Profile -->
              <div class="flex items-center gap-3 pr-3 border-r border-blue-100">
                <div class="text-right hidden lg:block">
                  <p class="text-sm font-semibold text-gray-900">{{ studentName }}</p>
                  <p class="text-xs text-gray-500">Student</p>
                </div>
                <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-100">
                  {{ userInitials }}
                </div>
              </div>

              <!-- Logout -->
              <button @click="handleLogout" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200" title="Logout">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span class="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Header -->
      <header class="md:hidden bg-white/90 backdrop-blur-xl border-b border-blue-100/50 h-16 flex items-center justify-between px-4 z-40 sticky top-0 shadow-sm">
        <div class="flex items-center">
          <button @click="isSidebarOpen = true" class="text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-blue-50 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <span class="ml-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">TESTJEE</span>
        </div>
        <div>
          <div class="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- Overlay for mobile sidebar -->
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false"
        class="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 md:hidden transition-opacity"
      ></div>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth">
        <router-view v-slot="{ Component }">
          <transition 
            enter-active-class="transition ease-out duration-400 transform"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-200 transform"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import logo from '../assets/logo_test_jee.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const studentName = computed(() => authStore.studentProfile?.student_name || 'Student')
const studentEmail = computed(() => authStore.studentProfile?.email_id || '')

const userInitials = computed(() => {
  const name = studentName.value
  if (!name) return 'S'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return 'Dashboard'
  if (path.includes('/details')) return 'Performance Review'
  if (path.includes('/settings')) return 'Settings'
  return 'TestJEE'
})

const pageSubtitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return 'View your exam history and start new tests'
  if (path.includes('/details')) return 'Detailed exam analysis'
  if (path.includes('/settings')) return 'Manage your account settings and preferences'
  return 'Welcome to TestJEE'
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
