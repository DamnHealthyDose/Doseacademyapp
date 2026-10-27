import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const SESSION_LENGTHS = [10, 15, 25, 45] as const;
export const BREAK_LENGTHS = [3, 5, 10] as const;

export interface Settings {
  /** null = follow the OS prefers-reduced-motion setting until the user chooses. */
  reduceMotion: boolean | null;
  defaultSessionMinutes: (typeof SESSION_LENGTHS)[number];
  defaultBreakMinutes: (typeof BREAK_LENGTHS)[number];
  showSlick: boolean;
  // TODO: no notification backend yet; this is UI-only.
  remindersEnabled: boolean;
}

const DEFAULTS: Settings = {
  reduceMotion: null,
  defaultSessionMinutes: 25,
  defaultBreakMinutes: 5,
  showSlick: true,
  remindersEnabled: false,
};

interface SettingsContextType {
  settings: Settings;
  /** Resolved reduce-motion value (user choice, else OS preference). */
  reduceMotion: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
};

// Keyed by user ID so students sharing a device don't see each other's settings.
// TODO: move to Supabase (alongside the progress migration); keep all settings in this context.
const storageKey = (userId: string) => `dose-settings:${userId}`;

const osPrefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const load = (userId: string | undefined): Settings => {
  if (!userId) return DEFAULTS;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULTS;
    const d = JSON.parse(raw) as Partial<Settings>;
    return {
      reduceMotion: typeof d.reduceMotion === 'boolean' ? d.reduceMotion : null,
      defaultSessionMinutes: SESSION_LENGTHS.includes(d.defaultSessionMinutes as never)
        ? d.defaultSessionMinutes! : DEFAULTS.defaultSessionMinutes,
      defaultBreakMinutes: BREAK_LENGTHS.includes(d.defaultBreakMinutes as never)
        ? d.defaultBreakMinutes! : DEFAULTS.defaultBreakMinutes,
      showSlick: typeof d.showSlick === 'boolean' ? d.showSlick : DEFAULTS.showSlick,
      remindersEnabled: typeof d.remindersEnabled === 'boolean' ? d.remindersEnabled : DEFAULTS.remindersEnabled,
    };
  } catch {
    return DEFAULTS;
  }
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id;
  // `loadedFor` records which user these settings belong to, so a write can never land under another user's key.
  const [state, setState] = useState<{ loadedFor: string | undefined; settings: Settings }>(() => ({
    loadedFor: userId,
    settings: load(userId),
  }));
  const [osReduce, setOsReduce] = useState(osPrefersReducedMotion);

  // Reload whenever the signed-in user changes (sign-in, sign-out, account switch).
  useEffect(() => {
    setState(prev => (prev.loadedFor === userId ? prev : { loadedFor: userId, settings: load(userId) }));
  }, [userId]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setOsReduce(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState(prev => {
      // Settings still belong to the previous user (one-render window after a switch): drop the change.
      if (prev.loadedFor !== userId) return prev;
      const next = { ...prev.settings, ...patch };
      // Signed out: keep in memory only, never write under a shared key.
      if (userId) {
        try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* storage unavailable */ }
      }
      return { loadedFor: userId, settings: next };
    });
  }, [userId]);

  const value = useMemo(
    () => ({ settings: state.settings, reduceMotion: state.settings.reduceMotion ?? osReduce, updateSettings }),
    [state.settings, osReduce, updateSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
