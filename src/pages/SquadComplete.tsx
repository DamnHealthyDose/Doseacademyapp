import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppState } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

const SquadComplete = () => {
  const navigate = useNavigate();
  const { squadSession, xp, squadStreak } = useAppState();

  const ratio = squadSession.plannedDuration > 0
    ? squadSession.actualDuration / (squadSession.plannedDuration * 60)
    : 0;

  const isFull = ratio >= 0.95;
  const isPartial = ratio >= 0.5;
  const isInvite = squadSession.mode === 'invite';

  const headline = isFull && isInvite
    ? 'Squad goals. Both of you showed up.'
    : isFull
    ? 'You focused. The squad saw it.'
    : 'Partial focus still counts. You started.';

  const earnedXp = isFull ? (isInvite ? 30 : 25) : isPartial ? 15 : 5;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-12 flex flex-col items-center">
        {/* Animated icon */}
        <motion.div
          className="w-20 h-20 rounded-full bg-squad/20 flex items-center justify-center mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-4xl">👥</span>
        </motion.div>

        <motion.h1 className="text-xl font-heading font-extrabold text-foreground text-center mb-2"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {headline}
        </motion.h1>

        {/* Session summary */}
        <motion.div className="w-full dose-card p-4 mt-4 space-y-2"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm font-body">Task</span>
            <span className="text-foreground text-sm font-heading font-bold">{squadSession.task}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm font-body">Time focused</span>
            <span className="text-foreground text-sm font-heading font-bold">
              {Math.floor(squadSession.actualDuration / 60)}m {squadSession.actualDuration % 60}s
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm font-body">Squad mode</span>
            <span className="text-foreground text-sm font-heading font-bold">
              {isInvite ? 'Studied with a friend' : 'Ambient squad'}
            </span>
          </div>
          {squadSession.checkinCompletion && (
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm font-body">Completion</span>
              <span className="text-foreground text-sm font-heading font-bold">{squadSession.checkinCompletion}</span>
            </div>
          )}
          {squadSession.checkinFeeling && (
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm font-body">Feeling</span>
              <span className="text-foreground text-sm font-heading font-bold">{squadSession.checkinFeeling}</span>
            </div>
          )}
        </motion.div>

        {/* XP */}
        <motion.div className="mt-4 bg-success/20 text-success font-heading font-bold text-sm px-4 py-2 rounded-button"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          +{earnedXp} XP
        </motion.div>

        {/* Streak */}
        <motion.p className="text-text-secondary text-sm font-body mt-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          ⚡ Squad streak: {squadStreak} sessions
        </motion.p>

        {/* Actions */}
        <div className="w-full mt-6 space-y-3">
          <motion.button
            onClick={() => navigate('/squad/setup')}
            className="w-full h-14 bg-squad text-primary-foreground font-heading font-bold rounded-button"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            Do another session +
          </motion.button>
          <motion.button
            onClick={() => navigate('/')}
            className="w-full h-14 border-2 border-border text-foreground font-heading font-bold rounded-button hover:bg-bg-elevated transition-colors"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          >
            I'm done for now
          </motion.button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SquadComplete;
