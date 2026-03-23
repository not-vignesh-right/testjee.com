<template>
  <div class="min-h-full pb-16 font-sans">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

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

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500 font-medium">Loading question details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="font-bold text-red-800 text-lg mb-1">Could not load question</h3>
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <template v-else-if="questionData && perf">

        <!-- Status Banner -->
        <div
          class="rounded-2xl p-5 mb-6 flex items-center gap-4 shadow-sm"
          :class="statusBanner.bg"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" :class="statusBanner.iconBg">
            {{ statusBanner.icon }}
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider mb-0.5" :class="statusBanner.label">{{ statusBanner.title }}</p>
            <p class="font-semibold text-gray-800 text-sm">{{ statusBanner.subtitle }}</p>
          </div>
          <div class="ml-auto text-right">
            <p class="text-xs text-gray-500 font-medium">Time Spent</p>
            <p class="text-lg font-black tabular-nums" :class="statusBanner.label">{{ formatTime(perf.time_taken) }}</p>
          </div>
        </div>

        <!-- Question Meta Row -->
        <div class="flex items-center gap-2 mb-4 flex-wrap">
          <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">Q{{ perf.index + 1 }}</span>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{{ perf.subject }}</span>
          <span v-if="questionData.question_type" class="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full font-mono">{{ questionData.question_type === 'multiple_choice' ? 'MCQ' : 'Numeric' }}</span>
        </div>

        <!-- Question Card -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
          <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/70">
            <h2 class="text-xs font-bold uppercase text-gray-500 tracking-widest">Question</h2>
          </div>
          <div class="px-6 py-6 text-gray-800 text-base leading-relaxed prose max-w-none">
            {{ questionData.question_content?.text || questionData.question_content?.stem || questionData.external_reference || 'Question text not available.' }}
          </div>
          <div v-if="questionData.image_url" class="px-6 pb-6">
            <img :src="questionData.image_url" alt="Question image" class="w-full max-w-lg mx-auto rounded-xl border border-gray-200 shadow-sm object-contain bg-white" />
          </div>
        </div>

        <!-- Options (MCQ) -->
        <div v-if="questionData.question_type === 'multiple_choice' && choices" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
          <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/70">
            <h2 class="text-xs font-bold uppercase text-gray-500 tracking-widest">Answer Choices</h2>
          </div>
          <div class="p-5 space-y-3">
            <div
              v-for="(opt, key) in optionsList"
              :key="key"
              class="flex items-start gap-3 p-4 rounded-xl border-2 transition-all"
              :class="getOptionClass(opt.id)"
            >
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                :class="getOptionBadgeClass(opt.id)"
              >{{ opt.id.toUpperCase() }}</div>
              <div class="flex-1 text-sm font-medium leading-relaxed" :class="getOptionTextClass(opt.id)">
                {{ opt.text }}
              </div>
              <!-- Indicators -->
              <div class="flex items-center gap-1.5 shrink-0">
                <span v-if="opt.id === perf.correct" class="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  Correct
                </span>
                <span v-if="opt.id === perf.chosen && !perf.isCorrect" class="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                  Your Answer
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Numeric Answer -->
        <div v-else-if="questionData.question_type === 'numeric'" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-5">
          <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/70">
            <h2 class="text-xs font-bold uppercase text-gray-500 tracking-widest">Numerical Answer</h2>
          </div>
          <div class="p-6 grid grid-cols-2 gap-4">
            <div class="rounded-xl p-4 text-center" :class="perf.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'">
              <p class="text-xs font-bold uppercase tracking-wide mb-1" :class="perf.isCorrect ? 'text-green-600' : 'text-red-600'">Your Answer</p>
              <p class="text-2xl font-black font-mono" :class="perf.isCorrect ? 'text-green-700' : 'text-red-700'">{{ perf.chosen ?? '—' }}</p>
            </div>
            <div class="rounded-xl p-4 text-center bg-green-50 border-2 border-green-200">
              <p class="text-xs font-bold uppercase tracking-wide mb-1 text-green-600">Correct Answer</p>
              <p class="text-2xl font-black font-mono text-green-700">{{ perf.correct ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Solution/Explanation -->
        <div v-if="explanation" class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/70 rounded-2xl shadow-sm overflow-hidden mb-5">
          <div class="px-6 py-5 border-b border-blue-200/50 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 class="text-xs font-bold uppercase text-blue-700 tracking-widest">Solution & Explanation</h2>
          </div>
          <div class="px-6 py-6 text-gray-800 text-sm leading-relaxed prose max-w-none whitespace-pre-line">
            {{ explanation }}
          </div>
        </div>

        <!-- No solution notice -->
        <div v-else class="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center mb-5">
          <p class="text-sm text-gray-400 font-medium">Solution not yet available for this question.</p>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useExamStore } from '../stores/examStore'
import { supabase } from '../lib/supabase'

const route = useRoute()
const examStore = useExamStore()

const loading = ref(true)
const error = ref(null)
const questionData = ref(null)
const choices = ref(null)

// Pull from the in-memory last result (no DB re-read needed)
const perf = computed(() => {
  const qId = route.params.id
  return (examStore.lastResult?.perQuestion || []).find(p => p.question_id === qId) || null
})

const explanation = computed(() => {
  if (!questionData.value) return null
  return questionData.value.explanation?.text
    || questionData.value.explanation
    || questionData.value.solution_text
    || questionData.value.solution
    || null
})

// Build flattened options list [{id, text}]
const optionsList = computed(() => {
  if (!choices.value) return []
  return [
    { id: 'a', text: choices.value.choice1?.text || choices.value.choice1 || '' },
    { id: 'b', text: choices.value.choice2?.text || choices.value.choice2 || '' },
    { id: 'c', text: choices.value.choice3?.text || choices.value.choice3 || '' },
    { id: 'd', text: choices.value.choice4?.text || choices.value.choice4 || '' },
  ]
})

const statusBanner = computed(() => {
  if (!perf.value) return { bg: 'bg-gray-100', iconBg: 'bg-gray-200', icon: '—', title: 'Unknown', subtitle: '', label: 'text-gray-500' }
  if (!perf.value.chosen) return {
    bg: 'bg-gray-100 border border-gray-200',
    iconBg: 'bg-gray-200',
    icon: '—',
    title: 'Not Attempted',
    subtitle: 'You skipped this question.',
    label: 'text-gray-500'
  }
  if (perf.value.isCorrect) return {
    bg: 'bg-green-50 border border-green-200',
    iconBg: 'bg-green-100',
    icon: '✅',
    title: 'Correct  (+4)',
    subtitle: `You answered: ${perf.value.chosen?.toUpperCase()}`,
    label: 'text-green-700'
  }
  return {
    bg: 'bg-red-50 border border-red-200',
    iconBg: 'bg-red-100',
    icon: '❌',
    title: 'Incorrect  (−1)',
    subtitle: `You answered: ${perf.value.chosen?.toUpperCase()} — Correct: ${perf.value.correct?.toUpperCase()}`,
    label: 'text-red-700'
  }
})

function getOptionClass(id) {
  if (!perf.value) return 'border-gray-200 bg-white'
  const isChosen = id === perf.value.chosen
  const isCorrect = id === perf.value.correct
  if (isCorrect) return 'border-green-400 bg-green-50'
  if (isChosen && !perf.value.isCorrect) return 'border-red-400 bg-red-50'
  return 'border-gray-200 bg-white'
}

function getOptionBadgeClass(id) {
  if (!perf.value) return 'bg-gray-200 text-gray-600'
  const isChosen = id === perf.value.chosen
  const isCorrect = id === perf.value.correct
  if (isCorrect) return 'bg-green-500 text-white'
  if (isChosen && !perf.value.isCorrect) return 'bg-red-500 text-white'
  return 'bg-gray-200 text-gray-600'
}

function getOptionTextClass(id) {
  if (!perf.value) return 'text-gray-700'
  if (id === perf.value.correct) return 'text-green-800 font-semibold'
  if (id === perf.value.chosen && !perf.value.isCorrect) return 'text-red-800 font-semibold'
  return 'text-gray-700'
}

function formatTime(s) {
  if (!s) return '0s'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

onMounted(async () => {
  const qId = route.params.id
  if (!qId) {
    error.value = 'No question ID specified.'
    loading.value = false
    return
  }

  try {
    const { data: qData, error: qError } = await supabase
      .from('questions')
      .select('*, topics(topic_name), choices(choice1, choice2, choice3, choice4, correct_answer)')
      .eq('question_id', qId)
      .single()

    if (qError) throw qError

    questionData.value = qData
    choices.value = qData.choices || null
  } catch (err) {
    console.error('QuestionDetail fetch error:', err)
    error.value = err.message || 'Failed to fetch question data.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.prose {
  font-family: inherit;
}
</style>
