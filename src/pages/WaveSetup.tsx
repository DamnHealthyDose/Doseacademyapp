import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import ProgressDots from '@/components/ProgressDots';
import BottomNav from '@/components/BottomNav';

const quickPicks = ['Math', 'Reading', 'Essay / Writing', 'Science', 'History', 'Other'];

const durations = [
  { emoji: '🏃', minutes: 10, label: '10 min', desc: 'Just getting started' },
  { emoji: '⚡', minutes: 15, label: '15 min', desc: 'Quick burst' },
  { emoji: '🔥', minutes: 25, label: '25 min', desc: 'Full Pomodoro' },
  { emoji: '🧠', minutes: 45, label: '45 min', desc: 'Deep work mode' },
];

const distractionOptions = [
  'My phone', 'YouTube / TikTok', 'My thoughts', 'Getting up', 'Other apps', 'Talking to people',
];

const variants = {
  enter: { x: 20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

const WaveSetup = () => {
  const navigate = useNavigate();
  const { startWave } = useAppState();
  const [step, setStep] = useState(0);
  const [task, setTask] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [selectedDistractions, setSelectedDistractions] = useState<string[]>([]);
  const [distractionNote, setDistractionNote] = useState('');

  const completedSteps: number[] = [];
  if (task.length >= 3) completedSteps.push(0);
  if (duration !== null) completedSteps.push(1);
  if (selectedDistractions.length > 0) completedSteps.push(2);

  const canProceed = step === 0 ? task.length >= 3 : step === 1 ? duration !== null : selectedDistractions.length > 0;

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      const plan = [...selectedDistractions];
      if (distractionNote.trim()) plan.push(distractionNote.trim());
      startWave(task, duration!, plan);
      navigate('/wave/session');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate('/');
  };

  const toggleDistraction = (d: string) => {
    setSelectedDistractions(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] px-6 pt-4 pb-32 flex flex-col">
        <button onClick={handleBack} className="flex items-center gap-1 text-text-secondary text-sm font-body mb-2 self-start hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <ProgressDots total={3} current={step} completed={completedSteps} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col mt-4"
          >
            {/* Step 0: Work */}
            {step === 0 && (
              <>
                <span className="step-label mb-2">W — WORK</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">What are we working on?</h2>
                <p className="text-text-secondary text-sm font-body mb-4">Just the subject — keep it simple</p>
                <input
                  type="text"
                  value={task}
                  onChange={e => setTask(e.target.value.slice(0, 60))}
                  placeholder="e.g. Math homework, English essay..."
                  className="w-full h-14 rounded-card bg-bg-card border-2 border-bg-elevated px-4 text-foreground font-body text-base placeholder:text-text-hint focus:border-primary focus:outline-none transition-colors"
                />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {quickPicks.map(qp => (
                    <button
                      key={qp}
                      onClick={() => setTask(qp)}
                      className={`chip text-xs ${task === qp ? 'chip-selected' : ''}`}
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 1: Awareness */}
            {step === 1 && (
              <>
                <span className="step-label mb-2">A — AWARENESS</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">How long can you focus right now?</h2>
                <p className="text-text-secondary text-sm font-body mb-4">Be honest — shorter is better than bailing early</p>
                <div className="grid grid-cols-2 gap-3">
                  {durations.map(d => (
                    <button
                      key={d.minutes}
                      onClick={() => setDuration(d.minutes)}
                      className={`dose-card flex flex-col items-center gap-1 py-5 border-2 transition-all duration-150 cursor-pointer
                        ${duration === d.minutes ? 'border-primary bg-primary/10 scale-[1.03]' : 'border-transparent hover:border-primary/40'}`}
                    >
                      <span className="text-2xl">{d.emoji}</span>
                      <span className="text-foreground font-heading font-bold text-lg">{d.label}</span>
                      <span className="text-text-secondary text-xs font-body">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Distraction Plan */}
            {step === 2 && (
              <>
                <span className="step-label mb-2">DISTRACTION PLAN</span>
                <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">What usually pulls you away?</h2>
                <p className="text-text-secondary text-sm font-body mb-4">Name it so you can catch yourself</p>
                <div className="grid grid-cols-2 gap-2">
                  {distractionOptions.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDistraction(d)}
                      className={`chip text-xs ${selectedDistractions.includes(d) ? 'chip-selected' : ''}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={distractionNote}
                  onChange={e => setDistractionNote(e.target.value.slice(0, 80))}
                  placeholder="Anything else? (optional)"
                  className="w-full h-12 rounded-card bg-bg-card border-2 border-bg-elevated px-4 text-foreground font-body text-sm placeholder:text-text-hint focus:border-primary focus:outline-none transition-colors mt-4"
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={handleNext}
          disabled={!canProceed}
          className={`mt-8 w-full h-14 rounded-button font-heading font-bold text-lg flex items-center justify-center gap-2
                      transition-all duration-200
                      ${canProceed
                        ? 'bg-primary text-primary-foreground teal-glow hover:bg-primary-dark'
                        : 'bg-bg-elevated text-text-hint cursor-not-allowed opacity-40'}`}
          animate={{ opacity: canProceed ? 1 : 0.4 }}
          whileTap={canProceed ? { scale: 0.97 } : {}}
        >
          {step === 2 ? <>Let's go! <Rocket size={18} /></> : <>Next <ArrowRight size={18} /></>}
        </motion.button>
      </div>
      <BottomNav />
    </div>
  );
};

export default WaveSetup;
