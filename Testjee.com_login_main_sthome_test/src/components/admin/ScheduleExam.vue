<template>
  <div class="max-w-3xl mx-auto py-10 px-4 sm:px-6">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold text-ink-900 tracking-tight">Schedule live exam</h2>
      <p class="text-sm text-ink-500 mt-1">Create a synchronized exam session for a batch of students.</p>
    </div>

    <form @submit.prevent="handleCreateSession" class="space-y-8">

      <!-- API Alert -->
      <div v-if="errorMsg" class="p-4 bg-red-50 rounded-xl flex items-start gap-3 text-gta-danger text-sm font-medium">
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        {{ errorMsg }}
      </div>

      <!-- Exam Type: colorful cards matching the student dashboard's JEE/NEET/KCET cards -->
      <div>
        <label class="block text-sm font-semibold text-ink-700 mb-2.5">Exam type <span class="text-gta-danger">*</span></label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- JEE -->
          <button
            type="button"
            @click="selectFamily('JEE')"
            class="relative text-left p-4 rounded-2xl overflow-hidden transition-all duration-200"
            :class="examFamily === 'JEE' ? 'ring-2 ring-offset-2 ring-blue-500' : 'opacity-90 hover:opacity-100'"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500"></div>
            <div class="relative z-10">
              <span class="inline-block px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wide mb-2">NTA Pattern</span>
              <h3 class="text-lg font-bold text-white">JEE Main</h3>
              <p class="text-blue-100 text-xs mt-0.5">75 Qs &middot; 3h &middot; PCM</p>
            </div>
            <svg v-if="examFamily === 'JEE'" class="absolute top-3 right-3 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>

          <!-- NEET -->
          <button
            type="button"
            @click="selectFamily('NEET')"
            class="relative text-left p-4 rounded-2xl overflow-hidden transition-all duration-200"
            :class="examFamily === 'NEET' ? 'ring-2 ring-offset-2 ring-emerald-500' : 'opacity-90 hover:opacity-100'"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500"></div>
            <div class="relative z-10">
              <span class="inline-block px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wide mb-2">Medical Pattern</span>
              <h3 class="text-lg font-bold text-white">NEET UG</h3>
              <p class="text-green-100 text-xs mt-0.5">180 Qs &middot; 3h20m &middot; PCB</p>
            </div>
            <svg v-if="examFamily === 'NEET'" class="absolute top-3 right-3 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>

          <!-- KCET (with subject sub-picker) -->
          <div
            class="relative text-left p-4 rounded-2xl overflow-hidden transition-all duration-200"
            :class="examFamily === 'KCET' ? 'ring-2 ring-offset-2 ring-amber-500' : 'opacity-90 hover:opacity-100'"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-400"></div>
            <button type="button" @click="selectFamily('KCET')" class="relative z-10 block w-full text-left">
              <span class="inline-block px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wide mb-2">Karnataka State</span>
              <h3 class="text-lg font-bold text-white">KCET</h3>
              <p class="text-yellow-100 text-xs mt-0.5">60 Qs &middot; 80m &middot; No -ve</p>
            </button>
            <svg v-if="examFamily === 'KCET'" class="absolute top-3 right-3 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>

            <!-- KCET subject sub-picker -->
            <div v-if="examFamily === 'KCET'" class="relative z-10 grid grid-cols-2 gap-1.5 mt-3">
              <button
                v-for="opt in kcetOptions"
                :key="opt.value"
                type="button"
                @click="selectKcetSubject(opt.value)"
                class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                :class="formData.exam_type === opt.value
                  ? 'bg-white text-amber-700'
                  : 'bg-white/15 text-white hover:bg-white/25'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
        <p class="text-xs text-ink-500 mt-2">Determines the subjects, question mix, and marking scheme for this session.</p>
      </div>

      <!-- Test mode: Full Mock vs Topic Wise -->
      <div>
        <label class="block text-sm font-semibold text-ink-700 mb-2.5">Test mode</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="setMode('full')"
            class="flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left"
            :class="examMode === 'full' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'"
          >
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div>
              <p class="text-sm font-bold text-ink-900">Full Mock Test</p>
              <p class="text-xs text-ink-500">Standard randomized paper</p>
            </div>
          </button>
          <button
            type="button"
            @click="setMode('topic')"
            class="flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left"
            :class="examMode === 'topic' ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300 bg-white'"
          >
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <p class="text-sm font-bold text-ink-900">Topic Wise</p>
              <p class="text-xs text-ink-500">Choose specific topics</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Topic picker (only in Topic Wise mode) -->
      <div v-if="examMode === 'topic'" class="bg-canvas rounded-2xl p-5">
        <div v-if="topicsLoading" class="flex items-center justify-center py-8 text-ink-500 text-sm gap-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading topics...
        </div>
        <template v-else>
          <!-- Subject tabs -->
          <div class="flex gap-1 p-1 bg-white rounded-xl mb-4">
            <button
              v-for="subj in topicSubjects"
              :key="subj"
              type="button"
              @click="activeTopicSubject = subj"
              class="flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all"
              :class="activeTopicSubject === subj ? 'bg-blue-50 text-blue-700' : 'text-ink-500 hover:text-ink-700'"
            >
              {{ subj }}
            </button>
          </div>

          <template v-if="activeTopicSubject && topicsBySubject[activeTopicSubject]">
            <div class="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
              <label class="flex items-center gap-2.5 cursor-pointer" @click="toggleSelectAll(activeTopicSubject)">
                <div
                  class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                  :class="isAllSelectedForSubject(activeTopicSubject) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'"
                >
                  <svg v-if="isAllSelectedForSubject(activeTopicSubject)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </div>
                <span class="text-sm font-semibold text-ink-700">Select All {{ activeTopicSubject }}</span>
              </label>
              <span class="text-xs font-medium text-ink-500">
                {{ selectedTopics[activeTopicSubject]?.size || 0 }} / {{ topicsBySubject[activeTopicSubject]?.length || 0 }} selected
              </span>
            </div>

            <div class="max-h-72 overflow-y-auto pr-1">
              <div v-for="classGroup in ['11', '12']" :key="classGroup" class="mb-4">
                <p class="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">Class {{ classGroup }}</p>
                <div class="space-y-1">
                  <label
                    v-for="topic in getTopicsForSubjectAndClass(activeTopicSubject, classGroup)"
                    :key="topic.topic_id"
                    class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all"
                    :class="isTopicSelected(activeTopicSubject, topic.topic_id) ? 'bg-indigo-50' : 'hover:bg-white'"
                    @click="toggleTopic(activeTopicSubject, topic.topic_id)"
                  >
                    <div
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                      :class="isTopicSelected(activeTopicSubject, topic.topic_id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'"
                    >
                      <svg v-if="isTopicSelected(activeTopicSubject, topic.topic_id)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    </div>
                    <span class="text-sm text-ink-700" :class="isTopicSelected(activeTopicSubject, topic.topic_id) ? 'font-semibold text-indigo-800' : ''">
                      {{ topic.topic_name }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </template>
        </template>
        <p class="text-xs text-ink-500 mt-3">{{ totalTopicsSelected }} topic{{ totalTopicsSelected !== 1 ? 's' : '' }} selected across all subjects. Question availability (including cross-category borrowing) is checked when you create the session.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-sm font-semibold text-ink-700 mb-1.5">Session name <span class="text-gta-danger">*</span></label>
          <input
            v-model="formData.session_name"
            type="text"
            required
            placeholder="e.g. Morning Batch - Test 1"
            class="w-full px-4 py-2.5 bg-canvas rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors duration-200 placeholder-ink-400 text-ink-900"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-ink-700 mb-1.5">Start date &amp; time <span class="text-gta-danger">*</span></label>
          <div class="relative">
            <svg class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <input
              v-model="formData.start_time"
              type="datetime-local"
              required
              :min="minDateTime"
              class="w-full pl-11 pr-4 py-2.5 bg-canvas rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors duration-200 text-ink-900"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-ink-700 mb-1.5">Duration</label>
          <!-- Locked, branded badge for the 99% path — the exam type already dictates the
               correct duration. "Edit custom duration" is the escape hatch for edge cases. -->
          <div v-if="!customDuration" class="flex items-center justify-between px-4 py-2.5 bg-canvas rounded-xl">
            <span class="text-sm font-semibold text-ink-900 tabular-nums">{{ formData.duration_minutes }} minutes</span>
            <button type="button" @click="customDuration = true" class="text-xs font-semibold text-gta-secondary hover:underline transition-colors">
              Edit custom duration
            </button>
          </div>
          <input
            v-else
            v-model.number="formData.duration_minutes"
            type="number"
            min="30" max="300"
            required
            class="w-full px-4 py-2.5 bg-canvas rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors duration-200 text-ink-900"
          />
          <p class="text-xs text-ink-500 mt-1.5">{{ customDuration ? 'Between 30 and 300 minutes.' : `Standard duration for ${currentExamTitle}.` }}</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-ink-700 mb-1.5">Number of students <span class="text-gta-danger">*</span></label>
          <input
            v-model.number="formData.num_students"
            type="number"
            min="1" :max="availableStudentLimit"
            required
            class="w-full px-4 py-2.5 bg-canvas rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors duration-200 text-ink-900"
            :class="{'ring-1 ring-red-300 bg-red-50': formData.num_students > availableStudentLimit}"
          />
          <div class="flex justify-between items-center text-xs mt-1.5">
            <span class="text-ink-500">Generates temporary credentials</span>
            <span :class="formData.num_students > availableStudentLimit ? 'text-gta-danger font-semibold' : 'text-ink-500'">
              {{ availableStudentLimit }} remaining
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-ink-700 mb-1.5">Batch label <span class="text-ink-500 font-normal">(optional)</span></label>
          <input
            v-model="formData.batch_label"
            type="text"
            placeholder="e.g. Batch A, Morning Slot"
            class="w-full px-4 py-2.5 bg-canvas rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors duration-200 placeholder-ink-400 text-ink-900"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block text-sm font-semibold text-ink-700 mb-1.5">Instructions <span class="text-ink-500 font-normal">(optional)</span></label>
          <textarea
            v-model="formData.instructions"
            rows="3"
            placeholder="Specific instructions for this session..."
            class="w-full px-4 py-3 bg-canvas rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors duration-200 resize-none placeholder-ink-400 text-ink-900"
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="router.push('/admin/home')"
          class="px-5 py-2.5 text-ink-700 font-medium rounded-xl hover:bg-slate-100 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || isSubmitDisabled"
          class="px-6 py-2.5 bg-gta-primary hover:bg-gta-secondary text-white font-semibold rounded-xl transition-colors duration-200 ease-out-quart flex items-center gap-2 disabled:opacity-60"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Creating...' : 'Create exam session' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAdminStore } from '../../stores/adminStore'
import { EXAM_CONFIGS, getExamConfig } from '../../data/examConfigs'
import { compileExamQuestions, fetchTopicsForSubjects } from '../../utils/topicExamEngine'

const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(false)
const errorMsg = ref('')

const currentExamTitle = computed(() => getExamConfig(formData.value.exam_type).title)

// BUG-09 fix (kept): a real Exam Type selector driven by the same EXAM_CONFIGS used by the
// student dashboard, which is the actual source of truth for subjects/question counts/marking.
// NEW: presented as colorful JEE/NEET/KCET family cards (matching the student dashboard)
// instead of a flat tile grid, with KCET's subject sub-picker inline.
const examFamily = computed(() => {
  if (formData.value.exam_type?.startsWith('JEE')) return 'JEE'
  if (formData.value.exam_type?.startsWith('NEET')) return 'NEET'
  if (formData.value.exam_type?.startsWith('KCET')) return 'KCET'
  return 'JEE'
})

const kcetOptions = [
  { value: 'KCET_PHYSICS', label: 'Physics' },
  { value: 'KCET_CHEMISTRY', label: 'Chemistry' },
  { value: 'KCET_MATHEMATICS', label: 'Mathematics' },
  { value: 'KCET_BIOLOGY', label: 'Biology' },
]
const kcetSubject = ref('KCET_PHYSICS') // remembers last-picked KCET subject

function selectFamily(family) {
  if (family === 'JEE') selectExamType('JEE_MAIN_FULL')
  else if (family === 'NEET') selectExamType('NEET_UG_FULL')
  else if (family === 'KCET') selectExamType(kcetSubject.value)
}

function selectKcetSubject(value) {
  kcetSubject.value = value
  selectExamType(value)
}

// Enforce min datetime to now + 5 minutes — gives admins a natural buffer to share
// credentials and students to join the lobby before the scheduled time actually hits.
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 5)
  return now.toISOString().slice(0, 16)
})

