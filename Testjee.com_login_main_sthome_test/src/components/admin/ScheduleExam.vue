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

      <!-- Exam Type: visual tile grid instead of a <select> -->
      <div>
        <label class="block text-sm font-semibold text-ink-700 mb-2.5">Exam type <span class="text-gta-danger">*</span></label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            v-for="opt in examTypeOptions"
            :key="opt.key"
            type="button"
            @click="selectExamType(opt.key)"
            class="relative text-left px-4 py-3.5 rounded-xl border transition-all duration-200 ease-out-quart"
            :class="formData.exam_type === opt.key
              ? 'border-gta-primary bg-blue-50 ring-1 ring-gta-primary'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
          >
            <span class="block text-sm font-semibold" :class="formData.exam_type === opt.key ? 'text-gta-secondary' : 'text-ink-900'">{{ opt.shortLabel }}</span>
            <span class="block text-xs text-ink-500 mt-0.5">{{ opt.durationLabel }}</span>
            <svg v-if="formData.exam_type === opt.key" class="absolute top-2.5 right-2.5 w-4 h-4 text-gta-secondary" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </button>
        </div>
        <p class="text-xs text-ink-500 mt-2">Determines the subjects, question mix, and marking scheme for this session.</p>
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

const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(false)
const errorMsg = ref('')

// BUG-09 fix: previously the category dropdown only tagged which question bank
// (JEE-pool vs NEET-pool) to pull from, while the assembly loop below still always built
// a hardcoded Physics/Chemistry/Mathematics paper regardless of what was picked — so
// choosing NEET actually produced a broken/empty JEE-shaped exam. This replaces it with a
// real Exam Type selector driven by the same EXAM_CONFIGS used by the student dashboard,
// which is the actual source of truth for subjects/question counts/marking per exam type.
const examTypeOptions = Object.entries(EXAM_CONFIGS).map(([key, cfg]) => ({
  key,
  title: cfg.title,
  shortLabel: cfg.shortLabel,
  durationLabel: `${Math.round(cfg.durationSeconds / 60)} min`
}))

const currentExamTitle = computed(() => getExamConfig(formData.value.exam_type).title)

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
}

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

// BUG-10 fix: `.sort(() => 0.5 - Math.random())` is a well-known biased shuffle —
// some orderings are far more likely than others. Fisher-Yates is uniform.
function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

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
    const categoryIds = Array.isArray(examConfig.categoryId) ? examConfig.categoryId : [examConfig.categoryId]

    // 1. Resolve subject_ids for every canonical subject via its synonyms (e.g. NEET's
    // "Botany" canonical name also matches rows literally named "Biology" in some pools)
    const allSynonymNames = Array.from(new Set(Object.values(examConfig.subjectNameSynonyms).flat()))
    const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('subject_id, subject_name')
        .in('subject_name', allSynonymNames)

    if (subjectsError) throw subjectsError

    const lookupIdsFor = (canonicalName) => {
      const candidates = examConfig.subjectNameSynonyms[canonicalName] || [canonicalName]
      return (subjectsData || []).filter(s => candidates.includes(s.subject_name)).map(s => s.subject_id)
    }

    const mcqTarget = examConfig.questionsPerSubject.mcq
    const numTarget = examConfig.hasNumeric ? examConfig.questionsPerSubject.numeric : 0
    const assembledQuestionIds = []

    for (const subjectName of examConfig.subjects) {
      const subjectIds = lookupIdsFor(subjectName)
      if (subjectIds.length === 0) {
        console.warn(`No subject_id found for "${subjectName}" (exam type ${formData.value.exam_type})`)
        continue
      }

      // Split the per-subject target evenly across every mapped subject_id (e.g. a
      // "Biology" canonical subject that maps to both Botany and Zoology rows)
      const subCount = subjectIds.length
      for (let i = 0; i < subCount; i++) {
        const subId = subjectIds[i]
        const subMcqTarget = Math.floor(mcqTarget / subCount) + (i < (mcqTarget % subCount) ? 1 : 0)
        const subNumTarget = Math.floor(numTarget / subCount) + (i < (numTarget % subCount) ? 1 : 0)

        if (subMcqTarget > 0) {
          let mcqQuery = supabase
            .from('questions')
            .select('question_id')
            .in('category_id', categoryIds)
            .eq('subject_id', subId)
            .eq('question_type', 'multiple_choice')
          if (examConfig.difficultyFilter && examConfig.difficultyFilter.length > 0) {
            mcqQuery = mcqQuery.in('difficulty', examConfig.difficultyFilter)
          }
          const { data: mcqs } = await mcqQuery.limit(Math.max(subMcqTarget * 5, 200))
          if (mcqs && mcqs.length) {
            assembledQuestionIds.push(...shuffleArray(mcqs).slice(0, subMcqTarget).map(q => q.question_id))
          }
        }

        if (subNumTarget > 0) {
          const { data: nums } = await supabase
            .from('questions')
            .select('question_id')
            .in('category_id', categoryIds)
            .eq('subject_id', subId)
            .eq('question_type', 'numeric')
            .limit(Math.max(subNumTarget * 5, 50))
          if (nums && nums.length) {
            assembledQuestionIds.push(...shuffleArray(nums).slice(0, subNumTarget).map(q => q.question_id))
          }
        }
      }
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
