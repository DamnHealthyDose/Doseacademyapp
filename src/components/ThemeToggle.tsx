import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = ({ iconOnly = false }: { iconOnly?: boolean }) => {
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
      className={`flex items-center justify-center gap-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-body font-medium transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tool-accent ${
        iconOnly ? 'w-10 h-10' : 'px-3 py-1.5'
      }`}
      aria-label={`Theme: ${label}`}
      title={iconOnly ? `Theme: ${label}` : undefined}
    >
      <Icon size={iconOnly ? 16 : 14} />
      {!iconOnly && label}
    </button>
  );
};

export default ThemeToggle;
