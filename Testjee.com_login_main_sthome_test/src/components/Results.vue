<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white p-6 relative overflow-hidden">
    <!-- Subtle background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-50/20 rounded-full blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Professional Header -->
      <div class="text-center mb-10">
        <div class="flex items-center justify-center gap-4 mb-4">
          <div class="relative">
            <img :src="logo" alt="TESTJEE Logo" class="w-20 h-20 object-contain drop-shadow-lg" />
            <div class="absolute inset-0 bg-blue-200/20 rounded-full blur-xl -z-10"></div>
          </div>
          <div class="text-left">
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Exam Results
            </h1>
            <p class="text-gray-600 text-sm font-medium mt-1">Performance Analytics Dashboard</p>
          </div>
        </div>
      </div>

      <!-- If exam is submitted -->
      <div v-if="lastResult && lastResult.perQuestion" class="space-y-8">
        
        <!-- Professional Hero Score Card -->
        <div class="relative bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-blue-100/50 overflow-hidden mb-8">
          <!-- Subtle gradient overlay -->
          <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50"></div>
          <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-50 to-blue-50 rounded-full blur-3xl opacity-50"></div>
          
          <div class="relative z-10">
            <div class="text-center mb-10">
              <div class="text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-3">
                {{ percentageScore }}%
              </div>
              <div class="text-xl text-gray-600 font-semibold">Overall Performance</div>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{{ lastResult.score }}</div>
                <div class="text-gray-700 font-medium text-sm">Your Score</div>
                <div class="text-xs text-gray-500 mt-1">out of {{ total * 4 }}</div>
              </div>
              <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">{{ correctCount }}</div>
                <div class="text-gray-700 font-medium text-sm">Correct</div>
                <div class="text-xs text-gray-500 mt-1">{{ total > 0 ? Math.round((correctCount/total)*100) : 0 }}% accuracy</div>
              </div>
              <div class="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-red-600 mb-2">{{ wrongCount }}</div>
                <div class="text-gray-700 font-medium text-sm">Wrong</div>
                <div class="text-xs text-gray-500 mt-1">{{ total > 0 ? Math.round((wrongCount/total)*100) : 0 }}% mistakes</div>
              </div>
              <div class="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="text-3xl md:text-4xl font-bold text-gray-600 mb-2">{{ total - attempted }}</div>
                <div class="text-gray-700 font-medium text-sm">Skipped</div>
                <div class="text-xs text-gray-500 mt-1">{{ attempted }}/{{ total }} attempted</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Subject Performance Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div v-for="(stats, subject) in subjectStats" :key="subject" 
               class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            
            <!-- Subject Header -->
            <div class="px-6 py-4 border-b border-gray-100" :class="getSubjectHeaderClass(subject)">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-3 shadow-sm" :class="getSubjectColorClass(subject)"></div>
                  <h3 class="text-lg font-bold text-gray-800">{{ subject }}</h3>
                </div>
                <div class="text-2xl font-black" :class="getSubjectTextColor(subject)">
                  {{ Math.round((stats.correct/stats.total || 0) * 100) }}%
                </div>
              </div>
            </div>

            <!-- Subject Stats -->
            <div class="p-6 bg-gradient-to-br from-white to-gray-50/50">
              <div class="space-y-5">
                <!-- Progress Bar -->
                <div>
                  <div class="flex justify-between text-xs font-medium text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{{ stats.correct }}/{{ stats.total }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-1000 ease-out shadow-sm" 
                         :class="getSubjectProgressColor(subject)"
                         :style="{ width: `${(stats.correct/stats.total || 0) * 100}%` }">
                    </div>
                  </div>
                </div>

                <!-- Quick Stats Grid -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
                    <div class="text-xl font-bold text-emerald-600">{{ stats.correct }}</div>
                    <div class="text-xs text-gray-600 font-medium mt-0.5">Correct</div>
                  </div>
                  <div class="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
                    <div class="text-xl font-bold text-red-600">{{ stats.wrong }}</div>
                    <div class="text-xs text-gray-600 font-medium mt-0.5">Wrong</div>
                  </div>
                  <div class="bg-gray-100 rounded-lg p-3 border border-gray-200 text-center">
                    <div class="text-xl font-bold text-gray-600">{{ stats.total - stats.correct - stats.wrong }}</div>
                    <div class="text-xs text-gray-600 font-medium mt-0.5">Skipped</div>
                  </div>
                </div>

                <!-- Time Spent -->
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div class="flex items-center text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-sm font-medium">Time spent</span>
                  </div>
                  <span class="text-gray-800 font-semibold text-sm">{{ formatTime(stats.time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Performance Analysis -->
        <div class="bg-white rounded-2xl p-8 md:p-10 shadow-xl border border-gray-200 mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">Performance Analysis</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Insights -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                Key Insights
              </h3>
              <div class="space-y-3">
                <div v-for="(msg, i) in conclusions" :key="i" 
                     class="flex items-start p-4 rounded-lg border-l-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-blue-400 shadow-sm">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span class="text-gray-700 text-sm leading-relaxed">{{ msg }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-5 flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                Performance Metrics
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100 shadow-sm">
                  <div class="text-2xl font-bold text-emerald-600 mb-1">{{ getStrongestSubject() }}</div>
                  <div class="text-gray-600 text-xs font-medium">Strongest Subject</div>
                </div>
                <div class="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-100 shadow-sm">
                  <div class="text-2xl font-bold text-amber-600 mb-1">{{ getWeakestSubject() }}</div>
                  <div class="text-gray-600 text-xs font-medium">Needs Work</div>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                  <div class="text-2xl font-bold text-blue-600 mb-1">{{ getTotalTime() }}</div>
                  <div class="text-gray-600 text-xs font-medium">Total Time</div>
                </div>
                <div class="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100 shadow-sm">
                  <div class="text-2xl font-bold text-cyan-600 mb-1">{{ Math.round(lastResult.score / (getTotalTimeInMinutes() || 1)) }}</div>
                  <div class="text-gray-600 text-xs font-medium">Points/Min</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Call to Action -->
        <div class="text-center">
          <router-link 
            to="/sthome/details"
            class="group inline-flex items-center px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-semibold text-base md:text-lg rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
          >
            <span class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            <svg class="w-5 h-5 md:w-6 md:h-6 mr-3 group-hover:rotate-12 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span class="relative z-10">View Detailed Question Analysis</span>
            <svg class="w-5 h-5 md:w-6 md:h-6 ml-3 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Professional Empty State -->
      <div v-else class="text-center py-16">
        <div class="bg-white rounded-2xl p-10 md:p-12 max-w-lg mx-auto border border-gray-200 shadow-xl relative overflow-hidden">
          <!-- Subtle background decoration -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl"></div>
          
          <div class="relative z-10">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border-2 border-blue-200 shadow-md">
              <img :src="logo" alt="TESTJEE Logo" class="w-14 h-14 object-contain opacity-70" />
            </div>
            <h3 class="text-2xl font-bold text-gray-800 mb-3">No Results Found</h3>
            <p class="text-gray-600 mb-8 leading-relaxed">Complete an exam to see your performance analytics here.</p>
            <router-link 
              to="/exam"
              class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Start Exam
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useExamStore } from '../stores/examStore'
import logo from '../../assets/logo_test_jee.png'

const examStore = useExamStore()
const { lastResult } = storeToRefs(examStore)

const total = computed(() => {
  // Use perQuestion length if available, otherwise fall back to examStore
  return lastResult.value?.perQuestion?.length || examStore.totalQuestions || 75
})

const attempted = computed(() => {
  // Count from perQuestion data
  if (lastResult.value?.perQuestion) {
    return lastResult.value.perQuestion.filter(p => p.chosen).length
  }
  return examStore.answeredCount
})

const correctCount = computed(() =>
  (lastResult.value?.perQuestion || []).filter(p => p.isCorrect).length
)

const wrongCount = computed(() => {
  const arr = lastResult.value?.perQuestion || []
  return arr.filter(p => (p.chosen && !p.isCorrect)).length
})

const percentageScore = computed(() => {
  if (!lastResult.value?.score) return 0
  const max = total.value * 4
  if (max === 0) return 0
  return Math.round(((lastResult.value.score / max) * 100) * 100) / 100
})

const subjectStats = computed(() => {
  const map = {}
  ;(lastResult.value?.perQuestion || []).forEach(p => {
    const s = p.subject || 'Unknown'
    if (!map[s]) map[s] = { total: 0, correct: 0, wrong: 0, time: 0 }
    map[s].total++
    if (p.isCorrect) map[s].correct++
    else if (p.chosen) map[s].wrong++
    map[s].time += (p.time_taken || 0)
  })
  return map
})

const conclusions = computed(() => {
  const msgs = []
  for (const [name, stats] of Object.entries(subjectStats.value)) {
    const pct = Math.round((stats.correct / (stats.total || 1)) * 100)
    if (pct >= 75) msgs.push(`You are quite good at ${name}!`)
    else if (pct >= 40) msgs.push(`You are decent in ${name}. Keep improving.`)
    else msgs.push(`You need to improve on ${name}.`)
  }

  const subjects = Object.entries(subjectStats.value)
  if (subjects.length) {
    subjects.sort((a, b) => b[1].time - a[1].time)
    msgs.push(`You spent most of your time in ${subjects[0][0]}. Try to manage time efficiently.`)
  }
  if (subjects.length) {
    subjects.sort((a, b) => b[1].wrong - a[1].wrong)
    if (subjects[0][1].wrong > 0) msgs.push(`You did the most wrong attempts in ${subjects[0][0]}. Re-check concepts there.`)
  }

  return msgs
})

function formatTime(seconds) {
  if (!seconds) return '0s'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m ${s}s`
}

function getSubjectHeaderClass(subject) {
  const classes = {
    'Physics': 'bg-gradient-to-r from-blue-50 to-indigo-50',
    'Chemistry': 'bg-gradient-to-r from-emerald-50 to-green-50',
    'Mathematics': 'bg-gradient-to-r from-amber-50 to-yellow-50',
    'Math': 'bg-gradient-to-r from-amber-50 to-yellow-50',
    'Maths': 'bg-gradient-to-r from-amber-50 to-yellow-50'
  }
  return classes[subject] || 'bg-gradient-to-r from-indigo-50 to-purple-50'
}

function getSubjectColorClass(subject) {
  const classes = {
    'Physics': 'bg-blue-500',
    'Chemistry': 'bg-emerald-500',
    'Mathematics': 'bg-amber-500',
    'Math': 'bg-amber-500',
    'Maths': 'bg-amber-500'
  }
  return classes[subject] || 'bg-indigo-500'
}

function getSubjectTextColor(subject) {
  const colors = {
    'Physics': 'text-blue-600',
    'Chemistry': 'text-emerald-600',
    'Mathematics': 'text-amber-600',
    'Math': 'text-amber-600',
    'Maths': 'text-amber-600'
  }
  return colors[subject] || 'text-indigo-600'
}

function getSubjectProgressColor(subject) {
  const colors = {
    'Physics': 'bg-gradient-to-r from-blue-500 to-blue-400',
    'Chemistry': 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    'Mathematics': 'bg-gradient-to-r from-amber-500 to-amber-400',
    'Math': 'bg-gradient-to-r from-amber-500 to-amber-400',
    'Maths': 'bg-gradient-to-r from-amber-500 to-amber-400'
  }
  return colors[subject] || 'bg-gradient-to-r from-indigo-500 to-indigo-400'
}

function getStrongestSubject() {
  let best = null
  let bestScore = 0
  for (const [subject, stats] of Object.entries(subjectStats.value)) {
    const score = (stats.correct / stats.total) * 100
    if (score > bestScore) {
      bestScore = score
      best = subject
    }
  }
  return best || 'N/A'
}

function getWeakestSubject() {
  let worst = null
  let worstScore = 100
  for (const [subject, stats] of Object.entries(subjectStats.value)) {
    const score = (stats.correct / stats.total) * 100
    if (score < worstScore) {
      worstScore = score
      worst = subject
    }
  }
  return worst || 'N/A'
}

function getTotalTime() {
  const totalSeconds = Object.values(subjectStats.value).reduce((sum, stats) => sum + stats.time, 0)
  return formatTime(totalSeconds)
}

function getTotalTimeInMinutes() {
  const totalSeconds = Object.values(subjectStats.value).reduce((sum, stats) => sum + stats.time, 0)
  return Math.floor(totalSeconds / 60)
}
</script>