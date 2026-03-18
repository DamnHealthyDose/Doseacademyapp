import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

const sparkBadges = [
  { id: 'first-spark', emoji: '⚡', name: 'First Spark', description: 'Completed your first session' },
  { id: 'steady', emoji: '🔥', name: 'Steady', description: '5-day streak' },
  { id: 'reframe-pro', emoji: '🧠', name: 'Reframe Pro', description: 'Used 10 reframes' },
  { id: 'shared-it', emoji: '💬', name: 'Shared It', description: 'Shared a session with your coach' },
];

const waveBadges = [
  { id: 'first-wave', emoji: '🌊', name: 'First Wave', description: 'Complete first focus session' },
  { id: 'zero-distract', emoji: '🎯', name: 'Locked-in', description: 'Full session, 0 distractions' },
  { id: 'wave-streak', emoji: '🔥', name: 'Focus Streak', description: '5 sessions in a row' },
  { id: 'deep-diver', emoji: '🧠', name: 'Deep Diver', description: 'Complete a 45-min session' },
];

const BadgesPage = () => {
  const { badges } = useAppState();

  const renderBadge = (badge: typeof sparkBadges[0], i: number) => {
    const earned = badges.includes(badge.id);
    return (
      <motion.div
        key={badge.id}
        className={`dose-card flex flex-col items-center py-6 relative ${!earned ? 'opacity-40' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: earned ? 1 : 0.4, y: 0 }}
        transition={{ delay: i * 0.08 }}
      >
        {!earned && (
          <div className="absolute top-3 right-3 text-text-hint">
            <Lock size={14} />
          </div>
        )}
        {earned && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-heading font-bold bg-success/20 text-success px-2 py-0.5 rounded-button">Earned!</span>
          </div>
        )}
        <span className="text-3xl mb-2">{badge.emoji}</span>
        <span className="text-foreground font-heading font-bold text-sm">{badge.name}</span>
        <span className="text-text-secondary text-xs font-body text-center mt-1 px-2">{badge.description}</span>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-10">
        <h1 className="text-2xl font-heading font-extrabold text-foreground mb-6">My Badges</h1>

        <h2 className="text-text-secondary text-xs font-body font-medium uppercase tracking-wider mb-3">SPARK Badges</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {sparkBadges.map((b, i) => renderBadge(b, i))}
        </div>

        <h2 className="text-text-secondary text-xs font-body font-medium uppercase tracking-wider mb-3">WAVE Badges</h2>
        <div className="grid grid-cols-2 gap-3">
          {waveBadges.map((b, i) => renderBadge(b, i))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default BadgesPage;
