<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Exam Results
      </h1>

      <!-- If exam is submitted -->
      <div v-if="lastResult && lastResult.perQuestion" class="space-y-8">
        
        <!-- Hero Score Card -->
        <div class="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700 overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-green-500/10 rounded-full blur-3xl"></div>
          
          <div class="relative z-10 text-center">
            <div class="mb-8">
              <div class="text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                {{ percentageScore }}%
              </div>
              <div class="text-2xl text-gray-300 font-medium">Overall Performance</div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
                <div class="text-3xl font-bold text-green-400 mb-2">{{ lastResult.score }}</div>
                <div class="text-gray-400">Your Score</div>
                <div class="text-xs text-gray-500 mt-1">out of {{ total * 4 }}</div>
              </div>
              <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
                <div class="text-3xl font-bold text-blue-400 mb-2">{{ correctCount }}</div>
                <div class="text-gray-400">Correct</div>
                <div class="text-xs text-gray-500 mt-1">{{ total > 0 ? Math.round((correctCount/total)*100) : 0 }}% accuracy</div>
              </div>
              <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
                <div class="text-3xl font-bold text-red-400 mb-2">{{ wrongCount }}</div>
                <div class="text-gray-400">Wrong</div>
                <div class="text-xs text-gray-500 mt-1">{{ total > 0 ? Math.round((wrongCount/total)*100) : 0 }}% mistakes</div>
              </div>
              <div class="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600">
                <div class="text-3xl font-bold text-gray-400 mb-2">{{ total - attempted }}</div>
                <div class="text-gray-400">Skipped</div>
                <div class="text-xs text-gray-500 mt-1">{{ attempted }}/{{ total }} attempted</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subject Performance Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(stats, subject) in subjectStats" :key="subject" 
               class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden group hover:border-gray-600 transition-all">
            
            <!-- Subject Header -->
            <div class="px-6 py-4 border-b border-gray-700" :class="getSubjectHeaderClass(subject)">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 rounded-full mr-3" :class="getSubjectColorClass(subject)"></div>
                  <h3 class="text-xl font-bold text-white">{{ subject }}</h3>
                </div>
                <div class="text-2xl font-black" :class="getSubjectTextColor(subject)">
                  {{ Math.round((stats.correct/stats.total || 0) * 100) }}%
                </div>
              </div>
            </div>

            <!-- Subject Stats -->
            <div class="p-6">
              <div class="space-y-4">
                <!-- Progress Bar -->
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-400">Progress</span>
                    <span class="text-gray-300">{{ stats.correct }}/{{ stats.total }}</span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-3">
                    <div class="h-3 rounded-full transition-all duration-1000 ease-out" 
                         :class="getSubjectProgressColor(subject)"
                         :style="{ width: `${(stats.correct/stats.total || 0) * 100}%` }">
                    </div>
                  </div>
                </div>

                <!-- Quick Stats Grid -->
                <div class="grid grid-cols-3 gap-3 text-center">
                  <div class="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <div class="text-lg font-bold text-green-400">{{ stats.correct }}</div>
                    <div class="text-xs text-gray-500">Correct</div>
                  </div>
                  <div class="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <div class="text-lg font-bold text-red-400">{{ stats.wrong }}</div>
                    <div class="text-xs text-gray-500">Wrong</div>
                  </div>
                  <div class="bg-gray-800 rounded-lg p-3 border border-gray-600">
                    <div class="text-lg font-bold text-gray-400">{{ stats.total - stats.correct - stats.wrong }}</div>
                    <div class="text-xs text-gray-500">Skipped</div>
                  </div>
                </div>

                <!-- Time Spent -->
                <div class="flex items-center justify-between py-2 border-t border-gray-700">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-gray-400 text-sm">Time spent</span>
                  </div>
                  <span class="text-gray-300 font-medium">{{ formatTime(stats.time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Analysis -->
        <div class="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 border border-purple-700">
          <h2 class="text-3xl font-bold text-center mb-8 text-purple-200">Performance Analysis</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Insights -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-purple-200 mb-4 flex items-center">
                <svg class="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Key Insights
              </h3>
              <div class="space-y-3">
                <div v-for="(msg, i) in conclusions" :key="i" 
                     class="flex items-start p-4 rounded-xl border-l-4 border-purple-500 bg-black/20 backdrop-blur-sm">
                  <div class="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span class="text-purple-100">{{ msg }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-purple-200 mb-4 flex items-center">
                <svg class="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Performance Metrics
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-600">
                  <div class="text-2xl font-bold text-green-400">{{ getStrongestSubject() }}</div>
                  <div class="text-purple-200 text-sm">Strongest Subject</div>
                </div>
                <div class="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-600">
                  <div class="text-2xl font-bold text-yellow-400">{{ getWeakestSubject() }}</div>
                  <div class="text-purple-200 text-sm">Needs Work</div>
                </div>
                <div class="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-600">
                  <div class="text-2xl font-bold text-blue-400">{{ getTotalTime() }}</div>
                  <div class="text-purple-200 text-sm">Total Time</div>
                </div>
                <div class="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-purple-600">
                  <div class="text-2xl font-bold text-cyan-400">{{ Math.round(lastResult.score / (getTotalTimeInMinutes() || 1)) }}</div>
                  <div class="text-purple-200 text-sm">Points/Min</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="text-center">
          <router-link 
            to="/results/details"
            class="group inline-flex items-center px-16 py-6 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white font-bold text-xl rounded-full hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
          >
            <svg class="w-8 h-8 mr-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Dive Into Question Analysis
            <svg class="w-8 h-8 ml-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </router-link>
        </div>
      </div>

      <!-- If no result -->
      <div v-else class="text-center py-16">
        <div class="bg-gray-800 rounded-3xl p-12 max-w-md mx-auto border border-gray-700">
          <div class="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-200 mb-4">No Results Found</h3>
          <p class="text-gray-400 mb-6">Complete an exam to see your performance analytics here.</p>
          <router-link 
            to="/"
            class="inline-flex items-center px-8 py-3 bg-cyan-600 text-white font-semibold rounded-full hover:bg-cyan-700 transition-colors"
          >
            Start Exam
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useExamStore } from '../stores/examStore'

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
    'Physics': 'bg-gradient-to-r from-blue-900 to-blue-800',
    'Chemistry': 'bg-gradient-to-r from-green-900 to-green-800',
    'Mathematics': 'bg-gradient-to-r from-yellow-900 to-yellow-800',
    'Math': 'bg-gradient-to-r from-yellow-900 to-yellow-800',
    'Maths': 'bg-gradient-to-r from-yellow-900 to-yellow-800'
  }
  return classes[subject] || 'bg-gradient-to-r from-purple-900 to-purple-800'
}

function getSubjectColorClass(subject) {
  const classes = {
    'Physics': 'bg-blue-500',
    'Chemistry': 'bg-green-500',
    'Mathematics': 'bg-yellow-500',
    'Math': 'bg-yellow-500',
    'Maths': 'bg-yellow-500'
  }
  return classes[subject] || 'bg-purple-500'
}

function getSubjectTextColor(subject) {
  const colors = {
    'Physics': 'text-blue-400',
    'Chemistry': 'text-green-400',
    'Mathematics': 'text-yellow-400',
    'Math': 'text-yellow-400',
    'Maths': 'text-yellow-400'
  }
  return colors[subject] || 'text-purple-400'
}

function getSubjectProgressColor(subject) {
  const colors = {
    'Physics': 'bg-gradient-to-r from-blue-500 to-blue-400',
    'Chemistry': 'bg-gradient-to-r from-green-500 to-green-400',
    'Mathematics': 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    'Math': 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    'Maths': 'bg-gradient-to-r from-yellow-500 to-yellow-400'
  }
  return colors[subject] || 'bg-gradient-to-r from-purple-500 to-purple-400'
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