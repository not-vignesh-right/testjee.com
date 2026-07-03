import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import { useExamSessionStore } from './examSessionStore'
import { EXAM_CONFIGS, getExamConfig } from '../data/examConfigs'

export const useExamStore = defineStore('exam', () => {
  // State
  const sessionId = ref(null) // Track current exam session
  const sessionStartTime = ref(null) // Server start time
  const examType = ref('JEE_MAIN_FULL') // Current exam type
  const questions = ref([])
  const currentQuestionIndex = ref(0)
  const userAnswers = ref({}) // Format: { questionId: chosenOptionId }
  const draftAnswers = ref({}) // format { questionId: chosenOptionId } - highlighted but not saved
  const questionStatuses = ref({}) // Format: { questionId: { visited: true, answered: true, marked: false } })
  const isFullScreen = ref(false)
  const numericDrafts = ref({})
  const timeSpent = ref({}) // {question_id: cumulative_time_in_seconds}
  const currentTimer = ref(null) // Interval ID for active timer
  const currentStartTime = ref(null) // Timestamp when current question timer starts
  const lastResult = ref(null)
  const isSubmitted = ref(false)
  const globalTimerInterval = ref(null) // Track the global 3-hour timer interval
  const allResults = ref([]) // All student results with sessions
  const statistics = ref(null) // Aggregate statistics
  const isManuallySubmitting = ref(false) // Flag to prevent window blur cheating detection on manual submit
  const isSubmitting = ref(false) // Global lock to prevent duplicate async database writes
  const topicFilter = ref(null) // null = full mock; { [subjectName]: topicId[] } = topic-wise
  const isResuming = ref(false) // Flag: true when resuming an approved session (skip instructions + decrement)
  const isLoadingQuestions = ref(false)

  // --- Live Exam Bridge State ---
  // When true, this store is being driven by a live-session bridge (see liveExamBridge.js):
  // persistence and submission are delegated to examSessionStore instead of exam_sessions/results.
  const isLiveMode = ref(false)
  const liveSessionCode = ref(null)
  const isLiveReload = ref(false)

  // --- Config-derived reactive getters ---
  const examConfig = computed(() => getExamConfig(examType.value))
  const examTitle = computed(() => examConfig.value.title)
  const remainingTime = ref(getExamConfig('JEE_MAIN_FULL').durationSeconds) // Will be reset on setExamType
  const subjectsOrder = computed(() => examConfig.value.subjects)
  const subjectNameSynonyms = computed(() => examConfig.value.subjectNameSynonyms)
  const numericAnswerLimitPerSubject = computed(() => examConfig.value.numericLimitPerSubject)


  // Getters
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  const totalQuestions = computed(() => questions.value.length)
  const answeredCount = computed(() => Object.keys(userAnswers.value).length)
  const markedCount = computed(() =>
    Object.values(questionStatuses.value).filter(status => status.marked).length
  )

  // Actions

  // Initialize or resume exam session
  // Initialize or resume exam session (does NOT create a new session automatically)
  const initializeSession = async () => {
    const authStore = useAuthStore()
    if (!authStore.studentId) {
      console.error('No student ID available')
      return null
    }

    try {
      // Check if there's an active session
      const { data: existingSession, error: fetchError } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('student_id', authStore.studentId)
        .eq('exam_type', examType.value)
        .eq('is_submitted', false)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching session:', fetchError)
      }

      if (existingSession) {
        // Resume existing session
        console.log('Resuming existing session:', existingSession)
        sessionId.value = existingSession.session_id
        sessionStartTime.value = existingSession.start_time

        // Calculate remaining time based on elapsed time
        const startTime = new Date(existingSession.start_time)
        const now = new Date()
        const elapsedSeconds = Math.floor((now - startTime) / 1000)
        const totalDuration = existingSession.total_duration_seconds
        remainingTime.value = Math.max(0, totalDuration - elapsedSeconds)

        // Check if time has expired
        if (remainingTime.value <= 0) {
          console.warn('⏰ Session time expired!')

          // Check if already submitted
          if (existingSession.is_submitted) {
            console.log('Session already submitted, redirecting to results')
            isSubmitted.value = true
            return null
          }

          // Mark as submitted without trying to submit again
          await supabase
            .from('exam_sessions')
            .update({
              is_submitted: true,
              end_time: new Date().toISOString()
            })
            .eq('session_id', existingSession.session_id)

          isSubmitted.value = true
          console.log('Session marked as expired and submitted')
          return null
        }

        // Restore from localStorage (not database)
        const savedAnswers = localStorage.getItem('examAnswers')
        const savedDrafts = localStorage.getItem('examDrafts')
        const savedIndex = localStorage.getItem('currentQuestionIndex')
        const savedStatuses = localStorage.getItem('questionStatuses')
        const savedQuestions = localStorage.getItem('examQuestions')

        if (savedQuestions) {
          questions.value = JSON.parse(savedQuestions)
          console.log('Restored questions from localStorage:', questions.value.length)
        }

        if (savedAnswers) {
          userAnswers.value = JSON.parse(savedAnswers)
          console.log('Restored answers from localStorage:', Object.keys(userAnswers.value).length)
        } else {
          console.warn('⚠️ localStorage cleared - continuing with empty answers (strict mode)')
        }

        if (savedDrafts) {
          draftAnswers.value = JSON.parse(savedDrafts)
          console.log('Restored draft answers from localStorage:', Object.keys(draftAnswers.value).length)
        }

        if (savedIndex) {
          currentQuestionIndex.value = parseInt(savedIndex)
          console.log('Restored question index from localStorage:', currentQuestionIndex.value)
        }

        if (savedStatuses) {
          questionStatuses.value = JSON.parse(savedStatuses)
          console.log('Restored question statuses from localStorage')
        }

        console.log(`Session resumed: ${elapsedSeconds}s elapsed, ${remainingTime.value}s remaining`)

        return existingSession.session_id
      }

      return null // No active session exists
    } catch (error) {
      console.error('Failed to initialize session:', error)
      return null
    }
  }

  // Initialize question statuses for currently loaded questions (idempotent)
  const initializeQuestionStatuses = () => {
    questions.value.forEach(q => {
      if (!questionStatuses.value[q.id]) {
        questionStatuses.value[q.id] = { visited: false, answered: false, marked: false }
      }
      if (timeSpent.value[q.id] === undefined) timeSpent.value[q.id] = 0
    })
  }

  // Create new session (fresh start when student clicks start)
  const createNewSession = async () => {
    const authStore = useAuthStore()
    if (!authStore.studentId) {
      console.error('No student ID available')
      return null
    }

    try {
      console.log('Creating new exam session...')

      // CRITICAL: Force-submit any dangling unsubmitted sessions for this exam type
      // so a fresh exam never accidentally resumes an old one left open from a bug.
      const { data: staleSession } = await supabase
        .from('exam_sessions')
        .select('session_id')
        .eq('student_id', authStore.studentId)
        .eq('exam_type', examType.value)
        .eq('is_submitted', false)
        .maybeSingle()

      if (staleSession) {
        console.warn('⚠️ Found stale open session, force-submitting before creating new one:', staleSession.session_id)
        await supabase
          .from('exam_sessions')
          .update({ is_submitted: true, end_time: new Date().toISOString(), auto_submitted: false })
          .eq('session_id', staleSession.session_id)
      }

      // Reset answer/progress state for fresh start
      userAnswers.value = {}
      draftAnswers.value = {}
      questionStatuses.value = {}
      currentQuestionIndex.value = 0
      isSubmitted.value = false
      lastResult.value = null

      // Clear localStorage
      localStorage.removeItem('examAnswers')
      localStorage.removeItem('examDrafts')
      localStorage.removeItem('currentQuestionIndex')
      localStorage.removeItem('questionStatuses')
      localStorage.removeItem('examQuestions')

      const { data: newSession, error: insertError } = await supabase
        .from('exam_sessions')
        .insert({
          student_id: authStore.studentId,
          exam_type: examType.value,
          total_duration_seconds: examConfig.value.durationSeconds,
          is_submitted: false
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating session:', insertError)
        throw insertError
      }

      console.log('✅ Created new session:', newSession)
      sessionId.value = newSession.session_id
      sessionStartTime.value = newSession.start_time
      remainingTime.value = newSession.total_duration_seconds

      // CRITICAL: Re-initialize question statuses from the already-fetched questions.
      // fetchExamData runs BEFORE createNewSession, so questions are loaded but statuses
      // were wiped above. We must restore them here so navigation doesn't crash.
      initializeQuestionStatuses()
      if (questions.value.length > 0) {
        questionStatuses.value[questions.value[0].id].visited = true
        goToQuestion(0)
        // Save questions back to localStorage so page-reload can restore them
        localStorage.setItem('examQuestions', JSON.stringify(questions.value))
      }

      return newSession.session_id
    } catch (error) {
      console.error('Failed to create new session:', error)
      return null
    }
  }

  // Save to localStorage (instant, no API calls)
  const saveToLocalStorage = () => {
    // Live sessions persist to student_exam_sessions instead — writing here would let a
    // live exam's in-progress state get mistakenly restored as a regular exam session later.
    if (isLiveMode.value) return
    localStorage.setItem('examAnswers', JSON.stringify(userAnswers.value))
    localStorage.setItem('examDrafts', JSON.stringify(draftAnswers.value))
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex.value.toString())
    localStorage.setItem('questionStatuses', JSON.stringify(questionStatuses.value))
  }

  const fetchExamData = async () => {
    isLoadingQuestions.value = true
    try {
      const authStore = useAuthStore()
      if (!authStore.studentId) throw new Error('No student ID available')

      const cfg = examConfig.value
      console.log(`fetchExamData: Starting for exam type ${examType.value}...`)

      if (questions.value.length > 0) {
        console.log('fetchExamData: Questions already loaded (e.g., from localStorage). Skipping fetch.')
        isLoadingQuestions.value = false
        return
      }

      // 1. Get previously CORRECTLY answered question IDs for this student
      // Strategy: Primary exclusion is scoped to questions in the SAME category as this exam.
      // This means a JEE-answered Physics question won't block NEET Physics (different category).
      // If the category-scoped pool is still too small, we fall back to ALL correctly answered IDs.
      let excludedQuestionIds = []        // category-scoped (primary)
      let allCorrectlyAnsweredIds = []    // cross-category (fallback)
      try {
        const { data: pastResults, error: resultsError } = await supabase
          .from('results')
          .select('answers')
          .eq('student_id', authStore.studentId)

        if (resultsError) {
          console.error('fetchExamData: Error fetching past results:', resultsError)
        } else if (pastResults && pastResults.length > 0) {
          const allAttemptedAnswers = pastResults.flatMap(r => r.answers || [])
          const allAttemptedQuestionIds = [...new Set(allAttemptedAnswers.map(a => a?.question_id).filter(id => id != null))]

          if (allAttemptedQuestionIds.length > 0) {
            console.log(`fetchExamData: Checking correctness for ${allAttemptedQuestionIds.length} attempted questions...`)

            // Fetch correct answers + category_id for cross-category scoping
            const { data: choicesData } = await supabase
              .from('choices')
              .select('question_id, correct_answer')
              .in('question_id', allAttemptedQuestionIds)

            // Also fetch category_id, topic_id, and image_url for each attempted question
            const { data: questionMeta } = await supabase
              .from('questions')
              .select('question_id, category_id, topic_id, image_url')
              .in('question_id', allAttemptedQuestionIds)

            const metaById = Object.fromEntries((questionMeta || []).map(q => [q.question_id, q]))
            const categoryById = Object.fromEntries((questionMeta || []).map(q => [q.question_id, q.category_id]))

            if (choicesData) {
              const correctAnswersMap = Object.fromEntries(choicesData.map(c => [c.question_id, c.correct_answer]))

              const correctlyAnsweredAnswers = allAttemptedAnswers.filter(a => {
                if (!a || !a.question_id || !a.answer) return false
                const correctAnswer = correctAnswersMap[a.question_id]
                if (correctAnswer === undefined) return false
                const userAnswer = String(a.answer).trim()
                const targetAnswer = String(correctAnswer).trim()
                if (!isNaN(parseFloat(userAnswer)) && !isNaN(parseFloat(targetAnswer))) {
                  return parseFloat(userAnswer) === parseFloat(targetAnswer)
                }
                return userAnswer.toLowerCase() === targetAnswer.toLowerCase()
              })

              const initialCorrectIds = [...new Set(correctlyAnsweredAnswers.map(a => a.question_id))]

              // Find equivalent questions with the same image_url and topic_id
              const correctImageUrls = [...new Set(
                initialCorrectIds
                  .map(id => metaById[id]?.image_url)
                  .filter(url => url && url.trim() !== '')
              )]

              let equivalentQuestions = []
              if (correctImageUrls.length > 0) {
                const { data: eqData, error: eqErr } = await supabase
                  .from('questions')
                  .select('question_id, image_url, topic_id, category_id')
                  .in('image_url', correctImageUrls)
                if (!eqErr && eqData) {
                  equivalentQuestions = eqData
                }
              }

              // Create a set of keys "image_url_topic_id" for all correctly attempted questions
              const correctKeySet = new Set(
                initialCorrectIds
                  .map(id => {
                    const meta = metaById[id]
                    return meta && meta.image_url ? `${meta.image_url.trim()}_${meta.topic_id}` : null
                  })
                  .filter(Boolean)
              )

              const additionalCorrectIds = []
              for (const eqQ of equivalentQuestions) {
                if (eqQ.image_url) {
                  const key = `${eqQ.image_url.trim()}_${eqQ.topic_id}`
                  if (correctKeySet.has(key)) {
                    additionalCorrectIds.push(eqQ.question_id)
                    // Ensure the category mapping is available for category-scoped exclusion check
                    if (categoryById[eqQ.question_id] === undefined) {
                      categoryById[eqQ.question_id] = eqQ.category_id
                    }
                  }
                }
              }

              allCorrectlyAnsweredIds = [...new Set([...initialCorrectIds, ...additionalCorrectIds])]

              // Primary: only exclude questions from the SAME category as current exam
              const examCategories = Array.isArray(cfg.categoryId) ? cfg.categoryId : [cfg.categoryId]
              excludedQuestionIds = [...new Set(
                allCorrectlyAnsweredIds
                  .filter(id => examCategories.includes(categoryById[id]))
              )]

              console.log(`fetchExamData: Scoped exclusion: ${excludedQuestionIds.length} IDs (original correct: ${initialCorrectIds.length}, equivalents found: ${additionalCorrectIds.length}). All-category backup: ${allCorrectlyAnsweredIds.length} IDs`)
            }
          }
        }
      } catch (err) {
        console.error('fetchExamData: Catch in past results processing:', err)
      }

      // 2. Fetch subjects info — pull all synonym names from config
      const synonymsMap = cfg.subjectNameSynonyms
      const allSubjectNames = Array.from(new Set(Object.values(synonymsMap).flat()))
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('subject_id, subject_name')
        .in('subject_name', allSubjectNames)

      if (subjectsError) throw subjectsError

      const availableSubjects = (subjectsData || [])
      const lookupIdsFor = (canonicalName) => {
        const candidates = synonymsMap[canonicalName] || [canonicalName]
        const found = availableSubjects.filter(s => candidates.includes(s.subject_name))
        return found.map(s => s.subject_id)
      }

      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]
        }
        return array
      }

      // Helper to apply category filter. categoryId can be a number or array of numbers.
      const applyCategoryFilter = (query, categoryIdConfig) => {
        if (!categoryIdConfig) return query
        if (Array.isArray(categoryIdConfig)) {
          return query.in('category_id', categoryIdConfig)
        }
        return query.eq('category_id', categoryIdConfig)
      }

      const mcqTarget = cfg.questionsPerSubject.mcq
      const numTarget = cfg.questionsPerSubject.numeric
      const difficultyFilter = cfg.difficultyFilter // null or array like ['easy', 'medium']

      const assembledQuestions = []
      const currentExamImageUrls = new Set()

      // Helper to select questions with unique image URLs
      const addUniqueQuestions = (sourceRows, targetArray, limit) => {
        for (const row of sourceRows) {
          if (targetArray.length >= limit) break
          const imgUrl = row.image_url
          if (imgUrl && imgUrl.trim() !== '') {
            if (currentExamImageUrls.has(imgUrl)) {
              continue // Skip duplicate image
            }
            currentExamImageUrls.add(imgUrl)
          }
          targetArray.push(row)
        }
      }

      for (const subjectName of cfg.subjects) {
        const subjectIds = lookupIdsFor(subjectName)
        if (!subjectIds || subjectIds.length === 0) {
          console.warn(`fetchExamData: No subject IDs found for "${subjectName}"`)
          continue
        }

        // Topic filter (topic-wise mode): if topicFilter has entries for this subject, restrict to those topic IDs
        const subjectTopicIds = topicFilter.value?.[subjectName] ?? null

        let subjectMcqs = []
        let subjectNumericals = []

        // Partition target counts evenly among the mapped subjectIds (e.g. 30 Botany, 30 Zoology for KCET Biology)
        const subIdsCount = subjectIds.length
        for (let i = 0; i < subIdsCount; i++) {
          const subId = subjectIds[i]
          
          const subMcqTarget = Math.floor(mcqTarget / subIdsCount) + (i < (mcqTarget % subIdsCount) ? 1 : 0)
          const subNumTarget = Math.floor(numTarget / subIdsCount) + (i < (numTarget % subIdsCount) ? 1 : 0)

          if (subMcqTarget <= 0 && subNumTarget <= 0) continue

          // --- Helper: build a base MCQ query for this specific subjectId ---
          const buildMcqQueryForId = (excludeIds, useCategory = true) => {
            let q = supabase
              .from('questions')
              .select('question_id, subject_id, topic_id, question_type, question_content, image_url, external_reference, topics(topic_name), choices(multi_choice, choice1, choice2, choice3, choice4, correct_answer)')
              .eq('subject_id', subId)
              .eq('question_type', 'multiple_choice')

            if (useCategory) {
              q = applyCategoryFilter(q, cfg.categoryId)
            }

            if (difficultyFilter && difficultyFilter.length > 0) {
              q = q.in('difficulty', difficultyFilter)
            }

            if (subjectTopicIds && subjectTopicIds.length > 0) {
              q = q.in('topic_id', subjectTopicIds)
            }

            if (excludeIds && excludeIds.length > 0) {
              q = q.not('question_id', 'in', `(${excludeIds.join(',')})`)
            }
            return q
          }

          let subMcqs = []

          // MCQ Phase 1: Target category + unattempted/correctly-scoped exclusions
          const mcqFetchLimit = Math.max(subMcqTarget * 5, 50)
          const { data: mcqRows, error: mcqError } = await buildMcqQueryForId(excludedQuestionIds).limit(mcqFetchLimit)
          if (!mcqError && mcqRows) {
            addUniqueQuestions(shuffleArray(mcqRows), subMcqs, subMcqTarget)
          }

          // MCQ Fallback 1: Target category + cross-category exclusion
          if (subMcqs.length < subMcqTarget && allCorrectlyAnsweredIds.length > excludedQuestionIds.length) {
            const currentPickedIds = subMcqs.map(q => q.question_id)
            const skipIds = [...new Set([...allCorrectlyAnsweredIds, ...currentPickedIds])]
            const { data: fillMcqs } = await buildMcqQueryForId(skipIds).limit(Math.max((subMcqTarget - subMcqs.length) * 5, 50))
            if (fillMcqs) {
              addUniqueQuestions(shuffleArray(fillMcqs), subMcqs, subMcqTarget)
            }
          }

          // MCQ Fallback 2: Borrow from OTHER categories (Interdependence) + cross-category exclusion
          if (subMcqs.length < subMcqTarget) {
            const currentPickedIds = subMcqs.map(q => q.question_id)
            const skipIds = [...new Set([...allCorrectlyAnsweredIds, ...currentPickedIds])]
            const { data: fillMcqs } = await buildMcqQueryForId(skipIds, false).limit(Math.max((subMcqTarget - subMcqs.length) * 5, 50))
            if (fillMcqs) {
              addUniqueQuestions(shuffleArray(fillMcqs), subMcqs, subMcqTarget)
            }
          }

          // MCQ Fallback 3: Target category + allow repeats (pool exhausted)
          if (subMcqs.length < subMcqTarget) {
            const currentPickedIds = subMcqs.map(q => q.question_id)
            const { data: fillMcqs } = await buildMcqQueryForId(currentPickedIds).limit(Math.max((subMcqTarget - subMcqs.length) * 5, 50))
            if (fillMcqs) {
              addUniqueQuestions(shuffleArray(fillMcqs), subMcqs, subMcqTarget)
              if (subMcqs.length < subMcqTarget) {
                for (const row of shuffleArray(fillMcqs)) {
                  if (subMcqs.length >= subMcqTarget) break
                  if (!subMcqs.some(q => q.question_id === row.question_id)) {
                    subMcqs.push(row)
                  }
                }
              }
            }
          }

          // MCQ Fallback 4: Borrow from OTHER categories + allow repeats
          if (subMcqs.length < subMcqTarget) {
            const currentPickedIds = subMcqs.map(q => q.question_id)
            const { data: fillMcqs } = await buildMcqQueryForId(currentPickedIds, false).limit(Math.max((subMcqTarget - subMcqs.length) * 5, 50))
            if (fillMcqs) {
              addUniqueQuestions(shuffleArray(fillMcqs), subMcqs, subMcqTarget)
              if (subMcqs.length < subMcqTarget) {
                for (const row of shuffleArray(fillMcqs)) {
                  if (subMcqs.length >= subMcqTarget) break
                  if (!subMcqs.some(q => q.question_id === row.question_id)) {
                    subMcqs.push(row)
                  }
                }
              }
            }
          }

          subjectMcqs.push(...subMcqs)

          // --- Fetch Numericals (only if config has numeric) ---
          if (cfg.hasNumeric && subNumTarget > 0) {
            const buildNumQueryForId = (excludeIds, useCategory = true) => {
              let q = supabase
                .from('questions')
                .select('question_id, subject_id, topic_id, question_type, question_content, image_url, external_reference, topics(topic_name)')
                .eq('subject_id', subId)
                .eq('question_type', 'numeric')

              if (useCategory) {
                q = applyCategoryFilter(q, cfg.categoryId)
              }

              if (subjectTopicIds && subjectTopicIds.length > 0) {
                q = q.in('topic_id', subjectTopicIds)
              }

              if (excludeIds && excludeIds.length > 0) {
                q = q.not('question_id', 'in', `(${excludeIds.join(',')})`)
              }
              return q
            }

            let subNums = []

            // Num Phase 1: Target category + exclusions
            const { data: numRows, error: numError } = await buildNumQueryForId(excludedQuestionIds).limit(Math.max(subNumTarget * 5, 50))
            if (!numError && numRows) {
              addUniqueQuestions(shuffleArray(numRows), subNums, subNumTarget)
            }

            // Num Fallback 1: Target category + cross-category exclusion
            if (subNums.length < subNumTarget && allCorrectlyAnsweredIds.length > excludedQuestionIds.length) {
              const currentPickedIds = subNums.map(q => q.question_id)
              const skipIds = [...new Set([...allCorrectlyAnsweredIds, ...currentPickedIds])]
              const { data: fillNums } = await buildNumQueryForId(skipIds).limit(Math.max((subNumTarget - subNums.length) * 5, 50))
              if (fillNums) {
                addUniqueQuestions(shuffleArray(fillNums), subNums, subNumTarget)
              }
            }

            // Num Fallback 2: Borrow from OTHER categories + cross-category exclusion
            if (subNums.length < subNumTarget) {
              const currentPickedIds = subNums.map(q => q.question_id)
              const skipIds = [...new Set([...allCorrectlyAnsweredIds, ...currentPickedIds])]
              const { data: fillNums } = await buildNumQueryForId(skipIds, false).limit(Math.max((subNumTarget - subNums.length) * 5, 50))
              if (fillNums) {
                addUniqueQuestions(shuffleArray(fillNums), subNums, subNumTarget)
              }
            }

            // Num Fallback 3: Target category + allow repeats
            if (subNums.length < subNumTarget) {
              const currentPickedIds = subNums.map(q => q.question_id)
              const { data: fillNums } = await buildNumQueryForId(currentPickedIds).limit(Math.max((subNumTarget - subNums.length) * 5, 50))
              if (fillNums) {
                addUniqueQuestions(shuffleArray(fillNums), subNums, subNumTarget)
                if (subNums.length < subNumTarget) {
                  for (const row of shuffleArray(fillNums)) {
                    if (subNums.length >= subNumTarget) break
                    if (!subNums.some(q => q.question_id === row.question_id)) {
                      subNums.push(row)
                    }
                  }
                }
              }
            }

            // Num Fallback 4: Borrow from OTHER categories + allow repeats
            if (subNums.length < subNumTarget) {
              const currentPickedIds = subNums.map(q => q.question_id)
              const { data: fillNums } = await buildNumQueryForId(currentPickedIds, false).limit(Math.max((subNumTarget - subNums.length) * 5, 50))
              if (fillNums) {
                addUniqueQuestions(shuffleArray(fillNums), subNums, subNumTarget)
                if (subNums.length < subNumTarget) {
                  for (const row of shuffleArray(fillNums)) {
                    if (subNums.length >= subNumTarget) break
                    if (!subNums.some(q => q.question_id === row.question_id)) {
                      subNums.push(row)
                    }
                  }
                }
              }
            }

            subjectNumericals.push(...subNums)
          }
        }

        const transform = (row) => ({
          id: row.question_id,
          text: (row.question_content?.text || row.question_content?.stem) || row.external_reference || '',
          image_url: row.image_url || null,
          subject: subjectName,
          topic: row.topics?.topic_name || '',
          question_type: row.question_type,
          options: row.question_type === 'multiple_choice' ? [
            { id: 'a', text: row.choices?.choice1?.text || row.choices?.choice1 || '' },
            { id: 'b', text: row.choices?.choice2?.text || row.choices?.choice2 || '' },
            { id: 'c', text: row.choices?.choice3?.text || row.choices?.choice3 || '' },
            { id: 'd', text: row.choices?.choice4?.text || row.choices?.choice4 || '' }
          ] : null
        })

        assembledQuestions.push(...subjectMcqs.map(transform))
        assembledQuestions.push(...subjectNumericals.map(transform))
      }

      console.log(`fetchExamData: Done. Assembled ${assembledQuestions.length} questions.`)
      questions.value = assembledQuestions
      localStorage.setItem('examQuestions', JSON.stringify(questions.value))

      // Initialize statuses
      questions.value.forEach(q => {
        if (!questionStatuses.value[q.id]) {
          questionStatuses.value[q.id] = { visited: false, answered: false, marked: false }
        }
        if (timeSpent.value[q.id] === undefined) timeSpent.value[q.id] = 0
      })

      const hasAnyAnswers = Object.keys(userAnswers.value).length > 0
      if (questions.value.length > 0 && !hasAnyAnswers) {
        questionStatuses.value[questions.value[0].id].visited = true
        goToQuestion(0)
      }
    } catch (error) {
      console.error('fetchExamData: Critical failure:', error)
    } finally {
      isLoadingQuestions.value = false
    }
  }

  const resetExamState = () => {
    // Clear ALL intervals to prevent timer stacking
    if (globalTimerInterval.value) {
      clearInterval(globalTimerInterval.value)
      globalTimerInterval.value = null
    }
    if (currentTimer.value) {
      clearInterval(currentTimer.value)
      currentTimer.value = null
    }

    isSubmitted.value = false
    questions.value = []
    userAnswers.value = {}
    draftAnswers.value = {}
    questionStatuses.value = {}
    sessionId.value = null
    sessionStartTime.value = null
    lastResult.value = null
    topicFilter.value = null // Reset topic filter for fresh exam
    isLoadingQuestions.value = false // Reset loading state
    isResuming.value = false // Reset resumption flag
    // Reset time from config so resuming after a different exam type is correct
    remainingTime.value = examConfig.value.durationSeconds
    currentQuestionIndex.value = 0
    numericDrafts.value = {}
    timeSpent.value = {}
    isLiveMode.value = false
    liveSessionCode.value = null
  }

  const setTopicFilter = (filter) => {
    topicFilter.value = filter // null for full mock, { SubjectName: [topicId, ...] } for topic-wise
  }

  const selectDraftAnswer = (questionId, answer) => {
    draftAnswers.value[questionId] = answer
    // Save to localStorage (instant, no API call)
    saveToLocalStorage()
  }

  const commitAnswer = async (questionId, answer) => {
    try {
      const question = questions.value.find(q => q.id === questionId)
      if (!question) return { success: false }

      if (question.question_type === 'numeric') {
        const answeredNumericForSubject = questions.value
          .filter(q => q.subject === question.subject && q.question_type === 'numeric' && userAnswers.value[q.id])
          .length
        // Use config-driven limit
        if (answeredNumericForSubject >= numericAnswerLimitPerSubject.value) {
          return { success: false, reason: 'numeric_limit_reached' }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 50))

      userAnswers.value[questionId] = answer
      questionStatuses.value[questionId].answered = true
      questionStatuses.value[questionId].visited = true
      delete draftAnswers.value[questionId] // Clear draft once committed

      if (isLiveMode.value) {
        // Live sessions have no localStorage/support-request snapshot to fall back on —
        // every answer must be persisted to student_exam_sessions immediately so a crash
        // or the resume/appeal flow can recover the true state from the DB.
        await useExamSessionStore().saveAnswer(questionId, answer, questionStatuses.value[questionId].marked)
      } else {
        // Save to localStorage (instant, no API call)
        saveToLocalStorage()
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to save answer:', error)
      return { success: false }
    }
  }

  const markForReview = (questionId) => {
    questionStatuses.value[questionId].marked = true
    questionStatuses.value[questionId].visited = true
    if (isLiveMode.value) {
      useExamSessionStore().saveAnswer(questionId, userAnswers.value[questionId] ?? null, true)
    } else {
      saveToLocalStorage()
    }
  }

  const clearResponse = (questionId) => {
    delete userAnswers.value[questionId]
    delete draftAnswers.value[questionId]
    questionStatuses.value[questionId].answered = false

    if (isLiveMode.value) {
      useExamSessionStore().saveAnswer(questionId, null, !!questionStatuses.value[questionId].marked)
    } else {
      // Save to localStorage
      saveToLocalStorage()
    }
  }

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.value.length) {
      // Pause current timer
      if (currentTimer.value) {
        clearInterval(currentTimer.value)
        const currentQuestionId = questions.value[currentQuestionIndex.value]?.id
        if (currentQuestionId && currentStartTime.value) {
          const elapsed = (Date.now() - currentStartTime.value) / 1000
          timeSpent.value[currentQuestionId] = (timeSpent.value[currentQuestionId] || 0) + elapsed
        }
      }

      currentQuestionIndex.value = index
      const questionId = questions.value[index].id
      questionStatuses.value[questionId].visited = true

      // Save current position to localStorage
      saveToLocalStorage()

      if (isLiveMode.value) {
        // Keep examSessionStore's own per-question time tracking (used at live submit time)
        // in sync with navigation that now happens through ExamLayout/examStore instead of
        // LiveExamInterface's own navigateToQuestion().
        useExamSessionStore().navigateToQuestion(index + 1)
      }

      // Start new timer
      currentStartTime.value = Date.now()
      currentTimer.value = setInterval(() => {
        const elapsed = (Date.now() - currentStartTime.value) / 1000
        timeSpent.value[questionId] = (timeSpent.value[questionId] || 0) + elapsed
        currentStartTime.value = Date.now()  // Reset start time to avoid drift
      }, 1000)
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      goToQuestion(currentQuestionIndex.value + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      goToQuestion(currentQuestionIndex.value - 1)
    }
  }

  const submitExam = async (isAutoSubmit = false) => {
    if (isSubmitting.value || isSubmitted.value) {
      console.warn('⚠️ Exam already submitting or submitted, ignoring duplicate submit')
      return { success: false, message: 'Exam currently submitting or already submitted' }
    }

    // Live sessions submit through student_exam_sessions (examSessionStore), not
    // exam_sessions/results — completely different scoring/tables.
    if (isLiveMode.value) {
      isSubmitting.value = true
      try {
        if (currentTimer.value) {
          clearInterval(currentTimer.value)
          currentTimer.value = null
        }
        if (globalTimerInterval.value) {
          clearInterval(globalTimerInterval.value)
          globalTimerInterval.value = null
        }
        const res = await useExamSessionStore().submitExam(isAutoSubmit)
        if (res.success) {
          isSubmitted.value = true
        }
        return res
      } finally {
        isSubmitting.value = false
      }
    }

    isSubmitting.value = true
    try {
      const authStore = useAuthStore()

      // Flush final timer
      if (currentTimer.value) {
        clearInterval(currentTimer.value)
        currentTimer.value = null
      }

      const currentQuestionId = questions.value[currentQuestionIndex.value]?.id
      if (currentQuestionId && currentStartTime.value) {
        const elapsed = (Date.now() - currentStartTime.value) / 1000
        timeSpent.value[currentQuestionId] = (timeSpent.value[currentQuestionId] || 0) + elapsed
        currentStartTime.value = Date.now() // Reset just in case
      }

      // Auto-save any lingering draft for the very final question
      if (currentQuestionId && draftAnswers.value[currentQuestionId] !== undefined) {
        userAnswers.value[currentQuestionId] = draftAnswers.value[currentQuestionId]
      }

      const cfg = examConfig.value
      const totalQCount = questions.value.length

      // Build answers array (dynamic length based on exam config)
      const answersArray = Array(totalQCount).fill(null).map((_, i) => {
        const question = questions.value[i]
        if (!question) return null
        const answer = userAnswers.value[question.id] || null
        const time_taken = Math.floor(timeSpent.value[question.id] || 0)
        return {
          question_id: question.id,
          answer: answer,
          time_taken: time_taken
        }
      })

      // Fetch correct answers in batch
      const allQuestionIds = questions.value.map(q => q.id)
      const { data: choicesData, error: choicesError } = await supabase
        .from('choices')
        .select('question_id, correct_answer')
        .in('question_id', allQuestionIds)

      if (choicesError) throw choicesError

      // Calculate score using config-driven marking scheme
      const correctById = Object.fromEntries((choicesData || []).map(c => [c.question_id, c.correct_answer]))
      const score = answersArray.reduce((total, a) => {
        if (!a || !a.answer) return total + cfg.marking.unattempted
        const question = questions.value.find(q => q.id === a.question_id)
        const correctAnswer = correctById[a.question_id]
        let userAnswer = a.answer
        let isCorrect = false

        if (question && question.question_type === 'numeric') {
          userAnswer = Number(userAnswer)
          const parsedCorrect = Number(correctAnswer)
          isCorrect = !isNaN(userAnswer) && !isNaN(parsedCorrect) && userAnswer === parsedCorrect
        } else {
          isCorrect = userAnswer === correctAnswer
        }

        return total + (isCorrect ? cfg.marking.correct : cfg.marking.incorrect)
      }, 0)

      // Mark session as submitted
      if (sessionId.value) {
        console.log('🔄 Marking session as submitted:', sessionId.value)
        const { data: updateData, error: sessionError } = await supabase
          .from('exam_sessions')
          .update({
            end_time: new Date().toISOString(),
            is_submitted: true
          })
          .eq('session_id', sessionId.value)
          .select()

        if (sessionError) {
          console.error('❌ Error updating session:', sessionError)
          throw new Error('Failed to mark session as submitted')
        }

        console.log('✅ Session marked as submitted:', updateData)
      } else {
        console.error('❌ No session ID to mark as submitted!')
      }

      // Insert to results table with actual student_id and session_id
      const { data, error } = await supabase
        .from('results')
        .insert({
          student_id: authStore.studentId,
          session_id: sessionId.value,
          answers: answersArray,
          score: score
        })
        .select()

      if (error) throw error

      // Get inserted id (handles both `id` or `result_id`)
      const insertedId = data?.[0]?.result_id ?? data?.[0]?.id ?? null

      // Build per-question details
      const perQuestion = answersArray.map((a, idx) => {
        if (!a || !a.question_id) {
          return {
            question_id: null, index: idx,
            subject: null, chosen: null, correct: null,
            isCorrect: false, time_taken: 0
          }
        }
        const q = questions.value.find(q => q.id === a.question_id)
        const chosenRaw = a.answer
        const correctRaw = correctById[a.question_id]
        let isCorrect = false
        if (q && q.question_type === 'numeric') {
          isCorrect = !isNaN(Number(chosenRaw)) && !isNaN(Number(correctRaw)) && Number(chosenRaw) === Number(correctRaw)
        } else {
          isCorrect = chosenRaw === correctRaw
        }
        return {
          question_id: a.question_id,
          index: idx,
          subject: q?.subject ?? 'Unknown',
          chosen: a.answer,
          correct: correctRaw,
          isCorrect,
          time_taken: a.time_taken || 0
        }
      })

      // Save to store
      lastResult.value = {
        id: insertedId,
        score,
        answers: answersArray,
        perQuestion,
        correctById
      }
      isSubmitted.value = true
      isResuming.value = false // Clear resuming flag after full submit

      // Clear localStorage after successful submission
      localStorage.removeItem('examAnswers')
      localStorage.removeItem('examDrafts')
      localStorage.removeItem('currentQuestionIndex')
      localStorage.removeItem('questionStatuses')
      localStorage.removeItem('examQuestions')

      const pendingKey = `pending_submit_${authStore.studentProfile?.student_id || authStore.studentId || 'unauth'}`
      localStorage.removeItem(pendingKey)

      // Mark support request as 'completed' after any exam submission
      // Closes BOTH pending and approved requests so the dashboard banner
      // is always hidden once the exam has been submitted for this session
      if (sessionId.value) {
        try {
          const { error: srErr } = await supabase
            .from('exam_support_requests')
            .update({ status: 'completed' })
            .eq('session_id', sessionId.value)
            .in('status', ['pending', 'approved'])
          if (srErr) console.warn('Could not mark support request as completed:', srErr)
        } catch (cleanupErr) {
          console.warn('Could not mark support request as completed:', cleanupErr)
        }
      }

      console.log('Exam submitted, localStorage cleared')

      return { success: true, message: 'Exam submitted successfully', result_id: insertedId, score }
    } catch (error) {
      console.error('Error submitting exam:', error)
      alert("Error submitting exam. Please check your internet connection.")
      return { success: false, error }
    } finally {
      isSubmitting.value = false
    }
  }

  const emergencySubmit = () => {
    // Live sessions persist every answer immediately via saveAnswer — there's no
    // localStorage snapshot step to do here, and no exam_sessions row to key off.
    if (isLiveMode.value) return
    if (isSubmitted.value || !sessionId.value) return;

    try {
      // Flush final timer
      if (currentTimer.value) {
        clearInterval(currentTimer.value)
        currentTimer.value = null
      }

      const currentQuestionId = questions.value[currentQuestionIndex.value]?.id
      if (currentQuestionId && currentStartTime.value) {
        const elapsed = (Date.now() - currentStartTime.value) / 1000
        timeSpent.value[currentQuestionId] = (timeSpent.value[currentQuestionId] || 0) + elapsed
        currentStartTime.value = Date.now()
      }

      if (currentQuestionId && draftAnswers.value[currentQuestionId] !== undefined) {
        userAnswers.value[currentQuestionId] = draftAnswers.value[currentQuestionId]
      }

      const formattedAnswers = questions.value.map(q => {
        let answerData = {
          question_id: q.id,
          answer: userAnswers.value[q.id] || null,
          time_taken: Math.round(timeSpent.value[q.id] || 0)
        }

        const status = questionStatuses.value[q.id] || {}
        if (status.marked) {
          answerData.is_marked = true;
        }
        return answerData;
      })

      const payload = JSON.stringify({
        session_id: sessionId.value,
        answers: formattedAnswers
      })

      // Use App URL and append /api if we had an edge function, 
      // but Supabase REST API via sendBeacon is tricky because of auth headers.
      // Easiest reliable way: store in LS for later sync if sendBeacon is complex.
      // But we can try a sync fetch if possible (which beforeunload limits).

      const authStore = useAuthStore()
      const token = authStore.session?.access_token || authStore.accessToken

      // We will save to localStorage immediately to guarantee recovery
      const pendingKey = `pending_submit_${authStore.studentProfile?.student_id || 'unauth'}`
      localStorage.setItem(pendingKey, JSON.stringify({
        session_id: sessionId.value,
        answers: formattedAnswers,
        timestamp: Date.now()
      }))

      // Try beacon to an edge function if it exists, otherwise rely on the above localStorage backup
      // This is a common pattern for offline/close recovery without Edge functions
      console.log('Emergency saved exam state to localStorage.')
      // Intentionally NOT setting isSubmitted.value = true here, 
      // so that the subsequent await submitExam() can still hit the database!

    } catch (e) {
      console.error('Emergency full submit failed', e)
    }
  }


  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value
    if (isFullScreen.value) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const startTimer = () => {
    // CRITICAL: Clear any existing global timer to prevent stacking
    if (globalTimerInterval.value) {
      clearInterval(globalTimerInterval.value)
      globalTimerInterval.value = null
    }

    globalTimerInterval.value = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        clearInterval(globalTimerInterval.value)
        globalTimerInterval.value = null
        submitExam(true)
      }
    }, 1000)
  } // The global timer of 3 hours

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getNumericDraft = (questionId) => {
    // Check main draftAnswers first, then userAnswers
    const draft = draftAnswers.value[questionId]
    if (typeof draft !== 'undefined') return draft

    return userAnswers.value[questionId] || ''
  }

  const setNumericDraft = (questionId, value) => {
    selectDraftAnswer(questionId, value)
  }

  // Fetch all student results with exam sessions
  const fetchStudentResults = async () => {
    const authStore = useAuthStore()
    if (!authStore.studentId) {
      console.error('No student ID available')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          result_id,
          score,
          answers,
          creation_date,
          session_id,
          exam_sessions (
            session_id,
            start_time,
            end_time,
            exam_type,
            total_duration_seconds
          )
        `)
        .eq('student_id', authStore.studentId)
        .order('creation_date', { ascending: false })

      if (error) throw error

      allResults.value = data.map(item => ({
        ...item,
        session: item.exam_sessions
      }))

      // Calculate statistics
      calculateStatistics()

      return allResults.value
    } catch (error) {
      console.error('Error fetching student results:', error)
      return []
    }
  }

  // Calculate aggregate statistics from all results
  const calculateStatistics = () => {
    if (allResults.value.length === 0) {
      statistics.value = null
      return
    }

    const scores = allResults.value.map(r => r.score)
    const totalExams = scores.length
    const totalScore = scores.reduce((sum, s) => sum + s, 0)
    const avgScore = totalScore / totalExams
    const bestScore = Math.max(...scores)
    const recentScores = scores.slice(0, Math.min(5, scores.length))
    const olderScores = scores.slice(Math.min(5, scores.length))

    let trend = 'stable'
    if (recentScores.length >= 2 && olderScores.length >= 2) {
      const recentAvg = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
      const olderAvg = olderScores.reduce((sum, s) => sum + s, 0) / olderScores.length
      if (recentAvg > olderAvg + 10) trend = 'improving'
      else if (recentAvg < olderAvg - 10) trend = 'declining'
    }

    statistics.value = {
      totalExams,
      avgScore: Math.round(avgScore),
      bestScore,
      trend
    }
  }

  // Set exam type — also resets timer to the new exam's duration
  const setExamType = (type) => {
    examType.value = type
    // Sync remaining time to new exam's duration (will be overridden by initializeSession if resuming)
    remainingTime.value = getExamConfig(type).durationSeconds
  }

  // Support Requests Actions
  const submitSupportRequest = async (reason, customMessage, remainingSeconds) => {
    const authStore = useAuthStore()
    if (!authStore.studentId || !sessionId.value) {
      console.error('Missing student ID or session ID for support request')
      return { success: false, error: 'Session not initialized' }
    }

    try {
      // BUG 6 FIX: Check if a request already exists for this session to prevent duplicates
      const { data: existingRequest } = await supabase
        .from('exam_support_requests')
        .select('request_id, status')
        .eq('session_id', sessionId.value)
        .maybeSingle()

      if (existingRequest) {
        console.warn('⚠️ Support request already exists for this session:', existingRequest)
        if (existingRequest.status === 'pending' || existingRequest.status === 'approved') {
          return { success: true, data: [existingRequest], alreadyExists: true }
        }
        // If already completed or rejected, do not allow resubmission
        return { success: false, error: 'You have already used your resume limit for this session.' }
      }

      // Build answers snapshot array
      const totalQCount = questions.value.length
      const answersArray = Array(totalQCount).fill(null).map((_, i) => {
        const question = questions.value[i]
        if (!question) return null
        const answer = userAnswers.value[question.id] || null
        const time_taken = Math.floor(timeSpent.value[question.id] || 0)
        return {
          question_id: question.id,
          answer: answer,
          time_taken: time_taken,
          is_marked: !!(questionStatuses.value[question.id]?.marked) // Preserve marked-for-review
        }
      })

      // BUG 4 FIX: Save the exact question list so resume restores the same questions in same order
      const questionsSnapshot = questions.value.map(q => ({
        id: q.id,
        text: q.text,
        image_url: q.image_url,
        subject: q.subject,
        topic: q.topic,
        question_type: q.question_type,
        options: q.options
      }))

      // BUG 5 FIX: Mark the session as auto_submitted so dashboard only shows banner for these
      await supabase
        .from('exam_sessions')
        .update({ auto_submitted: true })
        .eq('session_id', sessionId.value)

      const { data, error } = await supabase
        .from('exam_support_requests')
        .insert({
          session_id: sessionId.value,
          student_id: authStore.studentId,
          reason,
          custom_message: customMessage,
          remaining_time_seconds: remainingSeconds,
          answers: answersArray,
          questions: questionsSnapshot,
          status: 'pending'
        })
        .select()

      if (error) throw error
      console.log('✅ Support request submitted successfully:', data)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Failed to submit support request:', error)
      return { success: false, error: error.message }
    }
  }

  const setIsResuming = (value) => {
    isResuming.value = value
  }

  const restoreResumedSession = async (request) => {
    try {
      console.log('🔄 Restoring resumed exam session progress from request:', request)
      
      // Verify that the request is actually approved in the DB
      const { data: dbRequest, error: reqDbErr } = await supabase
        .from('exam_support_requests')
        .select('status')
        .eq('request_id', request.request_id)
        .single()

      if (reqDbErr || !dbRequest) {
        throw new Error('Support request not found in database.')
      }

      if (dbRequest.status !== 'approved') {
        throw new Error('This support request has already been used or is no longer approved.')
      }

      // 1. Reset state
      sessionId.value = request.session_id
      isSubmitted.value = false
      userAnswers.value = {}
      draftAnswers.value = {}
      questionStatuses.value = {}
      timeSpent.value = {}

      // 2. Fetch session to get exam_type
      const { data: sessionData, error: sessError } = await supabase
        .from('exam_sessions')
        .select('exam_type')
        .eq('session_id', request.session_id)
        .single()
      
      if (sessError) throw sessError

      examType.value = sessionData.exam_type

      const currentNow = new Date().toISOString()
      remainingTime.value = request.remaining_time_seconds

      if (remainingTime.value <= 0) {
        console.warn('⏰ Session time has already expired. Cannot resume.')
        return { success: false, error: 'Session time has expired.' }
      }

      // Reopen session in DB and reset start_time to NOW so student gets full remaining time
      const { error: updateErr } = await supabase
        .from('exam_sessions')
        .update({ 
          is_submitted: false, 
          end_time: null,
          start_time: currentNow,
          total_duration_seconds: request.remaining_time_seconds
        })
        .eq('session_id', request.session_id)

      if (updateErr) {
        console.error('❌ Failed to reopen session in DB:', updateErr)
        throw updateErr
      }

      // BUG 4 FIX: Restore EXACT original questions from the snapshot in the support request
      if (request.questions && Array.isArray(request.questions) && request.questions.length > 0) {
        questions.value = request.questions
        console.log('✅ Restored original question set from snapshot:', questions.value.length)
        localStorage.setItem('examQuestions', JSON.stringify(questions.value))
      } else {
        // Fallback: fetch fresh (only if no snapshot, e.g. old requests)
        console.warn('⚠️ No question snapshot in request, fetching fresh (order may differ)')
        await fetchExamData()
      }

      // 3. Initialize question statuses for all questions
      questions.value.forEach(q => {
        if (!questionStatuses.value[q.id]) {
          questionStatuses.value[q.id] = { visited: false, answered: false, marked: false }
        }
        if (timeSpent.value[q.id] === undefined) timeSpent.value[q.id] = 0
      })

      // 4. Restore answers, status, and time spent from answers array snapshot
      if (request.answers && Array.isArray(request.answers)) {
        request.answers.forEach(a => {
          if (a && a.question_id) {
            if (a.answer !== null && a.answer !== undefined) {
              userAnswers.value[a.question_id] = a.answer
            }
            timeSpent.value[a.question_id] = a.time_taken || 0
            questionStatuses.value[a.question_id] = {
              visited: (a.time_taken > 0 || a.answer !== null),
              answered: (a.answer !== null && a.answer !== undefined),
              marked: !!(a.is_marked) // Restore marked-for-review state
            }
          }
        })
      }

      // 5. Set isResuming flag — prevents ExamInstructions decrement + initializeSession re-run
      isResuming.value = true

      // 6. Save to localStorage
      saveToLocalStorage()

      // 7. Update support request status in DB to 'completed' as it has now been consumed/restored
      try {
        const { error: updateReqErr } = await supabase
          .from('exam_support_requests')
          .update({ status: 'completed' })
          .eq('request_id', request.request_id)
        
        if (updateReqErr) {
          console.warn('⚠️ Failed to update support request status to completed:', updateReqErr)
        } else {
          console.log('✅ Support request marked as completed in DB')
        }
      } catch (dbErr) {
        console.warn('⚠️ Failed to update support request status:', dbErr)
      }
      
      console.log(`✅ Exam session resumed! ${remainingTime.value}s remaining.`)
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to restore resumed session:', error)
      isResuming.value = false
      return { success: false, error: error.message }
    }
  }

  return {
    // Topic filter
    topicFilter,
    setTopicFilter,
    // State
    sessionId,
    sessionStartTime,
    examType,
    questions,
    currentQuestionIndex,
    userAnswers,
    draftAnswers,
    questionStatuses,
    remainingTime,
    isFullScreen,
    examTitle,    // Now a computed ref driven by config
    examConfig,   // Expose full config for components that need it
    numericDrafts,
    timeSpent,
    currentTimer,
    currentStartTime,
    lastResult,
    isSubmitted,
    allResults,
    statistics,
    isResuming,
    isLoadingQuestions,
    isLiveMode,
    liveSessionCode,
    isLiveReload,

    // Getters
    currentQuestion,
    totalQuestions,
    answeredCount,
    markedCount,

    // Actions
    initializeSession,
    createNewSession,
    initializeQuestionStatuses,
    fetchExamData,
    resetExamState,
    selectDraftAnswer,
    commitAnswer,
    markForReview,
    clearResponse,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitExam,
    emergencySubmit,
    toggleFullScreen,
    startTimer,
    formatTime,
    getNumericDraft,
    setNumericDraft,
    fetchStudentResults,
    setExamType,
    isManuallySubmitting,
    submitSupportRequest,
    restoreResumedSession,
    setIsResuming
  }
})
