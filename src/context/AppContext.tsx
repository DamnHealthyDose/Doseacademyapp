import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SparkAnswers {
  situation: string;
  perception: string;
  affect: string;
  intensity: number;
  reframe: string;
  keyResult: string;
}

interface DistractionEntry {
  type: string;
  timestamp: number;
}

interface WaveSession {
  task: string;
  plannedDuration: number; // minutes
  actualDuration: number; // seconds elapsed
  status: 'idle' | 'running' | 'paused' | 'complete' | 'abandoned';
  startTime: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
  distractions: DistractionEntry[];
  distractionPlan: string[];
  completionType: 'full' | 'partial' | 'early';
}

interface AppState {
  xp: number;
  streak: number;
  sessionsCount: number;
  badges: string[];
  currentStep: number;
  answers: SparkAnswers;
  setCurrentStep: (step: number) => void;
  setAnswer: (key: keyof SparkAnswers, value: string | number) => void;
  resetSpark: () => void;
  completeSpark: () => void;
  // Wave state
  waveSession: WaveSession;
  setWaveSession: React.Dispatch<React.SetStateAction<WaveSession>>;
  sessionsToday: number;
  minutesToday: number;
  focusStreak: number;
  startWave: (task: string, duration: number, distractionPlan: string[]) => void;
  completeWave: (actualSeconds: number, distractions: DistractionEntry[]) => void;
  resetWave: () => void;
  hasActiveSession: boolean;
}

const defaultAnswers: SparkAnswers = {
  situation: '',
  perception: '',
  affect: '',
  intensity: 1,
  reframe: '',
  keyResult: '',
};

const defaultWaveSession: WaveSession = {
  task: '',
  plannedDuration: 25,
  actualDuration: 0,
  status: 'idle',
  startTime: null,
  pausedAt: null,
  totalPausedMs: 0,
  distractions: [],
  distractionPlan: [],
  completionType: 'full',
};

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
};

const loadState = () => {
  try {
    const saved = localStorage.getItem('dose-academy-state');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

const loadWaveSession = (): WaveSession | null => {
  try {
    const saved = localStorage.getItem('dose-wave-session');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

const loadWaveStats = () => {
  try {
    const saved = localStorage.getItem('dose-wave-stats');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date === today) return data;
    }
  } catch {}
  return { date: new Date().toDateString(), sessionsToday: 0, minutesToday: 0 };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const saved = loadState();
  const savedWave = loadWaveSession();
  const savedStats = loadWaveStats();
  
  const [xp, setXp] = useState(saved?.xp ?? 100);
  const [streak, setStreak] = useState(saved?.streak ?? 3);
  const [sessionsCount, setSessionsCount] = useState(saved?.sessionsCount ?? 3);
  const [badges, setBadges] = useState<string[]>(saved?.badges ?? []);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SparkAnswers>(defaultAnswers);
  const [focusStreak, setFocusStreak] = useState(saved?.focusStreak ?? 0);

  const [waveSession, setWaveSession] = useState<WaveSession>(savedWave ?? defaultWaveSession);
  const [sessionsToday, setSessionsToday] = useState(savedStats.sessionsToday);
  const [minutesToday, setMinutesToday] = useState(savedStats.minutesToday);

  const hasActiveSession = waveSession.status === 'running' || waveSession.status === 'paused';

  useEffect(() => {
    localStorage.setItem('dose-academy-state', JSON.stringify({ xp, streak, sessionsCount, badges, focusStreak }));
  }, [xp, streak, sessionsCount, badges, focusStreak]);

  useEffect(() => {
    localStorage.setItem('dose-wave-session', JSON.stringify(waveSession));
  }, [waveSession]);

  useEffect(() => {
    localStorage.setItem('dose-wave-stats', JSON.stringify({
      date: new Date().toDateString(),
      sessionsToday,
      minutesToday,
    }));
  }, [sessionsToday, minutesToday]);

  const setAnswer = (key: keyof SparkAnswers, value: string | number) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const resetSpark = () => {
    setCurrentStep(0);
    setAnswers(defaultAnswers);
  };

  const completeSpark = () => {
    setXp(prev => prev + 20);
    setStreak(prev => prev + 1);
    setSessionsCount(prev => prev + 1);
    if (!badges.includes('first-spark')) {
      setBadges(prev => [...prev, 'first-spark']);
    }
  };

  const startWave = (task: string, duration: number, distractionPlan: string[]) => {
    setWaveSession({
      task,
      plannedDuration: duration,
      actualDuration: 0,
      status: 'idle',
      startTime: null,
      pausedAt: null,
      totalPausedMs: 0,
      distractions: [],
      distractionPlan,
      completionType: 'full',
    });
  };

  const completeWave = (actualSeconds: number, distractions: DistractionEntry[]) => {
    const planned = waveSession.plannedDuration * 60;
    const ratio = actualSeconds / planned;
    let earnedXp = 5;
    let completionType: 'full' | 'partial' | 'early' = 'early';

    if (ratio >= 0.95) {
      completionType = 'full';
      earnedXp = 25;
    } else if (ratio >= 0.5) {
      completionType = 'partial';
      earnedXp = 15;
    }

    // Bonus: 0 distractions on full session
    if (completionType === 'full' && distractions.length === 0) {
      earnedXp += 10;
      if (!badges.includes('zero-distract')) {
        setBadges(prev => [...prev, 'zero-distract']);
      }
    }

    setXp(prev => prev + earnedXp);
    setFocusStreak(prev => prev + 1);
    setSessionsToday(prev => {
      const newVal = prev + 1;
      // Bonus: 3+ sessions in one day
      if (newVal >= 3) setXp(x => x + 20);
      return newVal;
    });
    setMinutesToday(prev => prev + Math.round(actualSeconds / 60));
    setSessionsCount(prev => prev + 1);

    // Badges
    if (!badges.includes('first-wave')) {
      setBadges(prev => [...prev, 'first-wave']);
    }
    if (focusStreak + 1 >= 5 && !badges.includes('wave-streak')) {
      setBadges(prev => [...prev, 'wave-streak']);
    }
    if (waveSession.plannedDuration >= 45 && completionType === 'full' && !badges.includes('deep-diver')) {
      setBadges(prev => [...prev, 'deep-diver']);
    }

    setWaveSession(prev => ({
      ...prev,
      actualDuration: actualSeconds,
      distractions,
      status: 'complete',
      completionType,
    }));
  };

  const resetWave = () => {
    setWaveSession(defaultWaveSession);
  };

  return (
    <AppContext.Provider value={{
      xp, streak, sessionsCount, badges, currentStep, answers,
      setCurrentStep, setAnswer, resetSpark, completeSpark,
      waveSession, setWaveSession, sessionsToday, minutesToday, focusStreak,
      startWave, completeWave, resetWave, hasActiveSession,
    }}>
      {children}
    </AppContext.Provider>
  );
};
