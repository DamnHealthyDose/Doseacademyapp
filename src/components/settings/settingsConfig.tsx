import type { ComponentType } from 'react';
import {
  User, Timer, Palette, Accessibility, MessageCircle, Bell,
  Mail, LogOut, LogIn, Coffee, Wind, Sun, UserRound, type LucideIcon,
} from 'lucide-react';
import type { TileTone } from './SettingsRow';
import {
  SignOutControl, SignInControl, EmailValue, DisplayNameValue, SessionLengthControl, BreakLengthControl,
  ThemeControl, ReduceMotionControl, ShowSlickControl,
} from './controls';

export type CategoryId = 'account' | 'focus' | 'appearance' | 'accessibility' | 'slick' | 'notifications';

export interface SettingRowConfig {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Extra search terms (matched alongside title, subtitle and category label). */
  keywords?: string[];
  /** Colored tile; other rows get the muted tile. */
  featured?: boolean;
  /** Inline control or read-only value shown on the right. */
  control?: ComponentType;
  /** Opens a detail view (chevron). */
  to?: string;
  /** Not available yet. */
  soon?: boolean;
  /** Overrides while signed out. `control: null` / `to: null` remove the control / link. */
  signedOut?: {
    icon?: LucideIcon;
    title?: string;
    subtitle?: string;
    control?: ComponentType | null;
    to?: string | null;
  };
}

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  tone: TileTone;
  group: 'most-used' | 'more';
  rows: SettingRowConfig[];
}

export const DEFAULT_CATEGORY: CategoryId = 'account';

export const GROUP_LABELS: Record<CategoryConfig['group'], string> = {
  'most-used': 'MOST USED',
  more: 'MORE',
};

export const categoryPath = (id: CategoryId) => `/settings/${id}`;
export const NAME_EDIT_PATH = '/settings/account/name';

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'account',
    label: 'Account & Profile',
    icon: User,
    tone: 'primary',
    group: 'most-used',
    rows: [
      {
        id: 'display-name', icon: UserRound, title: 'Display name', subtitle: 'How we greet you',
        keywords: ['name', 'username', 'profile'], featured: true, to: NAME_EDIT_PATH, control: DisplayNameValue,
        signedOut: { subtitle: 'Sign in to set a name', to: null, control: null },
      },
      { id: 'email', icon: Mail, title: 'Email', subtitle: 'Your sign-in address', control: EmailValue },
      {
        id: 'sign-out', icon: LogOut, title: 'Sign out', subtitle: 'Sign out on this device',
        keywords: ['log out', 'logout'], control: SignOutControl,
        signedOut: { icon: LogIn, title: 'Sign in', subtitle: 'Use your DOSE Academy account', control: SignInControl },
      },
    ],
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: Timer,
    tone: 'squad',
    group: 'most-used',
    rows: [
      {
        id: 'session-length', icon: Timer, title: 'Default session length', subtitle: 'Pre-selected in WAVE setup',
        keywords: ['timer', 'wave', 'minutes', 'pomodoro'], featured: true, control: SessionLengthControl,
      },
      {
        id: 'break-length', icon: Coffee, title: 'Break length', subtitle: 'How long your WAVE break lasts',
        keywords: ['timer', 'wave', 'minutes', 'pomodoro'], control: BreakLengthControl,
      },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    tone: 'rsd',
    group: 'most-used',
    rows: [
      {
        id: 'theme', icon: Sun, title: 'Theme', subtitle: 'Auto follows your device',
        keywords: ['dark', 'light', 'mode', 'color'], featured: true, control: ThemeControl,
      },
    ],
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: Accessibility,
    tone: 'success',
    group: 'more',
    rows: [
      {
        id: 'reduce-motion', icon: Wind, title: 'Reduce motion',
        subtitle: 'Fewer animations. Breathing exercises keep their animation.',
        keywords: ['animation', 'motion', 'accessibility'], featured: true, control: ReduceMotionControl,
      },
    ],
  },
  {
    id: 'slick',
    label: 'Slick',
    icon: MessageCircle,
    tone: 'primary',
    group: 'more',
    rows: [
      {
        id: 'show-slick', icon: MessageCircle, title: 'Show Slick', subtitle: 'The chat bubble in the corner',
        keywords: ['chat', 'mascot', 'assistant', 'bubble'], featured: true, control: ShowSlickControl,
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    tone: 'squad',
    group: 'more',
    rows: [
      // TODO: no notification backend yet. The preference (settings.remindersEnabled) is kept in
      // SettingsContext, but no switch is shown until reminders exist.
      {
        id: 'study-reminders', icon: Bell, title: 'Study reminders', subtitle: 'Gentle nudges to study',
        keywords: ['notifications', 'reminders', 'alerts'], soon: true,
      },
    ],
  },
];

export const isCategoryId = (v: string | undefined): v is CategoryId => CATEGORIES.some((c) => c.id === v);

export const findCategory = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

/**
 * Rows across ALL categories matching the query. Every word of the query must appear somewhere in
 * the row's title, subtitle, keywords or category label (so "dark mode" works).
 */
export const searchRows = (query: string) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return CATEGORIES.flatMap((category) =>
    category.rows
      .filter((row) => {
        const haystack = [row.title, row.subtitle, ...(row.keywords ?? []), category.label].join(' ').toLowerCase();
        return terms.every((t) => haystack.includes(t));
      })
      .map((row) => ({ category, row })),
  );
};
