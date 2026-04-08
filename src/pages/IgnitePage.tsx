import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Mic, ArrowLeft } from 'lucide-react';
import { useIgnite, AgeMode } from '@/hooks/useIgnite';
import BottomNav from '@/components/BottomNav';

// --- Age-adaptive copy ---
const COPY = {
  middle_school: {
    subheading: "What feels too big right now? Let's find your first move.",
    placeholder: "Type what you need to do...",
    cta: "Find my first step ✨",
    footerHint: "You only have to do one thing at a time.",
    doneBtn: "Done! I did it! ✅",
    stuckBtn: "I'm stuck",
    stepHint: "Just this one thing. You've got this.",
    loadingCopy: ["Finding your first step...", "Making it smaller...", "Almost ready..."],
    stuckTitle: "It's okay to feel stuck.",
    stuckBody: "Sometimes our brain just needs a little help. SPARK can help you figure out what's going on.",
    completeFinal: "You finished the whole thing! That is huge. 🎉",
    streakCopy: (d: number) => `Day ${d} streak! You're on fire! 🔥`,
  },
  high_school: {
    subheading: "What are you avoiding? Let's make it smaller.",
    placeholder: "What's the task?",
    cta: "Break it down",
    footerHint: "You don't have to do it all. Just the first thing.",
    doneBtn: "Done — I did it",
    stuckBtn: "I'm stuck",
    stepHint: "Just this one thing. Nothing else.",
    loadingCopy: ["Breaking it down...", "Finding your move...", "One second..."],
    stuckTitle: "Let's shift gears.",
    stuckBody: "Getting stuck is part of it. SPARK can help you work through what's in the way.",
    completeFinal: "You finished it. All of it.",
    streakCopy: (d: number) => `Day ${d} streak. Keep it going.`,
  },
};

