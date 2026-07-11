# Technical Deep Dive: Mock Exam Question Logic

> [!NOTE]
> For the complete global application architecture, database schemas, reload recovery workflows, and proctoring security structures, refer to the central:
> * [codebase_context.md](file:///c:/Users/admin/Desktop/testjee/codebase_context.md)

This document specifies the technical implementation of the unique question fetching system, randomization strategy, and state management used in the TestJEE Mock Exam feature.

## 1. Question Deduplication Logic

### Goal
Ensure that a student does not see the same question twice in sequential Mock Exam attempts until the entire question bank is exhausted.

### Implementation Vector
- **File**: `src/stores/examStore.js`
- **Action**: `fetchExamData`

### Workflow
1.  **Extraction of Seen IDs**:
    -   The system queries the `results` table for all records matching the `student_id`.
    -   It flattens the `answers` JSONB column (which contains `question_id` for every attempted question).
    -   IDs are deduplicated in-memory using `[...new Set(excludedQuestionIds)]`.
2.  **Database-Level Filtering**:
    -   The Supabase (PostgREST) `.not('question_id', 'in', 'list')` operator is used.
    -   **Technical Constraint**: PostgREST requires the list to be stringified and wrapped in parentheses: `not.in.(1417,1423,...)`. Common errors include passing a raw array or a comma-separated string without parentheses.
3.  **Two-Stage Fallback**:
    -   **Stage 1 (Pure Unique)**: Attempts to fetch 20 MCQs and 5 Numericals per subject that have *never* been seen by the student.
    -   **Stage 2 (Current Session Unique)**: If Stage 1 returns fewer than the required count, the system performs a second query. This query only excludes IDs already picked for the *current* session, allowing previously seen questions to fill the gaps. This ensures a 75-question set is always delivered.

## 2. Advanced Randomization sampling

### Pool-Based Sampling
To prevent "cluster repetition" (where a student sees the same set of questions in the same order), we implement **Oversampled Sampling**:
1.  **Fetch Pool**: Instead of fetching exactly 20 questions, the candidate query fetches a much larger pool per subject (see the "True Random Candidate Fetch" note below — this pool is now fetched via a randomized RPC, not a plain `.limit(n)`).
2.  **In-Memory Shuffle**: We use a `shuffleArray` helper implementing the **Fisher-Yates Shuffle Algorithm** (now in `src/utils/topicExamEngine.js`, shared with the admin scheduler — see Section 5):
    ```javascript
    export function shuffleArray(arr) {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    ```
3.  **Round-robin-by-topic selection** (`selectUniformlyFromTopics`): rather than a flat slice of the shuffled pool, candidates are grouped by `topic_id` first, each group shuffled internally, then picked round-robin one-per-topic-per-pass until the target count is reached — this is what actually guarantees topic *variety*, not just randomness. A flat shuffle-and-slice alone would still let a topic with disproportionately more rows in the pool dominate the selection.

### ⚠️ True Random Candidate Fetch (July 2026 fix)
The pool-based sampling above only works if the **candidate pool itself** is a representative, unbiased sample of the question bank. It wasn't: every candidate query used a plain `.limit(n)` with **no `ORDER BY`**. Postgres/PostgREST return unordered queries in roughly insertion order, not randomly — at question-bank sizes above the fetch limit (this platform runs 10,000+ questions, 3,000+ per subject), a plain `.limit(1000)` could be systematically dominated by whichever topics were uploaded first, silently starving later-uploaded topics of any representation in the candidate pool at all — no amount of round-robin logic downstream can select from a topic that was never fetched.

**Fix**: `get_random_questions` (see `random-question-selection-rpc.sql`), a `SECURITY DEFINER` RPC that does the randomization at the database level (`ORDER BY random() LIMIT n`), called via `fetchRandomQuestionBatch()` in `src/utils/topicExamEngine.js`. Both `examStore.js` (student practice, all 8 fallback-tier fetches) and the admin scheduler's `compileSubjectQuestions` now fetch candidates this way instead of a raw `.from('questions').select(...).limit(n)`.

## 3. Session & State Management

### Persistence Fixes
A critical bug was identified where students were redirected to the Dashboard immediately after starting an exam. This was caused by the `isSubmitted` state in `Pinia` persisting as `true` from a previous session.

- **Solution**: Implemented `resetExamState()`.
- **Logic**: Clears `questions`, `userAnswers`, `questionStatuses`, `sessionId`, and crucially resets `isSubmitted = false`.
- **Trigger**: Called in `Dashboard.vue` immediately upon clicking the "Start Exam" button, before navigation.

### Router Guard Integration
The `src/router/index.js` guard was updated to selectively block access to the `/exam` route based on the updated `examStore.isSubmitted` flag, which is now correctly synchronized with the session lifecycle.

## 4. Supabase Query Performance
- **Indexed Filtering**: `question_id` is a primary key, making the `not in` filter extremely fast even with hundreds of excluded IDs.
- **Batch Selection**: Subject IDs are resolved via a `subjectNameSynonyms` mapping to handle data inconsistencies (e.g., 'Math' vs 'Mathematics') before querying.

## 5. Shared Question-Selection Engine (`src/utils/topicExamEngine.js`)

Added when topic-wise selection was ported into the admin live-exam scheduler
(`ScheduleExam.vue`), which previously reimplemented this logic separately and
worse (single query per subject, no fallback). Both `examStore.js` (student
practice exams) and `ScheduleExam.vue` (admin live exams) now import from this
one module. Exports:

- **`shuffleArray`** / **`selectUniformlyFromTopics`** — the Fisher-Yates +
  round-robin-across-topics + image-dedup algorithm described in Section 2,
  extracted verbatim so both call sites stay byte-identical instead of drifting.
- **`fetchRandomQuestionBatch(supabase, opts)`** — calls the `get_random_questions`
  RPC (Section 2's "True Random Candidate Fetch") instead of a plain `.limit(n)`
  query, and reshapes the flat RPC row into the nested `{ topics: { topic_name },
  choices: { choice1..4 } }` shape the rest of the pipeline expects.
- **`fetchSubjectIdLookup(supabase, subjectNameSynonyms)`** — resolves every
  synonym name in one query, returns a `lookupIdsFor(canonicalName)` helper.
- **`fetchTopicsForSubjects(supabase, examConfig)`** — returns
  `{ [SubjectName]: [{ topic_id, topic_name, class }] }`, sorted by class then
  name, for populating the topic-wise picker UI (used by both `Dashboard.vue`'s
  topic modal logic and `ScheduleExam.vue`'s inline topic picker).
- **`compileSubjectQuestions(supabase, opts)`** — fetches + picks questions for
  one `subject_id` + `question_type`, with a **two-tier fallback**:
  1. **Tier 1**: within the exam's own `categoryId` (respecting `topicIds`/`difficultyFilter`).
  2. **Tier 2 — cross-category borrowing**: if Tier 1 falls short, re-queries with
     the category filter dropped entirely (still respecting topic/difficulty
     filters). This is how KCET papers exist at all despite there being no KCET
     `category_id` row in the DB — KCET configs just point `categoryId` at
     JEE's (1) and/or NEET's (2) pools, and Tier 2 additionally allows pulling
     from *any* category if that specific pool is thin. Also how JEE/NEET
     borrow each other's Physics/Chemistry questions when a topic is thin on
     one side but not the other.
- **`compileExamQuestions(supabase, examConfig, topicFilterMap)`** — the
  top-level entry point. Loops every subject in the config, splits the
  per-subject target evenly across every resolved `subject_id` (e.g. KCET
  Biology's 60 questions split ~30/30 across Botany + Zoology), and returns
  `{ questionIds, shortfalls }`. `topicFilterMap` is `null` for a full mock
  test, or `{ [SubjectName]: [topicId, ...] }` for topic-wise. `shortfalls` is
  a human-readable array populated per subject that still couldn't be filled
  even after borrowing — callers (`ScheduleExam.vue`) block and surface this
  instead of silently shipping a shorter paper, matching the validation
  strictness `Dashboard.vue`'s topic-wise flow already enforced for students.

**Not yet unified:** `examStore.js`'s own per-student fallback ladder (exclude
correctly-answered → cross-category borrow → allow repeats → cross-category +
repeats, keyed off a given student's history) is more elaborate than
`compileExamQuestions`'s two-tier version, since admin-scheduled live exams
have no single "student" to scope exclusions to. `examStore.js` still owns
that extra logic itself, calling only the shared low-level helpers
(`selectUniformlyFromTopics`/`shuffleArray`) rather than `compileExamQuestions`.

---
*Technical Documentation - Feb 24, 2026, updated Jul 10, 2026 (Section 5: shared topicExamEngine.js)*
