import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Waves, Heart, Users, Award, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const items = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/spark', icon: Zap, label: 'SPARK' },
  { to: '/wave/setup', icon: Waves, label: 'WAVE' },
  { to: '/rsd', icon: Heart, label: 'RSD' },
  { to: '/squad', icon: Users, label: 'Squad' },
  { to: '/badges', icon: Award, label: 'Badges' },
];

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    pathname === to ||
    (to === '/spark' && pathname.startsWith('/spark')) ||
    (to === '/wave/setup' && pathname.startsWith('/wave')) ||
    (to === '/rsd' && pathname.startsWith('/rsd')) ||
    (to === '/squad' && pathname.startsWith('/squad'));

  return (
    <>
      {/* Floating hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay + menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="fixed top-0 right-0 z-[58] h-full w-64 bg-bg-card border-l border-border shadow-2xl flex flex-col pt-16 px-4"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              {items.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-button mb-1 transition-all duration-200 font-heading font-bold text-sm
                    ${isActive(to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-primary/5 hover:text-primary'
                    }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
