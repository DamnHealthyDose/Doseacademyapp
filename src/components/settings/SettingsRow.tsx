import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TileTone = 'primary' | 'rsd' | 'squad' | 'success' | 'muted';

const TILE_TONES: Record<TileTone, string> = {
  primary: 'bg-primary/10 text-primary-strong',
  rsd: 'bg-rsd-accent/15 text-rsd-accent-text',
  squad: 'bg-squad-glow/15 text-squad-glow',
  success: 'bg-success/15 text-success',
  muted: 'bg-bg-elevated text-text-secondary',
};

export const IconTile = ({ icon: Icon, tone, small = false }: { icon: LucideIcon; tone: TileTone; small?: boolean }) => (
  <span
    aria-hidden="true"
    className={cn('flex shrink-0 items-center justify-center rounded-xl', small ? 'h-8 w-8' : 'h-10 w-10', TILE_TONES[tone])}
  >
    <Icon size={small ? 16 : 20} />
  </span>
);

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-tool-accent';
const rowBase = 'flex items-center gap-3 px-4 py-3.5';

interface SettingsRowProps {
  icon: LucideIcon;
  tone: TileTone;
  title: string;
  subtitle: string;
  /** Shown above the title in search results. */
  category?: string;
  /** Row opens a detail view (renders a link with a chevron). */
  to?: string;
  /** Row isn't available yet: dimmed, not clickable, "Coming Soon" pill. */
  soon?: boolean;
  /** Inline control (switch, segmented toggle, button) or a read-only value. */
  children?: ReactNode;
}

/** Card that holds a list of rows separated by thin dividers. */
export const SettingsCard = ({ children }: { children: ReactNode }) => (
  <div className="overflow-hidden rounded-card border border-border bg-bg-card divide-y divide-border">{children}</div>
);

export const SettingsRow = ({ icon, tone, title, subtitle, category, to, soon, children }: SettingsRowProps) => {
  const text = (
    <>
      <IconTile icon={icon} tone={soon ? 'muted' : tone} />
      <div className="min-w-0 flex-1 basis-40">
        {category && (
          <p className="text-text-hint font-body text-[11px] font-medium uppercase tracking-wider">{category}</p>
        )}
        <p className="text-foreground font-heading font-bold text-sm">{title}</p>
        <p className="text-text-secondary font-body text-xs">{subtitle}</p>
      </div>
    </>
  );

  if (soon) {
    return (
      <div aria-disabled="true" className={cn(rowBase, 'opacity-60')}>
        {text}
        <span className="shrink-0 rounded-full bg-bg-elevated px-2.5 py-1 text-text-secondary font-body text-xs font-medium">
          Coming Soon
        </span>
      </div>
    );
  }

  if (to) {
    return (
      <Link to={to} className={cn(rowBase, 'transition-colors hover:bg-primary/5', focusRing)}>
        {text}
        {children}
        <ChevronRight size={18} className="shrink-0 text-text-secondary" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className={cn(rowBase, 'flex-wrap')}>
      {text}
      {children}
    </div>
  );
};
