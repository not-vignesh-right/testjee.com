<template>
  <div class="min-h-screen bg-canvas flex flex-col font-sans">

    <!-- Shared Admin Header -->
    <header class="bg-surface border-b border-slate-200 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Left: Brand + current page breadcrumb -->
          <div class="flex items-center gap-3 min-w-0">
            <button
              @click="router.push('/admin/home')"
              class="flex items-center gap-2.5 shrink-0 group"
              title="Admin Home"
            >
              <img
                :src="logo"
                alt="TestJEE Logo"
                class="h-9 w-auto object-contain"
              />
            </button>

            <!-- Breadcrumb separator + page title -->
            <template v-if="pageTitle">
              <svg class="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-sm font-semibold text-ink-700 truncate">{{ pageTitle }}</span>
            </template>
          </div>

          <!-- Right: Nav links + user + logout -->
          <div class="flex items-center gap-1 sm:gap-2">

            <!-- Nav links (hidden on very small screens) -->
            <nav class="hidden md:flex items-center gap-1 mr-2">
              <RouterLink
                to="/admin/home"
                class="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-out-quart"
                :class="isActive('/admin/home') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:text-ink-900 hover:bg-slate-100'"
              >
                Dashboard
              </RouterLink>
              <RouterLink
                to="/admin/sessions"
                class="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-out-quart"
                :class="isActive('/admin/sessions') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:text-ink-900 hover:bg-slate-100'"
              >
                Sessions
              </RouterLink>
              <RouterLink
                to="/admin/sessions/new"
                class="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-out-quart"
                :class="isActive('/admin/sessions/new') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:text-ink-900 hover:bg-slate-100'"
              >
                + New Exam
              </RouterLink>
              <!-- Resume Requests with pending badge -->
              <RouterLink
                to="/admin/resume-requests"
                class="relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-out-quart"
                :class="isActive('/admin/resume-requests') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:text-ink-900 hover:bg-slate-100'"
              >
                Resume Requests
                <span
                  v-if="pendingResumeCount > 0"
                  class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                >{{ pendingResumeCount }}</span>
              </RouterLink>
            </nav>

            <!-- Username pill -->
            <span class="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <svg class="w-3.5 h-3.5 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ adminStore.adminProfile?.username }}
            </span>

            <!-- Logout -->
            <button
              @click="handleLogout"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-ink-500 hover:bg-red-50 hover:text-gta-danger transition-colors duration-200 ease-out-quart"
              title="Logout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile nav strip -->
      <div class="md:hidden border-t border-slate-100 bg-canvas px-4 flex gap-1 overflow-x-auto no-scrollbar py-1.5">
        <RouterLink
          to="/admin/home"
          class="px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors duration-200"
          :class="isActive('/admin/home') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:bg-slate-200'"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/admin/sessions"
          class="px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors duration-200"
          :class="isActive('/admin/sessions') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:bg-slate-200'"
        >
          Sessions
        </RouterLink>
        <RouterLink
          to="/admin/sessions/new"
          class="px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors duration-200"
          :class="isActive('/admin/sessions/new') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:bg-slate-200'"
        >
          + New Exam
        </RouterLink>
        <RouterLink
          to="/admin/resume-requests"
          class="relative px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors duration-200"
          :class="isActive('/admin/resume-requests') ? 'bg-gta-secondary text-white' : 'text-ink-500 hover:bg-slate-200'"
        >
          Resume Requests
          <span
            v-if="pendingResumeCount > 0"
            class="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-700 text-white text-[8px] font-bold rounded-full flex items-center justify-center"
          >{{ pendingResumeCount }}</span>
        </RouterLink>
      </div>
    </header>

    <!-- Page content -->
    <main class="flex-1">
      <RouterView />
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'
import { supabase } from '../../lib/supabase'
import logo from '../../assets/logo_test_jee_original.png'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

// Map route names to readable breadcrumb titles
const routeTitles = {
  AdminHome: 'Dashboard',
  AdminLiveSessions: 'Exam Sessions',
  ScheduleExam: 'Schedule New Exam',
  SessionCredentials: 'Session Credentials',
  LiveExamMonitor: 'Live Monitor',
  ExamResults: 'Results & Leaderboard',
  AdminResumeRequests: 'Resume Requests',
}

const pageTitle = computed(() => routeTitles[route.name] ?? null)

// Active state — handles nested routes under /admin/sessions
const isActive = (path) => {
  if (path === '/admin/sessions/new') return route.path === '/admin/sessions/new'
  if (path === '/admin/sessions') return route.path.startsWith('/admin/sessions') && route.path !== '/admin/sessions/new'
  return route.path === path
}

const handleLogout = () => {
  adminStore.logout()
  router.push('/')
}

// Pending resume requests badge count
const pendingResumeCount = ref(0)
let badgePollInterval = null
let realtimeSub = null

async function fetchPendingCount() {
  const token = adminStore.getToken()
  if (!token) return
  try {
    // Security fix: was an unscoped head-count over ALL admins' requests, then briefly an
    // admin_id-trusted RPC. Now token-verified — see harden-admin-rpc-security.sql.
    const { data } = await supabase.rpc('get_admin_pending_appeals', {
      p_token: token
    })
    pendingResumeCount.value = (data || []).filter(r => r.status === 'pending').length
  } catch {}
}

onMounted(async () => {
  await fetchPendingCount()

  // NEW-07: Realtime subscription instead of 30s polling. Postgres_changes can't filter on
  // the deep join needed to scope this to one admin, so every event just triggers a refetch
  // of the properly-scoped count above — never trust row-level INSERT/UPDATE payloads here.
  realtimeSub = supabase
    .channel('admin-resume-watch')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'exam_support_requests'
    }, () => {
      fetchPendingCount()
    })
    .subscribe()

  // Safety-net fallback: Realtime requires replication to be enabled on this table in the
  // Supabase dashboard (Database → Replication). Keep a slow poll so the badge doesn't get
  // permanently stuck if that hasn't been turned on.
  badgePollInterval = setInterval(fetchPendingCount, 60000)
})

onUnmounted(() => {
  if (badgePollInterval) clearInterval(badgePollInterval)
  if (realtimeSub) supabase.removeChannel(realtimeSub)
})
</script>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
