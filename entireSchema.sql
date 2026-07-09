-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  category_id integer NOT NULL DEFAULT nextval('categories_category_id_seq'::regclass),
  category_name text NOT NULL UNIQUE,
  CONSTRAINT categories_pkey PRIMARY KEY (category_id)
);
CREATE TABLE public.subjects (
  subject_id integer NOT NULL DEFAULT nextval('subjects_subject_id_seq'::regclass),
  subject_name text NOT NULL UNIQUE,
  CONSTRAINT subjects_pkey PRIMARY KEY (subject_id)
);
CREATE TABLE public.topics (
  topic_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  subject_id integer NOT NULL,
  topic_name text NOT NULL,
  class text NOT NULL DEFAULT '11'::text CHECK (class = ANY (ARRAY['11'::text, '12'::text])),
  CONSTRAINT topics_pkey PRIMARY KEY (topic_id),
  CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id)
);
CREATE TABLE public.questions (
  question_id integer NOT NULL DEFAULT nextval('questions_question_id_seq'::regclass),
  category_id integer,
  subject_id integer,
  topic_id integer,
  difficulty text CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text, 'advance'::text])),
  time_required integer,
  question_type text CHECK (question_type = ANY (ARRAY['multiple_choice'::text, 'numeric'::text])),
  question_content jsonb,
  solution text,
  external_reference text,
  creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  modification_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by text,
  modified_by text,
  image_url text,
  pyq text,
  CONSTRAINT questions_pkey PRIMARY KEY (question_id),
  CONSTRAINT questions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id),
  CONSTRAINT questions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id),
  CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(topic_id)
);
CREATE TABLE public.results (
  result_id integer GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  student_id integer,
  creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  answers jsonb,
  score smallint,
  session_id integer,
  CONSTRAINT results_pkey PRIMARY KEY (result_id),
  CONSTRAINT results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.exam_sessions(session_id)
);
CREATE TABLE public.choices (
  question_id integer NOT NULL,
  multi_choice boolean NOT NULL DEFAULT true,
  choice1 jsonb,
  choice2 jsonb,
  choice3 jsonb,
  choice4 jsonb,
  correct_answer text NOT NULL DEFAULT 'a'::text,
  CONSTRAINT choices_pkey PRIMARY KEY (question_id),
  CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id)
);
CREATE TABLE public.students (
  student_id integer NOT NULL DEFAULT nextval('students_student_id_seq'::regclass),
  supabase_user_id uuid UNIQUE,
  student_name text NOT NULL,
  email_id text NOT NULL UNIQUE,
  mobile_number text,
  class text,
  parent_name text,
  parent_number text,
  parent_email_id text,
  creation_date timestamp without time zone DEFAULT now(),
  modification_date timestamp without time zone DEFAULT now(),
  created_by text,
  modified_by text,
  number_of_tests integer DEFAULT 1,
  is_approved boolean DEFAULT false,
  is_genuine_user boolean NOT NULL DEFAULT true,
  CONSTRAINT students_pkey PRIMARY KEY (student_id)
);
CREATE TABLE public.exam_sessions (
  session_id integer NOT NULL DEFAULT nextval('exam_sessions_session_id_seq'::regclass),
  student_id integer,
  exam_type text NOT NULL DEFAULT 'JEE_MAIN_FULL'::text,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  total_duration_seconds integer NOT NULL DEFAULT 10800,
  is_submitted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  temp_student_id integer,
  admin_test_id integer,
  is_temp_student boolean DEFAULT false,
  auto_submitted boolean DEFAULT false,
  CONSTRAINT exam_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT exam_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT exam_sessions_temp_student_id_fkey FOREIGN KEY (temp_student_id) REFERENCES public.temp_students(temp_student_id),
  CONSTRAINT exam_sessions_admin_test_id_fkey FOREIGN KEY (admin_test_id) REFERENCES public.admin_tests(admin_test_id)
);
CREATE TABLE public.admins (
  admin_id integer NOT NULL DEFAULT nextval('admins_admin_id_seq'::regclass),
  institute_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  max_tests integer NOT NULL DEFAULT 100,
  max_students integer NOT NULL DEFAULT 100,
  tests_created integer DEFAULT 0,
  students_created integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_date timestamp without time zone DEFAULT now(),
  modification_date timestamp without time zone DEFAULT now(),
  session_token text,
  session_expires timestamp with time zone,
  CONSTRAINT admins_pkey PRIMARY KEY (admin_id)
);
CREATE TABLE public.admin_tests (
  admin_test_id integer NOT NULL DEFAULT nextval('admin_tests_admin_test_id_seq'::regclass),
  admin_id integer NOT NULL,
  test_name text NOT NULL,
  test_code text NOT NULL UNIQUE,
  duration_minutes integer NOT NULL DEFAULT 180,
  question_ids ARRAY,
  instructions text,
  total_marks integer,
  created_date timestamp without time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT admin_tests_pkey PRIMARY KEY (admin_test_id),
  CONSTRAINT admin_tests_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(admin_id)
);
CREATE TABLE public.temp_students (
  temp_student_id integer NOT NULL DEFAULT nextval('temp_students_temp_student_id_seq'::regclass),
  admin_id integer NOT NULL,
  admin_test_id integer NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  student_name text,
  roll_number text,
  has_appeared boolean DEFAULT false,
  created_date timestamp without time zone DEFAULT now(),
  CONSTRAINT temp_students_pkey PRIMARY KEY (temp_student_id),
  CONSTRAINT temp_students_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(admin_id),
  CONSTRAINT temp_students_admin_test_id_fkey FOREIGN KEY (admin_test_id) REFERENCES public.admin_tests(admin_test_id)
);
CREATE TABLE public.live_exam_sessions (
  live_session_id integer NOT NULL DEFAULT nextval('live_exam_sessions_live_session_id_seq'::regclass),
  admin_test_id integer NOT NULL,
  admin_id integer NOT NULL,
  session_name text NOT NULL,
  session_code text NOT NULL UNIQUE,
  scheduled_start_time timestamp with time zone NOT NULL,
  scheduled_end_time timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL,
  status text NOT NULL DEFAULT 'scheduled'::text CHECK (status = ANY (ARRAY['scheduled'::text, 'live'::text, 'completed'::text, 'cancelled'::text])),
  total_students_enrolled integer DEFAULT 0,
  instructions text,
  created_date timestamp with time zone DEFAULT now(),
  exam_type text NOT NULL DEFAULT 'JEE_MAIN_FULL'::text,
  batch_label text,
  CONSTRAINT live_exam_sessions_pkey PRIMARY KEY (live_session_id),
  CONSTRAINT live_exam_sessions_admin_test_id_fkey FOREIGN KEY (admin_test_id) REFERENCES public.admin_tests(admin_test_id),
  CONSTRAINT live_exam_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(admin_id)
);
CREATE TABLE public.student_exam_sessions (
  student_session_id integer NOT NULL DEFAULT nextval('student_exam_sessions_student_session_id_seq'::regclass),
  live_session_id integer NOT NULL,
  temp_student_id integer NOT NULL,
  question_order ARRAY,
  start_time timestamp with time zone,
  submit_time timestamp with time zone,
  time_taken_seconds integer,
  status text NOT NULL DEFAULT 'not_started'::text CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'submitted'::text, 'auto_submitted'::text])),
  score numeric,
  max_score integer,
  percentage numeric,
  rank integer,
  created_date timestamp with time zone DEFAULT now(),
  end_time timestamp with time zone,
  CONSTRAINT student_exam_sessions_pkey PRIMARY KEY (student_session_id),
  CONSTRAINT student_exam_sessions_live_session_id_fkey FOREIGN KEY (live_session_id) REFERENCES public.live_exam_sessions(live_session_id),
  CONSTRAINT student_exam_sessions_temp_student_id_fkey FOREIGN KEY (temp_student_id) REFERENCES public.temp_students(temp_student_id)
);
CREATE TABLE public.student_answers (
  answer_id integer NOT NULL DEFAULT nextval('student_answers_answer_id_seq'::regclass),
  student_session_id integer NOT NULL,
  question_id integer NOT NULL,
  question_number integer NOT NULL,
  selected_answer text,
  is_correct boolean,
  marks_obtained numeric DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  is_marked_for_review boolean DEFAULT false,
  answered_at timestamp with time zone,
  CONSTRAINT student_answers_pkey PRIMARY KEY (answer_id),
  CONSTRAINT student_answers_student_session_id_fkey FOREIGN KEY (student_session_id) REFERENCES public.student_exam_sessions(student_session_id),
  CONSTRAINT student_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id)
);
CREATE TABLE public.uploaded_papers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  paper_prefix character varying NOT NULL,
  target_env USER-DEFINED NOT NULL,
  category USER-DEFINED NOT NULL,
  difficulty character varying DEFAULT 'medium'::character varying,
  topic_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT uploaded_papers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.push_subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  device_id text NOT NULL UNIQUE,
  subscription jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exam_support_requests (
  request_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  session_id integer UNIQUE,
  student_id integer,
  reason text NOT NULL,
  custom_message text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'completed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone,
  remaining_time_seconds integer NOT NULL,
  answers jsonb,
  questions jsonb,
  updated_at timestamp with time zone,
  student_session_id integer,
  CONSTRAINT exam_support_requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT exam_support_requests_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.exam_sessions(session_id),
  CONSTRAINT exam_support_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT exam_support_requests_student_session_id_fkey FOREIGN KEY (student_session_id) REFERENCES public.student_exam_sessions(student_session_id)
);