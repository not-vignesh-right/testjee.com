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
To prevent "cluster repetition" (where a student sees the same set of questions in the same order), we implemented **Oversampled Sampling**:
1.  **Fetch Pool**: Instead of fetching exactly 20 questions, the query fetches a limit of **60** unique questions per subject.
2.  **In-Memory Shuffle**: We use a `shuffleArray` helper implementing the **Fisher-Yates Shuffle Algorithm**:
    ```javascript
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }
    ```
3.  **Slice**: The first 20 items from the shuffled 60-item pool are selected. This results in $3 \times 10^{24}$ possible variations for a 60-item set, making duplicate exams statistically impossible.

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

---
*Technical Documentation - Feb 24, 2026*
