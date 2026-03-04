create table public.students (
  student_id serial not null,
  supabase_user_id uuid null,
  student_name text not null,
  email_id text not null,
  mobile_number text null,
  class text null,
  parent_name text null,
  parent_number text null,
  parent_email_id text null,
  creation_date timestamp without time zone null default now(),
  modification_date timestamp without time zone null default now(),
  created_by text null,
  modified_by text null,
  number_of_tests integer null default 1,
  is_approved boolean null default false,
  constraint students_pkey primary key (student_id),
  constraint students_email_id_key unique (email_id),
  constraint students_supabase_user_id_key unique (supabase_user_id)
) TABLESPACE pg_default;

create index IF not exists idx_students_supabase_user_id on public.students using btree (supabase_user_id) TABLESPACE pg_default;

create index IF not exists idx_students_email_id on public.students using btree (email_id) TABLESPACE pg_default;