const formData = ref({
  exam_type: 'JEE_MAIN_FULL',
  session_name: '',
  batch_label: '',
  start_time: minDateTime.value,
  duration_minutes: Math.round(EXAM_CONFIGS.JEE_MAIN_FULL.durationSeconds / 60),
  num_students: 20,
  instructions: 'Please do not refresh the page during the exam. Avoid switching tabs as your session may be monitored.'
})

// Locked-duration badge state — false shows the branded "N minutes" badge tied to the exam
// type tile, true reveals the raw number input for edge cases.
const customDuration = ref(false)

// Reset duration to the exam type's default when the admin explicitly picks a new tile, and
// re-lock the duration badge. Deliberately an explicit click handler, not a `watch` — a watch
// would also fire when the "Duplicate Session" prefill below sets exam_type programmatically,
// silently clobbering the prefilled duration for any session whose duration differs from
// that type's default.
const selectExamType = (key) => {
  formData.value.exam_type = key
  formData.value.duration_minutes = Math.round(getExamConfig(key).durationSeconds / 60)
  customDuration.value = false
  // Topics differ per exam type — clear the picker and re-fetch if it's currently open.
  topicsBySubject.value = {}
  selectedTopics.value = {}
  if (examMode.value === 'topic') loadTopicsForCurrentExam()
}

