import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '@/context/AppContext';
import { checkinFeelings } from '@/lib/squadContent';

const SquadCheckin = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'ambient';
  const { squadSession, setSquadSession } = useAppState();

  const [step, setStep] = useState(1);
  const [completion, setCompletion] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);

  const completionOptions = [
    { label: 'Yes, done!', value: 'yes', color: 'bg-success/20 text-success border-success/30' },
    { label: 'Mostly', value: 'mostly', color: 'bg-warning/20 text-warning border-warning/30' },
    { label: 'Not really', value: 'no', color: 'bg-bg-elevated text-text-secondary border-border' },
  ];

  const handleDone = () => {
    setSquadSession(prev => ({
      ...prev,
      checkinCompletion: completion,
      checkinFeeling: feeling,
    }));
    navigate('/squad/complete');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] px-6">
        <motion.h1 className="text-xl font-heading font-extrabold text-foreground text-center mb-1"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Session done. Quick check-in 👋
        </motion.h1>
        <p className="text-text-secondary text-sm font-body text-center mb-8">2 questions — your squad sees your answers</p>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="q1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <p className="text-foreground font-heading font-bold text-base mb-4">Did you finish what you planned?</p>
              <div className="space-y-3">
                {completionOptions.map(o => (
                  <motion.button
                    key={o.value}
                    onClick={() => setCompletion(o.value)}
                    className={`w-full h-14 rounded-card border-2 font-heading font-bold text-base transition-all
                      ${completion === o.value ? o.color + ' scale-[1.03]' : 'bg-bg-card border-border text-foreground hover:border-squad/30'}`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {o.label}
                  </motion.button>
                ))}
              </div>
              <button
                disabled={!completion}
                onClick={() => setStep(2)}
                className="w-full h-14 mt-6 bg-squad text-primary-foreground font-heading font-bold rounded-button disabled:opacity-30"
              >
                Next →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="q2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <p className="text-foreground font-heading font-bold text-base mb-4">One word — how do you feel right now?</p>
              <div className="grid grid-cols-2 gap-3">
                {checkinFeelings.map(f => (
                  <motion.button
                    key={f}
                    onClick={() => setFeeling(f)}
                    className={`h-14 rounded-card border-2 font-heading font-bold text-sm transition-all
                      ${feeling === f ? 'border-squad bg-squad/10 text-squad scale-[1.03]' : 'bg-bg-card border-border text-foreground hover:border-squad/30'}`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {f}
                  </motion.button>
                ))}
              </div>

              {/* Squad summary */}
              {feeling && (
                <motion.div className="dose-card p-4 mt-5 text-center"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-text-secondary text-sm font-body">
                    {mode === 'invite'
                      ? "Your friend's check-in will appear here when they finish."
                      : `Your squad finished ${3 + Math.floor(Math.random() * 5)} sessions in the last 30 minutes. You were part of that.`}
                  </p>
                </motion.div>
              )}

              <button
                disabled={!feeling}
                onClick={handleDone}
                className="w-full h-14 mt-6 bg-squad text-primary-foreground font-heading font-bold rounded-button disabled:opacity-30"
              >
                Done →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SquadCheckin;
