import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Flame } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import SlickMessage from '@/components/SlickMessage';
import ThemeToggle from '@/components/ThemeToggle';
import WhatsDoseButton from '@/components/WhatsDoseButton';
import HomeDashboard from '@/components/HomeDashboard';
import { TOOLS } from '@/lib/tools';
import logo from '@/assets/dose-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const { xp, streak, sessionsCount, sessionsToday, minutesToday, hasActiveSession, waveSession } = useAppState();

  const stats = [
    { label: 'Sessions', value: `🔥 ${sessionsToday} Today` },
    { label: 'Minutes', value: `⏱ ${minutesToday} min` },
    { label: 'Streak', value: `⚡ ${streak}-day` },
  ];

  const isReturning = sessionsCount > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-6 flex flex-col items-center md:hidden">
        {/* Top row: Watch intro + Theme toggle */}
        <div className="w-full flex items-center justify-between mb-2">
          <WhatsDoseButton
            animated
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/30 text-primary-strong font-heading font-bold text-xs hover:bg-primary/10 transition-colors"
          />
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
          {isReturning ? 'Welcome back!' : 'Ready to ride the WAVE?'}
        </motion.h1>
        <motion.p
          className="text-text-secondary font-body text-base text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          Your ADHD-friendly focus toolkit
        </motion.p>

        {/* Slick */}
        <SlickMessage message="Hey! I'm Slick. Pick a tool — SPARK for emotions, WAVE for focus, RSD for rejection, Squad for studying together." />

        {/* Active session resume card */}
        {hasActiveSession && (
          <motion.div
            className="w-full dose-card p-4 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="step-label text-xs">PICK UP WHERE YOU LEFT OFF</span>
            <p className="text-foreground font-heading font-bold text-sm mt-1">{waveSession.task}</p>
            <button
              onClick={() => navigate('/wave/session')}
              className="mt-2 text-primary-strong text-sm font-heading font-bold flex items-center gap-1 hover:underline"
            >
              Resume <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* CTAs */}
        <div className="flex gap-3 mt-6 w-full">
          {TOOLS.map((tool, i) => (
            <motion.button
              key={tool.id}
              onClick={() => navigate(tool.route)}
              className="tool-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
            >
              {tool.icon} {tool.label}
            </motion.button>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          className="flex gap-3 mt-5 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          {stats.map(s => (
            <div key={s.label} className="flex-1 dose-card flex flex-col items-center py-3">
              <span className="text-foreground font-heading font-bold text-xs">{s.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          className="w-full mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <h2 className="text-text-secondary text-xs font-body font-medium uppercase tracking-wider mb-2">Recent Sessions</h2>
          {['English essay draft · 25 min', 'Science reading · 15 min', 'Math problems · 25 min'].map(s => (
            <div key={s} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-foreground text-sm font-body">{s}</span>
              <Check size={14} className="text-success" />
            </div>
          ))}
        </motion.div>

        {/* XP bar */}
        <motion.div
          className="w-full mt-4 dose-card p-3 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          <span className="text-foreground font-heading font-bold text-sm">{xp} XP</span>
          <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min((xp % 100), 100)}%` }} />
          </div>
        </motion.div>

        {/* IGNITE CTA */}
        <motion.div
          className="w-full mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => navigate('/ignite')}
            className="w-full dose-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame size={20} className="text-primary-strong" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-foreground font-heading font-bold text-sm block">IGNITE</span>
              <span className="text-muted-foreground font-body text-xs">Break any task into your first move</span>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary-strong transition-colors" />
          </button>
        </motion.div>

        {/* Footer */}
        <div className="w-full mt-6 mb-2 flex items-center justify-center gap-3 text-xs text-muted-foreground font-body">
          <Link to="/privacy" className="hover:text-primary-strong transition-colors">Privacy Policy</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} DOSE Academy</span>
        </div>
      </div>
      <HomeDashboard />
      <BottomNav />
    </div>
  );
};

export default Index;
