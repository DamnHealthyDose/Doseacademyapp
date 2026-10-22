import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS, isNavActive } from '@/lib/navItems';

const items = NAV_ITEMS.filter((i) => !i.hideOnPhone);

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

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
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-button mb-1 transition-all duration-200 font-heading font-bold text-sm
                    ${item.tone === 'rsd'
                      ? (isNavActive(item, pathname) ? 'bg-rsd-accent/15 text-rsd-accent-text' : 'text-foreground hover:bg-rsd-accent/10 hover:text-rsd-accent-text')
                      : (isNavActive(item, pathname) ? 'bg-primary/5 text-primary-strong' : 'text-foreground hover:bg-primary/5 hover:text-primary-strong')
                    }`}
                >
                  <item.icon size={20} className={item.tone === 'rsd' && isNavActive(item, pathname) ? 'text-rsd-accent' : ''} />
                  <span>{item.label}</span>
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
