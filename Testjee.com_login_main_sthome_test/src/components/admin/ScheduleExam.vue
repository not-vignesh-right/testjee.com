<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
        <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900 leading-tight">Schedule Live Exam</h2>
          <p class="text-sm text-gray-500">Create a synchronized exam session for a batch of students.</p>
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleCreateSession" class="p-6 md:p-8 space-y-6 animate-fade-in">
        
        <!-- API Alert -->
        <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm font-medium">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-6">
            
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Exam Type <span class="text-red-500">*</span></label>
              <div class="relative">
                <select
                  v-model="formData.exam_type"
                  required
                  @change="onExamTypeChange"
                  class="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors appearance-none text-gray-700 font-medium"
                >
                  <option v-for="opt in examTypeOptions" :key="opt.key" :value="opt.key">
                    {{ opt.title }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <p class="text-xs text-gray-500 ml-1 mt-1.5">Determines the subjects, question mix, and marking scheme for this session.</p>
            </div>

            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Session Name <span class="text-red-500">*</span></label>
              <input 
                v-model="formData.session_name" 
                type="text" 
                required
                placeholder="e.g. Morning Batch - Test 1"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors placeholder-gray-400"
              />
            </div>
            
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Start Date & Time <span class="text-red-500">*</span></label>
              <input 
                v-model="formData.start_time" 
                type="datetime-local" 
                required
                :min="minDateTime"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors text-gray-700"
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            
            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Duration (Minutes) <span class="text-red-500">*</span></label>
              <input 
                v-model.number="formData.duration_minutes" 
                type="number" 
                min="30" max="300"
                required
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
              />
              <p class="text-xs text-gray-500 ml-1 mt-1.5">Between 30 and 300 minutes.</p>
            </div>

            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Number of Students <span class="text-red-500">*</span></label>
              <input 
                v-model.number="formData.num_students" 
                type="number" 
                min="1" :max="availableStudentLimit"
                required
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
                :class="{'border-red-300 bg-red-50': formData.num_students > availableStudentLimit}"
              />
              <div class="flex justify-between items-center text-xs ml-1 mt-1.5">
                <span class="text-gray-500">Will generate temporary credentials.</span>
                <span :class="formData.num_students > availableStudentLimit ? 'text-red-600 font-bold' : 'text-blue-600 font-medium'">
                  Remaining Limit: {{ availableStudentLimit }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Batch Label (Optional)</label>
              <input
                v-model="formData.batch_label"
                type="text"
                placeholder="e.g. Batch A, Morning Slot"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors placeholder-gray-400"
              />
              <p class="text-xs text-gray-500 ml-1 mt-1.5">Shown on the sessions list to help distinguish multiple batches.</p>
            </div>

            <div class="form-group">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Instructions (Optional)</label>
              <textarea 
                v-model="formData.instructions" 
                rows="3"
                placeholder="Specific instructions for this session..."
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors resize-none placeholder-gray-400"
              ></textarea>
            </div>
            
          </div>
        </div>
        
        <!-- Actions -->
        <div class="pt-6 border-t border-gray-200 flex items-center justify-end gap-3 mt-8">
           <button 
            type="button" 
            @click="router.push('/admin/home')"
            class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="loading || isSubmitDisabled"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-60 overflow-hidden relative"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else class="mr-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </span>
            {{ loading ? 'Creating...' : 'Create Exam Session' }}
          </button>
        </div>
      </form>
    </div>
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
const examTypeOptions = Object.entries(EXAM_CONFIGS).map(([key, cfg]) => ({ key, title: cfg.title }))

// Enforce min datetime to local current time
const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
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

// Reset duration to the exam type's default when the admin explicitly picks a new one.
// Deliberately a @change handler, not a `watch` — a watch would also fire when the
// "Duplicate Session" prefill below sets exam_type programmatically, silently clobbering
// the prefilled duration for any session whose duration differs from that type's default.
const onExamTypeChange = () => {
  formData.value.duration_minutes = Math.round(getExamConfig(formData.value.exam_type).durationSeconds / 60)
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
    try {
      await supabase.rpc('set_live_session_exam_type', {
        input_admin_id: adminStore.adminProfile.admin_id,
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
          input_admin_id: adminStore.adminProfile.admin_id,
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
