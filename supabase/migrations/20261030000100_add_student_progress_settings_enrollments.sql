-- Move per-user progress and settings out of localStorage and into Supabase,
-- keyed by auth.users.id. Adds:
--   * public.enrollments       — teacher <-> student links (admin-managed)
--   * public.student_progress  — one row per user: SPARK/WAVE/RSD/Squad totals
--   * public.user_settings     — one row per user: app preferences
-- plus an enrollment-scoped SELECT helper so teachers can read ONLY the progress
-- of students they are enrolled with (student_progress, barkley_memory,
-- ignite_streaks). Parents are NOT granted any direct access here — the parent
-- dashboard reads through the token-validated edge function (service role).

-- ============================================================================
-- 1. Enrollments: teacher <-> student links
-- ============================================================================
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, student_id)
);

CREATE INDEX idx_enrollments_teacher ON public.enrollments (teacher_id);
CREATE INDEX idx_enrollments_student ON public.enrollments (student_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Teachers may read only their own links; admins may read all. Students get
-- nothing (no policy == denied).
CREATE POLICY "Teachers can view own enrollments"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Only admins can create / change / remove enrollments, and the linked
-- teacher_id must actually hold the 'teacher' role (no enrolling arbitrary
-- users as teachers).
CREATE POLICY "Admins can insert enrollments"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND public.has_role(teacher_id, 'teacher')
  );

CREATE POLICY "Admins can update enrollments"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND public.has_role(teacher_id, 'teacher')
  );

CREATE POLICY "Admins can delete enrollments"
  ON public.enrollments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- 2. Enrollment-scoped read helper
-- ============================================================================
-- SECURITY DEFINER so the enrollment lookup is not itself filtered by the
-- enrollments RLS policy. Returns true when the caller currently holds the
-- 'teacher' role AND is enrolled as a teacher of _student. Requiring the role
-- here means revoking a teacher's role immediately cuts off access even if the
-- enrollment rows are left in place. Used by the SELECT policies on the three
-- progress tables.
CREATE OR REPLACE FUNCTION public.is_teacher_of(_student UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'teacher')
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.teacher_id = auth.uid()
        AND e.student_id = _student
    )
$$;

REVOKE ALL ON FUNCTION public.is_teacher_of(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_teacher_of(uuid) TO authenticated, service_role;

-- ============================================================================
-- 3. student_progress: one row per user (mirror of the four localStorage blobs)
-- ============================================================================
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- dose-academy-state
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  focus_streak INTEGER NOT NULL DEFAULT 0,
  badges TEXT[] NOT NULL DEFAULT '{}',

  -- dose-wave-stats (daily counters; stat_date is the day they belong to)
  stat_date DATE,
  sessions_today INTEGER NOT NULL DEFAULT 0,
  minutes_today INTEGER NOT NULL DEFAULT 0,

  -- dose-rsd-stats
  rsd_total_sessions INTEGER NOT NULL DEFAULT 0,
  rsd_week_sessions INTEGER NOT NULL DEFAULT 0,
  rsd_week_start DATE,
  rsd_reframe_count INTEGER NOT NULL DEFAULT 0,

  -- dose-squad-stats
  squad_streak INTEGER NOT NULL DEFAULT 0,
  total_squad_sessions INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Owner: full read/write of their own row.
CREATE POLICY "Users can view own progress"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_teacher_of(user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own progress"
  ON public.student_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.student_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON public.student_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 4. user_settings: one row per user (mirror of dose-settings:<userId>)
-- ============================================================================
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- NULL = follow the OS prefers-reduced-motion setting (matches the client).
  reduce_motion BOOLEAN,
  default_session_minutes INTEGER NOT NULL DEFAULT 25,
  default_break_minutes INTEGER NOT NULL DEFAULT 5,
  show_slick BOOLEAN NOT NULL DEFAULT true,
  reminders_enabled BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Settings are private to the owner — no teacher/admin read.
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. Extend teacher/admin read to the existing progress tables
-- ============================================================================
-- Additive SELECT policies (RLS permissive policies OR together, so the existing
-- owner-only SELECT policies keep working). Teachers see only enrolled students;
-- admins see all. No moderator access.
CREATE POLICY "Teachers and admins can view enrolled student streaks"
  ON public.ignite_streaks FOR SELECT
  TO authenticated
  USING (public.is_teacher_of(user_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers and admins can view enrolled student sessions"
  ON public.barkley_memory FOR SELECT
  TO authenticated
  USING (public.is_teacher_of(student_id) OR public.has_role(auth.uid(), 'admin'));
