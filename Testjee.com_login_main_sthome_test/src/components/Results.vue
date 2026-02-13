<template>
  <div class="min-h-full">
    <div class="max-w-7xl mx-auto w-full">
      <!-- Title Section -->
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Student Dashboard
          </h1>
          <p class="text-blue-600/80 text-sm font-medium">Overview of your performance</p>
        </div>
        <div class="text-right hidden md:block">
          <div class="text-xs text-gray-500 font-medium mb-1">Today's Date</div>
          <div class="text-sm text-gray-900 font-semibold bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 inline-block">
            {{ formattedToday }}
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Exams -->
        <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 group hover:shadow-lg transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+2 this week</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Total Exams</h3>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.totalExams }}</p>
        </div>

        <!-- Average Score -->
        <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 group hover:shadow-lg transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Top 10%</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Average Score</h3>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.averageScore }}%</p>
        </div>

        <!-- Accuracy -->
        <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 group hover:shadow-lg transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Last 5 exams</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Accuracy</h3>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.accuracy }}%</p>
        </div>

        <!-- Time Spent -->
        <div class="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 group hover:shadow-lg transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
             <span class="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Avg / Exam</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Time Taken</h3>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.timeSpent }}m</p>
        </div>
      </div>

      <!-- Main Content Area: Chart + Recent Exams -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Chart Section -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-900">Score Trend</h2>
            <select class="text-sm border-gray-200 rounded-lg text-gray-500 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 border px-3 py-1">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div class="h-80 w-full relative">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Quick Actions / Performance -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden flex flex-col justify-between">
           <!-- Decorative BG -->
           <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div class="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

           <div class="relative z-10">
             <h2 class="text-xl font-bold mb-2">Ready to practice?</h2>
             <p class="text-blue-100 text-sm mb-6">Take a new mock test to improve your score and speed.</p>
             
             <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20">
               <div class="flex justify-between items-center mb-2">
                 <span class="text-sm font-medium text-blue-100">Overall Progress</span>
                 <span class="text-lg font-bold">Good</span>
               </div>
               <div class="w-full bg-blue-900/40 rounded-full h-2">
                 <div class="bg-white h-2 rounded-full w-[75%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
               </div>
             </div>
           </div>
           
           <button 
             @click="toggleExamModal"
             class="w-full py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] relative z-10 flex items-center justify-center gap-2 group"
           >
             <svg class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             Start New Exam
           </button>
        </div>
      </div>

      <!-- Recent Activity / Exams List -->
      <div class="mt-8 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">Recent Exams</h2>
          <button class="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
        </div>
        
        <div class="divide-y divide-gray-50">
          <div v-for="exam in recentExams" :key="exam.id" 
               class="p-6 hover:bg-blue-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {{ exam.score }}%
              </div>
              <div>
                <h3 class="text-gray-900 font-semibold">{{ exam.name }}</h3>
                <p class="text-sm text-gray-500">{{ exam.date }} • {{ exam.duration }}</p>
              </div>
            </div>

            <div class="flex items-center gap-6">
              <div class="text-center hidden md:block">
                <div class="text-xs text-gray-400 uppercase font-semibold">Correct</div>
                <div class="font-medium text-gray-700">{{ exam.correct }}/{{ exam.total }}</div>
              </div>
              <div class="text-center hidden md:block">
                 <div class="text-xs text-gray-400 uppercase font-semibold">Accuracy</div>
                 <div class="font-medium text-gray-700">{{ Math.round((exam.correct/exam.total)*100) }}%</div>
              </div>
              
              <button 
                @click="viewDetails(exam)"
                class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                View Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Exam Modal (Improved) -->
    <div v-if="showExamModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="toggleExamModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Start New Exam
                </h3>
                <div class="mt-4 space-y-3">
                  <p class="text-sm text-gray-500 mb-4">Choose the type of exam you want to attempt:</p>
                  
                  <button 
                    @click="startFullExam"
                    class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all group"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <div class="text-left">
                        <div class="font-semibold text-gray-900">Full Mock Test</div>
                        <div class="text-xs text-gray-500">Standard Pattern (PCM)</div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>

                   <button 
                    class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 hover:shadow-md transition-all group opacity-70 cursor-not-allowed"
                    title="Coming soon"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      </div>
                      <div class="text-left">
                        <div class="font-semibold text-gray-900">Subject Wise</div>
                        <div class="text-xs text-gray-500">Physics, Chem, or Maths</div>
                      </div>
                    </div>
                     <span class="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded">HOON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" 
              @click="toggleExamModal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
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