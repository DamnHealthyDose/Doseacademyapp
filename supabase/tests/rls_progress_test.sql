-- RLS regression test for the progress-to-Supabase migration. LOCAL ONLY.
--
-- Covers migrations:
--   20261030000000_add_teacher_role.sql
--   20261030000100_add_student_progress_settings_enrollments.sql
--
-- How to run locally (never against a remote project):
--   1. Start the local stack (DB is all that's needed; excluding the other
--      services avoids the flaky realtime health check):
--        supabase start -x realtime,storage-api,imgproxy,studio,edge-runtime,logflare,vector,supavisor,pooler
--   2. Apply all migrations from scratch:
--        supabase db reset --local
--   3. Pipe this file into the local DB container:
--        docker exec -i "$(docker ps --format '{{.Names}}' | grep supabase_db)" \
--          psql -U postgres -d postgres -X < supabase/tests/rls_progress_test.sql
--
-- Every check prints `pass = t`. The run is wrapped in a transaction and rolled
-- back, so it leaves no residue.
--
-- Impersonation model: SET LOCAL ROLE authenticated + set request.jwt.claims.sub
-- makes auth.uid() return that user id, exactly like a logged-in PostgREST call.
--
-- GRANT shim: hosted Supabase auto-grants DML on new public tables to
-- authenticated via default privileges; some local CLI builds do not. The
-- migration now grants the three NEW tables (student_progress, user_settings,
-- enrollments) explicitly, so the shim below only covers the PRE-EXISTING tables
-- (ignite_streaks, barkley_memory, user_roles) that this test also reads/writes.

\set ON_ERROR_STOP off
\set admin    '11111111-1111-1111-1111-111111111111'
\set teacher  '22222222-2222-2222-2222-222222222222'
\set studentA '33333333-3333-3333-3333-333333333333'
\set studentB '44444444-4444-4444-4444-444444444444'

BEGIN;

-- =====================================================================
-- LOCAL-ONLY GRANT SHIM (not part of the migration)
-- Only the pre-existing tables; the three new tables are granted by the
-- migration itself. Rolled back with the transaction.
-- =====================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.ignite_streaks, public.barkley_memory, public.user_roles
TO authenticated;

