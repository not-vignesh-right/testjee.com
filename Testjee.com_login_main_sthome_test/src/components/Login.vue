<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
      
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
        <img 
          src="/logo.png" 
          alt="Gyan Edge Logo" 
          class="w-24 h-24 mx-auto mb-4 rounded-full shadow-xl border-4 border-white/20"
        >
        
        <h2 class="text-3xl font-bold text-white">
          Gyan Edge Testing Agency
        </h2>
        
        <p class="text-lg text-indigo-100 italic mt-2">
          "Exam se pehle original"
        </p>
      </div>
      <div class="p-8">
        <div v-if="sent" class="text-center">
          <div class="inline-block p-4 bg-green-100 rounded-full mb-4">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Check Your Email</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            A login link has been sent to<br />
            <strong class="text-blue-600">{{ email }}</strong>
          </p>
          <p class="text-sm text-gray-500 mb-6">
            Click the link in your email to complete sign in
          </p>
          <button 
            @click="back" 
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </button>
        </div>

        <div v-else>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                v-model="name"
                type="text"
                placeholder="Enter your full name"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                v-model="email"
                type="email"
                placeholder="student@university.edu"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <button
            @click="login"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Magic Link
          </button>

          <p class="text-xs text-gray-500 text-center mt-6">
            We'll send you a secure link to sign in without a password
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

const name = ref('')
const email = ref('')
const sent = ref(false)

async function login() {
  console.log('=== LOGIN: Storing name ===')
  console.log('Name entered:', name.value)
  console.log('Email entered:', email.value)
  
  // Store name in localStorage as backup
  if (name.value) {
    localStorage.setItem('pendingStudentName', name.value)
    console.log('Stored in localStorage:', localStorage.getItem('pendingStudentName'))
  } else {
    console.warn('WARNING: No name entered!')
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback',
      data: {
        name: name.value
      }
    }
  })

  if (error) {
    console.error('Login error:', error)
    return alert(error.message)
  }
  
  console.log('Magic link sent successfully')
  sent.value = true
}

function back() {
  sent.value = false
}
</script>