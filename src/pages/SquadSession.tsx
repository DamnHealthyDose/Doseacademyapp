import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Flag, X, MessageCircle } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { ambientPool, aiSquadMembers, pickRandom, AmbientMember } from '@/lib/squadContent';
import QuickChatBubble from '@/components/QuickChatBubble';

const SquadSession = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'ambient';
  const { squadSession, setSquadSession, completeSquad } = useAppState();

  const totalSeconds = squadSession.plannedDuration * 60;
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [showDistraction, setShowDistraction] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [distractions, setDistractions] = useState<{ type: string; timestamp: number }[]>([]);
  const [showReengagePrompt, setShowReengagePrompt] = useState(false);
  const [timeAway, setTimeAway] = useState(0);
  const startRef = useRef<number | null>(null);
  const pausedMsRef = useRef(0);

  // Ambient squad
  const [ambientSquad, setAmbientSquad] = useState<(AmbientMember & { visible: boolean })[]>(() =>
    pickRandom(ambientPool, 5).map(m => ({ ...m, visible: true }))
  );

  // Simulate ambient squad changes
  useEffect(() => {
    if (status !== 'running') return;
    const update = () => {
      setAmbientSquad(prev => {
        const visible = prev.filter(m => m.visible);
        if (visible.length <= 3) {
          const newMember = pickRandom(ambientPool.filter(p => !prev.some(e => e.initials === p.initials)), 1)[0];
          if (newMember) return [...prev.filter(m => m.visible), { ...newMember, minutesIn: Math.floor(Math.random() * 20) + 1, visible: true }];
        }
        if (visible.length >= 6 || Math.random() > 0.5) {
          const idx = Math.floor(Math.random() * visible.length);
          return prev.map((m, i) => i === idx ? { ...m, visible: false } : m);
        }
        const newM = pickRandom(ambientPool.filter(p => !prev.some(e => e.initials === p.initials)), 1)[0];
        if (newM) return [...prev.filter(m => m.visible), { ...newM, minutesIn: Math.floor(Math.random() * 15) + 1, visible: true }];
        return prev;
      });
    };
    const id = setInterval(update, 45000 + Math.random() * 45000);
    return () => clearInterval(id);
  }, [status]);

  // Timer
  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => {
      if (!startRef.current) return;
      const now = Date.now();
      const el = Math.floor((now - startRef.current - pausedMsRef.current) / 1000);
      setElapsed(el);
      if (el >= totalSeconds) {
        clearInterval(id);
        completeSquad(totalSeconds, distractions);
        setTimeout(() => navigate('/squad/checkin'), 1500);
      }
    }, 250);
    return () => clearInterval(id);
  }, [status, totalSeconds, distractions, completeSquad, navigate]);

  // Tab visibility
  useEffect(() => {
    let leftAt: number | null = null;
    const handler = () => {
      if (document.hidden && status === 'running') {
        leftAt = Date.now();
      } else if (!document.hidden && leftAt && status === 'running') {
        const away = Math.round((Date.now() - leftAt) / 1000);
        setTimeAway(away);
        setShowReengagePrompt(true);
        leftAt = null;
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [status]);

  const handleStart = () => {
    startRef.current = Date.now();
    setStatus('running');
    setSquadSession(prev => ({ ...prev, status: 'running', startTime: Date.now() }));
  };

  const handlePause = () => {
    pausedMsRef.current += Date.now() - (startRef.current ? Date.now() - (Date.now() - startRef.current! - pausedMsRef.current) : 0);
    setStatus('paused');
  };

  const handleResume = () => {
    startRef.current = Date.now() - (elapsed * 1000) - pausedMsRef.current;
    pausedMsRef.current = 0;
    startRef.current = Date.now() - elapsed * 1000;
    setStatus('running');
  };

  const handleEndEarly = () => {
    completeSquad(elapsed, distractions);
    navigate('/squad/checkin');
  };

  const logDistraction = (type: string) => {
    setDistractions(prev => [...prev, { type, timestamp: Date.now() }]);
    setShowDistraction(false);
  };

  const remaining = Math.max(totalSeconds - elapsed, 0);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;
  const isWarning = remaining <= 120 && remaining > 60;
  const isFinal = remaining <= 60 && remaining > 0;
  const isComplete = remaining <= 0;

  const circumference = 2 * Math.PI * 100;
  const strokeOffset = circumference * (1 - progress);

  const timerColor = isComplete ? 'text-success' : isFinal ? 'text-foreground' : isWarning ? 'text-warning' : 'text-foreground';
  const ringColor = isComplete ? 'hsl(var(--success))' : isWarning ? 'hsl(var(--warning))' : 'hsl(var(--squad))';

  const distractionTypes = ['My phone', 'YouTube / TikTok', 'My thoughts', 'Getting up', 'Other apps', 'Talking to people'];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative">
      {/* Distraction counter */}
      {distractions.length > 0 && (
        <div className="absolute top-4 right-4 bg-squad/20 text-squad text-xs font-heading font-bold px-3 py-1 rounded-button">
          {distractions.length} caught
        </div>
      )}

      {/* Duration chip */}
      <span className="text-text-hint text-xs font-body mb-4">{squadSession.plannedDuration} min focus</span>

      {/* Timer ring */}
      <div className="relative" style={{ width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
          <circle cx="110" cy="110" r="100" fill="none" stroke="hsl(var(--bg-elevated))" strokeWidth="8" />
          <circle cx="110" cy="110" r="100" fill="none" stroke={ringColor} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={strokeOffset}
            strokeLinecap="round" className="transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-7xl font-heading font-extrabold ${timerColor} tabular-nums`} aria-live="polite">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-text-hint text-xs font-body mt-1 max-w-[140px] truncate">{squadSession.task}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {status === 'idle' && (
          <motion.button onClick={handleStart} className="text-squad font-heading font-bold text-base animate-pulse"
            whileTap={{ scale: 0.95 }}>
            Tap to start
          </motion.button>
        )}
        {status === 'running' && (
          <div className="flex items-center gap-6">
            <button onClick={handlePause} className="w-11 h-11 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-foreground">
              <Pause size={18} />
            </button>
            <button onClick={() => setShowDistraction(true)} className="w-11 h-11 rounded-full bg-bg-elevated flex items-center justify-center text-warning hover:text-foreground">
              <Flag size={18} />
            </button>
            <button onClick={() => setShowConfirmEnd(true)} className="w-11 h-11 rounded-full bg-bg-elevated flex items-center justify-center text-text-hint hover:text-foreground">
              <X size={18} />
            </button>
          </div>
        )}
        {status === 'paused' && (
          <div className="flex flex-col items-center gap-2">
            <motion.button onClick={handleResume} className="h-14 px-8 bg-squad text-primary-foreground font-heading font-bold rounded-button flex items-center gap-2"
              whileTap={{ scale: 0.97 }}>
              <Play size={16} /> Resume
            </motion.button>
            <button onClick={handleEndEarly} className="text-text-hint text-sm font-body underline">End session</button>
          </div>
        )}
      </div>

      {/* Squad rail */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-deep/90 backdrop-blur-sm border-t border-border py-3">
        <div className="max-w-[420px] mx-auto px-6">
          <p className="text-text-hint text-[10px] font-body uppercase tracking-wider mb-2">
            {mode === 'invite' ? 'Your squad' : 'Studying with you right now'}
          </p>
          <div className="flex gap-3 overflow-x-auto">
            <AnimatePresence>
              {ambientSquad.filter(m => m.visible).map(m => (
                <motion.div
                  key={m.initials}
                  className="flex flex-col items-center min-w-[44px]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 1.5 }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-squad-dim flex items-center justify-center text-squad font-heading font-bold text-[10px]">
                      {m.initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-squad-glow rounded-full border border-bg-deep animate-pulse" />
                  </div>
                  <span className="text-text-hint text-[9px] mt-0.5">{m.subject}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Distraction modal */}
      <AnimatePresence>
        {showDistraction && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-bg-card rounded-card p-5 w-full max-w-[340px]"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <h3 className="text-foreground font-heading font-bold text-base mb-1">Caught one! What pulled you?</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {distractionTypes.map(d => (
                  <button key={d} onClick={() => logDistraction(d)}
                    className="chip hover:border-squad">{d}</button>
                ))}
              </div>
              <button onClick={() => setShowDistraction(false)} className="text-text-hint text-sm mt-3 underline w-full text-center">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm end modal */}
      <AnimatePresence>
        {showConfirmEnd && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-bg-card rounded-card p-5 w-full max-w-[300px] text-center"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <p className="text-foreground font-heading font-bold mb-3">End this session early?</p>
              <p className="text-text-secondary text-sm font-body mb-4">You still showed up — that counts.</p>
              <button onClick={handleEndEarly} className="w-full h-12 bg-squad text-primary-foreground font-heading font-bold rounded-button mb-2">
                End session
              </button>
              <button onClick={() => setShowConfirmEnd(false)} className="text-text-hint text-sm underline">Keep going</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-engage prompt */}
      <AnimatePresence>
        {showReengagePrompt && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-bg-card rounded-card p-5 w-full max-w-[320px] text-center"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <p className="text-foreground font-heading font-bold mb-2">Hey, you left for {timeAway}s</p>
              <p className="text-text-secondary text-sm font-body mb-4">Want to count that as a distraction?</p>
              <div className="flex gap-3">
                <button onClick={() => { logDistraction('Left app'); setShowReengagePrompt(false); }}
                  className="flex-1 h-12 bg-warning/20 text-warning font-heading font-bold rounded-button text-sm">Yes</button>
                <button onClick={() => setShowReengagePrompt(false)}
                  className="flex-1 h-12 bg-bg-elevated text-foreground font-heading font-bold rounded-button text-sm">Nah</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SquadSession;
