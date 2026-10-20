import { Home, Zap, Waves, Heart, Users, Award, Flame, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  /** Path prefix that counts as "inside" this section (defaults to exact match on `to`). */
  match?: string;
  /** Hidden from the <768px hamburger menu (kept as it was before the desktop layout). */
  hideOnPhone?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/spark', icon: Zap, label: 'SPARK', match: '/spark' },
  { to: '/wave/setup', icon: Waves, label: 'WAVE', match: '/wave' },
  { to: '/rsd', icon: Heart, label: 'RSD', match: '/rsd' },
  { to: '/squad', icon: Users, label: 'Squad', match: '/squad' },
  { to: '/ignite', icon: Flame, label: 'IGNITE', match: '/ignite', hideOnPhone: true },
  { to: '/badges', icon: Award, label: 'Badges' },
];

export const isNavActive = (item: NavItem, pathname: string) =>
  pathname === item.to || (!!item.match && pathname.startsWith(item.match));