// ─── Topic Wise state (Full Mock vs Topic Wise) ───────────────────────────────
const examMode = ref('full') // 'full' | 'topic'
const topicsBySubject = ref({})    // { SubjectName: [{ topic_id, topic_name, class }] }
const selectedTopics = ref({})     // { SubjectName: Set<topic_id> }
const activeTopicSubject = ref('')
const topicsLoading = ref(false)

const topicSubjects = computed(() => getExamConfig(formData.value.exam_type)?.subjects ?? [])

const totalTopicsSelected = computed(() => {
  let count = 0
  for (const subj of topicSubjects.value) count += selectedTopics.value[subj]?.size ?? 0
  return count
})

function setMode(mode) {
  examMode.value = mode
  errorMsg.value = ''
  if (mode === 'topic' && Object.keys(topicsBySubject.value).length === 0) {
    loadTopicsForCurrentExam()
  }
}

async function loadTopicsForCurrentExam() {
  topicsLoading.value = true
  try {
    const cfg = getExamConfig(formData.value.exam_type)
    topicsBySubject.value = await fetchTopicsForSubjects(supabase, cfg)
    const initSel = {}
    for (const subj of cfg.subjects) initSel[subj] = new Set()
    selectedTopics.value = initSel
    activeTopicSubject.value = cfg.subjects[0] || ''
  } catch (err) {
    console.error('Failed to load topics:', err)
    errorMsg.value = 'Failed to load topics. Please try again.'
  } finally {
    topicsLoading.value = false
  }
}

