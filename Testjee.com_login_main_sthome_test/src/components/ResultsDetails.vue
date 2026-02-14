<template>
  <div class="min-h-full pb-10">
    <div class="max-w-7xl mx-auto">

      <div v-if="lastResult && lastResult.perQuestion?.length">

        <!-- Student Portal Header Banner -->
        <div class="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 md:p-8 mb-6 shadow-lg relative overflow-hidden animate-fade-in-up">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          <div class="relative z-10">
            <!-- Portal Title Row -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Performance Review</span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-white">JEE Main Mock Test {{ examLabel }}</h1>
                <p class="text-blue-100 text-sm mt-1">Score: <span class="font-bold text-white">{{ lastResult.score }}</span> / 300</p>
              </div>
              <router-link 
                to="/sthome/dashboard"
                class="inline-flex items-center px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border border-white/20 text-sm gap-2 self-start"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Dashboard
              </router-link>
            </div>

            <!-- Quick Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-white">{{ totalQuestions }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Total</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-green-300">{{ getCorrectCount() }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Correct</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-red-300">{{ getWrongCount() }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Wrong</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-gray-300">{{ getUnattemptedCount() }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Skipped</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 col-span-2 md:col-span-1">
                <div class="text-xl font-bold text-white">{{ getTotalTime() }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Time</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subject-wise Analysis -->
        <div class="space-y-5">
          <div v-for="(questions, subject, subjectIndex) in groupedBySubject" :key="subject" 
               class="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden animate-fade-in-up"
               :style="`animation-delay: ${100 + subjectIndex * 60}ms`">
            
            <!-- Subject Header with inline stats -->
            <div class="px-5 md:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-cyan-50/30">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span class="text-white text-xs font-bold">{{ subject.charAt(0) }}</span>
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-gray-900">{{ subject }}</h2>
                    <p class="text-xs text-gray-500">{{ questions.length }} questions</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <!-- Progress bar -->
                  <div class="hidden sm:block w-32">
                    <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000" 
                           :style="{ width: `${(getSubjectCorrect(questions)/questions.length)*100}%` }">
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <span class="font-bold text-green-600">{{ getSubjectCorrect(questions) }}<span class="text-gray-400 font-normal text-xs ml-0.5">✓</span></span>
                    <span class="font-bold text-red-500">{{ getSubjectWrong(questions) }}<span class="text-gray-400 font-normal text-xs ml-0.5">✗</span></span>
                    <span class="font-bold text-gray-400">{{ getSubjectSkipped(questions) }}<span class="text-gray-400 font-normal text-xs ml-0.5">—</span></span>
                    <span class="pl-2 border-l border-gray-200 font-bold text-blue-600 text-base">{{ Math.round((getSubjectCorrect(questions)/questions.length)*100) }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Questions Grid -->
            <div class="p-4 md:p-5">
              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                <div v-for="q in questions" :key="q.index" 
                     class="rounded-xl p-3.5 border transition-all duration-200 hover:shadow-sm"
                     :class="getCardClass(q)">
                  
                  <!-- Top row: Q number + time + status -->
                  <div class="flex items-center justify-between mb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            :class="getQNumberClass(q)">
                        {{ q.index + 1 }}
                      </span>
                      <span :class="getStatusBadgeClass(q)" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        {{ getQuestionStatusText(q) }}
                      </span>
                    </div>
                    <span class="text-xs text-gray-400 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ formatTime(q.time_taken) }}
                    </span>
                  </div>

                  <!-- Answers row -->
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-1">
                      <span class="text-gray-400 text-xs">You:</span>
                      <span class="font-semibold" :class="getAnswerTextColor(q)">{{ q.chosen ?? '—' }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-gray-400 text-xs">Ans:</span>
                      <span class="font-semibold text-green-600">{{ q.correct ?? '—' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 animate-fade-in-up">
        <div class="bg-white rounded-2xl p-12 max-w-md mx-auto border border-gray-200/80 shadow-sm">
          <div class="w-16 h-16 mx-auto mb-5 bg-blue-50 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">No Data Available</h3>
          <p class="text-gray-500 text-sm mb-6">Complete an exam to see your analysis.</p>
          <router-link 
            to="/exam"
            class="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md text-sm gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
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

// Generate exam label from result id
const examLabel = computed(() => {
  if (!lastResult?.id) return ''
  return `#${lastResult.id}`
})

const totalQuestions = computed(() => (lastResult?.perQuestion || []).length)

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
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function getCardClass(q) {
  if (q.isCorrect) return 'bg-green-50/60 border-green-200/70'
  if (q.chosen) return 'bg-red-50/60 border-red-200/70'
  return 'bg-gray-50/60 border-gray-200/70'
}

function getQNumberClass(q) {
  if (q.isCorrect) return 'bg-green-500 text-white'
  if (q.chosen) return 'bg-red-500 text-white'
  return 'bg-gray-300 text-white'
}

function getStatusBadgeClass(q) {
  if (q.isCorrect) return 'bg-green-100 text-green-700'
  if (q.chosen) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-500'
}

function getQuestionStatusText(q) {
  if (q.isCorrect) return 'Correct'
  if (q.chosen) return 'Wrong'
  return 'Skipped'
}

function getAnswerTextColor(q) {
  if (!q.chosen) return 'text-gray-400'
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

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out both;
}
</style>