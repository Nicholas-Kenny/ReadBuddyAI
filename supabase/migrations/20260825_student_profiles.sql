alter table students
  add column if not exists login_id text,
  add column if not exists pin_hash text,
  add column if not exists school_grade text not null default 'Grade 1',
  add column if not exists reading_level text not null default 'Grade 1',
  add column if not exists location text not null default '',
  add column if not exists interests jsonb not null default '[]'::jsonb,
  add column if not exists interest_details text not null default '',
  add column if not exists assigned_activities jsonb not null default '{"oralReading": false, "c1": false, "c2": false, "c3": false, "c4": false}'::jsonb,
  add column if not exists profile_status text not null default 'pending';

alter table stories
  add column if not exists student_id text references students(id) on delete set null,
  add column if not exists student_name text,
  add column if not exists teacher_prompt text;

alter table assessments
  add column if not exists student_id text references students(id) on delete set null;

create index if not exists students_class_code_idx on students(class_code);
create unique index if not exists students_login_id_idx on students(login_id) where login_id is not null;
create index if not exists stories_student_id_idx on stories(student_id);
create index if not exists assessments_student_id_idx on assessments(student_id);
