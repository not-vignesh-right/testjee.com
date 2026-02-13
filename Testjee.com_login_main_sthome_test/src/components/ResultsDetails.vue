<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Question Analysis
        </h1>
        <router-link 
          to="/results"
          class="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-colors border border-gray-700"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Overview
        </router-link>
      </div>

      <div v-if="lastResult && lastResult.perQuestion?.length">
        <!-- Subject-wise Analysis -->
        <div class="space-y-8">
          <div v-for="(questions, subject) in groupedBySubject" :key="subject" 
               class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
            
            <!-- Subject Header -->
            <div class="px-8 py-6 border-b border-gray-700" :class="getSubjectHeaderClass(subject)">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full mr-4" :class="getSubjectColorClass(subject)"></div>
                  <h2 class="text-2xl font-bold text-white">{{ subject }}</h2>
                </div>
                <div class="flex items-center space-x-6 text-sm">
                  <div class="text-center">
                    <div class="text-xl font-bold text-green-400">{{ getSubjectCorrect(questions) }}</div>
                    <div class="text-gray-400">Correct</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xl font-bold text-red-400">{{ getSubjectWrong(questions) }}</div>
                    <div class="text-gray-400">Wrong</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xl font-bold text-gray-400">{{ getSubjectSkipped(questions) }}</div>
                    <div class="text-gray-400">Skipped</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xl font-bold text-blue-400">{{ Math.round((getSubjectCorrect(questions)/questions.length)*100) }}%</div>
                    <div class="text-gray-400">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Questions Grid -->
            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <div v-for="(q, index) in questions" :key="q.index" 
                     class="bg-gray-800 rounded-xl p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                  
                  <!-- Question Header -->
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                      <span class="text-sm font-medium text-gray-400 mr-2">Q{{ q.index + 1 }}</span>
                      <span class="text-xs font-mono bg-gray-700 px-2 py-1 rounded text-gray-300">
                        {{ q.question_id ?? '—' }}
                      </span>
                    </div>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-xs text-gray-400">{{ formatTime(q.time_taken) }}</span>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div class="mb-3">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          :class="getQuestionStatusClass(q)">
                      <svg v-if="q.isCorrect" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <svg v-else-if="q.chosen" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                      <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      {{ getQuestionStatusText(q) }}
                    </span>
                  </div>

                  <!-- Answer Details -->
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-400">Your Answer:</span>
                      <span class="text-sm font-medium" :class="getAnswerTextColor(q)">
                        {{ q.chosen ?? 'Not answered' }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-400">Correct Answer:</span>
                      <span class="text-sm font-medium text-green-400">
                        {{ q.correct ?? '—' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Summary -->
        <div class="mt-8 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-8 border border-purple-700">
          <h3 class="text-2xl font-bold text-center mb-6 text-purple-200">Overall Summary</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400 mb-2">{{ getCorrectCount() }}</div>
              <div class="text-purple-200">Total Correct</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-red-400 mb-2">{{ getWrongCount() }}</div>
              <div class="text-purple-200">Total Wrong</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-400 mb-2">{{ getUnattemptedCount() }}</div>
              <div class="text-purple-200">Unattempted</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-cyan-400 mb-2">{{ getTotalTime() }}</div>
              <div class="text-purple-200">Total Time</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <div class="bg-gray-800 rounded-3xl p-12 max-w-md mx-auto border border-gray-700">
          <div class="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-200 mb-4">No Detailed Data Available</h3>
          <p class="text-gray-400 mb-6">Complete an exam to see question-wise analysis.</p>
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
import { useExamStore } from '../stores/examStore'

const examStore = useExamStore()
const lastResult = examStore.lastResult

const groupedBySubject = computed(() => {
  const groups = {}
  ;(lastResult?.perQuestion || []).forEach(q => {
    const subject = q.subject || 'Unknown'
    if (!groups[subject]) groups[subject] = []
    groups[subject].push(q)
  })
  return groups
})

function formatTime(seconds) { 
  if(!seconds) return '0s'
  const m = Math.floor(seconds/60)
  const s = Math.floor(seconds%60)
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

function getQuestionStatusClass(q) {
  if (q.isCorrect) return 'bg-green-900 text-green-200 border border-green-700'
  if (q.chosen) return 'bg-red-900 text-red-200 border border-red-700'
  return 'bg-gray-800 text-gray-300 border border-gray-600'
}

function getQuestionStatusText(q) {
  if (q.isCorrect) return 'Correct'
  if (q.chosen) return 'Wrong'
  return 'Skipped'
}

function getAnswerTextColor(q) {
  if (!q.chosen) return 'text-gray-400'
  return q.isCorrect ? 'text-green-400' : 'text-red-400'
}

function getSubjectCorrect(questions) {
  return questions.filter(q => q.isCorrect).length
}

function getSubjectWrong(questions) {
  return questions.filter(q => q.chosen && !q.isCorrect).length
}

function getSubjectSkipped(questions) {
  return questions.filter(q => !q.chosen).length
}

function getCorrectCount() {
  return (lastResult?.perQuestion || []).filter(p => p.isCorrect).length
}

function getWrongCount() {
  return (lastResult?.perQuestion || []).filter(p => p.chosen && !p.isCorrect).length
}

function getUnattemptedCount() {
  return (lastResult?.perQuestion || []).filter(p => !p.chosen).length
}

function getTotalTime() {
  const total = (lastResult?.perQuestion || []).reduce((sum, p) => sum + (p.time_taken || 0), 0)
  return formatTime(total)
}
</script>