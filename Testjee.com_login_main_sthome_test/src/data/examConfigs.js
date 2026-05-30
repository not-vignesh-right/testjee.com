/**
 * EXAM CONFIGURATIONS
 * Central source of truth for all exam types supported by TestJEE.
 * 
 * Database mapping:
 *   category_id = 1 → JEE questions
 *   category_id = 2 → NEET questions
 * 
 * Subject IDs in DB:
 *   1 = Physics, 2 = Chemistry, 3 = Mathematics, 4 = Botany, 5 = Zoology
 */

export const EXAM_CONFIGS = {
  JEE_MAIN_FULL: {
    title: 'JEE Main - Full Mock Test',
    shortLabel: 'JEE Main',
    categoryId: 1,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    subjectNameSynonyms: {
      Physics: ['Physics'],
      Chemistry: ['Chemistry'],
      Mathematics: ['Mathematics', 'Maths', 'Math'],
    },
    // Per subject: how many MCQs and numerics to pick
    questionsPerSubject: {
      mcq: 20,
      numeric: 5,
    },
    totalQuestions: 75,         // 3 subjects × (20 MCQ + 5 numeric)
    durationSeconds: 180 * 60, // 3 hours
    marking: {
      correct: 4,
      incorrect: -1,
      unattempted: 0,
    },
    maxScore: 300,
    hasNumeric: true,
    numericLimitPerSubject: 5,
    difficultyFilter: null,     // No difficulty filter — fetch all
  },

  NEET_UG_FULL: {
    title: 'NEET UG - Full Mock Test',
    shortLabel: 'NEET UG',
    categoryId: 2,
    subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    subjectNameSynonyms: {
      Physics: ['Physics'],
      Chemistry: ['Chemistry'],
      Botany: ['Botany', 'Biology', 'Botany (Biology)'],
      Zoology: ['Zoology', 'Zoology (Biology)'],
    },
    // NEET pattern: 35 MCQ Section A (compulsory) + 15 Section B (attempt any 10) per subject
    // Simplified for platform: 45 questions per subject (all MCQ, no numeric)
    questionsPerSubject: {
      mcq: 45,
      numeric: 0,
    },
    totalQuestions: 180,        // 4 subjects × 45 MCQ
    durationSeconds: 200 * 60, // 3 hours 20 minutes
    marking: {
      correct: 4,
      incorrect: -1,
      unattempted: 0,
    },
    maxScore: 720,
    hasNumeric: false,
    numericLimitPerSubject: 0,
    difficultyFilter: null,
  },

  // KCET is a single-subject exam. The examType stored will be one of:
  // KCET_PHYSICS, KCET_CHEMISTRY, KCET_MATHEMATICS
  KCET_PHYSICS: {
    title: 'KCET - Physics',
    shortLabel: 'KCET Physics',
    // KCET physics — use questions from both JEE (cat 1) AND NEET (cat 2) Physics
    categoryId: [1, 2],
    subjects: ['Physics'],
    subjectNameSynonyms: {
      Physics: ['Physics'],
    },
    questionsPerSubject: {
      mcq: 60,
      numeric: 0,
    },
    totalQuestions: 60,
    durationSeconds: 80 * 60,  // 80 minutes
    marking: {
      correct: 1,
      incorrect: 0,           // NO negative marking for KCET!
      unattempted: 0,
    },
    maxScore: 60,
    hasNumeric: false,
    numericLimitPerSubject: 0,
    difficultyFilter: null,
  },

  KCET_CHEMISTRY: {
    title: 'KCET - Chemistry',
    shortLabel: 'KCET Chemistry',
    categoryId: [1, 2],
    subjects: ['Chemistry'],
    subjectNameSynonyms: {
      Chemistry: ['Chemistry'],
    },
    questionsPerSubject: {
      mcq: 60,
      numeric: 0,
    },
    totalQuestions: 60,
    durationSeconds: 80 * 60,
    marking: {
      correct: 1,
      incorrect: 0,
      unattempted: 0,
    },
    maxScore: 60,
    hasNumeric: false,
    numericLimitPerSubject: 0,
    difficultyFilter: null,
  },

  KCET_MATHEMATICS: {
    title: 'KCET - Mathematics',
    shortLabel: 'KCET Mathematics',
    // KCET Maths: fetch easy+medium difficulty from JEE (cat 1) questions
    categoryId: 1,
    subjects: ['Mathematics'],
    subjectNameSynonyms: {
      Mathematics: ['Mathematics', 'Maths', 'Math'],
    },
    questionsPerSubject: {
      mcq: 60,
      numeric: 0,
    },
    totalQuestions: 60,
    durationSeconds: 80 * 60,
    marking: {
      correct: 1,
      incorrect: 0,
      unattempted: 0,
    },
    maxScore: 60,
    hasNumeric: false,
    numericLimitPerSubject: 0,
    difficultyFilter: ['easy', 'medium'], // Only easy/medium for KCET Math from JEE pool
  },

  KCET_BIOLOGY: {
    title: 'KCET - Biology',
    shortLabel: 'KCET Biology',
    // KCET Biology: fetch from NEET (cat 2) questions (Botany and Zoology)
    categoryId: 2,
    subjects: ['Biology'],
    subjectNameSynonyms: {
      Biology: ['Botany', 'Zoology', 'Biology', 'Botany (Biology)', 'Zoology (Biology)'],
    },
    questionsPerSubject: {
      mcq: 60,
      numeric: 0,
    },
    totalQuestions: 60,
    durationSeconds: 80 * 60,
    marking: {
      correct: 1,
      incorrect: 0,
      unattempted: 0,
    },
    maxScore: 60,
    hasNumeric: false,
    numericLimitPerSubject: 0,
    difficultyFilter: null,
  },
}

/**
 * Get config for a given exam type string.
 * Falls back to JEE_MAIN_FULL if unknown type supplied.
 */
export function getExamConfig(examType) {
  return EXAM_CONFIGS[examType] ?? EXAM_CONFIGS.JEE_MAIN_FULL
}

/** Returns true for any KCET exam type */
export function isKcetExam(examType) {
  return examType?.startsWith('KCET_')
}

/** Returns true for NEET exam type */
export function isNeetExam(examType) {
  return examType?.startsWith('NEET_')
}
