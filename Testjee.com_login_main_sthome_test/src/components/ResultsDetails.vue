<template>
  <div class="min-h-full pb-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
        <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p class="text-gray-500 font-medium text-sm">Loading your exam analysis...</p>
      </div>

      <!-- Results Content -->
      <div v-else-if="result && result.perQuestion?.length">

        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl p-6 md:p-8 mb-6 shadow-lg relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

          <div class="relative z-10">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Performance Review</span>
                </div>
                <h1 class="text-2xl md:text-3xl font-bold text-white">{{ examConfig.shortLabel }} Mock Test {{ examLabel }}</h1>
                <p class="text-blue-100 text-sm mt-1">Score: <span class="font-bold text-white">{{ result.score }}</span> / {{ examConfig.maxScore }}</p>
              </div>
              <router-link
                to="/sthome/dashboard"
                class="inline-flex items-center px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold rounded-xl transition-all border border-white/20 text-sm gap-2 self-start"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Dashboard
              </router-link>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-white">{{ totalQuestions }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Total</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-green-300">{{ correctCount }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Correct</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-red-300">{{ wrongCount }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Wrong</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                <div class="text-xl font-bold text-gray-300">{{ skippedCount }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Skipped</div>
              </div>
              <div class="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 col-span-2 md:col-span-1">
                <div class="text-xl font-bold text-white">{{ totalTime }}</div>
                <div class="text-blue-100 text-[10px] font-medium uppercase tracking-wide">Time</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subject-wise Analysis -->
        <div class="space-y-5">
          <div
            v-for="(questions, subject, subjectIndex) in groupedBySubject"
            :key="subject"
            class="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
            :style="`animation-delay: ${100 + subjectIndex * 60}ms`"
          >
            <!-- Subject Header -->
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
                  <div class="hidden sm:block w-32">
                    <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                        :style="{ width: `${(getSubjectCorrect(questions)/questions.length)*100}%` }"
                      ></div>
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
                <div
                  v-for="q in questions"
                  :key="q.index"
                  class="rounded-xl p-3.5 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
                  :class="getCardClass(q)"
                  @click="goToDetail(q.question_id)"
                >
                  <!-- Top row -->
                  <div class="flex items-center justify-between mb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" :class="getQNumberClass(q)">
                        {{ q.index + 1 }}
                      </span>
                      <span :class="getStatusBadgeClass(q)" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        {{ getQuestionStatusText(q) }}
                      </span>
                    </div>
                    <span class="text-xs text-gray-400 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
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

                  <!-- CTA -->
                  <div
                    class="mt-2.5 pt-2.5 border-t border-current/10 flex items-center justify-end text-[10px] font-bold uppercase tracking-wide opacity-50 group-hover:opacity-100 transition-opacity"
                    :class="q.isCorrect ? 'text-green-700' : q.chosen ? 'text-red-700' : 'text-gray-500'"
                  >
                    View Details
                    <svg class="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty / Error State -->
      <div v-else class="flex flex-col items-center justify-center py-20">
        <div class="bg-white rounded-2xl p-12 max-w-md w-full mx-auto border border-gray-200 shadow-sm text-center">
          <div class="w-16 h-16 mx-auto mb-5 bg-blue-50 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">{{ loadError || 'No Analysis Available' }}</h3>
          <p class="text-gray-500 text-sm mb-6">
            {{ loadError ? 'There was a problem loading your exam data.' : 'Go to Dashboard and click "View Analysis" on an exam.' }}
          </p>
          <router-link
            to="/sthome/dashboard"
            class="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md text-sm gap-2"
          >
            ← Back to Dashboard
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

const router = useRouter()
const examStore = useExamStore()
const authStore = useAuthStore()

const isLoading = ref(false)
const loadError = ref('')

// ── REACTIVE DATA ─────────────────────────────────────────────────────────────
// `result` is the plain computed value — Vue auto-unwraps it in the template.
// Using examStore.lastResult directly (not double-wrapping in computed)
// to avoid the ComputedRef property-access bug that caused the white screen.
const result = computed(() => examStore.lastResult)

// ── EXAM CONFIG ───────────────────────────────────────────────────────────────
const EXAM_CONFIG_MAP = {
  'JEE_MAIN_FULL':     { shortLabel: 'JEE Main',        maxScore: 300 },
  'NEET_UG_FULL':      { shortLabel: 'NEET UG',         maxScore: 720 },
  'KCET_PHYSICS':      { shortLabel: 'KCET Physics',    maxScore: 60  },
  'KCET_CHEMISTRY':    { shortLabel: 'KCET Chemistry',  maxScore: 60  },
  'KCET_MATHEMATICS':  { shortLabel: 'KCET Mathematics',maxScore: 60  },
  'KCET_BIOLOGY':      { shortLabel: 'KCET Biology',    maxScore: 60  },
}

const examConfig = computed(() => {
  const examType = result.value?.examType || examStore.examType
  return EXAM_CONFIG_MAP[examType] ?? { shortLabel: 'JEE Main', maxScore: 300 }
})

const examLabel = computed(() => result.value?.id ? `#${result.value.id}` : '')

// ── STATS (computed, not functions — avoids re-running on every render) ───────
const perQ = computed(() => result.value?.perQuestion || [])
const totalQuestions = computed(() => perQ.value.length)
const correctCount   = computed(() => perQ.value.filter(p => p.isCorrect).length)
const wrongCount     = computed(() => perQ.value.filter(p => p.chosen && !p.isCorrect).length)
const skippedCount   = computed(() => perQ.value.filter(p => !p.chosen).length)
const totalTime      = computed(() => {
  const secs = perQ.value.reduce((s, p) => s + (p.time_taken || 0), 0)
  return formatTime(secs)
})

const groupedBySubject = computed(() => {
  const groups = {}
  perQ.value.forEach(q => {
    const subject = q.subject || 'Unknown'
    if (!groups[subject]) groups[subject] = []
    groups[subject].push(q)
  })
  return groups
})

// ── HELPERS ───────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds) return '0s'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function goToDetail(questionId) {
  if (questionId) router.push({ name: 'QuestionDetail', params: { id: questionId } })
}

