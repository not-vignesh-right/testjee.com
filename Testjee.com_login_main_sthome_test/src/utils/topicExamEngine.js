/**
 * Shared question-selection engine for EXAM_CONFIGS-driven papers.
 *
 * This is the single implementation of:
 *   - subject-name → subject_id resolution (via subjectNameSynonyms)
 *   - topic fetching for the topic-wise picker UI
 *   - uniform-across-topics, image-deduplicated question selection
 *   - cross-category "borrowing" (e.g. KCET pulling from the JEE/NEET pools)
 *
 * Previously this logic was duplicated (with the admin copy missing the
 * cross-category borrow fallback and any shortfall reporting) between
 * examStore.js (student practice exams) and ScheduleExam.vue (admin live
 * exam scheduling). Both now import from here.
 */

/** Fisher-Yates shuffle — uniform, unlike `.sort(() => 0.5 - Math.random())`. */
export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Group candidates by topic_id and round-robin pick into `targetArray` until
 * `limit` is reached, skipping questions whose image_url was already used
 * anywhere else in this exam paper (tracked via `usedImageUrls`, shared
 * across every subject/tier of one compilation). Falls back to allowing
 * image duplicates only if a topic group has nothing else left.
 */
export function selectUniformlyFromTopics(candidates, targetArray, limit, usedImageUrls) {
  if (!candidates || candidates.length === 0) return

  const topicGroups = {}
  candidates.forEach(q => {
    const topicId = q.topic_id !== null && q.topic_id !== undefined ? String(q.topic_id) : 'no_topic'
    if (!topicGroups[topicId]) topicGroups[topicId] = []
    topicGroups[topicId].push(q)
  })

  Object.keys(topicGroups).forEach(topicId => {
    topicGroups[topicId] = shuffleArray(topicGroups[topicId])
  })

  const imageDuplicateBackups = []

  while (targetArray.length < limit) {
    let activeTopicIds = Object.keys(topicGroups).filter(topicId => topicGroups[topicId].length > 0)
    if (activeTopicIds.length === 0) break

    activeTopicIds = shuffleArray(activeTopicIds)

    for (const topicId of activeTopicIds) {
      if (targetArray.length >= limit) break

      let foundIdx = -1
      for (let idx = 0; idx < topicGroups[topicId].length; idx++) {
        const q = topicGroups[topicId][idx]
        const imgUrl = q.image_url
        if (imgUrl && imgUrl.trim() !== '' && usedImageUrls.has(imgUrl.trim())) {
          continue
        }
        foundIdx = idx
        break
      }

      if (foundIdx !== -1) {
        const q = topicGroups[topicId].splice(foundIdx, 1)[0]
        const imgUrl = q.image_url
        if (imgUrl && imgUrl.trim() !== '') usedImageUrls.add(imgUrl.trim())
        targetArray.push(q)
      } else {
        const backupQ = topicGroups[topicId].shift()
        if (backupQ) imageDuplicateBackups.push(backupQ)
      }
    }
  }

  if (targetArray.length < limit && imageDuplicateBackups.length > 0) {
    const shuffledBackups = shuffleArray(imageDuplicateBackups)
    while (targetArray.length < limit && shuffledBackups.length > 0) {
      targetArray.push(shuffledBackups.shift())
    }
  }
}

export function applyCategoryFilter(query, categoryId) {
  if (Array.isArray(categoryId)) return query.in('category_id', categoryId)
  return query.eq('category_id', categoryId)
}

/**
 * Resolves every canonical subject name in `subjectNameSynonyms` to its DB subject_id(s)
 * in one query, and returns a `lookupIdsFor(canonicalName)` helper.
 */
export async function fetchSubjectIdLookup(supabase, subjectNameSynonyms) {
  const allSynonymNames = Array.from(new Set(Object.values(subjectNameSynonyms).flat()))
  const { data, error } = await supabase
    .from('subjects')
    .select('subject_id, subject_name')
    .in('subject_name', allSynonymNames)

  if (error) throw error

  const subjectsData = data || []
  return {
    subjectsData,
    lookupIdsFor(canonicalName) {
      const candidates = subjectNameSynonyms[canonicalName] || [canonicalName]
      return subjectsData.filter(s => candidates.includes(s.subject_name)).map(s => s.subject_id)
    }
  }
}

/**
 * Fetches topics (grouped by canonical subject name, sorted by class then name) for
 * every subject in an exam config — used to populate the topic-wise picker UI.
 * Returns `{ [SubjectName]: [{ topic_id, topic_name, class }, ...] }`.
 */
export async function fetchTopicsForSubjects(supabase, cfg) {
  const { lookupIdsFor } = await fetchSubjectIdLookup(supabase, cfg.subjectNameSynonyms)
  const result = {}

  for (const subjectName of cfg.subjects) {
    const subjectIds = lookupIdsFor(subjectName)
    if (subjectIds.length === 0) continue

    const allTopicRows = []
    for (const subjectId of subjectIds) {
      const { data: topicRows } = await supabase
        .from('topics')
        .select('topic_id, topic_name, class')
        .eq('subject_id', subjectId)
      if (topicRows) allTopicRows.push(...topicRows)
    }

    allTopicRows.sort((a, b) => {
      if (a.class !== b.class) return (a.class || 0) - (b.class || 0)
      return (a.topic_name || '').localeCompare(b.topic_name || '')
    })

    result[subjectName] = allTopicRows
  }

  return result
}

