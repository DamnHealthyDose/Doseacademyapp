import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { scenarios, intensityLabels, contentMap, type RsdScenario } from '@/lib/rsdContent';
import { useAppState } from '@/context/AppContext';

const INHALE_MS = 4000;
const HOLD_MS = 2000;
const EXHALE_MS = 4000;

const RsdFlow = () => {
  const navigate = useNavigate();
  const { completeRsd } = useAppState();
  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState<RsdScenario | null>(null);
  const [intensity, setIntensity] = useState(0);
  const [reframe, setReframe] = useState('');
  const [action, setAction] = useState('');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'done'>('inhale');
  const [breathDone, setBreathDone] = useState(false);

  // Step 3 breath cycle
  useEffect(() => {
    if (step !== 2) return;
    setBreathDone(false);
    setBreathPhase('inhale');

    const phases: { phase: 'inhale' | 'hold' | 'exhale'; duration: number }[] = [
      { phase: 'inhale', duration: INHALE_MS },
      { phase: 'hold', duration: HOLD_MS },
      { phase: 'exhale', duration: EXHALE_MS },
    ];

    let timeout: NodeJS.Timeout;
    let i = 0;

    const runPhase = () => {
      if (i >= phases.length) {
        setBreathPhase('done');
        timeout = setTimeout(() => setBreathDone(true), 1000);
        return;
      }
      setBreathPhase(phases[i].phase);
      timeout = setTimeout(() => { i++; runPhase(); }, phases[i].duration);
    };

    runPhase();
    return () => clearTimeout(timeout);
  }, [step]);

  const handleNext = useCallback(() => {
    if (step === 1 && intensity >= 4) {
      navigate('/rsd/breathe', { state: { returnTo: '/rsd/flow', returnStep: 2 } });
      return;
    }
    if (step === 4) {
      completeRsd(scenario!, intensity, intensity >= 4, reframe, action);
      navigate('/rsd/complete');
      return;
    }
    setStep(s => s + 1);
  }, [step, intensity, scenario, reframe, action, navigate, completeRsd]);

  const handleBack = () => {
    if (step === 0) navigate('/rsd');
    else setStep(s => s - 1);
  };

  const dots = Array.from({ length: 5 }).map((_, i) => (
    <div
      key={i}
      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
        i === step ? 'bg-rsd-warm' : i < step ? 'bg-rsd-calm' : 'bg-bg-elevated'
      }`}
    />
  ));

  const canNext = () => {
    if (step === 0) return !!scenario;
    if (step === 1) return intensity > 0;
    if (step === 2) return breathDone;
    if (step === 3) return !!reframe;
    if (step === 4) return !!action;
    return false;
  };

  const nextLabel = () => {
    if (step === 1 && intensity >= 4) return "Let's breathe first →";
    if (step === 4) return "I've got this →";
    return 'Next →';
  };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] px-6 pt-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="text-text-hint hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">{dots}</div>
          <div className="w-5" />
        </div>

        {/* Steps */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
            >
              {step === 0 && (
                <>
                  <h2 className="text-xl font-heading font-extrabold text-foreground">What happened?</h2>
                  <p className="text-text-secondary text-sm font-body mt-1 mb-6">Tap the one that fits — don't overthink it</p>
                  <div className="grid grid-cols-2 gap-3">
                    {scenarios.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setScenario(s.id)}
                        className={`h-[130px] rounded-card flex flex-col items-center justify-center gap-2 border-2 transition-all duration-150
                          ${scenario === s.id
                            ? 'border-rsd-warm bg-rsd-warm/10'
                            : 'border-bg-elevated bg-bg-card hover:border-rsd-warm/40'}`}
                      >
                        <span className="text-2xl">{s.emoji}</span>
                        <span className="text-foreground text-sm font-body font-medium text-center px-2">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="text-xl font-heading font-extrabold text-foreground">How intense is it right now?</h2>
                  <p className="text-text-secondary text-sm font-body mt-1 mb-8">Be honest — there's no wrong answer</p>
                  <div className="flex justify-center gap-4 mb-4">
                    {[1, 2, 3, 4, 5].map(n => {
                      const colors = n <= 2 ? 'bg-rsd-warm/20 border-rsd-warm/40' : n === 3 ? 'bg-warning/20 border-warning/40' : 'bg-rsd-warm/30 border-rsd-warm/60';
                      const selected = intensity === n;
                      return (
                        <button
                          key={n}
                          onClick={() => setIntensity(n)}
                          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center font-heading font-extrabold text-lg
                            border-2 transition-all duration-150
                            ${selected ? 'bg-rsd-warm text-primary-foreground border-rsd-warm scale-110' : `${colors} text-foreground`}`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  {intensity > 0 && (
                    <motion.p
                      className="text-center text-foreground font-body text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {intensityLabels[intensity - 1]}
                    </motion.p>
                  )}
                  {intensity === 5 && (
                    <motion.div
                      className="mt-6 p-3 rounded-card bg-warning/10 border border-warning/30 text-center"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-foreground text-sm font-body">Intensity 5 is a lot to carry. You can talk to someone right now.</p>
                      <a href="tel:988" className="text-rsd-calm text-sm font-body mt-1 inline-block hover:underline">Crisis support →</a>
                    </motion.div>
                  )}
                </>
              )}

              {step === 2 && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <h2 className="text-xl font-heading font-extrabold text-foreground text-center">Before we think — let's land.</h2>
                  <p className="text-text-secondary text-sm font-body mt-1 mb-8 text-center">Take one slow breath with me.</p>
                  <motion.div
                    className="rounded-full flex items-center justify-center bg-rsd-calm/20 border-2 border-rsd-calm/40"
                    animate={{
                      width: breathPhase === 'inhale' || breathPhase === 'hold' ? 180 : breathPhase === 'done' ? 140 : 120,
                      height: breathPhase === 'inhale' || breathPhase === 'hold' ? 180 : breathPhase === 'done' ? 140 : 120,
                    }}
                    transition={{ duration: breathPhase === 'hold' ? 0.2 : 4, ease: 'easeInOut' }}
                  >
                    <span className="text-foreground font-heading font-bold text-sm">
                      {breathPhase === 'inhale' && 'Breathe in...'}
                      {breathPhase === 'hold' && 'Hold...'}
                      {breathPhase === 'exhale' && 'Out...'}
                      {breathPhase === 'done' && ''}
                    </span>
                  </motion.div>
                  {breathDone && (
                    <motion.p
                      className="text-rsd-calm text-sm font-body mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Good. You're still here.
                    </motion.p>
                  )}
                </div>
              )}

              {step === 3 && scenario && (
                <>
                  <h2 className="text-xl font-heading font-extrabold text-foreground">What if the story isn't the whole story?</h2>
                  <p className="text-text-secondary text-sm font-body mt-1 mb-6">Tap the one that feels even a little possible</p>
                  <div className="flex flex-col gap-3">
                    {contentMap[scenario].reframes.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setReframe(r)}
                        className={`p-4 rounded-card border-2 text-left transition-all duration-150 text-sm font-body text-foreground
                          ${reframe === r
                            ? 'border-rsd-calm bg-rsd-calm/10'
                            : 'border-bg-elevated bg-bg-card hover:border-rsd-calm/40'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 4 && scenario && (
                <>
                  <h2 className="text-xl font-heading font-extrabold text-foreground">What's one thing you can do right now?</h2>
                  <p className="text-text-secondary text-sm font-body mt-1 mb-6">Not to fix it — just to take care of yourself</p>
                  <div className="flex flex-col gap-3">
                    {contentMap[scenario].actions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => setAction(a.text)}
                        className={`p-4 rounded-card border-2 text-left transition-all duration-150 flex items-start gap-3
                          ${action === a.text
                            ? 'border-primary bg-primary/10'
                            : 'border-bg-elevated bg-bg-card hover:border-primary/40'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center
                          ${action === a.text ? 'border-success bg-success' : 'border-text-hint'}`}>
                          {action === a.text && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                        </div>
                        <div>
                          <span className="text-foreground text-sm font-body font-medium block">{a.text}</span>
                          <span className="text-text-secondary text-xs font-body">{a.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Next button */}
          <div className="pb-8 pt-4">
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className={`w-full h-14 rounded-button font-heading font-bold text-base transition-all
                ${step <= 1 ? 'bg-rsd-warm' : step <= 3 ? 'bg-rsd-calm' : 'bg-primary'}
                text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {nextLabel()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RsdFlow;
