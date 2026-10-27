import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useSignOut';
import { useTheme } from '@/context/ThemeContext';
import { useSettings, SESSION_LENGTHS, BREAK_LENGTHS, type Settings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Fixed id so rapid toggling shows one toast instead of a stack.
const notifySaved = () => toast.success('Settings saved', { id: 'settings-saved' });

interface SegmentedControlProps<T extends string | number> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** ToggleGroup that never allows "no selection". */
const SegmentedControl = <T extends string | number>({ label, value, options, onChange }: SegmentedControlProps<T>) => (
  <ToggleGroup
    type="single"
    variant="outline"
    value={String(value)}
    onValueChange={(v) => {
      const next = options.find((o) => String(o.value) === v);
      if (next) onChange(next.value);
    }}
    aria-label={label}
  >
    {options.map((o) => (
      <ToggleGroupItem key={String(o.value)} value={String(o.value)} className="min-h-10 px-3">{o.label}</ToggleGroupItem>
    ))}
  </ToggleGroup>
);

const THEME_OPTIONS = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

export const ThemeControl = () => {
  const { theme, setTheme } = useTheme();
  return (
    <SegmentedControl
      label="Theme"
      value={theme}
      options={THEME_OPTIONS}
      onChange={(v) => { setTheme(v); notifySaved(); }}
    />
  );
};

const SESSION_OPTIONS = SESSION_LENGTHS.map((m) => ({ value: m, label: `${m} min` }));
const BREAK_OPTIONS = BREAK_LENGTHS.map((m) => ({ value: m, label: `${m} min` }));

export const SessionLengthControl = () => {
  const { settings, updateSettings } = useSettings();
  return (
    <SegmentedControl
      label="Default session length"
      value={settings.defaultSessionMinutes}
      options={SESSION_OPTIONS}
      onChange={(v) => { updateSettings({ defaultSessionMinutes: v as Settings['defaultSessionMinutes'] }); notifySaved(); }}
    />
  );
};

export const BreakLengthControl = () => {
  const { settings, updateSettings } = useSettings();
  return (
    <SegmentedControl
      label="Break length"
      value={settings.defaultBreakMinutes}
      options={BREAK_OPTIONS}
      onChange={(v) => { updateSettings({ defaultBreakMinutes: v as Settings['defaultBreakMinutes'] }); notifySaved(); }}
    />
  );
};

export const ReduceMotionControl = () => {
  const { reduceMotion, updateSettings } = useSettings();
  return (
    <Switch
      aria-label="Reduce motion"
      checked={reduceMotion}
      onCheckedChange={(v) => { updateSettings({ reduceMotion: v }); notifySaved(); }}
    />
  );
};

export const ShowSlickControl = () => {
  const { settings, updateSettings } = useSettings();
  return (
    <Switch
      aria-label="Show Slick"
      checked={settings.showSlick}
      onCheckedChange={(v) => { updateSettings({ showSlick: v }); notifySaved(); }}
    />
  );
};

export const SignOutControl = () => {
  const handleSignOut = useSignOut();
  return (
    <Button variant="outline" onClick={handleSignOut} className="min-h-10">
      <LogOut size={16} /> Sign out
    </Button>
  );
};

/** Shown instead of Sign out when nobody is signed in. Returns to the current settings page afterward. */
export const SignInControl = () => {
  const { pathname } = useLocation();
  return (
    <Button asChild variant="outline" className="min-h-10">
      <Link to={`/auth?redirect=${encodeURIComponent(pathname)}`}><LogIn size={16} /> Sign in</Link>
    </Button>
  );
};

/** Read-only value shown on the right of a row. */
export const ValueText = ({ children }: { children: string }) => (
  <span className="max-w-[45%] truncate text-text-secondary font-body text-sm">{children}</span>
);

export const EmailValue = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <ValueText>{user?.email ?? 'Not signed in'}</ValueText>;
};

export const DisplayNameValue = () => {
  const { profile } = useAuth();
  return <ValueText>{profile?.display_name || 'Not set'}</ValueText>;
};
