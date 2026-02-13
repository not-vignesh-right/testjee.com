<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-white p-6 relative overflow-hidden">
    <!-- Subtle background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/30 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-4xl font-bold text-gray-900">
          Question Analysis
        </h1>
        <router-link 
          to="/sthome"
          class="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-300 shadow-sm"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </router-link>
      </div>


      <div v-if="lastResult && lastResult.perQuestion?.length">
        <!-- Subject Performance Analysis -->
        <div class="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Subject Performance Analysis</h2>
          
          <!-- Subject Performance Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subject-wise Question Analysis -->
        <div class="space-y-8">
          <div v-for="(questions, subject) in groupedBySubject" :key="subject" 
               class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            
            <!-- Subject Header -->
            <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full mr-4 bg-blue-500"></div>
                  <h2 class="text-2xl font-bold text-gray-900">{{ subject }}</h2>
                </div>
                <div class="flex items-center space-x-6 text-sm">
                  <div class="text-center">
                    <div class="text-xl font-bold text-green-600">{{ getSubjectCorrect(questions) }}</div>
                    <div class="text-gray-600">Correct</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xl font-bold text-red-600">{{ getSubjectWrong(questions) }}</div>
                    <div class="text-gray-600">Wrong</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xl font-bold text-gray-500">{{ getSubjectSkipped(questions) }}</div>
                    <div class="text-gray-600">Skipped</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xl font-bold text-blue-600">{{ Math.round((getSubjectCorrect(questions)/questions.length)*100) }}%</div>
                    <div class="text-gray-600">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Questions Grid -->
            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <div v-for="(q, index) in questions" :key="q.index" 
                     class="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                  
                  <!-- Question Header -->
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                      <span class="text-sm font-medium text-gray-600 mr-2">Q{{ q.index + 1 }}</span>
                      <span class="text-xs font-mono bg-white px-2 py-1 rounded text-gray-500 border border-gray-200">
                        {{ q.question_id ?? '—' }}
                      </span>
                    </div>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-xs text-gray-600">{{ formatTime(q.time_taken) }}</span>
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
                      <span class="text-sm text-gray-600">Your Answer:</span>
                      <span class="text-sm font-medium" :class="getAnswerTextColor(q)">
                        {{ q.chosen ?? 'Not answered' }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">Correct Answer:</span>
                      <span class="text-sm font-medium text-green-600">
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
        <div class="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 border border-blue-400 shadow-lg">
          <h3 class="text-2xl font-bold text-center mb-6 text-white">Overall Summary</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">{{ getCorrectCount() }}</div>
              <div class="text-blue-100">Total Correct</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">{{ getWrongCount() }}</div>
              <div class="text-blue-100">Total Wrong</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">{{ getUnattemptedCount() }}</div>
              <div class="text-blue-100">Unattempted</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">{{ getTotalTime() }}</div>
              <div class="text-blue-100">Total Time</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <div class="bg-white rounded-3xl p-12 max-w-md mx-auto border border-gray-200 shadow-sm">
          <div class="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-800 mb-4">No Detailed Data Available</h3>
          <p class="text-gray-600 mb-6">Complete an exam to see question-wise analysis.</p>
          <router-link 
            to="/exam"
            class="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-md"
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

// Calculate subject statistics for performance cards
const subjectStats = computed(() => {
  const stats = {}
  
  Object.entries(groupedBySubject.value).forEach(([subject, questions]) => {
    const total = questions.length
    const correct = questions.filter(q => q.isCorrect).length
    const wrong = questions.filter(q => q.chosen && !q.isCorrect).length
    
    stats[subject] = {
      total,
      correct,
      wrong
    }
  })
  
  return stats
})


function formatTime(seconds) { 
  if(!seconds) return '0s'
  const m = Math.floor(seconds/60)
  const s = Math.floor(seconds%60)
  return `${m}m ${s}s` 
}

function getQuestionStatusClass(q) {
  if (q.isCorrect) return 'bg-green-100 text-green-700 border border-green-200'
  if (q.chosen) return 'bg-red-100 text-red-700 border border-red-200'
  return 'bg-gray-100 text-gray-600 border border-gray-200'
}

function getQuestionStatusText(q) {
  if (q.isCorrect) return 'Correct'
  if (q.chosen) return 'Wrong'
  return 'Skipped'
}

function getAnswerTextColor(q) {
  if (!q.chosen) return 'text-gray-500'
  return q.isCorrect ? 'text-green-600' : 'text-red-600'
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