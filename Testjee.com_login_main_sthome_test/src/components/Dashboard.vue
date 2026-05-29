<template>
  <div class="dashboard-page px-6 py-6 md:px-10 md:py-8" @click="closeKcetDropdown">

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
                      {{ kcetSubject === 'KCET_PHYSICS' ? 'Ph' : kcetSubject === 'KCET_CHEMISTRY' ? 'Ch' : 'Ma' }}
                    </span>
                  </div>
                  <span class="text-white font-bold text-sm">
                    {{ kcetSubject === 'KCET_PHYSICS' ? 'Physics' : kcetSubject === 'KCET_CHEMISTRY' ? 'Chemistry' : 'Mathematics' }}
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


    <!-- Confirm Start Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-[60] overflow-y-auto" style="animation: fadeIn 0.2s ease-out">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showConfirmModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center" style="animation: slideUp 0.3s ease-out">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg leading-6 font-bold text-gray-900 mb-2">Ready to Start?</h3>
          <div class="mt-2 text-sm text-gray-500 space-y-2 mb-6 text-left bg-red-50 p-4 rounded-lg border border-red-100">
            <p class="text-red-800 font-bold mb-1">STRICT SECURITY ENFORCED:</p>
            <p>• 🖥️ <strong>Laptop / Desktop only.</strong> Mobile phones and tablets are not permitted for this exam.</p>
            <p>• Ensure you have a <strong>stable internet connection</strong> and sit in a calm environment before starting.</p>
            <p>• The exam will immediately lock into <strong>full-screen mode</strong>.</p>
            <p>• <strong>WARNING:</strong> Your test will be <strong>IMMEDIATELY AUTO-SUBMITTED</strong> if you exit full-screen, switch tabs, or open other applications. No exceptions.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="showConfirmModal = false" :disabled="isStartingExam" class="w-full sm:w-1/2 justify-center rounded-xl border border-gray-300 px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50">Cancel</button>
            <button @click="startExam(selectedExamType)" :disabled="isStartingExam" class="w-full sm:w-1/2 justify-center rounded-xl border border-transparent px-4 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-75">
              <span v-if="isStartingExam" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Starting...
              </span>
              <template v-else>
                <span>Yes, Start Exam</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </template>
            </button>
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const router = useRouter()
const authStore = useAuthStore()

const studentProfile = computed(() => authStore.studentProfile)
const examHistory = ref([])
const loading = ref(true)
const showExamModal = ref(false)
const showConfirmModal = ref(false)
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
const kcetDropdownStyle = ref({}) // fixed positioning style for teleported panel

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
})

onUnmounted(() => {
  if (quoteTimer) clearInterval(quoteTimer)
  window.removeEventListener('scroll', closeKcetDropdown, true)
  window.removeEventListener('resize', closeKcetDropdown)
})

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
  showConfirmModal.value = true
}

async function startExam(examType) {
  if (isStartingExam.value) return
  isStartingExam.value = true
  try {
    const examStore = useExamStore()

    // Check if student has tests remaining
    const testsRemaining = authStore.studentProfile?.number_of_tests || 0
    if (testsRemaining <= 0) {
      showConfirmModal.value = false
      showRestoreModal.value = true
      restoreMessage.value = ''
      return
    }

    // Decrement the number of tests in Supabase
    const { error } = await supabase
      .from('students')
      .update({
        number_of_tests: testsRemaining - 1,
        modification_date: new Date().toISOString()
      })
      .eq('student_id', authStore.studentProfile.student_id)

    if (error) {
      console.error('Failed to decrement test count:', error)
      alert('Something went wrong. Please try again.')
      return
    }

    // Update local profile to reflect the change
    authStore.studentProfile.number_of_tests = testsRemaining - 1
    console.log(`[TESTJEE] Tests remaining: ${testsRemaining - 1}`)

    examStore.resetExamState() // Clear old submission state
    examStore.setExamType(examType || 'JEE_MAIN_FULL')
    showConfirmModal.value = false
    router.push('/exam')
  } catch (err) {
    console.error('Error decrementing tests:', err)
    alert('Something went wrong. Please try again.')
  } finally {
    isStartingExam.value = false
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
      if (q.choices && q.choices.correct_answer) {
        correctById[q.question_id] = q.choices.correct_answer
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
      answers: exam.answers,
      perQuestion,
      correctById
    }
    examStore.isSubmitted = true

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