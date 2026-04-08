
-- Create age_group enum
CREATE TYPE public.ignite_age_group AS ENUM ('middle_school', 'high_school');

-- Create barkley_memory table for session logging
CREATE TABLE public.barkley_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  age_group public.ignite_age_group NOT NULL,
  task_input TEXT NOT NULL,
  steps_completed INTEGER NOT NULL DEFAULT 0,
  spark_handoff BOOLEAN NOT NULL DEFAULT false,
  session_completed BOOLEAN NOT NULL DEFAULT false,
  streak_day INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.barkley_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.barkley_memory
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own sessions" ON public.barkley_memory
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update own sessions" ON public.barkley_memory
  FOR UPDATE TO authenticated USING (auth.uid() = student_id);

-- Create ignite_streaks table
CREATE TABLE public.ignite_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ignite_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" ON public.ignite_streaks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" ON public.ignite_streaks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" ON public.ignite_streaks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at on ignite_streaks
CREATE TRIGGER update_ignite_streaks_updated_at
  BEFORE UPDATE ON public.ignite_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
