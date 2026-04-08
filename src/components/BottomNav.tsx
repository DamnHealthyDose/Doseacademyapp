import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Waves, Heart, Users, Award, Flame } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileMenu from './MobileMenu';

const BottomNav = () => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const items = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/spark', icon: Zap, label: 'SPARK' },
    { to: '/wave/setup', icon: Waves, label: 'WAVE' },
    { to: '/rsd', icon: Heart, label: 'RSD' },
    { to: '/squad', icon: Users, label: 'Squad' },
    { to: '/ignite', icon: Flame, label: 'IGNITE' },
    { to: '/badges', icon: Award, label: 'Badges' },
  ];

  // On small screens, show hamburger menu instead of bottom tab bar
  if (isMobile) {
    return <MobileMenu />;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-border">
      <div className="max-w-[480px] mx-auto flex items-center justify-around h-16">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to ||
            (to === '/spark' && pathname.startsWith('/spark')) ||
            (to === '/wave/setup' && pathname.startsWith('/wave')) ||
            (to === '/rsd' && pathname.startsWith('/rsd')) ||
            (to === '/squad' && pathname.startsWith('/squad'));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-button transition-all duration-200
                ${active ? 'text-primary' : 'text-text-hint hover:text-text-secondary'}`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-body font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
