import { useExamStore } from './examStore'
import { useExamSessionStore } from './examSessionStore'
import { EXAM_CONFIGS } from '../data/examConfigs'

// Live sessions are currently always assembled as fixed Physics/Chemistry/Mathematics blocks
// of 25 questions each (20 MCQ + 5 numeric) — see ScheduleExam.vue's handleCreateSession().
// get_student_exam_questions does not return a subject_name per question yet, so until that
// RPC is updated we derive the subject from the question's position within that fixed layout.
// NOTE: this assumes start_student_exam only shuffles questions WITHIN each subject's block,
// not across the whole paper — if that's not true, this grouping will mislabel subjects.
function deriveSubjectFromNumber(questionNumber, totalQuestions, examType) {
  const subjects = (EXAM_CONFIGS[examType] ?? EXAM_CONFIGS.JEE_MAIN_FULL).subjects
  const blockSize = Math.ceil(totalQuestions / subjects.length) || 1
  const index = Math.min(Math.floor((questionNumber - 1) / blockSize), subjects.length - 1)
  return subjects[index] || 'General'
}

/**
 * Copies live exam session data into examStore so ExamLayout.vue (fullscreen, anti-cheat,
 * grace period, appeal, question palette, etc.) can run it instead of the bare-bones
 * LiveExamInterface.vue. Call this AFTER examSessionStore.loadQuestions() has populated questions.
 */
export function bridgeLiveSessionToExamStore(sessionCode, examType = 'JEE_MAIN_FULL') {
  const examStore = useExamStore()
  const liveStore = useExamSessionStore()

  if (!liveStore.questions || liveStore.questions.length === 0) {
    throw new Error('No questions loaded in examSessionStore. Call loadQuestions() first.')
  }

  const totalQuestions = liveStore.questions.length

  const mappedQuestions = liveStore.questions.map(q => ({
    id: q.question_id,
    text: q.question_content?.text || q.question_content?.stem || q.question_content || '',
    image_url: q.image_url || null,
    subject: q.subject_name || deriveSubjectFromNumber(q.question_number, totalQuestions, examType),
    topic: q.topic_name || '',
    question_type: q.question_type,
    options: q.question_type === 'multiple_choice' ? [
      { id: 'a', text: q.choice1?.text || q.choice1 || '' },
      { id: 'b', text: q.choice2?.text || q.choice2 || '' },
      { id: 'c', text: q.choice3?.text || q.choice3 || '' },
      { id: 'd', text: q.choice4?.text || q.choice4 || '' },
    ] : null
  }))

  examStore.questions = mappedQuestions
  examStore.userAnswers = { ...liveStore.answers }
  examStore.draftAnswers = {}
  examStore.timeSpent = { ...liveStore.timeSpent }
  examStore.numericDrafts = {}

  const statuses = {}
  mappedQuestions.forEach(q => {
    statuses[q.id] = {
      visited: false,
      answered: liveStore.answers[q.id] !== undefined,
      marked: !!liveStore.markedForReview[q.id]
    }
  })
  examStore.questionStatuses = statuses

  examStore.currentQuestionIndex = 0
  if (mappedQuestions.length > 0) {
    examStore.questionStatuses[mappedQuestions[0].id].visited = true
  }

  // Timer: use the personal (per-student) end time computed in examSessionStore.startExam(),
  // not the session-wide scheduled_end_time (BUG-04 — the two diverge once admin uses "Start Early").
  examStore.remainingTime = liveStore.timeRemainingSeconds

  examStore.sessionId = null // live mode never touches exam_sessions/results
  examStore.isSubmitted = false
  examStore.isLiveMode = true
  examStore.liveSessionCode = sessionCode
  // NEW-06: was hardcoded. Still defaults to JEE_MAIN_FULL because there's currently no
  // per-session exam-type value stored anywhere upstream (see BUG-09) — callers can pass
  // a real value once ScheduleExam.vue/live_exam_sessions actually track one.
  examStore.examType = examType

  console.log(`✅ Live exam bridged: ${mappedQuestions.length} questions, ${examStore.remainingTime}s remaining`)
}