-- =====================================================================
-- SEED (as postgres / superuser — bypasses RLS)
-- =====================================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000000', :'admin',    'authenticated','authenticated','admin@test.local',   '{"provider":"email"}','{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', :'teacher',  'authenticated','authenticated','teacher@test.local', '{"provider":"email"}','{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', :'studentA', 'authenticated','authenticated','studenta@test.local','{"provider":"email"}','{}', now(), now()),
  ('00000000-0000-0000-0000-000000000000', :'studentB', 'authenticated','authenticated','studentb@test.local','{"provider":"email"}','{}', now(), now());

-- Roles: admin->admin, teacher->teacher. Students get NO role.
INSERT INTO public.user_roles (user_id, role) VALUES
  (:'admin',   'admin'),
  (:'teacher', 'teacher');

-- Enroll student A (only) with the teacher.
INSERT INTO public.enrollments (teacher_id, student_id) VALUES (:'teacher', :'studentA');

-- Progress / ignite / barkley / settings rows for both students.
INSERT INTO public.student_progress (user_id, xp) VALUES (:'studentA', 10), (:'studentB', 20);
INSERT INTO public.ignite_streaks   (user_id, current_streak) VALUES (:'studentA', 3), (:'studentB', 5);
INSERT INTO public.barkley_memory   (student_id, age_group, task_input)
  VALUES (:'studentA','high_school','A essay'), (:'studentB','high_school','B essay');
INSERT INTO public.user_settings    (user_id, show_slick) VALUES (:'studentA', true), (:'studentB', false);

\echo '================ CHECKS ================'

-- =====================================================================
-- GROUP 1: teacher sees enrolled student A, not student B
-- =====================================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', :'teacher', 'role','authenticated')::text, true);

SELECT 'C1 teacher: student_progress A visible, B hidden' AS check,
       (count(*) FILTER (WHERE user_id = :'studentA') = 1
        AND count(*) FILTER (WHERE user_id = :'studentB') = 0) AS pass
FROM public.student_progress;

SELECT 'C2 teacher: ignite_streaks A visible, B hidden' AS check,
       (count(*) FILTER (WHERE user_id = :'studentA') = 1
        AND count(*) FILTER (WHERE user_id = :'studentB') = 0) AS pass
FROM public.ignite_streaks;

SELECT 'C3 teacher: barkley_memory A (task_input) visible, B hidden' AS check,
       (count(*) FILTER (WHERE student_id = :'studentA') = 1
        AND count(*) FILTER (WHERE student_id = :'studentB') = 0
        AND bool_or(task_input = 'A essay')) AS pass
FROM public.barkley_memory;

RESET ROLE;

-- =====================================================================
-- GROUP 2: students cannot see each other's rows
-- =====================================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', :'studentA', 'role','authenticated')::text, true);

SELECT 'C4 studentA: own progress visible, B hidden' AS check,
       (count(*) FILTER (WHERE user_id = :'studentA') = 1
        AND count(*) FILTER (WHERE user_id = :'studentB') = 0) AS pass
FROM public.student_progress;

SELECT 'C5 studentA: own ignite visible, B hidden' AS check,
       (count(*) FILTER (WHERE user_id = :'studentA') = 1
        AND count(*) FILTER (WHERE user_id = :'studentB') = 0) AS pass
FROM public.ignite_streaks;

RESET ROLE;

-- studentB mirror check
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', :'studentB', 'role','authenticated')::text, true);

SELECT 'C6 studentB: own progress visible, A hidden' AS check,
       (count(*) FILTER (WHERE user_id = :'studentB') = 1
        AND count(*) FILTER (WHERE user_id = :'studentA') = 0) AS pass
FROM public.student_progress;

RESET ROLE;

-- =====================================================================
-- GROUP 3: students cannot INSERT into user_roles or enrollments
-- =====================================================================
DO $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub','33333333-3333-3333-3333-333333333333','role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
      VALUES ('33333333-3333-3333-3333-333333333333','admin');
    RAISE NOTICE 'C7 studentA insert into user_roles | pass=f (insert succeeded — BAD)';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'C7 studentA insert into user_roles blocked | pass=t';
  WHEN others THEN
    RAISE NOTICE 'C7 studentA insert into user_roles blocked (%) | pass=t', SQLERRM;
  END;
  RESET ROLE;
END $$;

DO $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub','33333333-3333-3333-3333-333333333333','role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO public.enrollments (teacher_id, student_id)
      VALUES ('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');
    RAISE NOTICE 'C8 studentA insert into enrollments | pass=f (insert succeeded — BAD)';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'C8 studentA insert into enrollments blocked | pass=t';
  WHEN others THEN
    RAISE NOTICE 'C8 studentA insert into enrollments blocked (%) | pass=t', SQLERRM;
  END;
  RESET ROLE;
END $$;

-- =====================================================================
-- GROUP 4: user_settings is owner-only (no teacher/admin read)
-- =====================================================================
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', :'teacher', 'role','authenticated')::text, true);
SELECT 'C9 teacher: studentA settings hidden' AS check,
       (count(*) = 0) AS pass
FROM public.user_settings WHERE user_id = :'studentA';
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', :'studentB', 'role','authenticated')::text, true);
SELECT 'C10 studentB: studentA settings hidden' AS check,
       (count(*) = 0) AS pass
FROM public.user_settings WHERE user_id = :'studentA';
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', :'studentA', 'role','authenticated')::text, true);
SELECT 'C11 studentA: own settings visible' AS check,
       (count(*) = 1) AS pass
FROM public.user_settings WHERE user_id = :'studentA';
RESET ROLE;

-- =====================================================================
-- GROUP 5: revoking the teacher role cuts off access (enrollment intact)
-- =====================================================================
DELETE FROM public.user_roles WHERE user_id = :'teacher' AND role = 'teacher';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', :'teacher', 'role','authenticated')::text, true);

SELECT 'C12 ex-teacher: student_progress now hidden' AS check,
       (count(*) = 0) AS pass
FROM public.student_progress;

SELECT 'C13 ex-teacher: ignite_streaks now hidden' AS check,
       (count(*) = 0) AS pass
FROM public.ignite_streaks;

-- enrollment row must still exist (we only removed the role)
RESET ROLE;
SELECT 'C14 enrollment row still present (role-based cutoff, not row deletion)' AS check,
       (count(*) = 1) AS pass
FROM public.enrollments WHERE teacher_id = :'teacher' AND student_id = :'studentA';

ROLLBACK;
