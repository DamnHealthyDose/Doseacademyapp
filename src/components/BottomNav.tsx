import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Waves, Heart, Award } from 'lucide-react';

const BottomNav = () => {
  const { pathname } = useLocation();

  const items = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/spark', icon: Zap, label: 'SPARK' },
    { to: '/wave/setup', icon: Waves, label: 'WAVE' },
    { to: '/rsd', icon: Heart, label: 'RSD' },
    { to: '/badges', icon: Award, label: 'Badges' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card border-t border-border">
      <div className="max-w-[480px] mx-auto flex items-center justify-around h-16">
        {items.map(({ to, icon: Icon, label }) => {
          const active = pathname === to ||
            (to === '/spark' && pathname.startsWith('/spark')) ||
            (to === '/wave/setup' && pathname.startsWith('/wave')) ||
            (to === '/rsd' && pathname.startsWith('/rsd'));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-button transition-all duration-200
                ${active ? 'text-primary' : 'text-text-hint hover:text-text-secondary'}`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-body font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