const IgnitePage = () => {
  const navigate = useNavigate();
  const ignite = useIgnite();
  const copy = COPY[ignite.ageMode];
  const [taskInput, setTaskInput] = useState('');
  const [loadingIdx, setLoadingIdx] = useState(0);

  // Cycle loading copy
  const startLoading = () => {
    setLoadingIdx(0);
    const interval = setInterval(() => {
      setLoadingIdx(prev => {
        if (prev >= copy.loadingCopy.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleSubmit = () => {
    if (!taskInput.trim()) return;
    startLoading();
    ignite.startTask(taskInput.trim());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pb-24">
      <div className="w-full max-w-[420px] px-6 pt-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-2">
              <Flame size={22} className="text-primary" />
              IGNITE
            </h1>
          </div>
          {/* Streak counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <Flame size={14} className="text-primary" />
            <span className="text-primary font-heading font-bold text-xs">{ignite.streak}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* SCREEN: ENTRY */}
          {ignite.screen === 'entry' && (
            <motion.div
              key="entry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 mt-8"
            >
              <p className="text-muted-foreground font-body text-center text-sm">
                {copy.subheading}
              </p>
              <div className="w-full relative">
                <textarea
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  placeholder={copy.placeholder}
                  maxLength={500}
                  className="w-full min-h-[120px] rounded-card bg-card border border-border p-4 pr-12 text-foreground font-body text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <Mic size={18} className="absolute right-4 top-4 text-muted-foreground" />
              </div>
              <motion.button
                onClick={handleSubmit}
                disabled={!taskInput.trim()}
                className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold text-base rounded-button
                           flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:bg-primary-dark"
                whileTap={{ scale: 0.97 }}
              >
                {copy.cta}
              </motion.button>
              <p className="text-muted-foreground text-xs font-body text-center">
                {copy.footerHint}
              </p>
            </motion.div>
          )}

          {/* SCREEN: LOADING */}
          {ignite.screen === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 mt-24"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Flame size={48} className="text-primary" />
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-muted-foreground font-body text-sm"
                >
                  {copy.loadingCopy[loadingIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* SCREEN: STEP */}
          {ignite.screen === 'step' && ignite.currentStep && (
            <motion.div
              key="step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6 mt-8"
            >
              {/* Step card */}
              <div className="bg-card rounded-card border border-border border-l-4 border-l-primary p-6">
                <p className="text-foreground font-heading font-bold text-lg leading-relaxed">
                  {ignite.currentStep.step}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-heading font-bold">
                  About {ignite.currentStep.time_estimate} {ignite.currentStep.time_estimate === 1 ? 'minute' : 'minutes'}
                </div>
              </div>

              {/* Momentum counter */}
              {ignite.stepsCompleted > 0 && (
                <div className="text-center text-muted-foreground text-xs font-body">
                  {ignite.stepsCompleted} {ignite.stepsCompleted === 1 ? 'step' : 'steps'} done
                </div>
              )}

              {/* Buttons */}
              <motion.button
                onClick={ignite.completeStep}
                className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold text-base rounded-button
                           flex items-center justify-center gap-2 transition-all hover:bg-primary-dark"
                whileTap={{ scale: 0.97 }}
              >
                {copy.doneBtn}
              </motion.button>
              <motion.button
                onClick={ignite.handleStuck}
                className="w-full h-12 bg-transparent border-2 border-border text-muted-foreground font-heading font-bold text-sm rounded-button
                           flex items-center justify-center transition-all hover:border-warning hover:text-warning"
                whileTap={{ scale: 0.97 }}
              >
                {copy.stuckBtn}
              </motion.button>
              <p className="text-muted-foreground text-xs font-body text-center">
                {copy.stepHint}
              </p>
            </motion.div>
          )}

          {/* SCREEN: CELEBRATION */}
          {ignite.screen === 'celebration' && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center gap-6 mt-16"
            >
              {/* Spark burst animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative"
              >
                <Flame size={ignite.ageMode === 'middle_school' ? 64 : 48} className="text-primary" />
                {/* Decorative sparks */}
                {[...Array(ignite.ageMode === 'middle_school' ? 8 : 5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary"
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((i * 2 * Math.PI) / (ignite.ageMode === 'middle_school' ? 8 : 5)) * 60,
                      y: Math.sin((i * 2 * Math.PI) / (ignite.ageMode === 'middle_school' ? 8 : 5)) * 60,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ left: '50%', top: '50%' }}
                  />
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-foreground font-heading font-extrabold text-xl text-center"
              >
                {ignite.getCelebrationCopy()}
              </motion.p>

              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm">
                {ignite.stepsCompleted} {ignite.stepsCompleted === 1 ? 'step' : 'steps'} done
              </div>

              {/* Streak update */}
              {ignite.streakJustIncremented && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-primary font-heading font-bold text-sm text-center"
                >
                  {copy.streakCopy(ignite.streak)}
                </motion.p>
              )}

              {/* Milestone */}
              {ignite.milestoneDays && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-primary font-body text-sm text-center px-4"
                >
                  {ignite.getMilestoneCopy(ignite.milestoneDays)}
                </motion.p>
              )}

              <p className="text-muted-foreground text-xs font-body">Loading next step...</p>
            </motion.div>
          )}

          {/* SCREEN: STUCK (SPARK handoff) */}
          {ignite.screen === 'stuck' && (
            <motion.div
              key="stuck"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6 mt-8"
            >
              <div className="bg-card rounded-card border border-border border-l-4 border-l-warning p-6">
                <h2 className="text-foreground font-heading font-extrabold text-lg mb-3">
                  {copy.stuckTitle}
                </h2>
                <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
                  {copy.stuckBody}
                </p>
                <p className="text-muted-foreground/60 font-body text-xs">
                  You were working on: {ignite.task} — Step: {ignite.currentStep?.step}
                </p>
              </div>

              <motion.button
                onClick={() => navigate('/spark', {
                  state: {
                    from: 'ignite',
                    task: ignite.task,
                    currentStep: ignite.currentStep?.step,
                  }
                })}
                className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold text-base rounded-button
                           flex items-center justify-center gap-2 transition-all hover:bg-primary-dark"
                whileTap={{ scale: 0.97 }}
              >
                Go to SPARK ⚡
              </motion.button>
              <button
                onClick={ignite.retryStep}
                className="text-muted-foreground text-sm font-body text-center hover:text-foreground transition-colors"
              >
                Actually, let me try again
              </button>
            </motion.div>
          )}

          {/* SCREEN: COMPLETE */}
          {ignite.screen === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 mt-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.4, 1] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <Flame size={72} className="text-primary" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-foreground font-heading font-extrabold text-xl text-center px-4"
              >
                {copy.completeFinal}
              </motion.p>

              <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm">
                {ignite.stepsCompleted} steps completed
              </div>

              {ignite.streakJustIncremented && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-primary font-heading font-bold text-sm"
                >
                  {copy.streakCopy(ignite.streak)}
                </motion.p>
              )}

              <motion.button
                onClick={() => {
                  ignite.resetIgnite();
                  setTaskInput('');
                }}
                className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold text-base rounded-button
                           flex items-center justify-center gap-2 transition-all hover:bg-primary-dark mt-4"
                whileTap={{ scale: 0.97 }}
              >
                Start another task
              </motion.button>
              <button
                onClick={() => navigate('/')}
                className="text-muted-foreground text-sm font-body hover:text-foreground transition-colors"
              >
                Back to dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default IgnitePage;
