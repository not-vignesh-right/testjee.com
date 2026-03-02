-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
  CONSTRAINT admins_pkey PRIMARY KEY (admin_id)
);
CREATE TABLE public.categories (
  category_id integer NOT NULL DEFAULT nextval('categories_category_id_seq'::regclass),
  category_name text NOT NULL UNIQUE,
  CONSTRAINT categories_pkey PRIMARY KEY (category_id)
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
  CONSTRAINT exam_sessions_pkey PRIMARY KEY (session_id),
  CONSTRAINT exam_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(student_id),
  CONSTRAINT exam_sessions_temp_student_id_fkey FOREIGN KEY (temp_student_id) REFERENCES public.temp_students(temp_student_id),
  CONSTRAINT exam_sessions_admin_test_id_fkey FOREIGN KEY (admin_test_id) REFERENCES public.admin_tests(admin_test_id)
);
CREATE TABLE public.questions (
  question_id integer NOT NULL DEFAULT nextval('questions_question_id_seq'::regclass),
  category_id integer,
  subject_id integer,
  topic_id integer,
  difficulty text CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text, 'advance'::text])),
  pyq boolean DEFAULT false,
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
CREATE TABLE public.students (
  student_id integer NOT NULL DEFAULT nextval('students_student_id_seq'::regclass),
  supabase_user_id TEXT UNIQUE,
  is_approved BOOLEAN DEFAULT false,
  student_name text NOT NULL,
  email_id text NOT NULL UNIQUE,
  mobile_number text,
  class text,
  parent_name text,
  parent_number text,
  parent_email_id text,
  number_of_tests integer DEFAULT 1,
  creation_date timestamp without time zone DEFAULT now(),
  modification_date timestamp without time zone DEFAULT now(),
  created_by text,
  modified_by text,
  CONSTRAINT students_pkey PRIMARY KEY (student_id)
);
CREATE TABLE public.subjects (
  subject_id integer NOT NULL DEFAULT nextval('subjects_subject_id_seq'::regclass),
  subject_name text NOT NULL UNIQUE,
  CONSTRAINT subjects_pkey PRIMARY KEY (subject_id)
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
CREATE TABLE public.topics (
  topic_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  subject_id integer NOT NULL,
  topic_name text NOT NULL,
  class text NOT NULL DEFAULT '11'::text CHECK (class = ANY (ARRAY['11'::text, '12'::text])),
  CONSTRAINT topics_pkey PRIMARY KEY (topic_id),
  CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(subject_id)
);