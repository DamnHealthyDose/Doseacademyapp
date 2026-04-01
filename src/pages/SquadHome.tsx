import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { ambientPool, aiSquadMembers, pickRandom } from '@/lib/squadContent';
import { useMemo } from 'react';

const SquadHome = () => {
  const navigate = useNavigate();
  const squad = useMemo(() => {
    const aiPicks = pickRandom(aiSquadMembers, 2);
    const regularPicks = pickRandom(ambientPool, 2 + Math.floor(Math.random() * 3));
    return [...aiPicks, ...regularPicks];
  }, []);

  const recentSessions = [
    'Math with JL · 25 min · ✓ Both finished',
    'English solo · 15 min · ✓ Done',
    'Science with MR · 25 min · ✓ Both finished',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-8">
        <motion.h1
          className="text-2xl font-heading font-extrabold text-foreground mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Squad Focus
        </motion.h1>
        <p className="text-text-secondary font-body text-sm mb-5">Silent co-working. Real presence.</p>

        {/* Ambient squad display */}
        <motion.div
          className="dose-card p-4 mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-text-secondary text-xs font-body uppercase tracking-wider mb-3">
            {squad.length} people studying right now
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {squad.map((m, i) => (
              <div key={i} className="flex flex-col items-center min-w-[52px]">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-squad-dim flex items-center justify-center text-squad font-heading font-bold text-xs">
                    {m.initials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-squad-glow rounded-full border-2 border-bg-card animate-pulse" />
                </div>
                <span className="text-text-hint text-[10px] font-body mt-1">{m.subject}</span>
                <span className="text-text-hint text-[9px]">{m.minutesIn}m in</span>
              </div>
            ))}
          </div>
          <p className="text-text-hint text-[11px] font-body mt-2">Silent co-working. No chatting. Just presence.</p>
        </motion.div>

        {/* Mode picker */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => navigate('/squad/setup?mode=ambient')}
            className="w-full dose-card p-4 border-2 border-squad text-left hover:bg-squad/5 transition-colors"
          >
            <p className="text-foreground font-heading font-bold text-base">Join the squad</p>
            <p className="text-text-secondary text-sm font-body mt-1">Focus alongside others. Quiet presence, real accountability.</p>
            <span className="inline-block mt-2 text-[10px] font-body text-squad bg-squad/10 px-2 py-0.5 rounded-button">Solo · Ambient squad</span>
            <p className="text-squad font-heading font-bold text-sm mt-3">Start focusing →</p>
          </button>

          <button
            onClick={() => navigate('/squad/setup?mode=invite')}
            className="w-full dose-card p-4 border-2 border-primary text-left hover:bg-primary/5 transition-colors"
          >
            <p className="text-foreground font-heading font-bold text-base">Study with a friend</p>
            <p className="text-text-secondary text-sm font-body mt-1">Invite someone specific. You'll each set your task and go.</p>
            <span className="inline-block mt-2 text-[10px] font-body text-primary bg-primary/10 px-2 py-0.5 rounded-button">2-person · Async</span>
            <p className="text-primary font-heading font-bold text-sm mt-3">Invite someone →</p>
          </button>
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-text-secondary text-xs font-body font-medium uppercase tracking-wider mb-2">Recent Sessions</h3>
          {recentSessions.map(s => (
            <div key={s} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-foreground text-sm font-body">{s}</span>
              <Check size={14} className="text-squad" />
            </div>
          ))}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default SquadHome;
