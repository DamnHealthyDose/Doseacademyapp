import { Link, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { NAV_ITEMS, isNavActive } from '@/lib/navItems';
import { useSignOut } from '@/hooks/useSignOut';
import ThemeToggle from './ThemeToggle';
import WhatsDoseButton from './WhatsDoseButton';
import logo from '@/assets/dose-logo.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tool-accent';

const rsdFocusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rsd-accent';

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { pathname } = useLocation();
  const handleSignOut = useSignOut();

  return (
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-bg-card border-r border-border
        ${collapsed ? 'w-[72px]' : 'w-60'}`}
    >
      <Link
        to="/"
        aria-label="DOSE Academy home"
        className={`flex items-center gap-3 h-20 px-4 rounded-button ${collapsed ? 'justify-center' : ''} ${focusRing}`}
      >
        <img src={logo} alt="" className="w-10 h-10 shrink-0" />
        {!collapsed && <span className="font-heading font-extrabold text-foreground text-lg tracking-tight">DOSE Academy</span>}
      </Link>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 min-h-12 px-3 rounded-button font-heading font-bold text-sm transition-colors
                ${collapsed ? 'justify-center' : ''}
                ${item.tone === 'rsd'
                  ? (active ? 'bg-rsd-accent/15 text-rsd-accent-text' : 'text-foreground hover:bg-rsd-accent/10 hover:text-rsd-accent-text')
                  : (active ? 'bg-primary/10 text-primary-strong' : 'text-foreground hover:bg-primary/5 hover:text-primary-strong')}
                ${item.tone === 'rsd' ? rsdFocusRing : focusRing}`}
            >
              <Icon size={20} className={`shrink-0 ${item.tone === 'rsd' && active ? 'text-rsd-accent' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-border p-3 flex flex-col gap-3 ${collapsed ? 'items-center' : 'items-stretch'}`}>
        <WhatsDoseButton
          iconOnly={collapsed}
          className={`flex items-center justify-center gap-1.5 min-h-10 rounded-full bg-primary/5 border border-primary/30 text-primary-strong font-heading font-bold text-xs hover:bg-primary/10 transition-colors ${collapsed ? 'w-10' : 'px-3'} ${focusRing}`}
        />
        <ThemeToggle iconOnly={collapsed} />
        <button
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center gap-2 min-h-10 rounded-button text-text-secondary hover:text-foreground hover:bg-primary/5 text-xs font-body font-medium transition-colors ${collapsed ? 'justify-center w-10' : 'px-3'} ${focusRing}`}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={18} /> Collapse</>}
        </button>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className={`flex items-center gap-2 min-h-10 rounded-button text-text-secondary hover:text-foreground hover:bg-primary/5 text-xs font-body font-medium transition-colors ${collapsed ? 'justify-center w-10' : 'px-3'} ${focusRing}`}
        >
          {collapsed ? <LogOut size={18} /> : <><LogOut size={18} /> Sign out</>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
