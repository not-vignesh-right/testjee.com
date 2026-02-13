<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-white flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl"></div>
    </div>
    
    <div class="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden relative z-10 border border-white/50">
      
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center relative overflow-hidden">
        <!-- Animated background decoration -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-blue-200 rounded-full blur-3xl"></div>
        </div>
        
        <div class="relative z-10">
          <div class="mb-4 flex justify-center">
            <div class="relative">
              <img 
                :src="logo" 
                alt="TESTJEE Logo" 
                class="w-28 h-28 mx-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
              >
              <div class="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
            </div>
          </div>
          
          <h2 class="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            TESTJEE
          </h2>
          
          <p class="text-lg text-blue-100 font-medium mb-1">
            Gyan Edge Testing Agency
          </p>
          
          <p class="text-sm text-blue-200 italic mt-2">
            "Exam se pehle original"
          </p>
        </div>
      </div>
      <div class="p-8">
        <div v-if="sent" class="text-center">
          <div class="inline-block p-5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl mb-6 shadow-lg border-2 border-green-200">
            <svg class="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-3">Check Your Email</h3>
          <p class="text-gray-600 mb-4 leading-relaxed text-lg">
            A login link has been sent to<br />
            <strong class="text-blue-600 text-xl">{{ email }}</strong>
          </p>
          <p class="text-sm text-gray-500 mb-8">
            Click the link in your email to complete sign in
          </p>
          <button 
            @click="back" 
            class="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </button>
        </div>

        <div v-else>
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
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
                class="w-full pl-10 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
              />
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
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
                class="w-full pl-10 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none hover:border-gray-400"
              />
            </div>
          </div>

          <button
            @click="login"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <span class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="relative z-10">Send Magic Link</span>
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
import logo from '../../assets/logo_test_jee.png'

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