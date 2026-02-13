<template>
  <div class="p-8 text-center text-lg">
    Logging you in...
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  console.log('=== AUTH CALLBACK: Starting ===')
  console.log('localStorage before:', localStorage.getItem('pendingStudentName'))
  
  try {
    // Load session first
    await auth.loadSession()
    console.log('Session loaded, user:', auth.user)
    
    // Then fetch or create student profile
    await auth.fetchOrCreateStudent()
    console.log('Student profile:', auth.studentProfile)
    console.log('Student name:', auth.studentName)
    
    // Redirect to dashboard
    console.log('Redirecting to /dashboard')
    router.replace('/dashboard')
  } catch (error) {
    console.error('Error in auth callback:', error)
  }
})
</script>
