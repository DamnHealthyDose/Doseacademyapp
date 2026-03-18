import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import ProgressDots from '@/components/ProgressDots';
import SlickMessage from '@/components/SlickMessage';

const STEPS = ['S — SITUATION', 'P — PERCEPTION', 'A — AFFECT', 'R — REFRAME', 'K — KEY RESULT'];

const slickMessages = [
  "I'm listening. Which one feels most like right now?",
  "Naming it is the first step to taming it.",
  "Your body always knows. Let's check in with it.",
  "What else could be true? Pick the one that feels even a little possible.",
  "One action. That's all it takes. You've got this.",
];

const situations = ['Test anxiety', 'Friend drama', 'Total freeze', 'Overwhelmed', 'Got in trouble', 'Something else'];
const perceptions = ["I'm going to fail", 'Everyone hates me', "I can't do anything right", 'This is too much', "I'm the problem", 'My own words...'];
const emotions = [
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Angry' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😶', label: 'Numb' },
  { emoji: '🤯', label: 'Overwhelmed' },
  { emoji: '😕', label: 'Confused' },
];
const reframes = [
  "Maybe I'm struggling, but I've gotten through hard things before.",
  "This feeling is temporary — it won't stay this big.",
  "I don't have to be perfect to be okay.",
  "One step is enough right now.",
];
const keyResults = [
  'Take 3 slow breaths',
  'Write down what I actually need to do first',
  'Text a friend or trusted adult',
  'Take a 5-minute walk',
  'Set a 10-minute timer and start small',
];

