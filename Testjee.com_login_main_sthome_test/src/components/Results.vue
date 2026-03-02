<template>
  <div class="min-h-full pb-10">
    <div class="max-w-7xl mx-auto w-full">
      <!-- Title Section -->
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Student Dashboard
          </h1>
          <p class="text-blue-600/80 text-base font-medium">Overview of your performance</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right hidden md:block">
            <div class="text-xs text-gray-500 font-medium mb-1">Today's Date</div>
            <div class="text-sm text-gray-900 font-semibold bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-white/50 inline-block">
              {{ formattedToday }}
            </div>
          </div>
          <!-- Logout Button (Visible on all screens in dashboard area as requested) -->
          <button 
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 hover:shadow-md transition-all shadow-sm font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style="animation-delay: 100ms;">
        <!-- Total Exams -->
        <div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-green-700 bg-green-100/50 px-2.5 py-1 rounded-full border border-green-100">+2 this week</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Total Exams</h3>
          <p class="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{{ stats.totalExams }}</p>
        </div>

        <!-- Average Score -->
        <div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-indigo-700 bg-indigo-100/50 px-2.5 py-1 rounded-full border border-indigo-100">Top 10%</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Average Score</h3>
          <p class="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{{ stats.averageScore }}%</p>
        </div>

        <!-- Accuracy -->
        <div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-cyan-50 text-cyan-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span class="text-xs font-semibold text-gray-600 bg-gray-100/80 px-2.5 py-1 rounded-full border border-gray-200">Last 5 exams</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Accuracy</h3>
          <p class="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{{ stats.accuracy }}%</p>
        </div>

        <!-- Time Spent -->
        <div class="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
             <span class="text-xs font-semibold text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-full border border-amber-100">Avg / Exam</span>
          </div>
          <h3 class="text-gray-500 text-sm font-medium">Time Taken</h3>
          <p class="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{{ stats.timeSpent }}m</p>
        </div>
      </div>

      <!-- Main Content Area: Chart + Recent Exams -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up" style="animation-delay: 200ms;">
        
        <!-- Chart Section -->
        <div class="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">Score Trend</h2>
            <select class="text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white/50 border px-3 py-1.5 shadow-sm outline-none cursor-pointer hover:bg-white transition-colors">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div class="h-80 w-full relative">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Quick Actions / Performance -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden flex flex-col justify-between group">
           <!-- Decorative BG -->
           <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
           <div class="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-700 ease-in-out"></div>

           <div class="relative z-10">
             <h2 class="text-2xl font-bold mb-2">Ready to practice?</h2>
             <p class="text-blue-100 text-sm mb-6 leading-relaxed">Take a new mock test to improve your score and speed. Challenge yourself today!</p>
             
             <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20">
               <div class="flex justify-between items-center mb-2">
                 <span class="text-sm font-medium text-blue-100">Overall Progress</span>
                 <span class="text-lg font-bold">Good</span>
               </div>
               <div class="w-full bg-blue-900/40 rounded-full h-2.5 overflow-hidden">
                 <div class="bg-white h-2.5 rounded-full w-[75%] shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse-slow"></div>
               </div>
             </div>
           </div>
           
           <button 
             @click="toggleExamModal"
             class="w-full py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] relative z-10 flex items-center justify-center gap-2 group/btn"
           >
             <svg class="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             Start New Exam
           </button>
        </div>
      </div>

      <!-- Recent Activity / Exams List -->
      <div class="bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 overflow-hidden animate-fade-in-up" style="animation-delay: 300ms;">
        <div class="px-6 py-5 border-b border-gray-100/50 flex items-center justify-between bg-white/40">
          <h2 class="text-xl font-bold text-gray-900">Recent Exams</h2>
          <button class="text-sm text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-all">View All</button>
        </div>
        
        <div class="divide-y divide-gray-100/50">
          <div v-for="(exam, index) in recentExams" :key="exam.id" 
               class="p-6 hover:bg-blue-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
               :style="{ animationDelay: `${index * 50}ms` }">
            
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-600 font-bold text-xl shadow-sm group-hover:bg-blue-100 transition-colors border border-blue-50">
                {{ exam.score }}%
              </div>
              <div>
                <h3 class="text-gray-900 font-bold text-lg">{{ exam.name }}</h3>
                <p class="text-sm text-gray-500 font-medium">{{ exam.date }} • {{ exam.duration }}</p>
              </div>
            </div>

            <div class="flex items-center gap-8">
              <div class="text-center hidden md:block">
                <div class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Correct</div>
                <div class="font-bold text-gray-700 text-lg">{{ exam.correct }}/{{ exam.total }}</div>
              </div>
              <div class="text-center hidden md:block">
                 <div class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Accuracy</div>
                 <div class="font-bold text-gray-700 text-lg">{{ Math.round((exam.correct/exam.total)*100) }}%</div>
              </div>
              
              <button 
                @click="viewDetails(exam)"
                class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all whitespace-nowrap bg-white/50"
              >
                View Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Exam Modal (Improved) -->
    <div v-if="showExamModal" class="fixed inset-0 z-50 overflow-y-auto animate-fade-in" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="toggleExamModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-fade-in-up">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-8 sm:pb-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 sm:mx-0 sm:h-12 sm:w-12 ring-8 ring-blue-50">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="mt-4 text-center sm:mt-0 sm:ml-5 sm:text-left w-full">
                <h3 class="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                  Start New Exam
                </h3>
                <div class="mt-4 space-y-4">
                  <p class="text-sm text-gray-500 mb-4">Choose the type of exam you want to attempt:</p>
                  
                  <button 
                    @click="startFullExam"
                    class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-lg transition-all group cursor-pointer bg-white"
                  >
                    <div class="flex items-center gap-4">
                      <div class="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <div class="text-left">
                        <div class="font-bold text-gray-900 text-lg">Full Mock Test</div>
                        <div class="text-xs text-gray-500 font-medium mt-0.5">Standard Pattern (PCM)</div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>

                   <button 
                    class="w-full flex items-center justify-between p-4 border border-gray-200 rounded-2xl transition-all group opacity-70 cursor-not-allowed hover:bg-gray-50"
                    title="Coming soon"
                  >
                    <div class="flex items-center gap-4">
                      <div class="p-3 bg-purple-100 text-purple-600 rounded-xl transition-colors shadow-sm grayscale opacity-70">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      </div>
                      <div class="text-left">
                        <div class="font-bold text-gray-900 text-lg">Subject Wise</div>
                        <div class="text-xs text-gray-500 font-medium mt-0.5">Physics, Chem, or Maths</div>
                      </div>
                    </div>
                     <span class="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-full border border-gray-200 uppercase tracking-widest">SOON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-all" 
              @click="toggleExamModal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Request More Tests Modal -->
    <div v-if="showRestoreModal" class="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showRestoreModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
          <div class="text-center mb-6">
            <div class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">No Tests Remaining</h3>
            <p class="text-sm text-gray-500">You've used all your available tests. Request more from the admin.</p>
          </div>
          <div class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-2">How many tests do you need?</label>
            <select v-model="restoreTestCount" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all outline-none cursor-pointer">
              <option :value="1">1 Test</option>
              <option :value="3">3 Tests</option>
              <option :value="5">5 Tests</option>
              <option :value="10">10 Tests</option>
            </select>
          </div>
          <div v-if="restoreMessage" :class="['mb-4 p-3 rounded-xl text-sm font-medium', restoreMessageType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100']">
            {{ restoreMessage }}
          </div>
          <div class="flex gap-3">
            <button @click="showRestoreModal = false" class="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button @click="sendRestoreRequest" :disabled="restoreLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              <svg v-if="restoreLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ restoreLoading ? 'Sending...' : 'Send Request' }}
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
import emailjs from '@emailjs/browser'
import logo from '../assets/logo_test_jee.png'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const router = useRouter()
const examStore = useExamStore()
const authStore = useAuthStore()
const { allResults, statistics, sessionId } = storeToRefs(examStore)

