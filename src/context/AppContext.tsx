import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// --- Types ---
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
  plannedDuration: number;
  actualDuration: number;
  status: 'idle' | 'running' | 'paused' | 'complete' | 'abandoned';
  startTime: number | null;
  pausedAt: number | null;
  totalPausedMs: number;
  distractions: DistractionEntry[];
  distractionPlan: string[];
  completionType: 'full' | 'partial' | 'early';
}

interface RsdSession {
  scenario: string;
  intensity: number;
  usedBreathe: boolean;
  reframeChosen: string;
  actionChosen: string;
  completedAt: number | null;
}

export interface SquadSession {
  task: string;
  plannedDuration: number;
  actualDuration: number;
  mode: 'ambient' | 'invite';
  sessionCode: string | null;
  status: 'idle' | 'running' | 'paused' | 'complete' | 'abandoned';
  startTime: number | null;
  distractions: DistractionEntry[];
  checkinCompletion: string | null;
  checkinFeeling: string | null;
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
  // Wave
  waveSession: WaveSession;
  setWaveSession: React.Dispatch<React.SetStateAction<WaveSession>>;
  sessionsToday: number;
  minutesToday: number;
  focusStreak: number;
  startWave: (task: string, duration: number, distractionPlan: string[]) => void;
  completeWave: (actualSeconds: number, distractions: DistractionEntry[]) => void;
  resetWave: () => void;
  hasActiveSession: boolean;
  // RSD
  rsdSession: RsdSession;
  rsdSessionCount: number;
  rsdWeekCount: number;
  completeRsd: (scenario: string, intensity: number, usedBreathe: boolean, reframe: string, action: string) => void;
  resetRsd: () => void;
  // Squad
  squadSession: SquadSession;
  setSquadSession: React.Dispatch<React.SetStateAction<SquadSession>>;
  squadStreak: number;
  startSquad: (task: string, duration: number, mode: 'ambient' | 'invite', code: string | null) => void;
  completeSquad: (actualSeconds: number, distractions: DistractionEntry[]) => void;
  resetSquad: () => void;
}

// --- Defaults ---
const defaultAnswers: SparkAnswers = {
  situation: '', perception: '', affect: '', intensity: 1, reframe: '', keyResult: '',
};

const defaultWaveSession: WaveSession = {
  task: '', plannedDuration: 25, actualDuration: 0, status: 'idle',
  startTime: null, pausedAt: null, totalPausedMs: 0,
  distractions: [], distractionPlan: [], completionType: 'full',
};

const defaultRsdSession: RsdSession = {
  scenario: '', intensity: 0, usedBreathe: false, reframeChosen: '', actionChosen: '', completedAt: null,
};

const defaultSquadSession: SquadSession = {
  task: '', plannedDuration: 25, actualDuration: 0, mode: 'ambient',
  sessionCode: null, status: 'idle', startTime: null,
  distractions: [], checkinCompletion: null, checkinFeeling: null,
};

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
};

