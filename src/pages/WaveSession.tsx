import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Flag, X } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

const WaveSession = () => {
  const navigate = useNavigate();
  const { waveSession, setWaveSession, completeWave } = useAppState();
  const [showDistractionModal, setShowDistractionModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);
  const [leaveSeconds, setLeaveSeconds] = useState(0);
  const [distractionFlash, setDistractionFlash] = useState(false);
  const [affirmation, setAffirmation] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  const totalSeconds = waveSession.plannedDuration * 60;
  const elapsed = waveSession.actualDuration;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;

  // Timer color states
  const getTimerColor = () => {
    if (remaining <= 60) return 'text-foreground';
    if (remaining <= 120) return 'text-warning';
    return 'text-foreground';
  };

  const getRingColor = () => {
    if (remaining <= 120 && remaining > 0 && waveSession.status === 'running') return 'hsl(var(--warning))';
    return 'hsl(var(--primary))';
  };

  // Timer logic
  const tick = useCallback(() => {
    setWaveSession(prev => {
      if (prev.status !== 'running') return prev;
      const newElapsed = prev.actualDuration + 1;
      if (newElapsed >= prev.plannedDuration * 60) {
        return { ...prev, actualDuration: prev.plannedDuration * 60, status: 'complete', completionType: 'full' };
      }
      return { ...prev, actualDuration: newElapsed };
    });
  }, [setWaveSession]);

  useEffect(() => {
    if (waveSession.status === 'running') {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [waveSession.status, tick]);

  // Complete -> navigate
  useEffect(() => {
    if (waveSession.status === 'complete') {
      const timeout = setTimeout(() => {
        completeWave(waveSession.actualDuration, waveSession.distractions);
        navigate('/wave/complete');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [waveSession.status]);

  // Visibility change detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && waveSession.status === 'running') {
        hiddenAtRef.current = Date.now();
      } else if (!document.hidden && hiddenAtRef.current && waveSession.status === 'running') {
        const away = Math.round((Date.now() - hiddenAtRef.current) / 1000);
        hiddenAtRef.current = null;
        if (away > 3) {
          setLeaveSeconds(away);
          setShowLeavePrompt(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [waveSession.status]);

  const handleStart = () => {
    setWaveSession(prev => ({ ...prev, status: 'running', startTime: Date.now() }));
  };

  const handlePause = () => {
    setWaveSession(prev => ({ ...prev, status: 'paused', pausedAt: Date.now() }));
  };

  const handleResume = () => {
    setWaveSession(prev => {
      const pausedMs = prev.pausedAt ? Date.now() - prev.pausedAt : 0;
      return { ...prev, status: 'running', pausedAt: null, totalPausedMs: prev.totalPausedMs + pausedMs };
    });
  };

  const handleEndEarly = () => {
    completeWave(waveSession.actualDuration, waveSession.distractions);
    navigate('/wave/complete');
  };

  const handleLogDistraction = (type: string) => {
    setWaveSession(prev => ({
      ...prev,
      distractions: [...prev.distractions, { type, timestamp: Date.now() }],
    }));
    setDistractionFlash(true);
    setAffirmation('Logged. Back to it! 💪');
    setTimeout(() => {
      setDistractionFlash(false);
      setAffirmation('');
      setShowDistractionModal(false);
    }, 1500);
  };

  const handleLeaveAsDistraction = () => {
    handleLogDistraction('Left the app');
    setShowLeavePrompt(false);
  };

  // SVG ring
  const ringSize = 220;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const distractionCount = waveSession.distractions.length;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative">
      {/* Distraction counter */}
      <motion.div
        className={`absolute top-6 right-6 px-3 py-1 rounded-button text-xs font-heading font-bold transition-colors
          ${distractionFlash ? 'bg-success text-success-foreground' : 'bg-primary/20 text-primary'}`}
        animate={distractionFlash ? { opacity: [0.3, 1, 0.3] } : {}}
        transition={{ duration: 0.3 }}
      >
        {distractionCount} caught
      </motion.div>

      {/* Duration chip */}
      <div className="absolute top-6 left-6 px-3 py-1 rounded-button bg-bg-elevated text-text-secondary text-xs font-body">
        {waveSession.plannedDuration} min focus
      </div>

      <div className="flex flex-col items-center">
        {/* Timer ring */}
        <motion.div
          className="relative"
          animate={waveSession.status === 'idle' ? { scale: [1, 1.04, 1] } : waveSession.status === 'complete' ? { scale: [1, 1.1, 1] } : {}}
          transition={waveSession.status === 'idle' ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6, ease: 'easeOut' }}
        >
          <svg width={ringSize} height={ringSize} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--bg-elevated))"
              strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={waveSession.status === 'complete' ? 'hsl(var(--success))' : getRingColor()}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-7xl font-heading font-extrabold ${getTimerColor()} tabular-nums`} aria-live="polite">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-text-secondary text-xs font-body mt-1 max-w-[140px] truncate">
              {waveSession.task}
            </span>
          </div>
        </motion.div>

        {/* Status / Controls */}
        {waveSession.status === 'idle' && (
          <motion.button
            onClick={handleStart}
            className="mt-8 text-primary font-heading font-bold text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Tap to start
          </motion.button>
        )}

        {waveSession.status === 'running' && (
          <div className="flex items-center gap-6 mt-8">
            <button onClick={handlePause} className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-foreground transition-colors">
              <Pause size={20} />
            </button>
            <button onClick={() => setShowDistractionModal(true)} className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center text-warning hover:bg-warning/30 transition-colors">
              <Flag size={20} />
            </button>
            <button onClick={() => setShowEndConfirm(true)} className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center text-text-hint hover:text-destructive transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        {waveSession.status === 'paused' && (
          <div className="flex flex-col items-center gap-3 mt-8">
            <button
              onClick={handleResume}
              className="w-full max-w-[200px] h-14 bg-primary text-primary-foreground font-heading font-bold rounded-button flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
            >
              <Play size={18} /> Resume
            </button>
            <button onClick={handleEndEarly} className="text-text-hint text-sm font-body hover:text-destructive transition-colors">
              End session
            </button>
          </div>
        )}

        {waveSession.status === 'complete' && (
          <motion.div
            className="mt-6 text-success font-heading font-bold text-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            🌊 WAVE complete!
          </motion.div>
        )}
      </div>

      {/* Distraction Modal */}
      <AnimatePresence>
        {showDistractionModal && (
          <motion.div
            className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="dose-card w-full max-w-[360px] p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {affirmation ? (
                <p className="text-success font-heading font-bold text-center text-lg">{affirmation}</p>
              ) : (
                <>
                  <h3 className="text-foreground font-heading font-bold text-lg mb-1">Caught one!</h3>
                  <p className="text-text-secondary text-sm font-body mb-4">What pulled you?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[...waveSession.distractionPlan.filter(d => !['My phone', 'YouTube / TikTok', 'My thoughts', 'Getting up', 'Other apps', 'Talking to people'].includes(d)),
                      'My phone', 'YouTube / TikTok', 'My thoughts', 'Getting up'].map(d => (
                      <button
                        key={d}
                        onClick={() => handleLogDistraction(d)}
                        className="chip text-xs"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowDistractionModal(false)} className="mt-4 text-text-hint text-xs font-body hover:text-foreground transition-colors w-full text-center">
                    Never mind
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Confirm Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="dose-card w-full max-w-[320px] p-6 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h3 className="text-foreground font-heading font-bold text-lg mb-2">End session early?</h3>
              <p className="text-text-secondary text-sm font-body mb-4">You still showed up — that counts.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowEndConfirm(false)} className="flex-1 h-12 rounded-button border-2 border-bg-elevated text-text-secondary font-heading font-bold text-sm hover:border-primary transition-colors">
                  Keep going
                </button>
                <button onClick={handleEndEarly} className="flex-1 h-12 rounded-button bg-primary text-primary-foreground font-heading font-bold text-sm hover:bg-primary-dark transition-colors">
                  End it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Prompt */}
      <AnimatePresence>
        {showLeavePrompt && (
          <motion.div
            className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="dose-card w-full max-w-[320px] p-6 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h3 className="text-foreground font-heading font-bold text-lg mb-2">Hey, you're back!</h3>
              <p className="text-text-secondary text-sm font-body mb-4">
                You left for {leaveSeconds} seconds. Count that as a distraction?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowLeavePrompt(false)} className="flex-1 h-12 rounded-button border-2 border-bg-elevated text-text-secondary font-heading font-bold text-sm">
                  Nah
                </button>
                <button onClick={handleLeaveAsDistraction} className="flex-1 h-12 rounded-button bg-warning text-warning-foreground font-heading font-bold text-sm">
                  Yeah
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaveSession;
