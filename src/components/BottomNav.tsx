import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { NAV_ITEMS, isNavActive } from '@/lib/navItems';
import { useSignOut } from '@/hooks/useSignOut';
import MobileMenu from './MobileMenu';

const BottomNav = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const handleSignOut = useSignOut();

  // On small screens, show hamburger menu instead of bottom tab bar
  if (isMobile) {
    return <MobileMenu />;
  }

  // Hidden at >=1024px, where the sidebar (AppShell) takes over
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-border">
      <div className="max-w-[540px] mx-auto flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const { to, icon: Icon, label } = item;
          const active = isNavActive(item, pathname);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-1.5 py-2 rounded-button transition-all duration-200
                ${active ? (item.tone === 'rsd' ? 'text-rsd-accent-text' : 'text-tool-accent') : 'text-text-secondary hover:text-foreground'}`}
            >
              <Icon size={18} className={item.tone === 'rsd' && active ? 'text-rsd-accent' : ''} />
              <span className="text-xs font-body font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="flex flex-col items-center gap-1 px-1.5 py-2 rounded-button transition-all duration-200 text-text-secondary hover:text-foreground"
        >
          <LogOut size={18} />
          <span className="text-xs font-body font-medium">Sign out</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