// --- Persistence helpers ---
const loadState = () => {
  try { const s = localStorage.getItem('dose-academy-state'); if (s) return JSON.parse(s); } catch {} return null;
};
const loadWaveSession = (): WaveSession | null => {
  try { const s = localStorage.getItem('dose-wave-session'); if (s) return JSON.parse(s); } catch {} return null;
};
const loadWaveStats = () => {
  try {
    const s = localStorage.getItem('dose-wave-stats');
    if (s) { const d = JSON.parse(s); if (d.date === new Date().toDateString()) return d; }
  } catch {}
  return { date: new Date().toDateString(), sessionsToday: 0, minutesToday: 0 };
};
const loadRsdStats = () => {
  try { const s = localStorage.getItem('dose-rsd-stats'); if (s) return JSON.parse(s); } catch {}
  return { totalSessions: 0, weekSessions: 0, weekStart: new Date().toDateString(), reframeCount: 0 };
};
const loadSquadStats = () => {
  try { const s = localStorage.getItem('dose-squad-stats'); if (s) return JSON.parse(s); } catch {}
  return { squadStreak: 0, totalSquadSessions: 0 };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const saved = loadState();
  const savedWave = loadWaveSession();
  const savedStats = loadWaveStats();
  const savedRsd = loadRsdStats();
  const savedSquad = loadSquadStats();

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

  const [rsdSession, setRsdSession] = useState<RsdSession>(defaultRsdSession);
  const [rsdSessionCount, setRsdSessionCount] = useState(savedRsd.totalSessions);
  const [rsdWeekCount, setRsdWeekCount] = useState(savedRsd.weekSessions);
  const [rsdReframeCount, setRsdReframeCount] = useState(savedRsd.reframeCount);

  const [squadSession, setSquadSession] = useState<SquadSession>(defaultSquadSession);
  const [squadStreak, setSquadStreak] = useState(savedSquad.squadStreak);
  const [totalSquadSessions, setTotalSquadSessions] = useState(savedSquad.totalSquadSessions);

  const hasActiveSession = waveSession.status === 'running' || waveSession.status === 'paused';

  // Persist core state
  useEffect(() => {
    localStorage.setItem('dose-academy-state', JSON.stringify({ xp, streak, sessionsCount, badges, focusStreak }));
  }, [xp, streak, sessionsCount, badges, focusStreak]);

  useEffect(() => { localStorage.setItem('dose-wave-session', JSON.stringify(waveSession)); }, [waveSession]);

  useEffect(() => {
    localStorage.setItem('dose-wave-stats', JSON.stringify({ date: new Date().toDateString(), sessionsToday, minutesToday }));
  }, [sessionsToday, minutesToday]);

  useEffect(() => {
    localStorage.setItem('dose-rsd-stats', JSON.stringify({
      totalSessions: rsdSessionCount, weekSessions: rsdWeekCount, weekStart: new Date().toDateString(), reframeCount: rsdReframeCount,
    }));
  }, [rsdSessionCount, rsdWeekCount, rsdReframeCount]);

  useEffect(() => {
    localStorage.setItem('dose-squad-stats', JSON.stringify({ squadStreak, totalSquadSessions }));
  }, [squadStreak, totalSquadSessions]);

  // --- SPARK ---
  const setAnswer = (key: keyof SparkAnswers, value: string | number) => setAnswers(prev => ({ ...prev, [key]: value }));
  const resetSpark = () => { setCurrentStep(0); setAnswers(defaultAnswers); };
  const completeSpark = () => {
    setXp(prev => prev + 20); setStreak(prev => prev + 1); setSessionsCount(prev => prev + 1);
    if (!badges.includes('first-spark')) setBadges(prev => [...prev, 'first-spark']);
  };

  // --- WAVE ---
  const startWave = (task: string, duration: number, distractionPlan: string[]) => {
    setWaveSession({ task, plannedDuration: duration, actualDuration: 0, status: 'idle', startTime: null, pausedAt: null, totalPausedMs: 0, distractions: [], distractionPlan, completionType: 'full' });
  };

  const completeWave = (actualSeconds: number, distractions: DistractionEntry[]) => {
    const planned = waveSession.plannedDuration * 60;
    const ratio = actualSeconds / planned;
    let earnedXp = 5;
    let completionType: 'full' | 'partial' | 'early' = 'early';
    if (ratio >= 0.95) { completionType = 'full'; earnedXp = 25; }
    else if (ratio >= 0.5) { completionType = 'partial'; earnedXp = 15; }
    if (completionType === 'full' && distractions.length === 0) {
      earnedXp += 10;
      if (!badges.includes('zero-distract')) setBadges(prev => [...prev, 'zero-distract']);
    }
    setXp(prev => prev + earnedXp);
    setFocusStreak(prev => prev + 1);
    setSessionsToday(prev => { const n = prev + 1; if (n >= 3) setXp(x => x + 20); return n; });
    setMinutesToday(prev => prev + Math.round(actualSeconds / 60));
    setSessionsCount(prev => prev + 1);
    if (!badges.includes('first-wave')) setBadges(prev => [...prev, 'first-wave']);
    if (focusStreak + 1 >= 5 && !badges.includes('wave-streak')) setBadges(prev => [...prev, 'wave-streak']);
    if (waveSession.plannedDuration >= 45 && completionType === 'full' && !badges.includes('deep-diver')) setBadges(prev => [...prev, 'deep-diver']);
    setWaveSession(prev => ({ ...prev, actualDuration: actualSeconds, distractions, status: 'complete', completionType }));
  };

  const resetWave = () => setWaveSession(defaultWaveSession);

  // --- RSD ---
  const completeRsd = (scenario: string, intensity: number, usedBreathe: boolean, reframe: string, action: string) => {
    const earnedXp = usedBreathe ? 20 : 15;
    setXp(prev => prev + earnedXp);
    setRsdSessionCount(prev => prev + 1);
    setRsdWeekCount(prev => prev + 1);
    setRsdReframeCount(prev => prev + 1);
    setSessionsCount(prev => prev + 1);
    if (!badges.includes('rsd-grounded')) setBadges(prev => [...prev, 'rsd-grounded']);
    if (usedBreathe && !badges.includes('rsd-breathed')) setBadges(prev => [...prev, 'rsd-breathed']);
    if (rsdReframeCount + 1 >= 5 && !badges.includes('rsd-challenger')) setBadges(prev => [...prev, 'rsd-challenger']);
    if (rsdWeekCount + 1 >= 3 && !badges.includes('rsd-teflon')) setBadges(prev => [...prev, 'rsd-teflon']);
    setRsdSession({ scenario, intensity, usedBreathe, reframeChosen: reframe, actionChosen: action, completedAt: Date.now() });
  };

  const resetRsd = () => setRsdSession(defaultRsdSession);

  // --- SQUAD ---
  const startSquad = (task: string, duration: number, mode: 'ambient' | 'invite', code: string | null) => {
    setSquadSession({ task, plannedDuration: duration, actualDuration: 0, mode, sessionCode: code, status: 'idle', startTime: null, distractions: [], checkinCompletion: null, checkinFeeling: null });
  };

  const completeSquad = (actualSeconds: number, distractions: DistractionEntry[]) => {
    const planned = squadSession.plannedDuration * 60;
    const ratio = actualSeconds / planned;
    const isFull = ratio >= 0.95;
    const isPartial = ratio >= 0.5;
    const isInvite = squadSession.mode === 'invite';

    let earnedXp = 5;
    if (isFull) { earnedXp = isInvite ? 30 : 25; }
    else if (isPartial) { earnedXp = 15; }

    setXp(prev => prev + earnedXp);
    setSquadStreak(prev => prev + 1);
    setTotalSquadSessions(prev => prev + 1);
    setSessionsCount(prev => prev + 1);
    setSessionsToday(prev => prev + 1);
    setMinutesToday(prev => prev + Math.round(actualSeconds / 60));

    if (!badges.includes('squad-up')) setBadges(prev => [...prev, 'squad-up']);
    if (isInvite && !badges.includes('squad-together')) setBadges(prev => [...prev, 'squad-together']);
    if (squadStreak + 1 >= 5 && !badges.includes('squad-fire')) setBadges(prev => [...prev, 'squad-fire']);

    setSquadSession(prev => ({ ...prev, actualDuration: actualSeconds, distractions, status: 'complete' }));
  };

  const resetSquad = () => setSquadSession(defaultSquadSession);

  return (
    <AppContext.Provider value={{
      xp, streak, sessionsCount, badges, currentStep, answers,
      setCurrentStep, setAnswer, resetSpark, completeSpark,
      waveSession, setWaveSession, sessionsToday, minutesToday, focusStreak,
      startWave, completeWave, resetWave, hasActiveSession,
      rsdSession, rsdSessionCount, rsdWeekCount, completeRsd, resetRsd,
      squadSession, setSquadSession, squadStreak, startSquad, completeSquad, resetSquad,
    }}>
      {children}
    </AppContext.Provider>
  );
};