const loading = ref(false)
const hasActiveSession = ref(false)
const showExamModal = ref(false)
const showRestoreModal = ref(false)
const restoreTestCount = ref(3)
const restoreLoading = ref(false)
const restoreMessage = ref('')
const restoreMessageType = ref('')

const studentName = computed(() => authStore.studentProfile?.student_name || 'Student')

const formattedToday = computed(() => {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

const recentExams = computed(() => {
  return allResults.value.slice(0, 10).map(exam => {
    // Calculate correct answers
    let correct = 0
    let total = 0
    
    if (exam.answers && Array.isArray(exam.answers)) {
      total = exam.answers.filter(a => a && a.question_id).length
      // Estimate correct from score (+4 per correct, -1 per wrong)
      const attempted = exam.answers.filter(a => a && a.answer).length
      correct = Math.max(0, Math.round((exam.score + attempted) / 5))
    }
    
    return {
      id: exam.result_id,
      result_id: exam.result_id,
      name: getExamTypeName(exam.session?.exam_type || 'JEE_MAIN_FULL'),
      date: formatDate(exam.creation_date),
      duration: calculateDuration(exam),
      score: exam.score || 0,
      correct,
      total: total || 75,
      answers: exam.answers,
      session: exam.session
    }
  })
})

const latestResult = computed(() => {
  if (allResults.value.length === 0) return null
  return allResults.value[0]
})

// Stats computed property with default values
const stats = computed(() => {
  if (!statistics.value || allResults.value.length === 0) {
    return {
      totalExams: 0,
      averageScore: 0,
      accuracy: 0,
      timeSpent: 0
    }
  }
  
  // Calculate stats from allResults
  const totalExams = allResults.value.length
  const totalScore = allResults.value.reduce((sum, r) => sum + (r.score || 0), 0)
  const averageScore = totalExams > 0 ? Math.round(totalScore / totalExams) : 0
  
  // Calculate accuracy from recent exams
  const recentExams = allResults.value.slice(0, 5)
  let totalCorrect = 0
  let totalAttempted = 0
  
  recentExams.forEach(exam => {
    if (exam.answers && Array.isArray(exam.answers)) {
      const attempted = exam.answers.filter(a => a && a.answer).length
      totalAttempted += attempted
      // Estimate correct answers from score (+4 per correct, -1 per wrong)
      const estimatedCorrect = Math.max(0, Math.round((exam.score + attempted) / 5))
      totalCorrect += estimatedCorrect
    }
  })
  
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0
  
  // Calculate average time spent
  let totalTime = 0
  let examCount = 0
  allResults.value.forEach(exam => {
    if (exam.answers && Array.isArray(exam.answers)) {
      const examTime = exam.answers.reduce((sum, a) => sum + (a?.time_taken || 0), 0)
      if (examTime > 0) {
        totalTime += examTime
        examCount++
      }
    }
  })
  
  const avgTimeSeconds = examCount > 0 ? totalTime / examCount : 0
  const timeSpent = Math.round(avgTimeSeconds / 60) // Convert to minutes
  
  return {
    totalExams,
    averageScore,
    accuracy,
    timeSpent: timeSpent || 0
  }
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
      borderColor: 'rgb(37, 99, 235)', // Blue-600
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: 'rgb(37, 99, 235)',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
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
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1f2937',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context) {
          return `Score: ${context.parsed.y}%`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: 'Inter, sans-serif'
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        display: false // Hide x-axis labels for cleaner look or enable if needed
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
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

function toggleExamModal() {
  showExamModal.value = !showExamModal.value
}

function startFullExam() {
  startExam('JEE_MAIN_FULL')
}

async function startExam(examType) {
  // Check if student has tests remaining
  const testsRemaining = authStore.studentProfile?.number_of_tests || 0
  if (testsRemaining <= 0) {
    showExamModal.value = false
    showRestoreModal.value = true
    restoreMessage.value = ''
    return
  }

  // Decrement the number of tests in Supabase
  try {
    const { error } = await supabase
      .from('students')
      .update({
        number_of_tests: testsRemaining - 1,
        modification_date: new Date().toISOString()
      })
      .eq('student_id', authStore.studentProfile.student_id)

    if (error) {
      console.error('Failed to decrement test count:', error)
      alert('Something went wrong. Please try again.')
      return
    }

    // Update local profile to reflect the change
    authStore.studentProfile.number_of_tests = testsRemaining - 1
    console.log(`[TESTJEE] Tests remaining: ${testsRemaining - 1}`)
  } catch (err) {
    console.error('Error decrementing tests:', err)
    alert('Something went wrong. Please try again.')
    return
  }

  examStore.resetExamState()
  examStore.setExamType(examType)
  showExamModal.value = false
  router.push('/exam')
}

async function sendRestoreRequest() {
  restoreLoading.value = true
  restoreMessage.value = ''

  try {
    const studentName = authStore.studentProfile?.student_name || 'Student'
    const studentEmail = authStore.studentProfile?.email_id || ''
    const studentId = authStore.studentProfile?.student_id

    const restoreLink = `https://login.testjee.com/admin-approve?action=restore&email=${encodeURIComponent(studentEmail)}&tests=${restoreTestCount.value}&name=${encodeURIComponent(studentName)}&sid=${studentId}`

    const templateParams = {
      student_name: studentName,
      student_email: studentEmail,
      student_mobile: `Student ID: ${studentId}`,
      requested_tests: `${restoreTestCount.value} (Restore Request)`,
      approve_link: restoreLink
    }

    await emailjs.send(
      'service_testjee',
      'template_approval',
      templateParams,
      'I9eXY3TayX67uR-3R'
    )

    restoreMessage.value = 'Request sent! The admin will review and restore your tests.'
    restoreMessageType.value = 'success'
  } catch (error) {
    console.error('[TESTJEE] Restore request error:', error)
    restoreMessage.value = 'Failed to send request. Please try again.'
    restoreMessageType.value = 'error'
  } finally {
    restoreLoading.value = false
  }
}

async function viewDetails(exam) {
  // Logic to view details - needs to populate examStore.lastResult similar to viewExamDetails
  // Reusing the logic from the previous file content's viewExamDetails if it was there,
  // or implementing it.
  // Wait, the previous file HAD viewExamDetails. I should include it.
  
  await viewExamDetails(exam)
}

// RESTORED FUNCTIONS FROM ORIGINAL FILE
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