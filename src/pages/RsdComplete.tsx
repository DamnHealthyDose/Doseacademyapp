import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppState } from '@/context/AppContext';
import { affirmations } from '@/lib/rsdContent';
import BottomNav from '@/components/BottomNav';

const RsdComplete = () => {
  const navigate = useNavigate();
  const { rsdSession } = useAppState();

  const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

  const scenarioLabels: Record<string, string> = {
    left_out: 'Left out of plans',
    ignored: 'Read and ignored',
    awkward: 'Something awkward happened',
    hurtful: 'Said or heard something hurtful',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-16 flex flex-col items-center">
        {/* Pulsing circle */}
        <motion.div
          className="w-20 h-20 rounded-full bg-rsd-calm/20 border-2 border-rsd-calm/40 flex items-center justify-center mb-8"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-3xl">💜</span>
        </motion.div>

        <motion.h1
          className="text-2xl font-heading font-extrabold text-foreground text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          You got through it.
        </motion.h1>

        <motion.p
          className="text-text-secondary text-sm font-body text-center mt-3 leading-relaxed max-w-[340px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          RSD makes rejection feel permanent and huge. It isn't. You just proved that by making it to the other side.
        </motion.p>

        {/* Summary card */}
        <motion.div
          className="w-full dose-card p-4 mt-8 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-between">
            <span className="text-text-secondary text-xs font-body">What happened</span>
            <span className="text-foreground text-xs font-body font-medium">{scenarioLabels[rsdSession.scenario] || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary text-xs font-body">Intensity when you started</span>
            <span className="text-foreground text-xs font-body font-medium">{rsdSession.intensity || '—'}/5</span>
          </div>
          <div className="border-t border-border pt-3">
            <span className="text-text-secondary text-xs font-body block mb-1">Reframe you chose</span>
            <span className="text-foreground text-xs font-body">{rsdSession.reframeChosen || '—'}</span>
          </div>
          <div className="border-t border-border pt-3">
            <span className="text-text-secondary text-xs font-body block mb-1">Move you picked</span>
            <span className="text-foreground text-xs font-body">{rsdSession.actionChosen || '—'}</span>
          </div>
        </motion.div>

        {/* XP pill */}
        <motion.div
          className="mt-4 px-4 py-1.5 bg-success/20 text-success font-heading font-bold text-sm rounded-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          +{rsdSession.usedBreathe ? 20 : 15} XP
        </motion.div>

        {/* Affirmation */}
        <motion.p
          className="text-rsd-calm text-sm font-body text-center mt-6 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          "{randomAffirmation}"
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="w-full mt-8 flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <button
            onClick={() => navigate('/')}
            className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold rounded-button"
          >
            Back home
          </button>
          <button
            onClick={() => navigate('/rsd')}
            className="w-full h-12 border-2 border-border text-foreground font-heading font-bold rounded-button hover:border-rsd-calm transition-colors"
          >
            Do it again
          </button>
        </motion.div>

        {/* Safety footer */}
        <p className="text-text-hint text-[11px] font-body text-center mt-8 max-w-[320px]">
          If the sting is still very intense, it's okay to ask for help. That's strength, not weakness.
        </p>
      </div>
      <BottomNav />
    </div>
  );
};

export default RsdComplete;
