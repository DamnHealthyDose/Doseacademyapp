import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import SlickMessage from '@/components/SlickMessage';
import ThemeToggle from '@/components/ThemeToggle';
import logo from '@/assets/dose-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { xp, streak, sessionsCount } = useAppState();

  const stats = [
    { label: 'XP', value: `${xp} XP` },
    { label: 'Sessions', value: `${sessionsCount} Sessions` },
    { label: 'Badges', value: '2 Badges' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-6 flex flex-col items-center">
        {/* Theme toggle */}
        <div className="self-end mb-2">
          <ThemeToggle />
        </div>
        {/* Logo */}
        <motion.img
          src={logo}
          alt="DOSE Academy"
          className="w-20 h-20 mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Headline */}
        <motion.h1
          className="text-2xl font-heading font-extrabold text-foreground text-center tracking-tight mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          Feeling stuck? Let's SPARK it.
        </motion.h1>
        <motion.p
          className="text-text-secondary font-body text-base text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          A 2-minute reset for your ADHD brain
        </motion.p>

        {/* Slick */}
        <SlickMessage message="Hey! I'm Slick. Whenever you're ready, I'll walk you through a quick reset. No pressure." />

        {/* CTA */}
        <motion.button
          onClick={() => navigate('/spark')}
          className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold text-lg rounded-button
                     flex items-center justify-center gap-2 mt-6 teal-glow
                     hover:bg-primary-dark transition-colors duration-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
        >
          Start SPARK <ArrowRight size={18} />
        </motion.button>

        {/* Streak */}
        <motion.div
          className="flex items-center gap-2 mt-6 text-foreground font-heading font-bold text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <span className="animate-streak-pulse inline-block">⚡</span>
          {streak}-day streak
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex gap-3 mt-5 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          {stats.map(s => (
            <div key={s.label} className="flex-1 dose-card flex flex-col items-center py-3">
              <span className="text-foreground font-heading font-bold text-sm">{s.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
