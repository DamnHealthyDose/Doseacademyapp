export interface Tool {
  id: 'spark' | 'wave' | 'rsd' | 'squad';
  label: string;
  description: string;
  route: string;
  /** Colored emoji icon, shared by the mobile buttons and desktop cards. Decorative: always sits next to the label. */
  icon: string;
}

export const TOOLS: Tool[] = [
  { id: 'spark', label: 'SPARK', description: 'Work through your emotions', route: '/spark', icon: '⚡' },
  { id: 'wave', label: 'WAVE', description: 'Get into focus', route: '/wave/setup', icon: '🌊' },
  { id: 'rsd', label: 'RSD', description: 'Ease rejection feelings', route: '/rsd', icon: '💜' },
  { id: 'squad', label: 'Squad', description: 'Study together', route: '/squad', icon: '👥' },
];