/**
 * Fetches + picks questions for one subject_id + question_type, with a two-tier fallback:
 *   Tier 1: within the exam's own category (e.g. JEE pool for KCET Math, easy/medium only)
 *   Tier 2: "borrow" from ALL categories (drops the category filter) if Tier 1 falls short —
 *           this is the cross-category borrowing (KCET <-> JEE/NEET, JEE <-> NEET Physics/Chem).
 * Topic and difficulty filters (if any) are respected in both tiers.
 * Returns the picked question rows (question_id, topic_id, image_url).
 */
export async function compileSubjectQuestions(supabase, { categoryId, subjectId, questionType, difficultyFilter, topicIds, target, usedImageUrls }) {
  if (target <= 0) return []

  const picked = []
  const pickedIds = new Set()

  async function runTier(useCategory) {
    let q = supabase
      .from('questions')
      .select('question_id, topic_id, image_url')
      .eq('subject_id', subjectId)
      .eq('question_type', questionType)
    if (useCategory) q = applyCategoryFilter(q, categoryId)
    if (difficultyFilter?.length) q = q.in('difficulty', difficultyFilter)
    if (topicIds?.length) q = q.in('topic_id', topicIds)
    const { data } = await q.limit(1000)
    return (data || []).filter(row => !pickedIds.has(row.question_id))
  }

  let candidates = await runTier(true)
  selectUniformlyFromTopics(candidates, picked, target, usedImageUrls)
  picked.forEach(p => pickedIds.add(p.question_id))

  if (picked.length < target) {
    candidates = await runTier(false)
    selectUniformlyFromTopics(candidates, picked, target, usedImageUrls)
  }

  return picked
}

/**
 * Compiles a full exam paper (all subjects) for a given EXAM_CONFIGS entry.
 *
 * `topicFilterMap`: pass `{ [SubjectName]: [topicId, ...] }` for a topic-wise paper, or
 * `null`/omit for a full mock test (no topic restriction).
 *
 * Returns `{ questionIds: number[], shortfalls: string[] }` — `shortfalls` is populated
 * (human-readable, one entry per subject that came up short) whenever the pool couldn't
 * fill the required count even after cross-category borrowing, so the caller can block
 * and show a clear error instead of silently shipping a thinner paper.
 */
export async function compileExamQuestions(supabase, cfg, topicFilterMap = null) {
  const { lookupIdsFor } = await fetchSubjectIdLookup(supabase, cfg.subjectNameSynonyms)
  const mcqTarget = cfg.questionsPerSubject.mcq
  const numTarget = cfg.hasNumeric ? cfg.questionsPerSubject.numeric : 0
  const usedImageUrls = new Set()
  const questionIds = []
  const shortfalls = []

  for (const subjectName of cfg.subjects) {
    const subjectIds = lookupIdsFor(subjectName)
    if (subjectIds.length === 0) {
      shortfalls.push(`${subjectName}: subject not found in database.`)
      continue
    }

    let topicIds = null
    if (topicFilterMap) {
      topicIds = topicFilterMap[subjectName] || []
      if (topicIds.length === 0) {
        shortfalls.push(`${subjectName}: no topics selected.`)
        continue
      }
    }

    const subCount = subjectIds.length
    for (let i = 0; i < subCount; i++) {
      const subId = subjectIds[i]
      const subMcqTarget = Math.floor(mcqTarget / subCount) + (i < (mcqTarget % subCount) ? 1 : 0)
      const subNumTarget = Math.floor(numTarget / subCount) + (i < (numTarget % subCount) ? 1 : 0)

      if (subMcqTarget > 0) {
        const picked = await compileSubjectQuestions(supabase, {
          categoryId: cfg.categoryId, subjectId: subId, questionType: 'multiple_choice',
          difficultyFilter: cfg.difficultyFilter, topicIds, target: subMcqTarget, usedImageUrls
        })
        questionIds.push(...picked.map(q => q.question_id))
        if (picked.length < subMcqTarget) {
          shortfalls.push(`${subjectName}: only ${picked.length}/${subMcqTarget} MCQs available${topicFilterMap ? ' for selected topics' : ''}.`)
        }
      }

      if (subNumTarget > 0) {
        const picked = await compileSubjectQuestions(supabase, {
          categoryId: cfg.categoryId, subjectId: subId, questionType: 'numeric',
          difficultyFilter: cfg.difficultyFilter, topicIds, target: subNumTarget, usedImageUrls
        })
        questionIds.push(...picked.map(q => q.question_id))
        if (picked.length < subNumTarget) {
          shortfalls.push(`${subjectName}: only ${picked.length}/${subNumTarget} numeric questions available${topicFilterMap ? ' for selected topics' : ''}.`)
        }
      }
    }
  }

  return { questionIds, shortfalls }
}
