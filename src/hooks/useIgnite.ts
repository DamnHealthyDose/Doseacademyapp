import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AgeMode = 'middle_school' | 'high_school';

interface IgniteStep {
  step: string;
  time_estimate: number;
  is_final: boolean;
  total_estimated_steps: number;
}

interface IgniteState {
  screen: 'entry' | 'loading' | 'step' | 'celebration' | 'stuck' | 'complete';
  task: string;
  steps: string[];
  currentStep: IgniteStep | null;
  stepsCompleted: number;
  sparkHandoff: boolean;
  sessionId: string | null;
  streak: number;
  streakJustIncremented: boolean;
  milestoneDays: number | null;
}

const CELEBRATION_COPY = {
  middle_school: [
    "You did that! 🔥",
    "Yes! Keep going!",
    "One down, let's go!",
    "That's what I'm talking about!",
  ],
  high_school: [
    "You did that.",
    "One down. Keep going.",
    "That's real progress.",
    "Nice work.",
  ],
};

const MILESTONE_COPY = {
  middle_school: {
    3: "3 days in a row! You're on fire! 🔥",
    7: "One full week! That's a habit forming!",
    14: "Two weeks strong! This is who you are now!",
    30: "30 days! You showed up every single day!",
  },
  high_school: {
    3: "3 days in a row. You're building something real.",
    7: "One full week. That's a habit forming.",
    14: "Two weeks strong. This is who you are now.",
    30: "30 days. You showed up every single day.",
  },
};

export function useIgnite() {
  const { user, profile } = useAuth();
  const [state, setState] = useState<IgniteState>({
    screen: 'entry',
    task: '',
    steps: [],
    currentStep: null,
    stepsCompleted: 0,
    sparkHandoff: false,
    sessionId: null,
    streak: 0,
    streakJustIncremented: false,
    milestoneDays: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ageMode: AgeMode = (() => {
    const bracket = profile?.age_bracket;
    if (bracket === 'under-13' || bracket === '13-15') return 'middle_school';
    return 'high_school';
  })();

  // Load streak on mount
  useEffect(() => {
    if (!user) return;
    loadStreak();
  }, [user]);

  const loadStreak = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('ignite_streaks')
      .select('current_streak, last_activity_date')
      .eq('user_id', user.id)
      .single();

    if (data) {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = data.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let streak = data.current_streak;
      if (lastDate !== today && lastDate !== yesterday) {
        streak = 0; // streak broken
      }
      setState(prev => ({ ...prev, streak }));
    }
  };

  const generateStep = useCallback(async (task: string, completedSteps: string[] = []) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ignite-steps', {
        body: {
          task,
          age_group: ageMode,
          completed_steps: completedSteps,
          current_step_index: completedSteps.length,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      return data as IgniteStep;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate step';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [ageMode]);

  const startTask = useCallback(async (task: string) => {
    setState(prev => ({ ...prev, screen: 'loading', task, steps: [], stepsCompleted: 0, sparkHandoff: false }));

    // Create session in barkley_memory
    let sessionId: string | null = null;
    if (user) {
      const { data } = await supabase
        .from('barkley_memory')
        .insert({
          student_id: user.id,
          age_group: ageMode,
          task_input: task,
          streak_day: state.streak,
        } as any)
        .select('id')
        .single();
      sessionId = data?.id ?? null;
    }

    const step = await generateStep(task);
    if (step) {
      setState(prev => ({
        ...prev,
        screen: 'step',
        currentStep: step,
        sessionId,
      }));
    } else {
      setState(prev => ({ ...prev, screen: 'entry' }));
    }
  }, [user, ageMode, state.streak, generateStep]);

  const completeStep = useCallback(async () => {
    const completedSteps = [...state.steps, state.currentStep!.step];
    const newCount = state.stepsCompleted + 1;

    // Update streak
    let streakJustIncremented = false;
    let milestoneDays: number | null = null;
    let newStreak = state.streak;

    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const { data: streakData } = await supabase
        .from('ignite_streaks')
        .select('current_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();

      if (streakData) {
        if (streakData.last_activity_date !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (streakData.last_activity_date === yesterday) {
            newStreak = streakData.current_streak + 1;
          } else if (!streakData.last_activity_date) {
            newStreak = 1;
          } else {
            newStreak = 1;
          }
          streakJustIncremented = true;
          if ([3, 7, 14, 30].includes(newStreak)) {
            milestoneDays = newStreak;
          }
          await supabase
            .from('ignite_streaks')
            .update({ current_streak: newStreak, last_activity_date: today } as any)
            .eq('user_id', user.id);
        }
      } else {
        newStreak = 1;
        streakJustIncremented = true;
        await supabase
          .from('ignite_streaks')
          .insert({ user_id: user.id, current_streak: 1, last_activity_date: today } as any);
      }

      // Update session
      if (state.sessionId) {
        await supabase
          .from('barkley_memory')
          .update({ steps_completed: newCount, streak_day: newStreak } as any)
          .eq('id', state.sessionId);
      }
    }

    // Check if task is complete
    if (state.currentStep?.is_final) {
      // Mark session complete
      if (user && state.sessionId) {
        await supabase
          .from('barkley_memory')
          .update({ session_completed: true } as any)
          .eq('id', state.sessionId);
      }
      setState(prev => ({
        ...prev,
        steps: completedSteps,
        stepsCompleted: newCount,
        streak: newStreak,
        streakJustIncremented,
        milestoneDays,
        screen: 'complete',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      steps: completedSteps,
      stepsCompleted: newCount,
      streak: newStreak,
      streakJustIncremented,
      milestoneDays,
      screen: 'celebration',
    }));

    // After celebration, generate next step
    setTimeout(async () => {
      const nextStep = await generateStep(state.task, completedSteps);
      if (nextStep) {
        setState(prev => ({
          ...prev,
          screen: 'step',
          currentStep: nextStep,
          streakJustIncremented: false,
          milestoneDays: null,
        }));
      }
    }, 2500);
  }, [state, user, generateStep]);

  const handleStuck = useCallback(() => {
    if (user && state.sessionId) {
      supabase
        .from('barkley_memory')
        .update({ spark_handoff: true } as any)
        .eq('id', state.sessionId);
    }
    setState(prev => ({ ...prev, screen: 'stuck', sparkHandoff: true }));
  }, [user, state.sessionId]);

  const retryStep = useCallback(() => {
    setState(prev => ({ ...prev, screen: 'step' }));
  }, []);

  const resetIgnite = useCallback(() => {
    setState(prev => ({
      ...prev,
      screen: 'entry',
      task: '',
      steps: [],
      currentStep: null,
      stepsCompleted: 0,
      sparkHandoff: false,
      sessionId: null,
      streakJustIncremented: false,
      milestoneDays: null,
    }));
  }, []);

  const getCelebrationCopy = () => {
    const options = CELEBRATION_COPY[ageMode];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getMilestoneCopy = (days: number) => {
    const milestones = MILESTONE_COPY[ageMode];
    return milestones[days as keyof typeof milestones] || '';
  };

  return {
    ...state,
    ageMode,
    loading,
    error,
    startTask,
    completeStep,
    handleStuck,
    retryStep,
    resetIgnite,
    getCelebrationCopy,
    getMilestoneCopy,
  };
}
