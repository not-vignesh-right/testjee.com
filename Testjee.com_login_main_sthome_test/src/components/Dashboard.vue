<template>
  <div @click="closeKcetDropdown">

  <!-- ══════════════════════════════════════════════════════════
       COMPULSORY PHONE NUMBER OVERLAY
       Shown ONLY if: is_genuine_user !== false AND mobile_number is missing/invalid
       Not dismissible — user must submit a valid number or sign out.
       ══════════════════════════════════════════════════════════ -->
  <Teleport to="body">
    <div
      v-if="needsPhone"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style="background: rgba(15,23,42,0.85); backdrop-filter: blur(8px);"
    >
      <!-- Glow orbs -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <!-- Top accent bar -->
        <div class="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"></div>

        <div class="p-8">
          <!-- Icon + heading -->
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/60 mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-black text-gray-900 leading-tight">One last step!</h2>
            <p class="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs">
              Please add your mobile number to complete your profile. This is required for exam notifications and account recovery.
            </p>
          </div>

          <!-- Info chips -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <span class="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              India (+91)
            </span>
            <span class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              Secure & Private
            </span>
          </div>

          <!-- Phone input -->
          <div class="mb-4">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
            <div class="relative">
              <!-- Country prefix -->
              <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-3 border-r border-gray-200">
                <span class="text-base leading-none">🇮🇳</span>
                <span class="text-sm font-bold text-gray-600">+91</span>
              </div>
              <input
                id="phone-overlay-input"
                v-model="phoneOverlayInput"
                @keydown.enter="submitPhoneNumber"
                type="tel"
                inputmode="numeric"
                maxlength="10"
                placeholder="9876543210"
                :class="phoneOverlayError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'"
                class="w-full pl-24 pr-4 py-3.5 bg-gray-50 border rounded-xl text-base font-semibold text-gray-900 focus:bg-white focus:ring-2 outline-none transition-all placeholder-gray-400"
              />
            </div>
            <p v-if="phoneOverlayError" class="mt-2 text-xs font-medium text-red-600 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
              {{ phoneOverlayError }}
            </p>
          </div>

          <!-- Submit button -->
          <button
            id="phone-overlay-submit"
            @click="submitPhoneNumber"
            :disabled="phoneOverlaySaving"
            class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200/60 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
          >
            <svg v-if="phoneOverlaySaving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ phoneOverlaySaving ? 'Saving...' : 'Confirm Mobile Number' }}
          </button>

          <!-- Sign out escape -->
          <div class="mt-5 pt-5 border-t border-gray-100 text-center">
            <p class="text-xs text-gray-400 mb-2">Don't want to continue right now?</p>
            <button
              id="phone-overlay-signout"
              @click="handleOverlayLogout"
              class="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors underline underline-offset-2"
            >
              Sign out of your account
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <div class="dashboard-page px-6 py-6 md:px-10 md:py-8">

    <!-- Recent Auto-Submit Support Appeal Banner -->
    <div v-if="recentSubmittedSession" class="mb-6 animate-fadeIn">
      <div 
        class="relative p-5 rounded-2xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden backdrop-blur-md transition-all shadow-md text-left"
        :class="[
          !recentSupportRequest ? 'border-amber-200 bg-amber-50/70 text-amber-900 shadow-amber-50/30' : '',
          recentSupportRequest?.status === 'pending' ? 'border-amber-200 bg-amber-50/70 text-amber-900 shadow-amber-50/30' : '',
          recentSupportRequest?.status === 'approved' ? 'border-green-200 bg-green-50/70 text-green-900 shadow-green-50/30' : '',
          recentSupportRequest?.status === 'rejected' ? 'border-red-200 bg-red-50/70 text-red-900 shadow-red-900/10' : '',
        ]"
      >
        <div class="flex items-start gap-4">
          <div 
            class="p-3 rounded-xl flex-shrink-0"
            :class="[
              !recentSupportRequest ? 'bg-amber-100 text-amber-700' : '',
              recentSupportRequest?.status === 'pending' ? 'bg-amber-100 text-amber-700 animate-pulse' : '',
              recentSupportRequest?.status === 'approved' ? 'bg-green-100 text-green-700' : '',
              recentSupportRequest?.status === 'rejected' ? 'bg-red-100 text-red-700' : '',
            ]"
          >
            <svg v-if="!recentSupportRequest" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
            <svg v-else-if="recentSupportRequest.status === 'pending'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else-if="recentSupportRequest.status === 'approved'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else-if="recentSupportRequest.status === 'rejected'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <div>
            <h4 class="font-bold text-sm md:text-base">
              <span v-if="!recentSupportRequest">⚠️ Exam Auto-Submitted Unexpectedly</span>
              <span v-else-if="recentSupportRequest.status === 'pending'">⏳ Resumption Appeal Pending</span>
              <span v-else-if="recentSupportRequest.status === 'approved'">🎉 Resumption Request Approved!</span>
              <span v-else-if="recentSupportRequest.status === 'rejected'">❌ Resumption Request Denied</span>
            </h4>
            <p class="text-xs mt-1 leading-relaxed opacity-90">
              <span v-if="!recentSupportRequest">
                Your <strong>{{ getExamTypeLabel(recentSubmittedSession.exam_type) }}</strong> session was auto-submitted. If this was a glitch, request support to resume. Time left to appeal: <strong class="font-mono text-xs">{{ appealTimeRemainingText }}</strong>
              </span>
              <span v-else-if="recentSupportRequest.status === 'pending'">
                Gyan Edge administrators are reviewing your request for the <strong>{{ getExamTypeLabel(recentSubmittedSession.exam_type) }}</strong> mock test. Please wait.
              </span>
              <span v-else-if="recentSupportRequest.status === 'approved'">
                Admins have approved your request. You can now resume your <strong>{{ getExamTypeLabel(recentSubmittedSession.exam_type) }}</strong> mock test.
              </span>
              <span v-else-if="recentSupportRequest.status === 'rejected'">
                Your request to resume the <strong>{{ getExamTypeLabel(recentSubmittedSession.exam_type) }}</strong> mock test was not approved.
              </span>
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 mt-2 md:mt-0 flex-shrink-0">
          <button 
            v-if="!recentSupportRequest"
            @click="showDashboardAppealModal = true"
            class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            🙋‍♂️ Request Resume
          </button>
          
          <button 
            v-if="recentSupportRequest?.status === 'pending'"
            @click="fetchSupportRequestForSession(recentSubmittedSession.session_id)"
            class="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-all flex items-center gap-1.5"
          >
            🔄 Refresh Status
          </button>
          
          <button 
            v-if="recentSupportRequest?.status === 'approved'"
            @click="resumeApprovedExam"
            class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            🚀 Resume Test Now
          </button>
        </div>
      </div>
    </div>

    <!-- Greeting Row -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2 animate-fadeIn">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, <span class="text-blue-600">{{ studentProfile?.student_name || 'Student' }}</span>
        </h1>
        <p class="text-gray-500 mt-1 text-sm italic transition-opacity duration-300" :style="{ opacity: quoteOpacity }">"{{ currentQuote }}"</p>
      </div>
      <p class="text-sm text-gray-400 font-medium">{{ todayFormatted }}</p>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8 animate-fadeIn" style="animation-delay:0.05s">
      <!-- Tests Remaining Card -->
      <div 
        class="stat-card group cursor-pointer transition-colors" 
        :class="studentProfile?.number_of_tests === 0 ? 'bg-red-50 border-red-200' : 'hover:border-blue-300'"
        @click="studentProfile?.number_of_tests === 0 ? showRestoreModal = true : null"
      >
        <div 
          class="stat-icon"
          :class="studentProfile?.number_of_tests === 0 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Tests Left</p>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl font-bold" :class="studentProfile?.number_of_tests === 0 ? 'text-red-600' : 'text-gray-900'">
              {{ studentProfile?.number_of_tests || 0 }}
            </p>
            <span v-if="studentProfile?.number_of_tests === 0" class="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-100 px-1.5 py-0.5 rounded">Buy More</span>
          </div>
        </div>
      </div>

      <div class="stat-card group">
        <div class="stat-icon bg-blue-100 text-blue-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Exams</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalExams }}</p>
        </div>
      </div>

      <div class="stat-card group">
        <div class="stat-icon bg-green-100 text-green-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Best Score</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.bestScore }}</p>
        </div>
      </div>

      <div class="stat-card group">
        <div class="stat-icon bg-amber-100 text-amber-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Avg Score</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.avgScore }}</p>
        </div>
      </div>

      <div class="stat-card group">
        <div class="stat-icon bg-purple-100 text-purple-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Accuracy</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.accuracy }}%</p>
        </div>
      </div>
    </div>

    <!-- Exam Cards Row: JEE + NEET + KCET -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fadeIn" style="animation-delay:0.1s">

      <!-- JEE Main Card (Blue) -->
      <div class="exam-card exam-card-jee group">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-28 h-28 bg-cyan-300/10 rounded-full blur-2xl"></div>

        <div class="relative z-10 flex flex-col h-full">
          <div class="flex items-start justify-between mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full tracking-wider uppercase">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              NTA Pattern
            </span>
            <div class="flex gap-1.5">
              <span class="text-[10px] font-bold px-2 py-0.5 bg-white/15 text-white/90 rounded-full">+4</span>
              <span class="text-[10px] font-bold px-2 py-0.5 bg-red-500/30 text-white/90 rounded-full">-1</span>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-white mb-1">JEE Main</h2>
          <p class="text-blue-100/80 text-sm leading-relaxed mb-5 flex-1">Full-length mock covering Physics, Chemistry &amp; Mathematics. NTA-exact interface.</p>

          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3 text-blue-100 text-xs font-semibold">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                3 Hours
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                75 Qs
              </span>
              <span>PCM</span>
            </div>
            <button @click="confirmExamStart('JEE_MAIN_FULL')"
              class="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all transform hover:scale-[1.04] active:scale-95 shadow-lg">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Start
            </button>
          </div>
        </div>
      </div>

      <!-- NEET UG Card (Emerald Green) -->
      <div class="exam-card exam-card-neet group">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 rounded-2xl"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-transparent to-green-700/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-28 h-28 bg-teal-300/10 rounded-full blur-2xl"></div>

        <div class="relative z-10 flex flex-col h-full">
          <div class="flex items-start justify-between mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full tracking-wider uppercase">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/></svg>
              Medical Pattern
            </span>
            <div class="flex gap-1.5">
              <span class="text-[10px] font-bold px-2 py-0.5 bg-white/15 text-white/90 rounded-full">+4</span>
              <span class="text-[10px] font-bold px-2 py-0.5 bg-red-500/30 text-white/90 rounded-full">-1</span>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-white mb-1">NEET UG</h2>
          <p class="text-green-100/80 text-sm leading-relaxed mb-5 flex-1">Full-length mock covering Physics, Chemistry, Botany &amp; Zoology. PCB pattern.</p>

          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3 text-green-100 text-xs font-semibold">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                3h 20m
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                180 Qs
              </span>
              <span>PCB</span>
            </div>
            <button @click="confirmExamStart('NEET_UG_FULL')"
              class="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 font-bold text-sm rounded-xl hover:bg-green-50 transition-all transform hover:scale-[1.04] active:scale-95 shadow-lg">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Start
            </button>
          </div>
        </div>
      </div>

      <!-- KCET Card (Amber/Gold) — special subject dropdown -->
      <div class="exam-card exam-card-kcet group">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-400 rounded-2xl"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-transparent to-orange-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-28 h-28 bg-yellow-200/10 rounded-full blur-2xl"></div>

        <div class="relative z-10 flex flex-col h-full">
          <div class="flex items-start justify-between mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full tracking-wider uppercase">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
              Karnataka State
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-green-400/30 text-white rounded-full">No -ve</span>
          </div>

          <h2 class="text-2xl font-bold text-white mb-1">KCET</h2>
          <p class="text-yellow-100/80 text-sm leading-relaxed mb-4 flex-1">Single-subject exam. Select your subject below and start. No negative marking!</p>

          <!-- Subject Dropdown — unique to KCET (custom styled, teleported to body to escape overflow:hidden) -->
          <div class="mb-4">
            <label class="text-yellow-100/70 text-[11px] font-semibold uppercase tracking-widest mb-2 block">Select Subject</label>
            <div class="relative" @click.stop>
              <!-- Trigger button -->
              <button
                ref="kcetTriggerRef"
                type="button"
                @click="openKcetDropdown"
                class="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-white/40 bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200 cursor-pointer"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <span class="text-white text-[11px] font-black">
                      {{ kcetOptions.find(o => o.value === kcetSubject)?.abbr || 'Ph' }}
                    </span>
                  </div>
                  <span class="text-white font-bold text-sm">
                    {{ kcetOptions.find(o => o.value === kcetSubject)?.label || 'Physics' }}
                  </span>
                </div>
                <svg
                  class="w-4 h-4 text-white/80 transition-transform duration-200"
                  :class="kcetDropdownOpen ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Teleported dropdown — renders at body level to escape card's overflow:hidden -->
              <Teleport to="body">
                <div
                  v-show="kcetDropdownOpen"
                  class="kcet-dropdown-panel"
                  :style="kcetDropdownStyle"
                  @click.stop
                >
                  <div class="bg-white rounded-2xl border border-amber-100 overflow-hidden" style="box-shadow: 0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(245,158,11,0.12);">
                    <button
                      v-for="opt in kcetOptions"
                      :key="opt.value"
                      type="button"
                      @click="kcetSubject = opt.value; kcetDropdownOpen = false"
                      class="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 border-b border-gray-100/80 last:border-0"
                      :class="kcetSubject === opt.value
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-amber-700'"
                    >
                      <div
                        class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black transition-colors"
                        :class="kcetSubject === opt.value ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'"
                      >
                        {{ opt.abbr }}
                      </div>
                      <div class="flex-1">
                        <div class="font-bold text-sm">{{ opt.label }}</div>
                        <div class="text-[10px] text-gray-400 font-medium">{{ opt.desc }}</div>
                      </div>
                      <svg v-if="kcetSubject === opt.value" class="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </Teleport>
            </div>
          </div>

          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3 text-yellow-100 text-xs font-semibold">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                80 Mins
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                60 Qs
              </span>
              <span>+1 / 0</span>
            </div>
            <button @click="confirmExamStart(kcetSubject)"
              class="flex items-center gap-2 px-5 py-2.5 bg-white text-amber-600 font-bold text-sm rounded-xl hover:bg-amber-50 transition-all transform hover:scale-[1.04] active:scale-95 shadow-lg">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Start
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Score Trend Chart: full row below cards -->
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 mb-8 hover:shadow-md transition-shadow duration-300 animate-fadeIn" style="animation-delay:0.12s">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800">Score Trend</h3>
        <span class="text-xs text-gray-400 font-medium">{{ examHistory.length }} exam{{ examHistory.length !== 1 ? 's' : '' }}</span>
      </div>
      <div v-if="examHistory.length >= 1" class="h-40">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <div v-else class="flex flex-col items-center justify-center h-40 text-center">
        <svg class="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        <p class="text-gray-400 text-sm">Take exams to see your score trend</p>
      </div>
    </div>
    <!-- Exam History -->
    <div class="animate-fadeIn" style="animation-delay:0.15s">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-bold text-gray-900">Exam History</h2>
        <span v-if="examHistory.length" class="text-xs text-gray-400 font-medium">{{ examHistory.length }} exam{{ examHistory.length > 1 ? 's' : '' }}</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="examHistory.length === 0" class="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-12 text-center">
        <div class="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <p class="text-gray-700 font-semibold mb-1">No exams taken yet</p>
        <p class="text-gray-400 text-sm">Start your first mock test to see your results here.</p>
      </div>

      <!-- Exam list -->
      <div v-else class="space-y-3">
        <div
          v-for="(exam, index) in examHistory"
          :key="exam.result_id"
          class="exam-row animate-slideIn"
          :style="`animation-delay: ${0.15 + index * 0.05}s`"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4 min-w-0">
              <div class="exam-number">{{ index + 1 }}</div>
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 text-sm">{{ getExamTypeLabel(exam.session?.exam_type) }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(exam.session?.start_time) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-5 sm:gap-6 flex-wrap">
              <div class="text-center">
                <p class="text-xs text-gray-400">Score</p>
                <p class="text-sm font-bold" :class="getScoreColor(exam.score)">{{ exam.score }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-400">Attempted</p>
                <p class="text-sm font-bold text-gray-800">{{ countAttempted(exam.answers) }}/{{ exam.answers?.length ?? '—' }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-400">Duration</p>
                <p class="text-sm font-bold text-gray-800">{{ calculateDuration(exam) }}</p>
              </div>
              <button
                @click="viewDetails(exam)"
                class="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                Details
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- ══════════════════════════════════════════════════════════
         STEP 1 — MODE SELECTION MODAL
         Appears when student clicks "Start" on any exam card.
         ══════════════════════════════════════════════════════════ -->
    <div v-if="showModeModal" class="fixed inset-0 z-[60] overflow-y-auto" style="animation: fadeIn 0.2s ease-out">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showModeModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" style="animation: slideUp 0.3s ease-out">

          <!-- Header -->
          <div class="px-7 pt-7 pb-5">
            <div class="flex items-center gap-3 mb-1">
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-black"
                :class="{
                  'bg-gradient-to-br from-blue-500 to-cyan-500': selectedExamType?.startsWith('JEE'),
                  'bg-gradient-to-br from-emerald-500 to-teal-500': selectedExamType?.startsWith('NEET'),
                  'bg-gradient-to-br from-amber-500 to-orange-400': selectedExamType?.startsWith('KCET'),
                }">
                {{ selectedExamType?.startsWith('JEE') ? '📐' : selectedExamType?.startsWith('NEET') ? '🧬' : '📋' }}
              </div>
              <div>
                <h3 class="text-xl font-black text-gray-900 leading-tight">Start New Exam</h3>
                <p class="text-xs text-gray-400 font-medium">{{ getExamTypeLabel(selectedExamType) }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-3">Choose the type of exam:</p>
          </div>

          <!-- Mode Cards -->
          <div class="px-7 pb-6 space-y-3">
            <!-- Full Mock Test -->
            <button @click="selectMode('full')"
              class="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left hover:border-blue-400 hover:bg-blue-50 hover:shadow-md border-gray-200 bg-gray-50"
            >
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-gray-900 text-sm">Full Mock Test</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ getModeDescription(selectedExamType, 'full') }}</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- Topic Wise -->
            <button
              @click="selectMode('topic')"
              class="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left hover:border-purple-400 hover:bg-purple-50 hover:shadow-md border-gray-200 bg-gray-50 cursor-pointer"
            >
              <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-bold text-gray-900 text-sm">Topic Wise</p>
                </div>
                <p class="text-xs text-gray-500 mt-0.5">{{ getModeDescription(selectedExamType, 'topic') }}</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <!-- Cancel -->
          <div class="px-7 pb-7">
            <button @click="showModeModal = false" class="w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         STEP 2 — TOPIC WISE CONFIGURATION MODAL
         ══════════════════════════════════════════════════════════ -->
    <div v-if="showTopicModal" class="fixed inset-0 z-[70] overflow-y-auto" style="animation: fadeIn 0.2s ease-out">
      <div class="flex items-center justify-center min-h-screen px-4 py-8">
        <div class="fixed inset-0 bg-gray-900/70 backdrop-blur-sm" @click="showTopicModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" style="animation: slideUp 0.3s ease-out; max-height: 90vh; display: flex; flex-direction: column;">

          <!-- Modal Header -->
          <div class="px-7 pt-7 pb-4 shrink-0">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-3">
                <button @click="showTopicModal = false; showModeModal = true" class="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <div>
                  <h3 class="text-lg font-black text-gray-900 leading-tight">Topic Wise Exam</h3>
                  <p class="text-xs text-gray-400 font-medium">{{ getExamTypeLabel(selectedExamType) }}</p>
                </div>
              </div>
              <button @click="showTopicModal = false" class="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2 ml-11">Select topics for each subject. Only questions from selected topics will appear.</p>
          </div>

          <!-- Subject Tabs -->
          <div class="px-7 shrink-0">
            <div class="flex gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                v-for="subj in topicSubjects"
                :key="subj"
                @click="activeTopicSubject = subj"
                class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200"
                :class="activeTopicSubject === subj
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'"
              >
                {{ subj.length > 5 ? subj.slice(0, 4) + '.' : subj }}
              </button>
            </div>
          </div>

          <!-- Topics List (scrollable) -->
          <div class="flex-1 overflow-y-auto px-7 py-4 min-h-0">
            <!-- Loading -->
            <div v-if="topicsLoading" class="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg class="animate-spin h-8 w-8 mb-3" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-sm">Loading topics...</p>
            </div>

            <template v-else-if="activeTopicSubject && topicsBySubject[activeTopicSubject]">
              <!-- Select All row -->
              <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <label class="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer"
                    :class="isAllSelectedForSubject(activeTopicSubject) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 group-hover:border-indigo-400'"
                    @click="toggleSelectAll(activeTopicSubject)"
                  >
                    <svg v-if="isAllSelectedForSubject(activeTopicSubject)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <svg v-else-if="isSomeSelectedForSubject(activeTopicSubject)" class="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-semibold text-gray-700">Select All {{ activeTopicSubject }}</span>
                </label>
                <span class="text-xs font-medium text-gray-400">
                  {{ selectedTopics[activeTopicSubject]?.size || 0 }} / {{ topicsBySubject[activeTopicSubject]?.length || 0 }} selected
                </span>
              </div>

              <!-- Individual topics grouped by class -->
              <div v-for="classGroup in ['11', '12']" :key="classGroup" class="mb-4">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Class {{ classGroup }}</p>
                <div class="space-y-1">
                  <label
                    v-for="topic in getTopicsForSubjectAndClass(activeTopicSubject, classGroup)"
                    :key="topic.topic_id"
                    class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group transition-all"
                    :class="isTopicSelected(activeTopicSubject, topic.topic_id) ? 'bg-indigo-50' : 'hover:bg-gray-50'"
                  >
                    <div
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                      :class="isTopicSelected(activeTopicSubject, topic.topic_id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 group-hover:border-indigo-400'"
                      @click="toggleTopic(activeTopicSubject, topic.topic_id)"
                    >
                      <svg v-if="isTopicSelected(activeTopicSubject, topic.topic_id)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <span class="text-sm text-gray-700" :class="isTopicSelected(activeTopicSubject, topic.topic_id) ? 'font-semibold text-indigo-800' : ''">
                      {{ topic.topic_name }}
                    </span>
                  </label>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer: Validation Error + Start Button -->
          <div class="px-7 pb-7 pt-4 border-t border-gray-100 shrink-0">
            <!-- Validation error -->
            <div v-if="topicValidationError" class="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
              <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <p class="text-xs text-red-700 font-medium">{{ topicValidationError }}</p>
            </div>

            <!-- Summary of selected questions -->
            <div class="flex items-center justify-between mb-4 text-xs text-gray-500">
              <span>Topics selected across all subjects:</span>
              <span class="font-bold text-gray-800">{{ totalTopicsSelected }} topic{{ totalTopicsSelected !== 1 ? 's' : '' }}</span>
            </div>

            <div class="flex gap-3">
              <button @click="showTopicModal = false" class="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                @click="startTopicWiseExam"
                :disabled="isValidatingTopics || totalTopicsSelected === 0"
                class="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md"
                :class="totalTopicsSelected > 0 && !isValidatingTopics
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'"
              >
                <svg v-if="isValidatingTopics" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
                {{ isValidatingTopics ? 'Checking...' : 'Check &amp; Start' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request More Tests Modal -->
    <div v-if="showRestoreModal" class="fixed inset-0 z-50 overflow-y-auto" style="animation: fadeIn 0.2s ease-out">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" @click="showRestoreModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" style="animation: slideUp 0.3s ease-out">
          <div class="text-center mb-6">
            <div class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">No Tests Remaining</h3>
            <p class="text-sm text-gray-500">You've used all your available tests. Request more from the admin.</p>
          </div>

          <div class="mb-5">
            <div class="flex items-center justify-between mb-2 ml-1">
              <label class="block text-sm font-medium text-gray-700">Select Package to Restore</label>
              <span v-if="pricingDetails.savingsAmount > 0" class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                Save ₹{{ pricingDetails.savingsAmount }}
              </span>
            </div>
            
            <!-- Visual Pricing Grid -->
            <div class="grid grid-cols-3 gap-2 mb-3">
              <button 
                v-for="preset in PRESET_PACKAGES" 
                :key="preset"
                type="button"
                @click="selectPackage(preset)"
                class="relative p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[70px]"
                :class="restoreTestCount === preset && !isCustomPackage ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-gray-50'"
              >
                <span v-if="getPackageTag(preset)" class="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded text-white whitespace-nowrap shadow-sm" :class="getPackageTagColor(preset)">
                  {{ getPackageTag(preset) }}
                </span>
                <span class="text-lg font-bold text-gray-900 leading-none mb-1">{{ preset }}</span>
                <span class="text-xs text-gray-500 font-medium">Exams</span>
              </button>
              
              <!-- Custom Option -->
              <button 
                type="button"
                @click="enableCustomPackage"
                class="relative p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[70px]"
                :class="isCustomPackage ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-gray-50'"
              >
                <span class="text-xs font-bold text-gray-900">Custom</span>
                <span class="text-[10px] text-gray-500 mt-1">Any amount</span>
              </button>
            </div>

            <!-- Custom Input -->
            <div v-if="isCustomPackage" class="mb-3 animate-fade-in flex items-center gap-3">
              <label class="text-sm text-gray-600 whitespace-nowrap">I want to restore:</label>
              <input 
                v-model.number="restoreTestCount" 
                type="number" 
                min="1" 
                max="100"
                class="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all outline-none shadow-sm text-center font-bold text-gray-900"
              />
              <span class="text-sm text-gray-600">exams</span>
            </div>

            <!-- Price Summary -->
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 font-medium mb-0.5">Total to Pay</p>
                <div class="flex items-baseline gap-1.5">
                  <p class="text-lg font-bold text-amber-700">₹{{ pricingDetails.totalPrice }}</p>
                  <p v-if="pricingDetails.originalPrice > pricingDetails.totalPrice" class="text-xs text-gray-400 line-through">₹{{ pricingDetails.originalPrice }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-amber-800 font-medium bg-amber-100/50 px-2 py-1 rounded inline-block">
                  ₹{{ pricingDetails.pricePerExam }} / exam
                </p>
              </div>
            </div>
          </div>

          <div v-if="restoreMessage" :class="['mb-4 p-3 rounded-xl text-sm font-medium', restoreMessageType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100']">
            {{ restoreMessage }}
          </div>

          <div class="flex gap-3">
            <button @click="showRestoreModal = false" class="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="sendRestoreRequest" :disabled="restoreLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              <svg v-if="restoreLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ restoreLoading ? 'Sending...' : 'Send Request' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dashboard Support Appeal Modal -->
  <div v-if="showDashboardAppealModal" class="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
    <div class="flex items-center justify-center min-h-screen px-4 py-8">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showDashboardAppealModal = false"></div>
      <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up border border-gray-100 text-left">
        <h3 class="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          🙋‍♂️ Support & Resume Request
        </h3>
        <p class="text-xs text-gray-500 mb-6">If your exam was auto-submitted due to screen sleep or a technical glitch, Gyan Edge admins can reopen your session.</p>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Select Reason</label>
            <select v-model="dashboardAppealReason" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all cursor-pointer font-medium text-gray-800 text-sm">
              <option value="My computer went to sleep/locked screen">💻 My computer went to sleep / locked screen</option>
              <option value="I had a power failure / network drop">🔌 I had a power failure / network drop</option>
              <option value="I exited fullscreen / switched tabs accidentally">⚠️ I exited fullscreen / switched tabs accidentally</option>
              <option value="Other technical glitch">⚙️ Other technical glitch</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Additional details (optional)</label>
            <textarea 
              v-model="dashboardAppealCustomMessage"
              rows="3" 
              placeholder="Briefly describe what happened..."
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>
        </div>

        <div v-if="dashboardAppealError" class="mb-4 p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-medium animate-fadeIn">
          {{ dashboardAppealError }}
        </div>

        <div class="flex gap-3">
          <button 
            @click="showDashboardAppealModal = false" 
            class="flex-1 py-3 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="submitDashboardAppeal" 
            :disabled="dashboardAppealSubmitting"
            class="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-200/50 flex items-center justify-center gap-1.5"
          >
            <svg v-if="dashboardAppealSubmitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            {{ dashboardAppealSubmitting ? 'Submitting...' : 'Submit Appeal' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useExamStore } from '../stores/examStore'
import { supabase } from '../lib/supabase'
import { getRandomQuote } from '../data/quotes'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
import { getPriceDetails, PRESET_PACKAGES, EXAM_PRICE_TIERS } from '../data/pricing'
import { EXAM_CONFIGS } from '../data/examConfigs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const router = useRouter()
const authStore = useAuthStore()

const studentProfile = computed(() => authStore.studentProfile)

// ─── Phone Number Overlay ─────────────────────────────────────────────────────
const VALID_PHONE_REGEX = /^[6-9]\d{9}$/

/**
 * Show the overlay when:
 *  1. The student profile is loaded (not null)
 *  2. The student is a genuine user (is_genuine_user is not explicitly false)
 *  3. Their mobile_number is missing or not a valid 10-digit Indian number
 */
const needsPhone = computed(() => {
  const profile = studentProfile.value
  if (!profile) return false                          // profile still loading
  if (profile.is_genuine_user === false) return false // dev/internal — skip
  return !VALID_PHONE_REGEX.test(profile.mobile_number || '')
})

const phoneOverlayInput = ref('')
const phoneOverlayError = ref('')
const phoneOverlaySaving = ref(false)

async function submitPhoneNumber() {
  const cleaned = phoneOverlayInput.value.trim()
  if (!VALID_PHONE_REGEX.test(cleaned)) {
    phoneOverlayError.value = 'Please enter a valid 10-digit Indian mobile number (starts with 6–9)'
    return
  }
  phoneOverlayError.value = ''
  phoneOverlaySaving.value = true
  try {
    const result = await authStore.updateStudentProfile({ mobile_number: cleaned })
    if (!result.success) throw new Error(result.error || 'Failed to save')
    // Profile is updated reactively via authStore — needsPhone will auto-become false
  } catch (err) {
    phoneOverlayError.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    phoneOverlaySaving.value = false
  }
}

async function handleOverlayLogout() {
  await authStore.logout()
  router.push('/')
}
// ─────────────────────────────────────────────────────────────────────────────
const examHistory = ref([])
const loading = ref(true)
const showModeModal = ref(false)    // Step 1: Full Mock vs Topic Wise
const showTopicModal = ref(false)   // Step 2: Topic selection UI
const selectedExamType = ref(null)
const showRestoreModal = ref(false)
const restoreTestCount = ref(3)
const restoreLoading = ref(false)
const restoreMessage = ref('')
const restoreMessageType = ref('')
const isStartingExam = ref(false)
const kcetSubject = ref('KCET_PHYSICS') // KCET subject dropdown default
const kcetDropdownOpen = ref(false)
const kcetTriggerRef = ref(null)  // template ref on the trigger button

// --- Support Request / Appeal Banner State ---
const recentSubmittedSession = ref(null)
const recentSupportRequest = ref(null)
const showDashboardAppealModal = ref(false)
const dashboardAppealReason = ref('My computer went to sleep/locked screen')
const dashboardAppealCustomMessage = ref('')
const dashboardAppealError = ref('')
const dashboardAppealSubmitting = ref(false)
const appealTimeRemainingText = ref('')
let dashboardPollInterval = null
let countdownTimer = null
const kcetDropdownStyle = ref({}) // fixed positioning style for teleported panel

// ─── Topic Wise state ─────────────────────────────────────────────────────────
const topicsBySubject = ref({})    // { SubjectName: [{ topic_id, topic_name, class }] }
const selectedTopics = ref({})     // { SubjectName: Set<topic_id> }
const activeTopicSubject = ref('') // currently visible subject tab
const topicsLoading = ref(false)
const topicValidationError = ref('')
const isValidatingTopics = ref(false)

const topicSubjects = computed(() => {
  if (!selectedExamType.value) return []
  const cfg = EXAM_CONFIGS[selectedExamType.value]
  return cfg?.subjects ?? []
})

const totalTopicsSelected = computed(() => {
  let count = 0
  for (const subj of topicSubjects.value) {
    count += selectedTopics.value[subj]?.size ?? 0
  }
  return count
})

function isTopicSelected(subj, topicId) {
  return selectedTopics.value[subj]?.has(topicId) ?? false
}

function isAllSelectedForSubject(subj) {
  const topics = topicsBySubject.value[subj]
  if (!topics || topics.length === 0) return false
  return (selectedTopics.value[subj]?.size ?? 0) === topics.length
}

function isSomeSelectedForSubject(subj) {
  const size = selectedTopics.value[subj]?.size ?? 0
  return size > 0 && !isAllSelectedForSubject(subj)
}

function toggleTopic(subj, topicId) {
  if (!selectedTopics.value[subj]) selectedTopics.value[subj] = new Set()
  if (selectedTopics.value[subj].has(topicId)) {
    selectedTopics.value[subj].delete(topicId)
  } else {
    selectedTopics.value[subj].add(topicId)
  }
  // Trigger Vue reactivity on the Set
  selectedTopics.value = { ...selectedTopics.value }
  topicValidationError.value = ''
}

function toggleSelectAll(subj) {
  const topics = topicsBySubject.value[subj] ?? []
  if (isAllSelectedForSubject(subj)) {
    selectedTopics.value[subj] = new Set()
  } else {
    selectedTopics.value[subj] = new Set(topics.map(t => t.topic_id))
  }
  selectedTopics.value = { ...selectedTopics.value }
  topicValidationError.value = ''
}

function getTopicsForSubjectAndClass(subj, classNum) {
  return (topicsBySubject.value[subj] ?? []).filter(t => t.class === classNum)
}

async function fetchTopicsForExam(examTypeKey) {
  topicsLoading.value = true
  topicsBySubject.value = {}
  selectedTopics.value = {}
  topicValidationError.value = ''
  try {
    const cfg = EXAM_CONFIGS[examTypeKey]
    if (!cfg) return
    // Collect all subject names (via synonyms) to look up subject_ids
    const synonymsMap = cfg.subjectNameSynonyms
    const allSubjectNames = Array.from(new Set(Object.values(synonymsMap).flat()))
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('subject_id, subject_name')
      .in('subject_name', allSubjectNames)
    if (!subjectsData) return
    // Build canonical name → subject_ids map (can return multiple IDs, e.g. botany + zoology for biology)
    const lookupIdsFor = (canonicalName) => {
      const candidates = synonymsMap[canonicalName] || [canonicalName]
      const found = subjectsData.filter(s => candidates.includes(s.subject_name))
      return found.map(s => s.subject_id)
    }
    // Fetch topics for each subject
    const result = {}
    for (const subjectName of cfg.subjects) {
      const subjectIds = lookupIdsFor(subjectName)
      if (!subjectIds || subjectIds.length === 0) continue
      
      const allTopicRows = []
      for (const subjectId of subjectIds) {
        const { data: topicRows } = await supabase
          .from('topics')
          .select('topic_id, topic_name, class')
          .eq('subject_id', subjectId)
        if (topicRows) allTopicRows.push(...topicRows)
      }
      
      // Sort combined topics by class then by name
      allTopicRows.sort((a, b) => {
        if (a.class !== b.class) return (a.class || 0) - (b.class || 0)
        return (a.topic_name || '').localeCompare(b.topic_name || '')
      })
      
      result[subjectName] = allTopicRows
    }
    topicsBySubject.value = result
    // Initialize selections (all unselected by default)
    const initSel = {}
    for (const subj of cfg.subjects) initSel[subj] = new Set()
    selectedTopics.value = initSel
    // Default active tab
    if (cfg.subjects.length > 0) activeTopicSubject.value = cfg.subjects[0]
  } catch (err) {
    console.error('fetchTopicsForExam error:', err)
  } finally {
    topicsLoading.value = false
  }
}
// ─── End Topic Wise state ───────────────────────────────────────────────────────

// Compute and apply fixed position based on trigger button rect
function openKcetDropdown() {
  kcetDropdownOpen.value = !kcetDropdownOpen.value
  if (kcetDropdownOpen.value && kcetTriggerRef.value) {
    const rect = kcetTriggerRef.value.getBoundingClientRect()
    kcetDropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    }
  }
}

const kcetOptions = [
  { value: 'KCET_PHYSICS',     label: 'Physics',     abbr: 'Ph', desc: 'Mechanics, Waves, Optics & more' },
  { value: 'KCET_CHEMISTRY',   label: 'Chemistry',   abbr: 'Ch', desc: 'Organic, Inorganic & Physical' },
  { value: 'KCET_MATHEMATICS', label: 'Mathematics', abbr: 'Ma', desc: 'Calculus, Algebra, Trigonometry' },
  { value: 'KCET_BIOLOGY',     label: 'Biology',     abbr: 'Bi', desc: 'Botany & Zoology' },
]

// Close KCET dropdown when clicking outside
function closeKcetDropdown() { kcetDropdownOpen.value = false }

const isCustomPackage = ref(false)
const pricingDetails = computed(() => getPriceDetails(restoreTestCount.value))

function selectPackage(count) {
  isCustomPackage.value = false
  restoreTestCount.value = count
}

function enableCustomPackage() {
  isCustomPackage.value = true
  if (PRESET_PACKAGES.includes(restoreTestCount.value)) {
    restoreTestCount.value = restoreTestCount.value + 1
  }
}

function getPackageTag(count) {
  const tier = EXAM_PRICE_TIERS.find(t => count >= t.min && count <= t.max)
  return tier?.tag || null
}

function getPackageTagColor(count) {
  const tier = EXAM_PRICE_TIERS.find(t => count >= t.min && count <= t.max)
  if (tier?.tagColor === 'green') return 'bg-green-500'
  if (tier?.tagColor === 'purple') return 'bg-purple-500'
  return 'bg-blue-500'
}

// Motivational quote rotation
const currentQuote = ref('')
const quoteOpacity = ref(1)
let lastQuoteIdx = -1
let quoteTimer = null

function rotateQuote() {
  quoteOpacity.value = 0
  setTimeout(() => {
    const { quote, index } = getRandomQuote(lastQuoteIdx)
    currentQuote.value = quote
    lastQuoteIdx = index
    quoteOpacity.value = 1
  }, 300)
}

// Chart computed
const chartData = computed(() => {
  const reversed = [...examHistory.value].reverse()
  return {
    labels: reversed.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Score',
      data: reversed.map(e => e.score),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#fff',
      pointBorderColor: 'rgb(59, 130, 246)',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: {
    backgroundColor: '#fff', titleColor: '#1f2937', bodyColor: '#4b5563',
    borderColor: '#e5e7eb', borderWidth: 1, padding: 10, displayColors: false,
    callbacks: { label: ctx => `Score: ${ctx.parsed.y}` }
  }},
  scales: {
    y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } }
  },
  interaction: { intersect: false, mode: 'index' }
}

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

// Computed stats from exam history
const stats = computed(() => {
  const exams = examHistory.value
  if (!exams.length) return { totalExams: 0, bestScore: '—', avgScore: '—', accuracy: '—' }

  const scores = exams.map(e => e.score)
  const best = Math.max(...scores)
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  // Accuracy: percentage of correct answers across all exams
  let totalAttempted = 0
  let totalCorrect = 0
  exams.forEach(exam => {
    if (exam.answers && Array.isArray(exam.answers)) {
      exam.answers.forEach(a => {
        if (a && a.answer) {
          totalAttempted++
          // +4 for correct, -1 for wrong → score = 4*correct - 1*(attempted-correct)
          // We don't have per-question correctness here, so estimate from score
        }
      })
    }
  })

  // Estimate accuracy from scores: score = 4*correct - 1*(attempted - correct) = 5*correct - attempted
  // correct = (score + attempted) / 5
  const allAttempted = exams.reduce((sum, e) => sum + countAttempted(e.answers), 0)
  const totalScore = scores.reduce((a, b) => a + b, 0)
  let accuracy = '—'
  if (allAttempted > 0) {
    const estimatedCorrect = (totalScore + allAttempted) / 5
    accuracy = Math.max(0, Math.min(100, Math.round((estimatedCorrect / allAttempted) * 100)))
  }

  return { totalExams: exams.length, bestScore: best, avgScore: avg, accuracy }
})

onMounted(async () => {
  // Init quote
  const { quote, index } = getRandomQuote(-1)
  currentQuote.value = quote
  lastQuoteIdx = index
  quoteTimer = setInterval(rotateQuote, 8000)

  // Close KCET dropdown on scroll/resize so teleported panel stays aligned
  window.addEventListener('scroll', closeKcetDropdown, true)
  window.addEventListener('resize', closeKcetDropdown)

  await fetchExamHistory()
  await checkRecentAutoSubmissions()
})

onUnmounted(() => {
  if (quoteTimer) clearInterval(quoteTimer)
  window.removeEventListener('scroll', closeKcetDropdown, true)
  window.removeEventListener('resize', closeKcetDropdown)
  
  // Clean up support polls and countdown timers
  if (dashboardPollInterval) clearInterval(dashboardPollInterval)
  if (countdownTimer) clearInterval(countdownTimer)
})

async function checkRecentAutoSubmissions() {
  if (!studentProfile.value) return

  try {
    // Fetch recently submitted sessions (within 10-min appeal window)
    // Now that DB migration is done, filter by auto_submitted = true so
    // manual submits never show the banner
    const { data: sessions, error } = await supabase
      .from('exam_sessions')
      .select('session_id, exam_type, start_time, end_time, total_duration_seconds, auto_submitted')
      .eq('student_id', studentProfile.value.student_id)
      .eq('is_submitted', true)
      .eq('auto_submitted', true)
      .order('end_time', { ascending: false })
      .limit(5)

    if (error) throw error

    if (sessions && sessions.length > 0) {
      // Find the most recent session within the 10-minute appeal window
      const now = Date.now()
      const eligibleSession = sessions.find(s => {
        if (!s.end_time) return false
        return (now - new Date(s.end_time).getTime()) < 600000
      })

      if (eligibleSession) {
        // Fetch the support request for this session
        const { data: existingReq } = await supabase
          .from('exam_support_requests')
          .select('*')
          .eq('session_id', eligibleSession.session_id)
          .maybeSingle()

        // Suppress banner if:
        // 1) Request is 'completed' — student already resumed and finished
        // 2) Request is 'approved' — check if session is no longer submitted
        //    (meaning student already started the resumed exam, hide banner)
        if (existingReq?.status === 'completed') {
          recentSubmittedSession.value = null
          recentSupportRequest.value = null
          return
        }

        if (existingReq?.status === 'approved') {
          // Check if the session was reopened (is_submitted = false) meaning
          // student is mid-resumed-exam — hide the banner to prevent double-resume
          const { data: sessionState } = await supabase
            .from('exam_sessions')
            .select('is_submitted')
            .eq('session_id', eligibleSession.session_id)
            .single()

          if (sessionState && !sessionState.is_submitted) {
            // Student is actively in the resumed exam — hide banner
            recentSubmittedSession.value = null
            recentSupportRequest.value = null
            return
          }
        }

        recentSubmittedSession.value = eligibleSession
        startAppealCountdown(new Date(eligibleSession.end_time).getTime())
        recentSupportRequest.value = existingReq || null

        // Start polling if pending
        if (existingReq?.status === 'pending') {
          startDashboardPolling()
        } else if (existingReq?.status === 'approved') {
          stopDashboardPolling()
        }
      } else {
        recentSubmittedSession.value = null
        recentSupportRequest.value = null
      }
    } else {
      recentSubmittedSession.value = null
      recentSupportRequest.value = null
    }
  } catch (err) {
    console.error('Error checking recent auto-submissions:', err)
  }
}

async function fetchSupportRequestForSession(sessionId) {
  try {
    const { data, error } = await supabase
      .from('exam_support_requests')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (error) throw error
    
    recentSupportRequest.value = data || null
    
    // If pending, start status polling
    if (data && data.status === 'pending') {
      startDashboardPolling()
    } else {
      stopDashboardPolling()
    }
  } catch (err) {
    console.error('Error fetching support request:', err)
  }
}

function startAppealCountdown(endTime) {
  if (countdownTimer) clearInterval(countdownTimer)
  
  const updateCountdown = () => {
    const timeRemaining = 600000 - (Date.now() - endTime)
    if (timeRemaining <= 0) {
      recentSubmittedSession.value = null
      recentSupportRequest.value = null
      clearInterval(countdownTimer)
      countdownTimer = null
      stopDashboardPolling()
    } else {
      const minutes = Math.floor(timeRemaining / 60000)
      const seconds = Math.floor((timeRemaining % 60000) / 1000)
      appealTimeRemainingText.value = `${minutes}m ${seconds}s`
    }
  }
  
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
}

function startDashboardPolling() {
  if (dashboardPollInterval) clearInterval(dashboardPollInterval)
  
  dashboardPollInterval = setInterval(async () => {
    if (!recentSubmittedSession.value) {
      stopDashboardPolling()
      return
    }
    await fetchSupportRequestForSession(recentSubmittedSession.value.session_id)
  }, 5000)
}

function stopDashboardPolling() {
  if (dashboardPollInterval) {
    clearInterval(dashboardPollInterval)
    dashboardPollInterval = null
  }
}

async function submitDashboardAppeal() {
  if (!recentSubmittedSession.value) return
  
  dashboardAppealSubmitting.value = true
  dashboardAppealError.value = ''
  
  try {
    // Calculate remaining seconds at submission
    const start = new Date(recentSubmittedSession.value.start_time).getTime()
    const end = new Date(recentSubmittedSession.value.end_time).getTime()
    const elapsed = Math.floor((end - start) / 1000)
    const remainingSeconds = Math.max(0, recentSubmittedSession.value.total_duration_seconds - elapsed)
    
    const examStore = useExamStore()
    
    // BUG 13 FIX: Use the store action instead of direct property mutation
    examStore.setExamType(recentSubmittedSession.value.exam_type)
    // Set sessionId via action (use the exported ref directly as it's Pinia)
    examStore.sessionId = recentSubmittedSession.value.session_id
    
    // BUG 9 FIX: Load answers from the results table (the actual submitted answers)
    // instead of calling fetchExamData() which would create a new random question set
    let answersForSnapshot = []
    let questionsForSnapshot = []

    try {
      const { data: resultRow } = await supabase
        .from('results')
        .select('answers, exam_sessions(exam_type)')
        .eq('session_id', recentSubmittedSession.value.session_id)
        .maybeSingle()

      if (resultRow?.answers) {
        answersForSnapshot = resultRow.answers
      }

      // Also fetch question details from DB for snapshot (using question_ids from answers)
      const questionIds = answersForSnapshot
        .filter(a => a?.question_id)
        .map(a => a.question_id)

      if (questionIds.length > 0) {
        const { data: qRows } = await supabase
          .from('questions')
          .select('question_id, subject_id, question_type, question_content, image_url, external_reference, topics(topic_name), choices(choice1, choice2, choice3, choice4, correct_answer), subjects(subject_name)')
          .in('question_id', questionIds)

        if (qRows) {
          questionsForSnapshot = qRows.map(row => ({
            id: row.question_id,
            text: (row.question_content?.text || row.question_content?.stem) || row.external_reference || '',
            image_url: row.image_url || null,
            subject: row.subjects?.subject_name || '',
            topic: row.topics?.topic_name || '',
            question_type: row.question_type,
            options: row.question_type === 'multiple_choice' ? [
              { id: 'a', text: row.choices?.choice1?.text || row.choices?.choice1 || '' },
              { id: 'b', text: row.choices?.choice2?.text || row.choices?.choice2 || '' },
              { id: 'c', text: row.choices?.choice3?.text || row.choices?.choice3 || '' },
              { id: 'd', text: row.choices?.choice4?.text || row.choices?.choice4 || '' }
            ] : null
          }))
        }
      }
    } catch (fetchErr) {
      console.warn('Could not fetch results for appeal snapshot:', fetchErr)
      // Non-critical: proceed with empty snapshot rather than blocking the appeal
    }

    // Directly insert the support request with the pre-built snapshots
    // (bypasses examStore.submitSupportRequest which needs store questions loaded)
    const { data: existingReq } = await supabase
      .from('exam_support_requests')
      .select('request_id, status')
      .eq('session_id', recentSubmittedSession.value.session_id)
      .maybeSingle()

    if (existingReq) {
      // Already submitted — just refresh status
      await fetchSupportRequestForSession(recentSubmittedSession.value.session_id)
      showDashboardAppealModal.value = false
      return
    }

    // Mark session as auto_submitted before inserting request
    await supabase
      .from('exam_sessions')
      .update({ auto_submitted: true })
      .eq('session_id', recentSubmittedSession.value.session_id)

    const authStore = useAuthStore()
    const { data: insertedReq, error: insertErr } = await supabase
      .from('exam_support_requests')
      .insert({
        session_id: recentSubmittedSession.value.session_id,
        student_id: authStore.studentProfile?.student_id,
        reason: dashboardAppealReason.value,
        custom_message: dashboardAppealCustomMessage.value,
        remaining_time_seconds: remainingSeconds,
        answers: answersForSnapshot,
        questions: questionsForSnapshot,
        status: 'pending'
      })
      .select()

    if (insertErr) throw insertErr
    
    if (insertedReq) {
      showDashboardAppealModal.value = false
      await fetchSupportRequestForSession(recentSubmittedSession.value.session_id)
    }
  } catch (err) {
    dashboardAppealError.value = err.message || 'Error occurred'
  } finally {
    dashboardAppealSubmitting.value = false
  }
}

async function resumeApprovedExam() {
  if (!recentSupportRequest.value) return
  
  const examStore = useExamStore()
  
  stopDashboardPolling()
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  
  const res = await examStore.restoreResumedSession(recentSupportRequest.value)
  if (res.success) {
    // isResuming is already set to true inside restoreResumedSession
    // ExamLayout.onMounted will detect this and skip initializeSession
    router.push('/exam')
  } else {
    alert(res.error || 'Failed to resume session. Please try again.')
  }
}

async function fetchExamHistory() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('results')
      .select(`
        result_id,
        score,
        answers,
        session_id,
        exam_sessions (
          session_id,
          start_time,
          end_time,
          exam_type
        )
      `)
      .eq('student_id', studentProfile.value.student_id)
      .order('result_id', { ascending: false })

    if (error) throw error

    examHistory.value = data.map(item => ({
      ...item,
      session: item.exam_sessions
    }))
  } catch (error) {
    console.error('Error fetching exam history:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function calculateDuration(exam) {
  if (!exam.answers || !Array.isArray(exam.answers)) return '—'
  const totalSeconds = exam.answers.reduce((sum, answer) => sum + (answer?.time_taken || 0), 0)
  if (totalSeconds === 0) return '—'
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = Math.floor(totalSeconds % 60)
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

function countAttempted(answers) {
  if (!answers || !Array.isArray(answers)) return 0
  return answers.filter(a => a && a.answer).length
}

function getScoreColor(score) {
  if (score >= 200) return 'text-green-600'
  if (score >= 100) return 'text-amber-600'
  if (score >= 0) return 'text-blue-600'
  return 'text-red-500'
}

// Map exam_type stored in DB to a human-readable label
function getExamTypeLabel(examType) {
  const map = {
    'JEE_MAIN_FULL': 'JEE Main Mock Test',
    'NEET_UG_FULL': 'NEET UG Mock Test',
    'KCET_PHYSICS': 'KCET Physics',
    'KCET_CHEMISTRY': 'KCET Chemistry',
    'KCET_MATHEMATICS': 'KCET Mathematics',
    'KCET_BIOLOGY': 'KCET Biology',
  }
  return map[examType] || examType || 'Mock Test'
}

function confirmExamStart(examType) {
  const testsRemaining = authStore.studentProfile?.number_of_tests || 0
  if (testsRemaining <= 0) {
    showRestoreModal.value = true
    restoreMessage.value = ''
    return
  }

  selectedExamType.value = examType
  showModeModal.value = true
}

function getModeDescription(examType, mode) {
  if (mode === 'full') {
    const map = {
      JEE_MAIN_FULL: '75 Qs · 3 Hours · PCM',
      NEET_UG_FULL: '180 Qs · 3h 20m · PCBZ',
      KCET_PHYSICS: '60 Qs · 80 mins · Physics',
      KCET_CHEMISTRY: '60 Qs · 80 mins · Chemistry',
      KCET_MATHEMATICS: '60 Qs · 80 mins · Mathematics',
      KCET_BIOLOGY: '60 Qs · 80 mins · Biology',
    }
    return map[examType] || 'Full randomised mock test'
  }
  if (mode === 'topic') {
    return 'Choose specific topics'
  }
  return ''
}

async function selectMode(mode) {
  showModeModal.value = false
  if (mode === 'full') {
    // Full mock test — route straight to exam
    startExam(selectedExamType.value)
  } else {
    // Topic wise — open topic selector
    showTopicModal.value = true
    await fetchTopicsForExam(selectedExamType.value)
  }
}

function startExam(examType) {
  // NOTE: Test count decrement has moved to ExamInstructions.vue
  // (so Cancel on instructions page doesn't waste a test)
  const examStore = useExamStore()
  examStore.resetExamState()
  examStore.setExamType(examType || 'JEE_MAIN_FULL')
  examStore.setTopicFilter(null) // Full mock test: no topic filter
  router.push('/exam')
}

async function startTopicWiseExam() {
  if (isValidatingTopics.value) return
  topicValidationError.value = ''

  const examStore = useExamStore()
  const cfg = EXAM_CONFIGS[selectedExamType.value]
  if (!cfg) return

  // Build topic filter map: { SubjectName: [topicId, ...] }
  const topicFilterMap = {}
  let totalSelections = 0
  for (const subj of cfg.subjects) {
    const ids = [...(selectedTopics.value[subj] ?? [])]
    topicFilterMap[subj] = ids
    totalSelections += ids.length
  }

  if (totalSelections === 0) {
    topicValidationError.value = 'Please select at least one topic to continue.'
    return
  }

  isValidatingTopics.value = true
  try {
    // Validate: for each subject, count available questions across selected topics
    const synonymsMap = cfg.subjectNameSynonyms
    const allSubjectNames = Array.from(new Set(Object.values(synonymsMap).flat()))
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('subject_id, subject_name')
      .in('subject_name', allSubjectNames)

    const lookupIdsFor = (canonicalName) => {
      const candidates = synonymsMap[canonicalName] || [canonicalName]
      const found = (subjectsData || []).filter(s => candidates.includes(s.subject_name))
      return found.map(s => s.subject_id)
    }

    const errors = []
    for (const subj of cfg.subjects) {
      const subjectIds = lookupIdsFor(subj)
      const topicIds = topicFilterMap[subj]
      if (!topicIds || topicIds.length === 0) {
        errors.push(`${subj}: No topics selected.`)
        continue
      }
      if (!subjectIds || subjectIds.length === 0) continue

      const required = cfg.questionsPerSubject.mcq
      let totalAvailable = 0

      for (const subjectId of subjectIds) {
        // Count MCQs available for this subjectId + selected topics
        let countQuery = supabase
          .from('questions')
          .select('question_id', { count: 'exact', head: true })
          .eq('subject_id', subjectId)
          .eq('question_type', 'multiple_choice')
          .in('topic_id', topicIds)
        if (Array.isArray(cfg.categoryId)) {
          countQuery = countQuery.in('category_id', cfg.categoryId)
        } else if (cfg.categoryId) {
          countQuery = countQuery.eq('category_id', cfg.categoryId)
        }
        if (cfg.difficultyFilter?.length) {
          countQuery = countQuery.in('difficulty', cfg.difficultyFilter)
        }
        
        let { count, error: countErr } = await countQuery
        if (countErr) {
          console.error(`Validation count error for ${subj} (ID: ${subjectId}):`, countErr)
          continue
        }

        let countVal = count ?? 0

        // Borrowing fallback: count across all categories if primary category is short
        const requiredPerSubId = Math.ceil(required / subjectIds.length)
        if (countVal < requiredPerSubId) {
          let borrowQuery = supabase
            .from('questions')
            .select('question_id', { count: 'exact', head: true })
            .eq('subject_id', subjectId)
            .eq('question_type', 'multiple_choice')
            .in('topic_id', topicIds)
          if (cfg.difficultyFilter?.length) {
            borrowQuery = borrowQuery.in('difficulty', cfg.difficultyFilter)
          }
          const { count: borrowCount } = await borrowQuery
          countVal = borrowCount ?? 0
        }

        totalAvailable += countVal
      }

      if (totalAvailable < required) {
        errors.push(
          `${subj}: Only ${totalAvailable} question${totalAvailable !== 1 ? 's' : ''} available for selected topics (need ${required}).`
        )
      }
    }

    if (errors.length > 0) {
      topicValidationError.value = errors.join(' | ')
      return
    }

    // All good — start the exam
    showTopicModal.value = false
    examStore.resetExamState()
    examStore.setExamType(selectedExamType.value)
    examStore.setTopicFilter(topicFilterMap)
    router.push('/exam')
  } catch (err) {
    console.error('startTopicWiseExam error:', err)
    topicValidationError.value = 'Validation failed. Please try again.'
  } finally {
    isValidatingTopics.value = false
  }
}

async function sendRestoreRequest() {
  restoreLoading.value = true
  restoreMessage.value = ''

  try {
    // Set is_approved to false when requesting more tests so admin can re-approve after payment
    if (authStore.studentProfile) {
      await authStore.updateStudentProfile({ is_approved: false })
    }
    
    // Clear message
    restoreMessage.value = ''

    // Redirect to the payment component to actually prompt UI payment
    // But since Dashboard requires auth, we can just push to the payment route.
    // Make sure we clear modal and modal state.
    showRestoreModal.value = false
    router.push({
      path: '/payment',
      query: { tests: restoreTestCount.value }
    })
    
  } catch (error) {
    console.error('[TESTJEE] Restore request error:', error)
    restoreMessage.value = 'Failed to send request. Please try again.'
    restoreMessageType.value = 'error'
  } finally {
    restoreLoading.value = false
  }
}

async function viewDetails(exam) {
  try {
    const questionIds = exam.answers
      .filter(a => a && a.question_id)
      .map(a => a.question_id)

    if (questionIds.length === 0) {
      alert('No questions found in this exam')
      return
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        question_id,
        subject_id,
        question_type,
        subjects (subject_name),
        choices (correct_answer)
      `)
      .in('question_id', questionIds)

    if (questionsError) throw questionsError

    const questionMap = {}
    const correctById = {}

    questionsData.forEach(q => {
      questionMap[q.question_id] = {
        subject: q.subjects?.subject_name || 'Unknown',
        question_type: q.question_type
      }
      // Supabase can return choices as an object (one-to-one) or array (one-to-many)
      const choicesObj = Array.isArray(q.choices) ? q.choices[0] : q.choices
      if (choicesObj?.correct_answer) {
        correctById[q.question_id] = choicesObj.correct_answer
      }
    })

    const perQuestion = exam.answers.map((a, idx) => {
      if (!a || !a.question_id) {
        return { question_id: null, index: idx, subject: null, chosen: null, correct: null, isCorrect: false, time_taken: 0 }
      }

      const questionInfo = questionMap[a.question_id] || {}
      const correctAnswer = correctById[a.question_id]

      let isCorrect = false
      if (a.answer && correctAnswer) {
        if (questionInfo.question_type === 'numeric') {
          isCorrect = Number(a.answer) === Number(correctAnswer)
        } else {
          isCorrect = a.answer === correctAnswer
        }
      }

      return {
        question_id: a.question_id,
        index: idx,
        subject: questionInfo.subject || 'Unknown',
        chosen: a.answer,
        correct: correctAnswer,
        isCorrect,
        time_taken: a.time_taken || 0
      }
    })

    const examStore = useExamStore()
    examStore.lastResult = {
      id: exam.result_id,
      score: exam.score,
      examType: exam.session?.exam_type || null,
      answers: exam.answers,
      perQuestion,
      correctById
    }
    examStore.isSubmitted = true
    if (exam.session?.exam_type) {
      examStore.setExamType(exam.session.exam_type)
    }

    router.push('/sthome/details')
  } catch (error) {
    console.error('Error loading exam details:', error)
    alert('Failed to load exam details: ' + error.message)
  }
}
</script>

<style scoped>
/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out both;
}
.animate-slideIn {
  animation: slideIn 0.4s ease-out both;
}

/* Stat Card */
.stat-card {
  background: white;
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: box-shadow 0.3s, transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
.stat-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Exam Cards (JEE, NEET, KCET) */
.exam-card {
  position: relative;
  border-radius: 1.25rem;
  padding: 1.75rem;
  min-height: 240px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}
.exam-card-jee {
  box-shadow: 0 6px 30px rgba(37, 99, 235, 0.2);
}
.exam-card-jee:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(37, 99, 235, 0.3);
}
.exam-card-neet {
  box-shadow: 0 6px 30px rgba(5, 150, 105, 0.2);
}
.exam-card-neet:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(5, 150, 105, 0.3);
}
.exam-card-kcet {
  box-shadow: 0 6px 30px rgba(245, 158, 11, 0.2);
}
.exam-card-kcet:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.3);
}

/* Legacy Start Exam CTA (kept for safety) */
.exam-cta-card {
  position: relative;
  border-radius: 1rem;
  padding: 2rem;
  min-height: 220px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.15);
}
.exam-cta-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.25);
}

/* Profile Row */
.profile-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

/* Exam History Row */
.exam-row {
  background: white;
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 0.875rem;
  padding: 1rem 1.25rem;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.exam-row:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border-color: rgba(147, 197, 253, 0.6);
}
.exam-number {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>