function isTopicSelected(subj, topicId) {
  return selectedTopics.value[subj]?.has(topicId) ?? false
}

function isAllSelectedForSubject(subj) {
  const topics = topicsBySubject.value[subj]
  if (!topics || topics.length === 0) return false
  return (selectedTopics.value[subj]?.size ?? 0) === topics.length
}

function toggleTopic(subj, topicId) {
  if (!selectedTopics.value[subj]) selectedTopics.value[subj] = new Set()
  if (selectedTopics.value[subj].has(topicId)) selectedTopics.value[subj].delete(topicId)
  else selectedTopics.value[subj].add(topicId)
  selectedTopics.value = { ...selectedTopics.value }
}

function toggleSelectAll(subj) {
  const topics = topicsBySubject.value[subj] ?? []
  if (isAllSelectedForSubject(subj)) selectedTopics.value[subj] = new Set()
  else selectedTopics.value[subj] = new Set(topics.map(t => t.topic_id))
  selectedTopics.value = { ...selectedTopics.value }
}

function getTopicsForSubjectAndClass(subj, classNum) {
  return (topicsBySubject.value[subj] ?? []).filter(t => t.class === classNum)
}
// ─── End Topic Wise state ──────────────────────────────────────────────────

// 4.6: Prefill from "Duplicate" on AdminLiveSessions.vue. Merged field-by-field (not a
// blind Object.assign) so a missing/invalid field falls back to this form's own defaults
// instead of overwriting them with undefined or an exam_type that isn't in EXAM_CONFIGS.
onMounted(() => {
  const prefill = sessionStorage.getItem('prefillExamSession')
  if (!prefill) return
  try {
    const parsed = JSON.parse(prefill)
    if (parsed.session_name) formData.value.session_name = parsed.session_name
    if (parsed.duration_minutes) formData.value.duration_minutes = parsed.duration_minutes
    if (parsed.num_students) formData.value.num_students = parsed.num_students
    if (parsed.exam_type && EXAM_CONFIGS[parsed.exam_type]) formData.value.exam_type = parsed.exam_type
    if (parsed.instructions) formData.value.instructions = parsed.instructions
    if (parsed.batch_label) formData.value.batch_label = parsed.batch_label

    // If the duplicated session's duration doesn't match its exam type's default, unlock
    // the duration badge so the admin can see the actual (non-standard) value right away.
    const standardMinutes = Math.round(getExamConfig(formData.value.exam_type).durationSeconds / 60)
    if (formData.value.duration_minutes !== standardMinutes) customDuration.value = true
  } catch (err) {
    console.warn('Failed to apply session prefill:', err)
  }
  sessionStorage.removeItem('prefillExamSession')
})

