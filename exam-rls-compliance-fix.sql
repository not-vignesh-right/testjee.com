-- ====================================================================
-- SQL Migration: Enable Row Level Security (RLS) & Standard Read Policies
-- Target: Resolve database linter errors for public tables lacking RLS
-- ====================================================================

-- 1. Enable Row Level Security (RLS) on all target tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing read policies to prevent naming collisions
DROP POLICY IF EXISTS "Allow select access to subjects" ON public.subjects;
DROP POLICY IF EXISTS "Allow select access to questions" ON public.questions;
DROP POLICY IF EXISTS "Allow select access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow select access to topics" ON public.topics;
DROP POLICY IF EXISTS "Allow select access to choices" ON public.choices;
DROP POLICY IF EXISTS "Allow select access to uploaded_papers" ON public.uploaded_papers;

-- 3. Create SELECT policies for metadata tables (accessible to all authenticated and anonymous clients)
CREATE POLICY "Allow select access to subjects" ON public.subjects
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow select access to categories" ON public.categories
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow select access to topics" ON public.topics
  FOR SELECT TO authenticated, anon USING (true);

-- 4. Create SELECT policies for exam data tables (restricted to authenticated students only)
CREATE POLICY "Allow select access to questions" ON public.questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow select access to choices" ON public.choices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow select access to uploaded_papers" ON public.uploaded_papers
  FOR SELECT TO authenticated USING (true);

-- NOTE: 
-- • Write operations (INSERT, UPDATE, DELETE) on these tables are performed by administrative APIs 
--   or backend sync scripts using the Supabase Service Role Key, which bypasses RLS automatically.
-- • The 'push_subscriptions' table is only read and updated by the admin push backend via the 
--   Service Role Key, so it does not require any standard user RLS policies.
