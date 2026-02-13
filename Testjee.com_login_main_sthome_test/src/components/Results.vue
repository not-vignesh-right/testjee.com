<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-white p-6 relative overflow-hidden">
    <!-- Subtle background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/30 rounded-full blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Professional Header -->
      <div class="mb-12">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div class="flex items-center gap-5">
            <div class="relative">
              <img :src="logo" alt="TESTJEE Logo" class="w-16 h-16 object-contain" />
              <div class="absolute inset-0 bg-blue-100/30 rounded-full blur-xl -z-10"></div>
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                Exam Results
              </h1>
              <p class="text-gray-600 text-sm font-medium">Performance Analytics Dashboard</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500 font-medium mb-1">Exam Date</div>
            <div class="text-sm text-gray-700 font-semibold">{{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
          </div>
        </div>
      </div>

      <!-- If exam is submitted -->
      <div v-if="lastResult && lastResult.perQuestion" class="space-y-8">
        
        <!-- Professional Hero Score Card -->
        <div class="relative bg-white rounded-xl p-8 md:p-10 shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div class="relative z-10">
            <!-- Main Score Display -->
            <div class="text-center mb-8 pb-8 border-b border-gray-200">
              <div class="inline-block">
                <div class="text-6xl md:text-7xl font-bold text-blue-600 mb-2 leading-none">
                  {{ percentageScore }}%
                </div>
                <div class="text-lg text-gray-600 font-medium">Overall Performance Score</div>
              </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div class="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{{ lastResult.score }}</div>
                <div class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Score</div>
                <div class="text-xs text-gray-400">out of {{ total * 4 }} marks</div>
              </div>
              <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div class="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{{ correctCount }}</div>
                <div class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Correct Answers</div>
                <div class="text-xs text-gray-400">{{ total > 0 ? Math.round((correctCount/total)*100) : 0 }}% accuracy rate</div>
              </div>
              <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div class="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{{ wrongCount }}</div>
                <div class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Incorrect Answers</div>
                <div class="text-xs text-gray-400">{{ total > 0 ? Math.round((wrongCount/total)*100) : 0 }}% error rate</div>
              </div>
              <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div class="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{{ total - attempted }}</div>
                <div class="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Unattempted</div>
                <div class="text-xs text-gray-400">{{ attempted }}/{{ total }} questions answered</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Subject Performance Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div v-for="(stats, subject) in subjectStats" :key="subject" 
               class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
            
            <!-- Subject Header -->
            <div class="px-6 py-4 bg-blue-50 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                  <h3 class="text-base font-semibold text-gray-900">{{ subject }}</h3>
                </div>
                <div class="text-xl font-bold text-blue-600">
                  {{ Math.round((stats.correct/stats.total || 0) * 100) }}%
                </div>
              </div>
            </div>

            <!-- Subject Stats -->
            <div class="p-6">
              <div class="space-y-5">
                <!-- Progress Bar -->
                <div>
                  <div class="flex justify-between items-center mb-2.5">
                    <span class="text-xs font-medium text-gray-600 uppercase tracking-wide">Performance</span>
                    <span class="text-xs font-semibold text-gray-700">{{ stats.correct }}/{{ stats.total }} correct</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out" 
                         :style="{ width: `${(stats.correct/stats.total || 0) * 100}%` }">
                    </div>
                  </div>
                </div>

                <!-- Quick Stats Grid -->
                <div class="grid grid-cols-3 gap-2.5">
                  <div class="bg-blue-50 rounded-md p-3 border border-blue-100 text-center">
                    <div class="text-lg font-bold text-blue-600 mb-0.5">{{ stats.correct }}</div>
                    <div class="text-[10px] text-gray-600 font-medium uppercase tracking-wide">Correct</div>
                  </div>
                  <div class="bg-gray-50 rounded-md p-3 border border-gray-200 text-center">
                    <div class="text-lg font-bold text-gray-600 mb-0.5">{{ stats.wrong }}</div>
                    <div class="text-[10px] text-gray-600 font-medium uppercase tracking-wide">Wrong</div>
                  </div>
                  <div class="bg-gray-50 rounded-md p-3 border border-gray-200 text-center">
                    <div class="text-lg font-bold text-gray-600 mb-0.5">{{ stats.total - stats.correct - stats.wrong }}</div>
                    <div class="text-[10px] text-gray-600 font-medium uppercase tracking-wide">Skipped</div>
                  </div>
                </div>

                <!-- Time Spent -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div class="flex items-center gap-2 text-gray-600">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-xs font-medium">Time Spent</span>
                  </div>
                  <span class="text-gray-900 font-semibold text-xs">{{ formatTime(stats.time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Performance Analysis -->
        <div class="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-8">
          <div class="mb-8 pb-4 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-900">Performance Analysis</h2>
            <p class="text-sm text-gray-600 mt-1">Detailed insights into your exam performance</p>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Insights -->
            <div>
              <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Key Insights
              </h3>
              <div class="space-y-2.5">
                <div v-for="(msg, i) in conclusions" :key="i" 
                     class="flex items-start gap-3 p-3 rounded-md border-l-2 border-blue-500 bg-blue-50/50">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <span class="text-sm text-gray-700 leading-relaxed">{{ msg }}</span>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div>
              <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Performance Metrics
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white rounded-md p-4 border border-gray-200">
                  <div class="text-lg font-bold text-blue-600 mb-1">{{ getStrongestSubject() }}</div>
                  <div class="text-xs text-gray-600 font-medium">Strongest Subject</div>
                </div>
                <div class="bg-white rounded-md p-4 border border-gray-200">
                  <div class="text-lg font-bold text-blue-600 mb-1">{{ getWeakestSubject() }}</div>
                  <div class="text-xs text-gray-600 font-medium">Needs Improvement</div>
                </div>
                <div class="bg-white rounded-md p-4 border border-gray-200">
                  <div class="text-lg font-bold text-blue-600 mb-1">{{ getTotalTime() }}</div>
                  <div class="text-xs text-gray-600 font-medium">Total Time Spent</div>
                </div>
                <div class="bg-white rounded-md p-4 border border-gray-200">
                  <div class="text-lg font-bold text-blue-600 mb-1">{{ Math.round(lastResult.score / (getTotalTimeInMinutes() || 1)) }}</div>
                  <div class="text-xs text-gray-600 font-medium">Points per Minute</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Professional Call to Action -->
        <div class="text-center pt-4">
          <router-link 
            to="/sthome/details"
            class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            View Detailed Question Analysis
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Professional Empty State -->
      <div v-else class="text-center py-20">
        <div class="bg-white rounded-lg p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
          <div class="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
            <img :src="logo" alt="TESTJEE Logo" class="w-12 h-12 object-contain opacity-60" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Results Available</h3>
          <p class="text-sm text-gray-600 mb-8">Complete an exam to view your performance analytics and detailed insights.</p>
          <router-link 
            to="/exam"
            class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
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
  // All subjects use blue gradient
  return 'bg-gradient-to-r from-blue-50 to-blue-100/50'
}

function getSubjectColorClass(subject) {
  // All subjects use blue
  return 'bg-blue-500'
}

function getSubjectTextColor(subject) {
  // All subjects use blue
  return 'text-blue-600'
}

function getSubjectProgressColor(subject) {
  // All subjects use blue gradient
  return 'bg-gradient-to-r from-blue-500 to-blue-600'
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