-- True random question sampling for exam compilation
-- Run this once in the Supabase SQL Editor.
--
-- Problem: every question-fetching query in examStore.js / topicExamEngine.js used a plain
-- `.limit(1000)` with no ORDER BY. Postgres/PostgREST return unordered queries in roughly
-- insertion order, not randomly. At 1000+ questions per subject, this means the "candidate
-- pool" the round-robin-across-topics logic works with can be systematically dominated by
-- whichever topics were uploaded first, silently starving later-uploaded topics of any
-- representation at all — regardless of how good the round-robin selection itself is.
--
-- Fix: this RPC does the randomization at the database level (`ORDER BY random()`), so the
-- candidate pool handed to the existing round-robin/topic-uniform selection logic is a true
-- random cross-section of ALL matching questions, not a truncated insertion-order slice.

CREATE OR REPLACE FUNCTION get_random_questions(
  p_subject_id INTEGER,
  p_question_type TEXT,
  p_category_ids INTEGER[] DEFAULT NULL,   -- NULL = no category filter (cross-category borrow tier)
  p_topic_ids INTEGER[] DEFAULT NULL,      -- NULL = no topic filter (full mock test)
  p_difficulty TEXT[] DEFAULT NULL,        -- NULL = no difficulty filter
  p_exclude_ids INTEGER[] DEFAULT NULL,    -- NULL/empty = no exclusion
  p_limit INTEGER DEFAULT 500
)
RETURNS TABLE (
  question_id INTEGER,
  topic_id INTEGER,
  image_url TEXT,
  question_type TEXT,
  question_content JSONB,
  external_reference TEXT,
  topic_name TEXT,
  choice1 JSONB,
  choice2 JSONB,
  choice3 JSONB,
  choice4 JSONB
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    q.question_id,
    q.topic_id,
    q.image_url,
    q.question_type,
    q.question_content,
    q.external_reference,
    t.topic_name,
    c.choice1,
    c.choice2,
    c.choice3,
    c.choice4
  FROM questions q
  LEFT JOIN topics t ON t.topic_id = q.topic_id
  LEFT JOIN choices c ON c.question_id = q.question_id
  WHERE q.subject_id = p_subject_id
    AND q.question_type = p_question_type
    AND (p_category_ids IS NULL OR q.category_id = ANY(p_category_ids))
    AND (p_topic_ids IS NULL OR q.topic_id = ANY(p_topic_ids))
    AND (p_difficulty IS NULL OR q.difficulty = ANY(p_difficulty))
    AND (p_exclude_ids IS NULL OR NOT (q.question_id = ANY(p_exclude_ids)))
  ORDER BY random()
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION get_random_questions(INTEGER, TEXT, INTEGER[], INTEGER[], TEXT[], INTEGER[], INTEGER) TO anon, authenticated;
