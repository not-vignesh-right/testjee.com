<template>
  <div class="min-h-full pb-16">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">

      <!-- Back Button -->
      <div class="py-6">
        <router-link
          to="/sthome/details"
          class="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group"
        >
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Analysis
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500 font-medium animate-pulse">Loading question...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="font-bold text-red-800 text-lg mb-1">Could not load question</h3>
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <template v-else-if="question">

        <!-- Status Banner -->
        <div class="rounded-2xl p-4 mb-5 flex items-center gap-4 border shadow-sm" :class="banner.bg">
          <div class="text-3xl w-12 h-12 flex items-center justify-center rounded-xl shrink-0" :class="banner.iconBg">
            {{ banner.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-black uppercase tracking-wider" :class="banner.color">{{ banner.title }}</p>
            <p class="text-sm font-medium text-gray-700 mt-0.5 truncate">{{ banner.subtitle }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-[10px] text-gray-400 font-semibold uppercase">Time</p>
            <p class="text-lg font-black tabular-nums" :class="banner.color">{{ fmtTime(timeTaken) }}</p>
          </div>
        </div>

        <!-- Meta Tags -->
        <div class="flex flex-wrap items-center gap-2 mb-4">
          <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full uppercase tracking-wider">Q{{ questionIndex }}</span>
          <span v-if="question.subjects?.subject_name" class="px-2.5 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full">{{ question.subjects.subject_name }}</span>
          <span v-if="question.topics?.topic_name" class="px-2.5 py-1 bg-purple-100 text-purple-700 text-[11px] font-bold rounded-full">{{ question.topics.topic_name }}</span>
          <span v-if="question.question_type" class="px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] font-semibold rounded-full font-mono">{{ question.question_type === 'multiple_choice' ? 'MCQ' : 'Numeric' }}</span>
          <span v-if="question.difficulty" class="px-2.5 py-1 text-[11px] font-bold rounded-full uppercase"
            :class="{
              'bg-green-100 text-green-700': question.difficulty === 'easy',
              'bg-yellow-100 text-yellow-700': question.difficulty === 'medium',
              'bg-orange-100 text-orange-700': question.difficulty === 'hard',
              'bg-red-100 text-red-700': question.difficulty === 'advance',
            }">{{ question.difficulty }}</span>
        </div>

        <!-- Question Image -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
            <h2 class="text-[11px] font-black uppercase text-gray-500 tracking-widest">Question</h2>
          </div>
          <div class="p-4">
            <!-- Question image (primary) -->
            <div v-if="question.image_url" class="rounded-xl overflow-hidden border border-gray-100">
              <img
                :src="question.image_url"
                alt="Question"
                class="w-full h-auto object-contain bg-white"
                @error="imgError = true"
              />
            </div>
            <!-- Fallback text if no image -->
            <p v-else class="text-gray-800 text-base leading-relaxed">
              {{ question.question_content?.text || question.question_content?.stem || question.external_reference || 'No question content available.' }}
            </p>
          </div>
        </div>

        <!-- MCQ Options -->
        <div v-if="question.question_type === 'multiple_choice' && choices" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
            <h2 class="text-[11px] font-black uppercase text-gray-500 tracking-widest">Answer Choices</h2>
          </div>
          <div class="p-4 space-y-3">
            <div
              v-for="opt in optionsList"
              :key="opt.id"
              class="flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all"
              :class="getOptClass(opt.id)"
            >
              <!-- Label badge -->
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0" :class="getOptBadge(opt.id)">
                {{ opt.id.toUpperCase() }}
              </div>

              <!-- Option content: image if url, else text -->
              <div class="flex-1 min-w-0">
                <div v-if="isUrl(opt.text)" class="rounded-lg overflow-hidden border border-gray-100">
                  <img :src="opt.text" :alt="`Option ${opt.id.toUpperCase()}`" class="w-full h-auto object-contain bg-white max-h-40" />
                </div>
                <p v-else class="text-sm font-medium leading-relaxed" :class="getOptText(opt.id)">{{ opt.text || '—' }}</p>
              </div>

              <!-- Status badge -->
              <div class="flex flex-col gap-1 shrink-0">
                <span v-if="opt.id === correctAnswer" class="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  Correct
                </span>
                <span v-if="opt.id === studentAnswer && opt.id !== correctAnswer" class="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                  Your Answer
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Numeric Answer -->
        <div v-else-if="question.question_type === 'numeric'" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
            <h2 class="text-[11px] font-black uppercase text-gray-500 tracking-widest">Numerical Answer</h2>
          </div>
          <div class="p-5 grid grid-cols-2 gap-4">
            <div class="rounded-xl p-4 text-center border-2" :class="isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'">
              <p class="text-[10px] font-black uppercase tracking-wide mb-1" :class="isCorrect ? 'text-green-600' : 'text-red-600'">Your Answer</p>
              <p class="text-2xl font-black font-mono" :class="isCorrect ? 'text-green-700' : 'text-red-700'">{{ studentAnswer ?? '—' }}</p>
            </div>
            <div class="rounded-xl p-4 text-center bg-green-50 border-2 border-green-300">
              <p class="text-[10px] font-black uppercase tracking-wide mb-1 text-green-600">Correct Answer</p>
              <p class="text-2xl font-black font-mono text-green-700">{{ correctAnswer ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Solution -->
        <div class="rounded-2xl overflow-hidden border shadow-sm mb-4"
             :class="question.solution ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/60' : 'bg-gray-50 border-gray-200'">
          <div class="px-5 py-4 border-b flex items-center gap-2"
               :class="question.solution ? 'border-indigo-200/60' : 'border-gray-200'">
            <svg class="w-4 h-4" :class="question.solution ? 'text-indigo-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <h2 class="text-[11px] font-black uppercase tracking-widest" :class="question.solution ? 'text-indigo-700' : 'text-gray-400'">Solution</h2>
          </div>
          <div class="p-4">
            <!-- Solution as image if it's a URL -->
            <div v-if="question.solution && isUrl(question.solution)" class="rounded-xl overflow-hidden border border-indigo-100">
              <img :src="question.solution" alt="Solution" class="w-full h-auto object-contain bg-white" />
            </div>
            <!-- Solution as plain text -->
            <p v-else-if="question.solution" class="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
              {{ question.solution }}
            </p>
            <!-- No solution -->
            <p v-else class="text-gray-400 text-sm text-center py-4 font-medium">Solution not yet available.</p>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useExamStore } from '../stores/examStore'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

const route = useRoute()
const examStore = useExamStore()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const question = ref(null)
const choices = ref(null)
const studentAnswer = ref(null)
const correctAnswer = ref(null)
const timeTaken = ref(0)
const isCorrect = ref(false)
const questionIndex = ref('?')

// ── Helpers ──────────────────────────────────────────────────────────────────

function isUrl(str) {
  if (!str) return false
  return /^https?:\/\//i.test(str.trim())
}

function fmtTime(s) {
  if (!s) return '0s'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

// ── Computed ──────────────────────────────────────────────────────────────────

const optionsList = computed(() => {
  if (!choices.value) return []
  return ['a','b','c','d'].map((id, i) => ({
    id,
    text: choices.value[`choice${i+1}`]?.text || choices.value[`choice${i+1}`] || ''
  }))
})

const banner = computed(() => {
  if (!studentAnswer.value) return {
    bg: 'bg-gray-100 border-gray-200', iconBg: 'bg-gray-200',
    icon: '—', title: 'Not Attempted', subtitle: 'You skipped this question.',
    color: 'text-gray-500'
  }
  if (isCorrect.value) return {
    bg: 'bg-green-50 border-green-200', iconBg: 'bg-green-100',
    icon: '✅', title: 'Correct  (+4)',
    subtitle: `You answered: ${String(studentAnswer.value).toUpperCase()}`,
    color: 'text-green-700'
  }
  return {
    bg: 'bg-red-50 border-red-200', iconBg: 'bg-red-100',
    icon: '❌', title: 'Incorrect  (−1)',
    subtitle: `You: ${String(studentAnswer.value).toUpperCase()}  ·  Correct: ${String(correctAnswer.value || '?').toUpperCase()}`,
    color: 'text-red-700'
  }
})

// ── Option Styling ─────────────────────────────────────────────────────────────

function getOptClass(id) {
  if (id === correctAnswer.value) return 'border-green-400 bg-green-50'
  if (id === studentAnswer.value && !isCorrect.value) return 'border-red-400 bg-red-50'
  return 'border-gray-200 bg-white'
}
function getOptBadge(id) {
  if (id === correctAnswer.value) return 'bg-green-500 text-white'
  if (id === studentAnswer.value && !isCorrect.value) return 'bg-red-500 text-white'
  return 'bg-gray-200 text-gray-600'
}
function getOptText(id) {
  if (id === correctAnswer.value) return 'text-green-800 font-semibold'
  if (id === studentAnswer.value && !isCorrect.value) return 'text-red-800 font-semibold'
  return 'text-gray-700'
}

// ── Data Fetching ─────────────────────────────────────────────────────────────

onMounted(async () => {
  const qId = route.params.id

  if (!qId) {
    error.value = 'No question ID provided.'
    loading.value = false
    return
  }

  try {
    // 1. Try to get student answer from in-memory store first (fastest)
    const perfFromStore = (examStore.lastResult?.perQuestion || []).find(
      p => String(p.question_id) === String(qId)
    )

    if (perfFromStore) {
      studentAnswer.value = perfFromStore.chosen
      correctAnswer.value = perfFromStore.correct
      isCorrect.value = perfFromStore.isCorrect
      timeTaken.value = perfFromStore.time_taken || 0
      questionIndex.value = (perfFromStore.index ?? 0) + 1
    } else {
      // 2. Fallback: fetch from DB (handles page refreshes)
      await authStore.loadSession()
      if (authStore.studentId) {
        const { data: resultRows } = await supabase
          .from('results')
          .select('answers, result_id')
          .eq('student_id', authStore.studentId)
          .order('creation_date', { ascending: false })
          .limit(1)
          .single()

        if (resultRows?.answers) {
          const ans = resultRows.answers.find(a => String(a.question_id) === String(qId))
          if (ans) {
            studentAnswer.value = ans.answer
            timeTaken.value = ans.time_taken || 0
          }
        }
      }
    }

    // 3. Fetch question data + choices from DB
    const { data: qData, error: qErr } = await supabase
      .from('questions')
      .select(`
        question_id,
        question_type,
        question_content,
        image_url,
        solution,
        external_reference,
        difficulty,
        time_required,
        subjects (subject_name),
        topics (topic_name),
        choices (choice1, choice2, choice3, choice4, correct_answer)
      `)
      .eq('question_id', qId)
      .single()

    if (qErr) throw qErr

    question.value = qData
    choices.value = qData.choices || null

    // 4. Get correct answer from choices if not already set from store
    if (!correctAnswer.value && qData.choices?.correct_answer) {
      correctAnswer.value = qData.choices.correct_answer
    }

    // 5. Compute isCorrect if we fetched from DB
    if (!perfFromStore && studentAnswer.value && correctAnswer.value) {
      if (qData.question_type === 'numeric') {
        isCorrect.value = Number(studentAnswer.value) === Number(correctAnswer.value)
      } else {
        isCorrect.value = studentAnswer.value === correctAnswer.value
      }
    }

  } catch (err) {
    console.error('QuestionDetail error:', err)
    error.value = err.message || 'Failed to load question.'
  } finally {
    loading.value = false
  }
})
</script>
