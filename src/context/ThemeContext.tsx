import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('dose-theme') as Theme | null;
    return saved ?? 'system';
  });

  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    theme === 'system' ? getSystemTheme() : theme
  );

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      const r = theme === 'system' ? getSystemTheme() : theme;
      setResolved(r);
      root.classList.toggle('dark', r === 'dark');
    };

    apply();

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (theme === 'system') apply(); };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('dose-theme', t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
