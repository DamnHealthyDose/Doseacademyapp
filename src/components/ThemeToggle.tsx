import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
  };

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = theme === 'system' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark';

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-body font-medium transition-colors hover:bg-accent"
      aria-label={`Theme: ${label}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
};

export default ThemeToggle;
