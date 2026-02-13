<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header with Gradient -->
      <div class="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-700 overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-3">
              Welcome back, {{ studentProfile?.student_name || 'Student' }}
            </h1>
            <p class="text-gray-400 text-lg">Student ID: <span class="text-cyan-400 font-mono">{{ studentProfile?.student_id || 'N/A' }}</span></p>
          </div>
          <button 
            @click="logout"
            class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <!-- Student Information Card -->
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-xl p-8 mb-8 border border-gray-700">
        <h2 class="text-2xl font-bold text-gray-200 mb-6 flex items-center">
          <svg class="w-7 h-7 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Student Information
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-800 rounded-xl p-5 border border-gray-600">
            <p class="text-sm text-gray-400 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Email
            </p>
            <p class="font-medium text-white">{{ studentProfile?.email_id || 'N/A' }}</p>
          </div>
          
          <div class="bg-gray-800 rounded-xl p-5 border border-gray-600">
            <p class="text-sm text-gray-400 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Mobile Number
            </p>
            <p class="font-medium text-white">{{ studentProfile?.mobile_number || 'Not provided' }}</p>
          </div>
          
          <div class="bg-gray-800 rounded-xl p-5 border border-gray-600">
            <p class="text-sm text-gray-400 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              Class
            </p>
            <p class="font-medium text-white">{{ studentProfile?.class || 'Not provided' }}</p>
          </div>
          
          <div class="bg-gray-800 rounded-xl p-5 border border-gray-600">
            <p class="text-sm text-gray-400 mb-2 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Registration Date
            </p>
            <p class="font-medium text-white">{{ formatDate(studentProfile?.creation_date) }}</p>
          </div>
        </div>

        <!-- Parent Details (if available) -->
        <div v-if="hasParentDetails" class="mt-8 pt-8 border-t border-gray-700">
          <h3 class="text-xl font-semibold text-gray-200 mb-6 flex items-center">
            <svg class="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Parent/Guardian Information
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-800 rounded-xl p-5 border border-gray-600">
              <p class="text-sm text-gray-400 mb-2">Parent Name</p>
              <p class="font-medium text-white">{{ studentProfile?.parent_name || 'N/A' }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-5 border border-gray-600">
              <p class="text-sm text-gray-400 mb-2">Parent Mobile</p>
              <p class="font-medium text-white">{{ studentProfile?.parent_number || 'N/A' }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-5 border border-gray-600">
              <p class="text-sm text-gray-400 mb-2">Parent Email</p>
              <p class="font-medium text-white">{{ studentProfile?.parent_email_id || 'N/A' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Exam Hero Section -->
      <div class="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl p-10 mb-8 overflow-hidden group">
        <!-- Animated background -->
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="text-center md:text-left">
            <h2 class="text-3xl md:text-4xl font-bold mb-3 text-white">Ready to Take an Exam?</h2>
            <p class="text-blue-100 text-lg flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <span class="inline-flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                JEE Main Full Test
              </span>
              <span class="text-white">•</span>
              <span class="inline-flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                3 Hours
              </span>
              <span class="text-white">•</span>
              <span class="inline-flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
                75 Questions
              </span>
            </p>
          </div>
          <button 
            @click="startExam"
            class="px-10 py-4 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Start Exam
          </button>
        </div>
      </div>

      <!-- Exam History -->
      <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-xl p-8 border border-gray-700">
        <h2 class="text-3xl font-bold text-gray-200 mb-8 flex items-center">
          <svg class="w-8 h-8 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Exam History
        </h2>
        
        <div v-if="loading" class="text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mb-4"></div>
          <p class="text-gray-400 text-lg">Loading exam history...</p>
        </div>

        <div v-else-if="examHistory.length === 0" class="text-center py-16">
          <div class="w-24 h-24 mx-auto mb-6 bg-gray-700 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p class="text-gray-400 text-xl mb-2">No exams attempted yet</p>
          <p class="text-gray-500">Start your first exam to see results here</p>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="exam in examHistory" 
            :key="exam.result_id"
            class="bg-gray-800 border border-gray-600 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div class="flex-1 w-full">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <h3 class="font-bold text-white text-xl flex items-center">
                    <svg class="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    JEE Main Full Test
                  </h3>
                  <span 
                    class="px-4 py-2 rounded-full text-sm font-bold"
                    :class="getScoreClass(exam.score)"
                  >
                    Score: {{ exam.score }}
                  </span>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <p class="text-xs text-gray-400 mb-1 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Date
                    </p>
                    <p class="font-medium text-white text-sm">{{ formatDate(exam.session?.start_time) }}</p>
                  </div>
                  <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <p class="text-xs text-gray-400 mb-1 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Duration
                    </p>
                    <p class="font-medium text-white text-sm">{{ calculateDuration(exam) }}</p>
                  </div>
                  <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <p class="text-xs text-gray-400 mb-1 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      Attempted
                    </p>
                    <p class="font-medium text-blue-400 text-sm">{{ countAttempted(exam.answers) }}/75</p>
                  </div>
                  <div class="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <p class="text-xs text-gray-400 mb-1 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      Result ID
                    </p>
                    <p class="font-medium text-gray-300 text-sm font-mono">{{ exam.result_id }}</p>
                  </div>
                </div>
              </div>
              
              <button 
                @click="viewDetails(exam)"
                class="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useExamStore } from '../stores/examStore'
import { supabase } from '../lib/supabase'

const router = useRouter()
const authStore = useAuthStore()

const studentProfile = computed(() => authStore.studentProfile)
const examHistory = ref([])
const loading = ref(true)

const hasParentDetails = computed(() => {
  return studentProfile.value?.parent_name || 
         studentProfile.value?.parent_number || 
         studentProfile.value?.parent_email_id
})

onMounted(async () => {
  await fetchExamHistory()
})

async function fetchExamHistory() {
  loading.value = true
  try {
    console.log('Fetching exam history for student:', studentProfile.value.student_id)
    
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

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log('Fetched exam history:', data)
    
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
  if (!dateString) return 'N/A'
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
  // Calculate from time_taken in answers array
  if (!exam.answers || !Array.isArray(exam.answers)) return 'N/A'
  
  const totalSeconds = exam.answers.reduce((sum, answer) => {
    return sum + (answer?.time_taken || 0)
  }, 0)
  
  if (totalSeconds === 0) return 'N/A'
  
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = Math.floor(totalSeconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  } else if (mins > 0) {
    return `${mins}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

function countAttempted(answers) {
  if (!answers || !Array.isArray(answers)) return 0
  return answers.filter(a => a && a.answer).length
}

function getScoreClass(score) {
  if (score >= 200) return 'bg-green-500 text-white'
  if (score >= 100) return 'bg-yellow-500 text-white'
  return 'bg-red-500 text-white'
}

function startExam() {
  router.push('/exam')
}

async function viewDetails(exam) {
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
        chosen: a.answer,
        correct: correctAnswer,
        isCorrect,
        time_taken: a.time_taken || 0
      }
    })
    
    // Store in examStore
    const examStore = useExamStore()
    examStore.lastResult = {
      id: exam.result_id,
      score: exam.score,
      answers: exam.answers,
      perQuestion,
      correctById
    }
    examStore.isSubmitted = true
    
    // Navigate to student home
    router.push('/sthome')
  } catch (error) {
    console.error('Error loading exam details:', error)
    alert('Failed to load exam details: ' + error.message)
  }
}

function logout() {
  authStore.logout()
  router.push('/')
}
</script>