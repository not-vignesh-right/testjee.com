import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useExamStore = defineStore('exam', () => {
  // State
  const sessionId = ref(null) // Track current exam session
  const sessionStartTime = ref(null) // Server start time
  const examType = ref('JEE_MAIN_FULL') // Current exam type
  const questions = ref([])
  const currentQuestionIndex = ref(0)
  const userAnswers = ref({}) // Format: { questionId: chosenOptionId }
  const draftAnswers = ref({}) // New: format { questionId: chosenOptionId } - highlighted but not saved
  const questionStatuses = ref({}) // Format: { questionId: { visited: true, answered: true, marked: false } })
  const remainingTime = ref(180 * 60) // 3 hours in seconds
  const isFullScreen = ref(false)
  const examTitle = ref('Test JEE Main - Full Test')
  const subjectsOrder = ['Physics', 'Chemistry', 'Mathematics']
  const subjectNameSynonyms = {
    Physics: ['Physics'],
    Chemistry: ['Chemistry'],
    Mathematics: ['Mathematics', 'Maths', 'Math']
  }
  const numericAnswerLimitPerSubject = 5
  const numericDrafts = ref({})
  const timeSpent = ref({}) // {question_id: cumulative_time_in_seconds}
  const currentTimer = ref(null) // Interval ID for active timer
  const currentStartTime = ref(null) // Timestamp when current question timer starts
  const lastResult = ref(null)
  const isSubmitted = ref(false)
  const globalTimerInterval = ref(null) // Track the global 3-hour timer interval
  const allResults = ref([]) // All student results with sessions
  const statistics = ref(null) // Aggregate statistics


  // Getters
  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
  const totalQuestions = computed(() => questions.value.length)
  const answeredCount = computed(() => Object.keys(userAnswers.value).length)
  const markedCount = computed(() =>
    Object.values(questionStatuses.value).filter(status => status.marked).length
  )

  // Actions

  // Initialize or resume exam session
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

      // Create new session (fresh start)
      console.log('Creating new exam session...')

      // Reset all exam state for fresh start
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
          total_duration_seconds: 180 * 60, // 3 hours
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

      return newSession.session_id
    } catch (error) {
      console.error('Failed to initialize session:', error)
      return null
    }
  }

  // Save to localStorage (instant, no API calls)
  const saveToLocalStorage = () => {
    localStorage.setItem('examAnswers', JSON.stringify(userAnswers.value))
    localStorage.setItem('examDrafts', JSON.stringify(draftAnswers.value))
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex.value.toString())
    localStorage.setItem('questionStatuses', JSON.stringify(questionStatuses.value))
  }

  const fetchExamData = async () => {
    try {
      const authStore = useAuthStore()
      if (!authStore.studentId) throw new Error('No student ID available')

      console.log('fetchExamData: Starting...')

      if (questions.value.length > 0) {
        console.log('fetchExamData: Questions already loaded (e.g., from localStorage). Skipping fetch.')
        return
      }

      // 1. Get previously seen question IDs for this student
      let excludedQuestionIds = []
      try {
        const { data: pastResults, error: resultsError } = await supabase
          .from('results')
          .select('answers')
          .eq('student_id', authStore.studentId)

        if (resultsError) {
          console.error('fetchExamData: Error fetching past results:', resultsError)
        } else if (pastResults) {
          excludedQuestionIds = pastResults
            .flatMap(r => r.answers || [])
            .map(a => a?.question_id)
            .filter(id => id != null)

          excludedQuestionIds = [...new Set(excludedQuestionIds)]
          console.log(`fetchExamData: Found ${excludedQuestionIds.length} unique seen IDs`)
        }
      } catch (err) {
        console.error('fetchExamData: Catch in past results:', err)
      }

      // 2. Fetch subjects info
      const allSubjectNames = Array.from(new Set(Object.values(subjectNameSynonyms).flat()))
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('subject_id, subject_name')
        .in('subject_name', allSubjectNames)

      if (subjectsError) throw subjectsError

      const availableSubjects = (subjectsData || [])
      const lookupIdFor = (canonicalName) => {
        const candidates = subjectNameSynonyms[canonicalName] || [canonicalName]
        const found = availableSubjects.find(s => candidates.includes(s.subject_name))
        return found?.subject_id
      }

      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]]
        }
        return array
      }

      const assembledQuestions = []

      for (const subjectName of subjectsOrder) {
        const subjectId = lookupIdFor(subjectName)
        if (!subjectId) {
          console.warn(`fetchExamData: No ID for ${subjectName}`)
          continue
        }

        let subjectMcqs = []
        let subjectNumericals = []

        // --- Fetch MCQs ---
        let mcqQuery = supabase
          .from('questions')
          .select('question_id, subject_id, topic_id, question_type, question_content, image_url, external_reference, topics(topic_name), choices(multi_choice, choice1, choice2, choice3, choice4, correct_answer)')
          .eq('subject_id', subjectId)
          .eq('question_type', 'multiple_choice')

        if (excludedQuestionIds.length > 0) {
          // Wrap with parentheses to satisfy PostgREST IN filter requirement
          mcqQuery = mcqQuery.not('question_id', 'in', `(${excludedQuestionIds.join(',')})`)
        }

        const { data: mcqRows, error: mcqError } = await mcqQuery.limit(60)
        if (mcqError) {
          console.error(`fetchExamData: Error for ${subjectName} MCQs:`, mcqError)
        } else {
          subjectMcqs = shuffleArray(mcqRows || []).slice(0, 20)
        }

        // MCQ Fallback
        if (subjectMcqs.length < 20) {
          const currentPickedIds = subjectMcqs.map(q => q.question_id)
          let fillQuery = supabase
            .from('questions')
            .select('question_id, subject_id, topic_id, question_type, question_content, image_url, external_reference, topics(topic_name), choices(multi_choice, choice1, choice2, choice3, choice4, correct_answer)')
            .eq('subject_id', subjectId)
            .eq('question_type', 'multiple_choice')

          if (currentPickedIds.length > 0) {
            fillQuery = fillQuery.not('question_id', 'in', `(${currentPickedIds.join(',')})`)
          }

          const { data: fillMcqs } = await fillQuery.limit(20 - subjectMcqs.length)
          if (fillMcqs) subjectMcqs.push(...fillMcqs)
        }

        // --- Fetch Numericals ---
        let numQuery = supabase
          .from('questions')
          .select('question_id, subject_id, topic_id, question_type, question_content, image_url, external_reference, topics(topic_name)')
          .eq('subject_id', subjectId)
          .eq('question_type', 'numeric')

        if (excludedQuestionIds.length > 0) {
          numQuery = numQuery.not('question_id', 'in', `(${excludedQuestionIds.join(',')})`)
        }

        const { data: numRows, error: numError } = await numQuery.limit(20)
        if (numError) {
          console.error(`fetchExamData: Error for ${subjectName} Numericals:`, numError)
        } else {
          subjectNumericals = shuffleArray(numRows || []).slice(0, 5)
        }

        // Num Fallback
        if (subjectNumericals.length < 5) {
          const currentPickedIds = subjectNumericals.map(q => q.question_id)
          let fillQuery = supabase
            .from('questions')
            .select('question_id, subject_id, topic_id, question_type, question_content, image_url, external_reference, topics(topic_name)')
            .eq('subject_id', subjectId)
            .eq('question_type', 'numeric')

          if (currentPickedIds.length > 0) {
            fillQuery = fillQuery.not('question_id', 'in', `(${currentPickedIds.join(',')})`)
          }

          const { data: fillNums } = await fillQuery.limit(5 - subjectNumericals.length)
          if (fillNums) subjectNumericals.push(...fillNums)
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
    remainingTime.value = 180 * 60
    currentQuestionIndex.value = 0
    numericDrafts.value = {}
    timeSpent.value = {}
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
        if (answeredNumericForSubject >= numericAnswerLimitPerSubject) {
          return { success: false, reason: 'numeric_limit_reached' }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 50))

      userAnswers.value[questionId] = answer
      questionStatuses.value[questionId].answered = true
      questionStatuses.value[questionId].visited = true
      delete draftAnswers.value[questionId] // Clear draft once committed

      // Save to localStorage (instant, no API call)
      saveToLocalStorage()

      return { success: true }
    } catch (error) {
      console.error('Failed to save answer:', error)
      return { success: false }
    }
  }

  const markForReview = (questionId) => {
    questionStatuses.value[questionId].marked = true
    questionStatuses.value[questionId].visited = true
    saveToLocalStorage()
  }

  const clearResponse = (questionId) => {
    delete userAnswers.value[questionId]
    delete draftAnswers.value[questionId]
    questionStatuses.value[questionId].answered = false

    // Save to localStorage
    saveToLocalStorage()
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

  const submitExam = async () => {
    try {
      const authStore = useAuthStore()

      // Prevent double submission
      if (isSubmitted.value) {
        console.warn('⚠️ Exam already submitted, ignoring duplicate submit')
        return { success: false, message: 'Exam already submitted' }
      }

      // Pause final timer
      if (currentTimer.value) {
        clearInterval(currentTimer.value)
        const currentQuestionId = questions.value[currentQuestionIndex.value]?.id
        if (currentQuestionId && currentStartTime.value) {
          const elapsed = (Date.now() - currentStartTime.value) / 1000
          timeSpent.value[currentQuestionId] = (timeSpent.value[currentQuestionId] || 0) + elapsed
        }
      }

      // Build answers array (fixed length 75)
      const answersArray = Array(75).fill(null).map((_, i) => {
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

      // Calculate score
      const correctById = Object.fromEntries((choicesData || []).map(c => [c.question_id, c.correct_answer]))
      const score = answersArray.reduce((total, a) => {
        if (!a || !a.answer) return total
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

        return total + (isCorrect ? 4 : -1)
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

      // Clear localStorage after successful submission
      localStorage.removeItem('examAnswers')
      localStorage.removeItem('examDrafts')
      localStorage.removeItem('currentQuestionIndex')
      localStorage.removeItem('questionStatuses')
      localStorage.removeItem('examQuestions')
      console.log('Exam submitted, localStorage cleared')

      return { success: true, message: 'Exam submitted successfully', result_id: insertedId, score }
    } catch (error) {
      console.error('Error submitting exam:', error)
      alert("Error submitting exam. Please check your internet connection.")
      return { success: false, error }
    }
  }

  const emergencySubmit = () => {
    if (isSubmitted.value || !sessionId.value) return;

    try {
      const currentQuestionId = questions.value[currentQuestionIndex.value]?.id
      if (currentQuestionId && currentStartTime.value) {
        const elapsed = (Date.now() - currentStartTime.value) / 1000
        timeSpent.value[currentQuestionId] = (timeSpent.value[currentQuestionId] || 0) + elapsed
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
      isSubmitted.value = true

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
        submitExam()
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

  // Set exam type
  const setExamType = (type) => {
    examType.value = type
  }

  return {
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
    examTitle,
    numericDrafts,
    timeSpent,
    currentTimer,
    currentStartTime,
    lastResult,
    isSubmitted,
    allResults,
    statistics,

    // Getters
    currentQuestion,
    totalQuestions,
    answeredCount,
    markedCount,

    // Actions
    initializeSession,
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
    setExamType
  }
})
