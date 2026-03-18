import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SparkAnswers {
  situation: string;
  perception: string;
  affect: string;
  intensity: number;
  reframe: string;
  keyResult: string;
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
}

const defaultAnswers: SparkAnswers = {
  situation: '',
  perception: '',
  affect: '',
  intensity: 1,
  reframe: '',
  keyResult: '',
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const saved = loadState();
  const [xp, setXp] = useState(saved?.xp ?? 100);
  const [streak, setStreak] = useState(saved?.streak ?? 3);
  const [sessionsCount, setSessionsCount] = useState(saved?.sessionsCount ?? 3);
  const [badges, setBadges] = useState<string[]>(saved?.badges ?? []);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SparkAnswers>(defaultAnswers);

  useEffect(() => {
    localStorage.setItem('dose-academy-state', JSON.stringify({ xp, streak, sessionsCount, badges }));
  }, [xp, streak, sessionsCount, badges]);

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

  return (
    <AppContext.Provider value={{
      xp, streak, sessionsCount, badges, currentStep, answers,
      setCurrentStep, setAnswer, resetSpark, completeSpark
    }}>
      {children}
    </AppContext.Provider>
  );
};