function getCardClass(q) {
  if (q.isCorrect) return 'bg-green-50/60 border-green-200/70'
  if (q.chosen)    return 'bg-red-50/60 border-red-200/70'
  return 'bg-gray-50/60 border-gray-200/70'
}
function getQNumberClass(q) {
  if (q.isCorrect) return 'bg-green-500 text-white'
  if (q.chosen)    return 'bg-red-500 text-white'
  return 'bg-gray-300 text-white'
}
function getStatusBadgeClass(q) {
  if (q.isCorrect) return 'bg-green-100 text-green-700'
  if (q.chosen)    return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-500'
}
function getQuestionStatusText(q) {
  if (q.isCorrect) return 'Correct'
  if (q.chosen)    return 'Wrong'
  return 'Skipped'
}
function getAnswerTextColor(q) {
  if (!q.chosen) return 'text-gray-400'
  return q.isCorrect ? 'text-green-600' : 'text-red-600'
}
function getSubjectCorrect(questions)  { return questions.filter(q => q.isCorrect).length }
function getSubjectWrong(questions)    { return questions.filter(q => q.chosen && !q.isCorrect).length }
function getSubjectSkipped(questions)  { return questions.filter(q => !q.chosen).length }

// ── SELF-LOAD: fetch latest result from DB if store is empty ─────────────────
// This makes the page work even on page-refresh or direct URL navigation.
onMounted(async () => {
  // If store already has data from the normal flow (Results → View Analysis → here)
  if (examStore.lastResult?.perQuestion?.length) return

  isLoading.value = true
  loadError.value = ''

  try {
    const studentId = authStore.studentProfile?.student_id || authStore.studentId
    if (!studentId) {
      loadError.value = 'Not logged in.'
      return
    }

    // 1. Fetch the latest result row for this student
    const { data: resultRows, error: resultErr } = await supabase
      .from('results')
      .select('result_id, score, creation_date, answers, session_id, exam_sessions(exam_type)')
      .eq('student_id', studentId)
      .order('creation_date', { ascending: false })
      .limit(1)

    if (resultErr) throw resultErr
    if (!resultRows || resultRows.length === 0) {
      loadError.value = 'No exam results found.'
      return
    }

    const latestResult = resultRows[0]
    if (!latestResult.answers || !Array.isArray(latestResult.answers)) {
      loadError.value = 'Result data is incomplete.'
      return
    }

    // 2. Fetch question details (subjects + correct answers)
    const questionIds = latestResult.answers
      .filter(a => a && a.question_id)
      .map(a => a.question_id)

    if (questionIds.length === 0) {
      loadError.value = 'No questions found in this result.'
      return
    }

    const { data: questionsData, error: qErr } = await supabase
      .from('questions')
      .select('question_id, question_type, subjects(subject_name), topics(topic_name), choices(correct_answer)')
      .in('question_id', questionIds)

    if (qErr) throw qErr

    // 3. Build lookup maps
    const questionMap = {}
    const correctById = {}
    ;(questionsData || []).forEach(q => {
      questionMap[q.question_id] = {
        subject: q.subjects?.subject_name || 'Unknown',
        topic:   q.topics?.topic_name    || 'Not specified',
        question_type: q.question_type
      }
      if (q.choices?.correct_answer) {
        correctById[q.question_id] = q.choices.correct_answer
      }
    })

    // 4. Build perQuestion array
    const perQuestion = latestResult.answers.map((a, idx) => {
      if (!a || !a.question_id) {
        return { question_id: null, index: idx, subject: null, topic: null, chosen: null, correct: null, isCorrect: false, time_taken: 0 }
      }
      const info = questionMap[a.question_id] || {}
      const correctAnswer = correctById[a.question_id]
      let isCorrect = false
      if (a.answer && correctAnswer) {
        isCorrect = info.question_type === 'numeric'
          ? Number(a.answer) === Number(correctAnswer)
          : a.answer === correctAnswer
      }
      return {
        question_id: a.question_id,
        index: idx,
        subject: info.subject || 'Unknown',
        topic:   info.topic   || 'Not specified',
        chosen:  a.answer,
        correct: correctAnswer,
        isCorrect,
        time_taken: a.time_taken || 0
      }
    })

    // 5. Set store data
    examStore.lastResult = {
      id:          latestResult.result_id,
      score:       latestResult.score,
      examType:    latestResult.exam_sessions?.exam_type,
      answers:     latestResult.answers,
      perQuestion,
      correctById
    }
    examStore.isSubmitted = true
    if (latestResult.exam_sessions?.exam_type) {
      examStore.setExamType(latestResult.exam_sessions.exam_type)
    }

  } catch (err) {
    console.error('ResultsDetails: failed to self-load result:', err)
    loadError.value = err.message || 'Failed to load exam data.'
  } finally {
    isLoading.value = false
  }
})
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