import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plus } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

const WaveComplete = () => {
  const navigate = useNavigate();
  const { waveSession, focusStreak, resetWave } = useAppState();

  const planned = waveSession.plannedDuration * 60;
  const actual = waveSession.actualDuration;
  const ratio = planned > 0 ? actual / planned : 0;
  const ct = waveSession.completionType;

  const headline = ct === 'full'
    ? 'WAVE complete! 🌊'
    : ratio >= 0.5
      ? 'You showed up — that counts.'
      : 'Every wave starts somewhere.';

  const xpEarned = ct === 'full'
    ? (waveSession.distractions.length === 0 ? 35 : 25)
    : ratio >= 0.5 ? 15 : 5;

  const xpLabel = ct === 'early' && ratio < 0.5 ? `+${xpEarned} XP — for trying` : `+${xpEarned} XP`;

  const actualMin = Math.floor(actual / 60);
  const actualSec = actual % 60;

  // Group distractions by type
  const distractionTypes = [...new Set(waveSession.distractions.map(d => d.type))];

  const handleShare = () => {
    const text = `I focused on ${waveSession.task} for ${actualMin}m ${actualSec}s and caught ${waveSession.distractions.length} distractions! — DOSE Academy WAVE`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-[420px] w-full px-6 flex flex-col items-center text-center">
        {/* Animated ring */}
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center mb-6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-4xl">🌊</span>
        </motion.div>

        <motion.h1
          className="text-2xl font-heading font-extrabold text-foreground mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {headline}
        </motion.h1>

        {/* Session summary */}
        <motion.div
          className="dose-card w-full text-left p-5 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between">
              <span className="text-text-secondary">Task</span>
              <span className="text-foreground font-medium">{waveSession.task}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Time focused</span>
              <span className="text-foreground font-medium">{actualMin}m {String(actualSec).padStart(2, '0')}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Distractions caught</span>
              <span className="text-foreground font-medium">{waveSession.distractions.length} caught and logged</span>
            </div>
          </div>
          {distractionTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {distractionTypes.map(t => (
                <span key={t} className="px-2 py-1 rounded-button bg-bg-elevated text-text-secondary text-xs font-body">{t}</span>
              ))}
            </div>
          )}
        </motion.div>

        {/* XP */}
        <motion.div
          className="inline-flex items-center gap-2 bg-success/15 text-success font-heading font-bold text-sm px-4 py-2 rounded-button mb-3"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {xpLabel}
        </motion.div>

        {/* Streak */}
        <motion.p
          className="text-foreground font-heading font-bold text-base mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ⚡ Focus streak: {focusStreak} sessions
        </motion.p>

        {/* Actions */}
        <motion.div className="flex flex-col gap-3 w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <button
            onClick={() => { navigate('/wave/break'); }}
            className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold rounded-button flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
          >
            <Plus size={18} /> Do another WAVE
          </button>
          <button
            onClick={() => { resetWave(); navigate('/'); }}
            className="w-full h-14 border-2 border-primary text-primary font-heading font-bold rounded-button flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
          >
            <Home size={18} /> I'm done for now
          </button>
        </motion.div>

        <button onClick={handleShare} className="mt-4 text-text-hint text-xs font-body hover:text-primary transition-colors">
          Share this session with your coach →
        </button>
      </div>
    </div>
  );
};

export default WaveComplete;
