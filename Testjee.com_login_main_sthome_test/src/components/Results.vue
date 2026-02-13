<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/30 to-white p-6 relative overflow-hidden">
    <!-- Subtle background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/30 rounded-full blur-3xl"></div>
    </div>
    
    <div class="max-w-7xl mx-auto relative z-10 w-full">
      <!-- Title Section (Simplified) -->
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Student Dashboard
          </h1>
          <p class="text-gray-600 text-sm font-medium">Overview of your performance</p>
        </div>
        <div class="text-right hidden md:block">
          <div class="text-xs text-gray-500 font-medium mb-1">Today's Date</div>
          <div class="text-sm text-gray-700 font-semibold">{{ formattedToday }}</div>
        </div>
      </div>

      <!-- Exam Type Selection Buttons -->
      <div class="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Select Exam Type</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- JEE Button (Active) -->
          <button 
            @click="startExam('JEE_MAIN_FULL')"
            class="relative group bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-bold">JEE Main</h3>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-sm text-blue-100">Full Test • 3 Hours • 75 Questions</p>
            <div v-if="hasActiveSession" class="mt-2 text-xs bg-white/20 px-2 py-1 rounded inline-block">
              Resume Active Session
            </div>
          </button>

          <!-- KCET Button (Coming Soon) -->
          <button 
            disabled
            class="relative bg-gray-100 text-gray-400 p-6 rounded-lg cursor-not-allowed border-2 border-gray-200"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-bold">KCET</h3>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <p class="text-sm">Coming Soon</p>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span class="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">Coming Soon</span>
            </div>
          </button>

          <!-- NEET Button (Coming Soon) -->
          <button 
            disabled
            class="relative bg-gray-100 text-gray-400 p-6 rounded-lg cursor-not-allowed border-2 border-gray-200"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-bold">NEET</h3>
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <p class="text-sm">Coming Soon</p>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span class="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">Coming Soon</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Quick Statistics -->
      <div v-if="statistics" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div class="text-3xl font-bold text-blue-600 mb-1">{{ statistics.totalExams }}</div>
          <div class="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Exams</div>
        </div>
        <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div class="text-3xl font-bold text-blue-600 mb-1">{{ statistics.avgScore }}</div>
          <div class="text-xs text-gray-500 font-medium uppercase tracking-wide">Average Score</div>
        </div>
        <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div class="text-3xl font-bold text-blue-600 mb-1">{{ statistics.bestScore }}</div>
          <div class="text-xs text-gray-500 font-medium uppercase tracking-wide">Best Score</div>
        </div>
        <div class="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div class="flex items-center gap-2">
            <svg v-if="statistics.trend === 'improving'" class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <svg v-else-if="statistics.trend === 'declining'" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"></path>
            </svg>
            <span class="text-xl font-bold" :class="getTrendColorClass(statistics.trend)">
              {{ getTrendText(statistics.trend) }}
            </span>
          </div>
          <div class="text-xs text-gray-500 font-medium uppercase tracking-wide">Performance Trend</div>
        </div>
      </div>

      <!-- Performance Chart -->
      <div v-if="allResults.length > 0" class="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Score Trend</h2>
        <Line :data="chartData" :options="chartOptions" />
      </div>

      <!-- Recent Exams -->
      <div class="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Recent Exams</h2>
        
        <div v-if="loading" class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p class="text-gray-600 text-lg">Loading your exam history...</p>
        </div>

        <div v-else-if="allResults.length === 0" class="text-center py-16">
          <div class="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Exams Yet</h3>
          <p class="text-sm text-gray-600 mb-8">Start your first JEE exam to see results here!</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="exam in recentExams" 
            :key="exam.result_id"
            class="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            @click="viewExamDetails(exam)"
          >
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <h3 class="font-bold text-gray-900 text-lg">{{ getExamTypeName(exam.session?.exam_type) }}</h3>
                  <span class="px-3 py-1 rounded-full text-sm font-bold" :class="getScoreClass(exam.score)">
                    {{ exam.score }} points
                  </span>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="text-sm">
                    <span class="text-gray-500">Date:</span>
                    <span class="text-gray-900 font-medium ml-1">{{ formatDate(exam.creation_date) }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Duration:</span>
                    <span class="text-gray-900 font-medium ml-1">{{ calculateDuration(exam) }}</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Attempted:</span>
                    <span class="text-gray-900 font-medium ml-1">{{ countAttempted(exam.answers) }}/75</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">Accuracy:</span>
                    <span class="text-gray-900 font-medium ml-1">{{ calculateAccuracy(exam) }}%</span>
                  </div>
                </div>
              </div>
              
              <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Latest Result Detailed Analytics removed - now shown in details page -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import logo from '../../assets/logo_test_jee.png'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const router = useRouter()
const examStore = useExamStore()
const authStore = useAuthStore()
const { allResults, statistics, sessionId } = storeToRefs(examStore)

const loading = ref(false)
const hasActiveSession = ref(false)

const studentName = computed(() => authStore.studentProfile?.student_name || 'Student')

const formattedToday = computed(() => {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

const recentExams = computed(() => {
  return allResults.value.slice(0, 10) // Show last 10 exams
})

const latestResult = computed(() => {
  if (allResults.value.length === 0) return null
  return allResults.value[0]
})

// Chart data for score trend
const chartData = computed(() => {
  const labels = allResults.value.slice().reverse().map((exam, idx) => `Exam ${idx + 1}`)
  const scores = allResults.value.slice().reverse().map(exam => exam.score)
  
  return {
    labels,
    datasets: [{
      label: 'Score',
      data: scores,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

// Compute subject stats for latest exam
const latestSubjectStats = computed(() => {
  if (!latestResult.value || !latestResult.value.answers) return {}
  
  return computeSubjectStatsForExam(latestResult.value)
})

onMounted(async () => {
  loading.value = true
  try {
    // Fetch all student results
    await examStore.fetchStudentResults()
    
    // Check for active session
    await checkActiveSession()
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
})

async function checkActiveSession() {
  if (!authStore.studentId) return
  
  try {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('session_id')
      .eq('student_id', authStore.studentId)
      .eq('exam_type', 'JEE_MAIN_FULL')
      .eq('is_submitted', false)
      .maybeSingle()
    
    if (error) console.error('Error checking active session:', error)
    hasActiveSession.value = !!data
  } catch (error) {
    console.error('Error checking active session:', error)
  }
}

function startExam(examType) {
  examStore.setExamType(examType)
  router.push('/exam')
}

async function viewExamDetails(exam) {
  try {
    // Get question IDs
    const questionIds = exam.answers
      .filter(a => a && a.question_id)
      .map(a => a.question_id)
    
    if (questionIds.length === 0) {
      alert('No questions found in this exam')
      return
    }
    
    // Fetch questions with subject info and correct answers
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        question_id,
        subject_id,
        question_type,
        subjects (subject_name),
        topics (topic_name),
        choices (correct_answer)
      `)
      .in('question_id', questionIds)
    
    if (questionsError) throw questionsError
    
    // Build lookup maps
    const questionMap = {}
    const correctById = {}
    
    questionsData.forEach(q => {
      questionMap[q.question_id] = {
        subject: q.subjects?.subject_name || 'Unknown',
        topic: q.topics?.topic_name || 'Not specified',
        question_type: q.question_type
      }
      if (q.choices && q.choices.correct_answer) {
        correctById[q.question_id] = q.choices.correct_answer
      }
    })
    
    // Build perQuestion array
    const perQuestion = exam.answers.map((a, idx) => {
      if (!a || !a.question_id) {
        return {
          question_id: null,
          index: idx,
          subject: null,
          topic: null,
          chosen: null,
          correct: null,
          isCorrect: false,
          time_taken: 0
        }
      }
      
      const questionInfo = questionMap[a.question_id] || {}
      const correctAnswer = correctById[a.question_id]
      
      // Check if correct
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
        topic: questionInfo.topic || 'Not specified',
        chosen: a.answer,
        correct: correctAnswer,
        isCorrect,
        time_taken: a.time_taken || 0
      }
    })
    
    // Store in examStore
    examStore.lastResult = {
      id: exam.result_id,
      score: exam.score,
      answers: exam.answers,
      perQuestion,
      correctById
    }
    examStore.isSubmitted = true
    
    // Navigate to details page
    router.push('/sthome/details')
  } catch (error) {
    console.error('Error loading exam details:', error)
    alert('Failed to load exam details: ' + error.message)
  }
}

function computeSubjectStatsForExam(exam) {
  const stats = {}
  
  // We need to fetch question subjects - for now use a simplified version
  // In production, this should be part of the exam data
  const subjects = ['Physics', 'Chemistry', 'Mathematics']
  
  subjects.forEach(subject => {
    // Approximate: first 25 questions per subject
    const subjectAnswers = exam.answers.slice(
      subjects.indexOf(subject) * 25,
      (subjects.indexOf(subject) + 1) * 25
    )
    
    const correct = subjectAnswers.filter(a => a && a.answer).length // Simplified
    const wrong = subjectAnswers.filter(a => a && a.answer === false).length
    const total = 25
    
    stats[subject] = { correct, wrong, total }
  })
  
  return stats
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}

function calculateDuration(exam) {
  if (!exam.answers || !Array.isArray(exam.answers)) return 'N/A'
  
  const totalSeconds = exam.answers.reduce((sum, answer) => {
    return sum + (answer?.time_taken || 0)
  }, 0)
  
  if (totalSeconds === 0) return 'N/A'
  
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m`
  }
}

function countAttempted(answers) {
  if (!answers || !Array.isArray(answers)) return 0
  return answers.filter(a => a && a.answer).length
}

function calculateAccuracy(exam) {
  if (!exam.answers || !Array.isArray(exam.answers)) return 0
  
  const attempted = countAttempted(exam.answers)
  if (attempted === 0) return 0
  
  // Estimate: each correct answer gives +4, each wrong gives -1
  // So if score is positive, approximate correct answers
  const estimatedCorrect = Math.max(0, Math.round((exam.score + attempted) / 5))
  
  return Math.round((estimatedCorrect / attempted) * 100)
}

function getScoreClass(score) {
  if (score >= 200) return 'bg-green-500 text-white'
  if (score >= 100) return 'bg-yellow-500 text-white'
  return 'bg-red-500 text-white'
}

function getExamTypeName(examType) {
  const names = {
    'JEE_MAIN_FULL': 'JEE Main Full Test',
    'KCET': 'KCET',
    'NEET': 'NEET'
  }
  return names[examType] || examType
}

function getTrendColorClass(trend) {
  if (trend === 'improving') return 'text-green-600'
  if (trend === 'declining') return 'text-red-600'
  return 'text-gray-600'
}

function getTrendText(trend) {
  if (trend === 'improving') return 'Improving'
  if (trend === 'declining') return 'Declining'
  return 'Stable'
}

async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/')
  }
}
</script>