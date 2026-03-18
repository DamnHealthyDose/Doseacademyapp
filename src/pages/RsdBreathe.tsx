import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const INHALE_MS = 4000;
const HOLD_MS = 2000;
const EXHALE_MS = 4000;
const TOTAL_CYCLES = 3;

const RsdBreathe = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo || '/rsd/flow';
  const returnStep = (location.state as any)?.returnStep ?? 2;

  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const phases: { p: 'inhale' | 'hold' | 'exhale'; d: number }[] = [
      { p: 'inhale', d: INHALE_MS },
      { p: 'hold', d: HOLD_MS },
      { p: 'exhale', d: EXHALE_MS },
    ];

    let currentCycle = 0;
    let phaseIdx = 0;
    let timeout: NodeJS.Timeout;

    const run = () => {
      if (currentCycle >= TOTAL_CYCLES) {
        setDone(true);
        return;
      }
      setPhase(phases[phaseIdx].p);
      setCycle(currentCycle);
      timeout = setTimeout(() => {
        phaseIdx++;
        if (phaseIdx >= phases.length) {
          phaseIdx = 0;
          currentCycle++;
        }
        run();
      }, phases[phaseIdx].d);
    };

    run();
    return () => clearTimeout(timeout);
  }, [done]);

  const handleContinue = () => {
    // Navigate back to flow at step 3 (index 2)
    navigate(returnTo, { state: { resumeStep: returnStep } });
  };

  const circleSize = phase === 'inhale' || phase === 'hold' ? 200 : 120;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <p className="text-text-hint text-xs font-body mb-12">RSD Junior · Breathe</p>

        <motion.div
          className="rounded-full flex items-center justify-center bg-rsd-calm/20 border-2 border-rsd-calm/30"
          animate={{ width: done ? 160 : circleSize, height: done ? 160 : circleSize }}
          transition={{ duration: phase === 'hold' || done ? 0.3 : 4, ease: 'easeInOut' }}
        >
          <span className="text-foreground font-heading font-bold text-base">
            {done ? '' : phase === 'inhale' ? 'In...' : phase === 'hold' ? 'Hold...' : 'Out...'}
          </span>
        </motion.div>

        {/* Cycle dots */}
        <div className="flex gap-2 mt-8">
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300
                ${i <= cycle && !done ? 'bg-rsd-calm' : done ? 'bg-rsd-calm' : 'bg-bg-elevated'}`}
            />
          ))}
        </div>

        {done && (
          <motion.div
            className="mt-10 flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-foreground font-body text-base mb-8">You're more regulated now.</p>
            <button
              onClick={handleContinue}
              className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold rounded-button"
            >
              Ready to continue →
            </button>
          </motion.div>
        )}

        <a
          href="tel:988"
          className="mt-8 text-rsd-calm text-xs font-body hover:underline"
        >
          Skip — I need to talk to someone →
        </a>
      </div>
    </div>
  );
};

export default RsdBreathe;
