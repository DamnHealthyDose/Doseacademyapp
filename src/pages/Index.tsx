import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Play, X } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import SlickMessage from '@/components/SlickMessage';
import ThemeToggle from '@/components/ThemeToggle';
import logo from '@/assets/dose-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const [videoVersion, setVideoVersion] = useState<'narrated' | 'music'>('narrated');
  const { xp, streak, sessionsCount, sessionsToday, minutesToday, hasActiveSession, waveSession } = useAppState();

  const stats = [
    { label: 'Sessions', value: `🔥 ${sessionsToday} Today` },
    { label: 'Minutes', value: `⏱ ${minutesToday} min` },
    { label: 'Streak', value: `⚡ ${streak}-day` },
  ];

  const isReturning = sessionsCount > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-6 flex flex-col items-center">
        {/* Top row: Watch intro + Theme toggle */}
        <div className="w-full flex items-center justify-between mb-2">
          <motion.button
            onClick={() => setShowVideo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-heading font-bold text-xs hover:bg-primary/20 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={12} className="fill-current" /> What's DOSE?
          </motion.button>
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
            <span className="step-label text-[10px]">PICK UP WHERE YOU LEFT OFF</span>
            <p className="text-foreground font-heading font-bold text-sm mt-1">{waveSession.task}</p>
            <button
              onClick={() => navigate('/wave/session')}
              className="mt-2 text-primary text-sm font-heading font-bold flex items-center gap-1 hover:underline"
            >
              Resume <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* CTAs */}
        <div className="flex gap-3 mt-6 w-full">
          <motion.button
            onClick={() => navigate('/spark')}
            className="flex-1 h-14 bg-bg-card border-2 border-primary text-primary font-heading font-bold text-sm rounded-button
                       flex items-center justify-center gap-1 hover:bg-primary/10 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            ⚡ SPARK
          </motion.button>
          <motion.button
            onClick={() => navigate('/wave/setup')}
            className="flex-1 h-14 bg-primary text-primary-foreground font-heading font-bold text-sm rounded-button
                       flex items-center justify-center gap-1 teal-glow hover:bg-primary-dark transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            🌊 WAVE
          </motion.button>
          <motion.button
            onClick={() => navigate('/rsd')}
            className="flex-1 h-14 bg-bg-card border-2 border-rsd-warm text-rsd-warm font-heading font-bold text-sm rounded-button
                       flex items-center justify-center gap-1 hover:bg-rsd-warm/10 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            💜 RSD
          </motion.button>
          <motion.button
            onClick={() => navigate('/squad')}
            className="flex-1 h-14 bg-bg-card border-2 border-squad text-squad font-heading font-bold text-sm rounded-button
                       flex items-center justify-center gap-1 hover:bg-squad/10 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            👥 Squad
          </motion.button>
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
          <h3 className="text-text-secondary text-xs font-body font-medium uppercase tracking-wider mb-2">Recent Sessions</h3>
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

        {/* Footer */}
        <div className="w-full mt-6 mb-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground font-body">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} DOSE Academy</span>
        </div>
      </div>
      {/* Video modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-black shadow-2xl"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={16} />
              </button>
              {/* Version toggle */}
              <div className="flex bg-black/80 border-b border-white/10">
                <button
                  onClick={() => setVideoVersion('narrated')}
                  className={`flex-1 py-2.5 text-xs font-heading font-bold transition-colors ${
                    videoVersion === 'narrated'
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  🎙 Narrated
                </button>
                <button
                  onClick={() => setVideoVersion('music')}
                  className={`flex-1 py-2.5 text-xs font-heading font-bold transition-colors ${
                    videoVersion === 'music'
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  🎵 Music Only
                </button>
              </div>
              <video
                key={videoVersion}
                src={videoVersion === 'narrated' ? '/dose-onboarding-narrated.mp4' : '/dose-onboarding-music.mp4'}
                controls
                autoPlay
                className="w-full"
                style={{ aspectRatio: '16/9' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
};

export default Index;
