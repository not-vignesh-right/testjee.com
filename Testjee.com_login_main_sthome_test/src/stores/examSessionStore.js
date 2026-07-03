import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useExamSessionStore = defineStore('examSession', () => {
    // ------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------
    const studentSessionId = ref(null)
    const tempStudentId = ref(null)
    const liveSessionId = ref(null)
    const sessionDetails = ref({})

    const questionOrder = ref([])
    const questions = ref([])

    // Maps question_id to selected_answer
    const answers = ref({})
    // Plain object map: { [questionNumber]: true } — Vue can track property reads/writes natively
    const markedForReview = ref({})
    // Maps question_id to total seconds spent
    const timeSpent = ref({})

    const currentQuestionNumber = ref(1) // 1 to N
    const timeRemainingSeconds = ref(0)

    // 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted'
    const examStatus = ref('not_started')

    // Timer references
    const mainTimerInterval = ref(null)
    const activeQuestionStartTime = ref(null)
    const isTimeUpAlertGiver = ref(false)

    // ------------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------------
    const currentQuestion = computed(() => {
        if (!questions.value || questions.value.length === 0) return null
        return questions.value[currentQuestionNumber.value - 1]
    })

    const totalQuestions = computed(() => questionOrder.value.length || 0)

    const answeredCount = computed(() => Object.keys(answers.value).length)

    const formattedTimeRemaining = computed(() => {
        const totalSelected = timeRemainingSeconds.value
        if (totalSelected <= 0) return '00:00:00'
        const h = Math.floor(totalSelected / 3600)
        const m = Math.floor((totalSelected % 3600) / 60)
        const s = totalSelected % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    })

    // ------------------------------------------------------------------------
    // Actions
    // ------------------------------------------------------------------------

    /**
     * 1. Login to Exam
     */
    const loginToExam = async (sessionCode, username) => {
        try {
            const { data, error } = await supabase.rpc('student_exam_login', {
                input_session_code: sessionCode,
                input_username: username
            })

            if (error) throw error
            if (!data || data.length === 0) {
                throw new Error('Invalid credentials or session code')
            }

            const info = data[0]
            studentSessionId.value = info.student_session_id
            tempStudentId.value = info.temp_student_id
            liveSessionId.value = info.live_session_id
            examStatus.value = info.status

            sessionDetails.value = {
                sessionName: info.session_name,
                scheduledStartTime: info.scheduled_start_time,
                scheduledEndTime: info.scheduled_end_time,
                durationMinutes: info.duration_minutes,
                studentName: info.student_name,
                rollNumber: info.roll_number,
                hasFilledDetails: info.has_filled_details,
                sessionStatus: info.session_status,
                canStart: info.can_start
            }
            return { success: true, data: info }
        } catch (err) {
            console.error('Login to Exam Failed:', err)
            return { success: false, error: err.message }
        }
    }

    /**
     * 2. Start Exam
     * Returns true if successful. Transitions state to 'in_progress'
     */
    const startExam = async () => {
        try {
            if (!studentSessionId.value) throw new Error('No active student session')

            const { data, error } = await supabase.rpc('start_student_exam', {
                input_student_session_id: studentSessionId.value
            })

            if (error) throw error

            if (data && data.length > 0) {
                questionOrder.value = data[0].question_order
                examStatus.value = 'in_progress'

                // BUG-04 fix: the per-student end time is start_time + duration, NOT the
                // session's scheduled_end_time (which is wrong once admin uses "Start Early").
                // Computed client-side from `now` since start_student_exam fires right as the
                // student clicks Start, and the RPC doesn't currently return a start timestamp.
                if (sessionDetails.value.durationMinutes) {
                    sessionDetails.value.personalEndTime = new Date(
                        Date.now() + sessionDetails.value.durationMinutes * 60 * 1000
                    ).toISOString()
                }

                // Calculate initial time remaining based on end time
                calculateTimeRemaining()

                // Initialize timer
                startTimer()

                // Setup initial active question start time block
                activeQuestionStartTime.value = Date.now()

                return { success: true }
            }
            throw new Error('No question order returned')
        } catch (err) {
            console.error('Failed to start exam:', err)
            return { success: false, error: err.message }
        }
    }

    /**
     * 3. Load Questions
     * Loads the actual shuffled questions, including previously saved answers
     */
    const loadQuestions = async () => {
        try {
            if (!studentSessionId.value) throw new Error('No active student session')

            const { data, error } = await supabase.rpc('get_student_exam_questions', {
                input_student_session_id: studentSessionId.value
            })

            if (error) throw error

            questions.value = data || []

            // Sync local state with loaded database data
            answers.value = {}
            timeSpent.value = {}

            // Build marked map keyed by question_id (reliable, no ambiguity with question_number)
            const freshMarked = {}
            questions.value.forEach(q => {
                if (q.selected_answer) {
                    answers.value[q.question_id] = q.selected_answer
                }
                if (q.is_marked_for_review) {
                    freshMarked[q.question_id] = true
                }
                if (q.time_spent_seconds) {
                    timeSpent.value[q.question_id] = q.time_spent_seconds
                }
            })
            markedForReview.value = freshMarked

            return { success: true }
        } catch (err) {
            console.error('Failed to load questions:', err)
            return { success: false, error: err.message }
        }
    }

    /**
     * 4. Save Answer
     * Called to push updates immediately to DB.
     */
    const saveAnswer = async (questionId, answerValue, isMarkedRef = false) => {
        try {
            if (!studentSessionId.value) return { success: false }

            // Update local state primarily
            const question = questions.value.find(q => q.question_id === questionId)
            if (!question) return { success: false }

            if (answerValue !== null && answerValue !== undefined) {
                answers.value[questionId] = answerValue
            } else {
                delete answers.value[questionId] // To Clear Response
            }

            // Key by question_id — always unique, no confusion with question_number or loop index
            if (isMarkedRef) {
                markedForReview.value[questionId] = true
            } else {
                delete markedForReview.value[questionId]
            }

            // Calculate active time spent dynamically before hitting API
            flushActiveTimeSpent(questionId)

            // Send to DB blindly (non-blocking in most cases, but we await for consistency)
            const { error } = await supabase.rpc('save_student_answer', {
                input_student_session_id: studentSessionId.value,
                input_question_id: questionId,
                input_question_number: question.question_number,
                input_selected_answer: answerValue === null ? null : answerValue.toString(),
                input_time_spent_seconds: Math.floor(timeSpent.value[questionId] || 0),
                input_is_marked_for_review: isMarkedRef
            })

            if (error) {
                console.error('Failed DB save:', error)
            }

            return { success: !error }
        } catch (err) {
            console.error('Failed to save answer:', err)
            return { success: false }
        }
    }

    /**
     * 5. Navigate to Question
     */
    const navigateToQuestion = async (number) => {
        if (number < 1 || number > totalQuestions.value) return

        const prevQ = currentQuestion.value
        if (prevQ) {
            await flushActiveTimeSpent(prevQ.question_id)

            // Background Sync time spent purely if it changed heavily
            supabase.rpc('save_student_answer', {
                input_student_session_id: studentSessionId.value,
                input_question_id: prevQ.question_id,
                input_question_number: prevQ.question_number,
                input_selected_answer: answers.value[prevQ.question_id] || null,
                input_time_spent_seconds: Math.floor(timeSpent.value[prevQ.question_id] || 0),
                input_is_marked_for_review: !!markedForReview.value[prevQ.question_id]
            }).then()
        }

        currentQuestionNumber.value = number
        activeQuestionStartTime.value = Date.now()
    }

    /**
     * 6. Submit Exam
     */
    const submitExam = async (isAutoSubmit = false) => {
        try {
            if (!studentSessionId.value || examStatus.value === 'submitted' || examStatus.value === 'auto_submitted') {
                return { success: false, error: 'Exam already submitted' }
            }

            // Flush last active time tracking
            if (currentQuestion.value) {
                await flushActiveTimeSpent(currentQuestion.value.question_id)
            }
            stopTimer()

            const { data, error } = await supabase.rpc('submit_student_exam', {
                input_student_session_id: studentSessionId.value
            })

            if (error) throw error

            examStatus.value = isAutoSubmit ? 'auto_submitted' : 'submitted'

            return { success: true, result: data ? data[0] : null }
        } catch (err) {
            console.error('Failed to submit exam:', err)
            return { success: false, error: err.message }
        }
    }


    // ------------------------------------------------------------------------
    // Setup & Utility
    // ------------------------------------------------------------------------

    const calculateTimeRemaining = () => {
        // BUG-04 fix: prefer the student's own personal end time (start + duration) over the
        // session's scheduled_end_time, since "Start Early" makes those two diverge.
        const endTimeSource = sessionDetails.value.personalEndTime || sessionDetails.value.scheduledEndTime
        if (!endTimeSource) return 0
        const end = new Date(endTimeSource).getTime()
        const now = Date.now()
        const diff = Math.max(0, Math.floor((end - now) / 1000))
        timeRemainingSeconds.value = diff
        return diff
    }

    const startTimer = () => {
        if (mainTimerInterval.value) clearInterval(mainTimerInterval.value)

        mainTimerInterval.value = setInterval(() => {
            if (timeRemainingSeconds.value > 0) {
                timeRemainingSeconds.value--
            } else {
                if (!isTimeUpAlertGiver.value) {
                    isTimeUpAlertGiver.value = true
                    handleTimeUp()
                }
            }
        }, 1000)
    }

    const stopTimer = () => {
        if (mainTimerInterval.value) {
            clearInterval(mainTimerInterval.value)
            mainTimerInterval.value = null
        }
    }

    const handleTimeUp = async () => {
        stopTimer()
        await submitExam(true)
        // You'd typically trigger a router push from the UI after listening to this,
        // or through a global event/store reactive change
    }

    const flushActiveTimeSpent = async (questionId) => {
        if (!activeQuestionStartTime.value || !questionId) return
        const now = Date.now()
        const elapsedSeconds = (now - activeQuestionStartTime.value) / 1000

        if (!timeSpent.value[questionId]) timeSpent.value[questionId] = 0
        timeSpent.value[questionId] += elapsedSeconds

        activeQuestionStartTime.value = Date.now() // Reset for next tracking cycle
    }

    const resetStore = () => {
        stopTimer()
        studentSessionId.value = null
        tempStudentId.value = null
        liveSessionId.value = null
        sessionDetails.value = {}
        questionOrder.value = []
        questions.value = []
        answers.value = {}
        markedForReview.value = {}
        timeSpent.value = {}
        currentQuestionNumber.value = 1
        timeRemainingSeconds.value = 0
        examStatus.value = 'not_started'
        isTimeUpAlertGiver.value = false
    }

    return {
        studentSessionId,
        tempStudentId,
        liveSessionId,
        sessionDetails,
        questionOrder,
        questions,
        answers,
        markedForReview,
        timeSpent,
        currentQuestionNumber,
        timeRemainingSeconds,
        examStatus,

        currentQuestion,
        totalQuestions,
        answeredCount,
        formattedTimeRemaining,

        loginToExam,
        startExam,
        loadQuestions,
        saveAnswer,
        navigateToQuestion,
        submitExam,
        resetStore,
        calculateTimeRemaining,
        startTimer,
        stopTimer
    }
})
