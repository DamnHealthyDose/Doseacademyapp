import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

const allBadges = [
  { id: 'first-spark', emoji: '⚡', name: 'First Spark', description: 'Completed your first session' },
  { id: 'steady', emoji: '🔥', name: 'Steady', description: '5-day streak' },
  { id: 'reframe-pro', emoji: '🧠', name: 'Reframe Pro', description: 'Used 10 reframes' },
  { id: 'shared-it', emoji: '💬', name: 'Shared It', description: 'Shared a session with your coach' },
];

const BadgesPage = () => {
  const { badges } = useAppState();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-10">
        <h1 className="text-2xl font-heading font-extrabold text-foreground mb-6">My Badges</h1>
        <div className="grid grid-cols-2 gap-3">
          {allBadges.map((badge, i) => {
            const earned = badges.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                className={`dose-card flex flex-col items-center py-6 relative ${!earned ? 'opacity-40' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: earned ? 1 : 0.4, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {!earned && (
                  <div className="absolute top-3 right-3 text-text-hint">
                    <Lock size={14} />
                  </div>
                )}
                <span className="text-3xl mb-2">{badge.emoji}</span>
                <span className="text-foreground font-heading font-bold text-sm">{badge.name}</span>
                <span className="text-text-secondary text-xs font-body text-center mt-1 px-2">{badge.description}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default BadgesPage;