const variants = {
  enter: { x: 20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

const SparkPage = () => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, answers, setAnswer, completeSpark, resetSpark } = useAppState();
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const completedSteps = useMemo(() => {
    const c: number[] = [];
    if (answers.situation) c.push(0);
    if (answers.perception) c.push(1);
    if (answers.affect) c.push(2);
    if (answers.reframe) c.push(3);
    if (answers.keyResult) c.push(4);
    return c;
  }, [answers]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: return !!answers.situation;
      case 1: return !!answers.perception;
      case 2: return !!answers.affect;
      case 3: return !!answers.reframe;
      case 4: return !!answers.keyResult;
      default: return false;
    }
  }, [currentStep, answers]);

  const handleNext = () => {
    if (currentStep === 2 && answers.intensity === 5 && answers.affect === 'Numb') {
      setShowCrisisAlert(true);
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      completeSpark();
      navigate('/spark/complete');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigate('/');
  };

  const intensityColor = (val: number) => {
    if (val <= 2) return 'bg-primary';
    if (val === 3) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] px-6 pt-4 pb-32 flex flex-col">
        {/* Back */}
        <button onClick={handleBack} className="flex items-center gap-1 text-text-secondary text-sm font-body mb-2 self-start hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <ProgressDots total={5} current={currentStep} completed={completedSteps} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col mt-4"
          >
            <span className="step-label mb-2">{STEPS[currentStep]}</span>

            <SlickMessage message={slickMessages[currentStep]} />

            {/* Step 0: Situation */}
            {currentStep === 0 && (
              <>
                <h2 className="text-xl font-heading font-extrabold text-foreground mt-4 mb-1">What's going on right now?</h2>
                <p className="text-text-secondary text-sm font-body mb-4">Pick the one that fits best</p>
                <div className="grid grid-cols-2 gap-3">
                  {situations.map(s => (
                    <button key={s} onClick={() => setAnswer('situation', s)}
                      className={`chip ${answers.situation === s ? 'chip-selected' : ''}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 1: Perception */}
            {currentStep === 1 && (
              <>
                <h2 className="text-xl font-heading font-extrabold text-foreground mt-4 mb-1">What's the thought playing loudest?</h2>
                <p className="text-text-secondary text-sm font-body mb-4">Tap the one that sounds like you</p>
                <div className="grid grid-cols-2 gap-3">
                  {perceptions.map(p => (
                    <button key={p} onClick={() => setAnswer('perception', p)}
                      className={`chip ${answers.perception === p ? 'chip-selected' : ''}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Affect */}
            {currentStep === 2 && (
              <>
                <h2 className="text-xl font-heading font-extrabold text-foreground mt-4 mb-1">How does your body feel right now?</h2>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {emotions.map(e => (
                    <button key={e.label} onClick={() => setAnswer('affect', e.label)}
                      className={`dose-card flex flex-col items-center gap-1 py-4 cursor-pointer border-2 transition-all duration-150
                        ${answers.affect === e.label ? 'border-primary scale-[1.03]' : 'border-transparent hover:border-primary/40'}`}>
                      <span className="text-2xl">{e.emoji}</span>
                      <span className="text-xs text-text-secondary font-body">{e.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="text-sm text-text-secondary font-body block mb-3">
                    How intense? (1 = a little, 5 = a lot)
                  </label>
                  <input
                    type="range" min={1} max={5} step={1}
                    value={answers.intensity}
                    onChange={e => setAnswer('intensity', Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className={`h-1 rounded-full mt-1 transition-colors duration-300 ${intensityColor(answers.intensity)}`}
                    style={{ width: `${(answers.intensity / 5) * 100}%` }} />
                  <div className="flex justify-between text-xs text-text-hint font-body mt-1">
                    <span>1 — mild</span><span>3 — real</span><span>5 — intense</span>
                  </div>
                </div>

                {/* Crisis alert */}
                {showCrisisAlert && answers.intensity === 5 && answers.affect === 'Numb' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-card bg-bg-elevated border border-primary/30"
                  >
                    <p className="text-foreground text-sm font-body mb-2">
                      This sounds really hard. You're not alone.
                    </p>
                    <a href="tel:988" className="text-primary text-sm font-body font-medium hover:underline">
                      Talk to someone →
                    </a>
                  </motion.div>
                )}
              </>
            )}

            {/* Step 3: Reframe */}
            {currentStep === 3 && (
              <>
                <h2 className="text-xl font-heading font-extrabold text-foreground mt-4 mb-1">What else could be true?</h2>
                <p className="text-text-secondary text-sm font-body mb-4">Pick the one that feels even a little possible</p>
                <div className="flex flex-col gap-3">
                  {reframes.map(r => (
                    <button key={r} onClick={() => setAnswer('reframe', r)}
                      className={`dose-card text-left px-4 py-4 border-2 text-sm font-body transition-all duration-200
                        ${answers.reframe === r
                          ? 'border-success bg-success/10 text-foreground'
                          : answers.reframe && answers.reframe !== r
                            ? 'border-transparent opacity-30'
                            : 'border-transparent text-text-secondary hover:border-primary/40'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 4: Key Result */}
            {currentStep === 4 && (
              <>
                <h2 className="text-xl font-heading font-extrabold text-foreground mt-4 mb-1">What's one thing you can do right now?</h2>
                <div className="flex flex-col gap-3 mt-4">
                  {keyResults.map(kr => (
                    <button key={kr} onClick={() => setAnswer('keyResult', kr)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-card bg-bg-card text-left transition-all duration-150
                        ${answers.keyResult === kr ? 'border-2 border-success' : 'border-2 border-transparent hover:border-primary/30'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                        ${answers.keyResult === kr ? 'border-success bg-success' : 'border-text-hint'}`}>
                        {answers.keyResult === kr && <Check size={12} className="text-foreground" />}
                      </div>
                      <span className="text-sm font-body text-text-secondary">{kr}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next / Finish */}
        <motion.button
          onClick={handleNext}
          disabled={!canProceed}
          className={`mt-8 w-full h-14 rounded-button font-heading font-bold text-lg flex items-center justify-center gap-2
                      transition-all duration-200
                      ${canProceed
                        ? 'bg-primary text-primary-foreground teal-glow hover:bg-primary-dark'
                        : 'bg-bg-elevated text-text-hint cursor-not-allowed opacity-40'}`}
          animate={{ opacity: canProceed ? 1 : 0.4, y: canProceed ? 0 : 4 }}
          transition={{ duration: 0.18 }}
          whileTap={canProceed ? { scale: 0.97 } : {}}
        >
          {currentStep === 4 ? <>Finish <Check size={18} /></> : <>Next <ArrowRight size={18} /></>}
        </motion.button>
      </div>
    </div>
  );
};

export default SparkPage;
