<template>
  <div class="dashboard-page px-6 py-6 md:px-10 md:py-8">

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
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 animate-fadeIn" style="animation-delay:0.05s">
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

    <!-- Main Content: Start Exam CTA + Profile -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8 animate-fadeIn" style="animation-delay:0.1s">

      <!-- Start Exam CTA — 3/5 width -->
      <div class="lg:col-span-3 exam-cta-card group">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-400/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <!-- decorative circles -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

        <div class="relative z-10 flex flex-col justify-between h-full">
          <div>
            <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full mb-4 tracking-wide uppercase">JEE Main Pattern</span>
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">Start Mock Test</h2>
            <p class="text-blue-100 text-base md:text-lg leading-relaxed mb-6">Full-length JEE Main paper with 75 questions across Physics, Chemistry & Mathematics.</p>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <button @click="showExamModal = true" class="px-8 py-3.5 bg-white text-blue-600 font-bold text-base rounded-xl hover:bg-blue-50 transition-all transform hover:scale-[1.03] active:scale-95 shadow-xl flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
              Start Exam
            </button>
            <div class="flex items-center gap-4 text-blue-100 text-sm font-medium">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                3 Hours
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                75 Qs
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                +4 / −1
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Trend Chart — 2/5 width -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">Score Trend</h3>
          <span class="text-xs text-gray-400 font-medium">{{ examHistory.length }} exam{{ examHistory.length !== 1 ? 's' : '' }}</span>
        </div>
        <div v-if="examHistory.length >= 1" class="h-52">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="flex flex-col items-center justify-center h-52 text-center">
          <svg class="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <p class="text-gray-400 text-sm">Take exams to see your score trend</p>
        </div>
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
                <p class="font-semibold text-gray-900 text-sm">JEE Main Mock Test</p>
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
                <p class="text-sm font-bold text-gray-800">{{ countAttempted(exam.answers) }}/75</p>
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

    <!-- Exam Type Modal -->
    <div v-if="showExamModal" class="fixed inset-0 z-50 overflow-y-auto" style="animation: fadeIn 0.2s ease-out">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" @click="showExamModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" style="animation: slideUp 0.3s ease-out">
          <h3 class="text-xl font-bold text-gray-900 mb-1">Start New Exam</h3>
          <p class="text-sm text-gray-500 mb-5">Choose the type of exam:</p>

          <button @click="startExam('JEE_MAIN_FULL')" class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group mb-3">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div class="text-left">
                <p class="font-bold text-gray-900">Full Mock Test</p>
                <p class="text-xs text-gray-500">75 Qs • 3 Hours • PCM</p>
              </div>
            </div>
            <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>

          <button class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed mb-4">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <div class="text-left">
                <p class="font-bold text-gray-900">Subject Wise</p>
                <p class="text-xs text-gray-500">Physics, Chem, or Maths</p>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase">Soon</span>
          </button>

          <button @click="showExamModal = false" class="w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const router = useRouter()
const authStore = useAuthStore()

const studentProfile = computed(() => authStore.studentProfile)
const examHistory = ref([])
const loading = ref(true)
const showExamModal = ref(false)

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

  await fetchExamHistory()
})

onUnmounted(() => {
  if (quoteTimer) clearInterval(quoteTimer)
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

function startExam(examType) {
  const examStore = useExamStore()
  examStore.resetExamState() // Clear old submission state
  examStore.setExamType(examType || 'JEE_MAIN_FULL')
  showExamModal.value = false
  router.push('/exam')
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

/* Start Exam CTA */
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