// Max student cap calculated dynamically from the current profile
const availableStudentLimit = computed(() => {
  if (!adminStore.adminProfile) return 0
  const profile = adminStore.adminProfile
  return Math.max(0, profile.max_students - profile.students_created)
})

const isSubmitDisabled = computed(() => {
  return formData.value.num_students > availableStudentLimit.value || formData.value.num_students < 1
})

const handleCreateSession = async () => {
  errorMsg.value = ''
  
  if (isSubmitDisabled.value) {
    errorMsg.value = 'Cannot create session. Student limit exceeded.'
    return
  }
  
  loading.value = true

  try {
    const inputDate = new Date(formData.value.start_time)
    const examConfig = getExamConfig(formData.value.exam_type)

    // Build the topic filter (Topic Wise mode only) the same shape examStore.js uses for
    // student practice exams: { SubjectName: [topicId, ...] }
    let topicFilterMap = null
    if (examMode.value === 'topic') {
      topicFilterMap = {}
      let totalSelections = 0
      for (const subj of examConfig.subjects) {
        const ids = [...(selectedTopics.value[subj] ?? [])]
        topicFilterMap[subj] = ids
        totalSelections += ids.length
      }
      if (totalSelections === 0) {
        throw new Error('Please select at least one topic to continue, or switch to Full Mock Test.')
      }
    }

    // Compile the paper via the shared engine (also used by examStore.js for student practice
    // exams) — includes the same cross-category borrowing (KCET <-> JEE/NEET, JEE <-> NEET) and
    // reports a per-subject shortfall instead of silently shipping a thinner paper.
    const { questionIds: assembledQuestionIds, shortfalls } = await compileExamQuestions(supabase, examConfig, topicFilterMap)

    if (shortfalls.length > 0) {
      throw new Error(`Not enough questions available: ${shortfalls.join(' | ')}`)
    }
    if (assembledQuestionIds.length === 0) {
      throw new Error("No questions found for this Exam Type. Add questions first.")
    }

    // 2. Transmit to secure RPC wrapper
    const { data, error } = await supabase.rpc('create_live_exam_session_custom', {
      input_admin_id: adminStore.adminProfile.admin_id,
      input_session_name: formData.value.session_name,
      input_start_time: inputDate.toISOString(),
      input_duration_minutes: formData.value.duration_minutes,
      input_num_students: formData.value.num_students,
      input_instructions: formData.value.instructions,
      input_question_ids: assembledQuestionIds
    })

    if (error) throw error

    // Re-verify session to update total students created count locally
    await adminStore.loadSession()

    // Assuming the RPC returns array with one record
    const result = data[0]

    // Persist the chosen exam type (BUG-09 / NEW-06) via a separate additive RPC — best
    // effort so exam creation still succeeds even if that migration hasn't been run yet.
    // Security fix: token-verified, not a trusted admin_id — see harden-admin-rpc-security.sql.
    try {
      await supabase.rpc('set_live_session_exam_type', {
        p_token: adminStore.getToken(),
        input_live_session_id: result.live_session_id,
        input_exam_type: formData.value.exam_type
      })
    } catch (typeErr) {
      console.warn('Could not persist exam_type on live session (non-fatal):', typeErr)
    }

    // 5.4: Persist the optional batch label the same best-effort way
    if (formData.value.batch_label?.trim()) {
      try {
        await supabase.rpc('set_live_session_batch_label', {
          p_token: adminStore.getToken(),
          input_live_session_id: result.live_session_id,
          input_batch_label: formData.value.batch_label.trim()
        })
      } catch (labelErr) {
        console.warn('Could not persist batch_label on live session (non-fatal):', labelErr)
      }
    }

    // Pass session data to SessionCredentials route
    // Note: Use navigation state or session storage for large credential payloads
    sessionStorage.setItem('newSessionCredentials', JSON.stringify({
      sessionCode: result.session_code,
      sessionName: formData.value.session_name,
      credentials: result.student_credentials
    }))

    router.push(`/admin/sessions/${result.live_session_id}/credentials`)

  } catch (err) {
    console.error('Failed to create live exam wrapper:', err)
    errorMsg.value = err.message || 'Server failed to build session constraints. Verify constraints.'
  } finally {
    loading.value = false
  }
}
</script>
