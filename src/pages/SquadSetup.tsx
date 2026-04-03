import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { subjects, durationOptions, ambientPool, pickRandom, generateCode } from '@/lib/squadContent';
import ProgressDots from '@/components/ProgressDots';

const SquadSetup = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get('mode') || 'ambient';
  const isJoining = params.get('joined') === 'true';
  const joinCode = params.get('code');

  const { startSquad } = useAppState();
  const [step, setStep] = useState(1);
  const [task, setTask] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [sessionCode] = useState(() => generateCode());

  const miniSquad = useMemo(() => pickRandom(ambientPool, 4), []);

  // Guard: redirect away if invite mode (disabled for safety)
  useEffect(() => {
    if (mode === 'invite') {
      navigate('/squad', { replace: true });
    }
  }, [mode, navigate]);

  const handleChip = (label: string) => setTask(label === 'Other' ? '' : label);

  const handleStart = () => {
    startSquad(task, duration!, mode as 'ambient' | 'invite', mode === 'invite' ? sessionCode : null);
    if (mode === 'invite' && !isJoining) {
      localStorage.setItem(`squad_session_${sessionCode}`, JSON.stringify({
        hostTask: task, hostDuration: duration, createdAt: Date.now(), status: 'waiting',
      }));
    }
    navigate(`/squad/session?mode=${mode}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Join my Squad Focus session on DOSE Academy: ${window.location.origin}/squad/invite/${sessionCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] px-6 pt-6">
        <div className="flex items-center mb-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/squad')} className="text-text-secondary hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 flex justify-center"><ProgressDots total={3} current={step - 1} completed={Array.from({ length: step - 1 }, (_, i) => i)} /></div>
          <div className="w-5" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }}>
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">What are you working on?</h2>
              <p className="text-text-secondary text-sm font-body mb-4">Just the subject — keep it simple</p>
              <input
                className="w-full h-14 bg-bg-elevated rounded-card px-4 text-foreground font-body text-base outline-none border-2 border-transparent focus:border-squad transition-colors placeholder:text-text-hint"
                placeholder="e.g. Math homework, English essay..."
                maxLength={60}
                value={task}
                onChange={e => setTask(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {subjects.map(s => (
                  <button key={s} onClick={() => handleChip(s)}
                    className={`chip ${task === s ? 'chip-selected border-squad bg-squad/15' : ''}`}>
                    {s}
                  </button>
                ))}
              </div>
              <button
                disabled={task.length < 3}
                onClick={() => setStep(2)}
                className="w-full h-14 mt-6 bg-squad text-primary-foreground font-heading font-bold rounded-button disabled:opacity-30 transition-opacity"
              >
                Next →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }}>
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">How long can you focus?</h2>
              <p className="text-text-secondary text-sm font-body mb-4">Be honest — shorter is better than bailing</p>
              <div className="grid grid-cols-2 gap-3">
                {durationOptions.map(d => (
                  <button key={d.minutes} onClick={() => setDuration(d.minutes)}
                    className={`dose-card flex flex-col items-center py-5 border-2 transition-all
                      ${duration === d.minutes ? 'border-squad bg-squad/10' : 'border-transparent hover:border-squad/30'}`}>
                    <span className="text-2xl mb-1">{d.emoji}</span>
                    <span className="text-foreground font-heading font-bold text-lg">{d.label}</span>
                    <span className="text-text-secondary text-xs font-body">{d.desc}</span>
                  </button>
                ))}
              </div>
              <button
                disabled={!duration}
                onClick={() => setStep(3)}
                className="w-full h-14 mt-6 bg-squad text-primary-foreground font-heading font-bold rounded-button disabled:opacity-30 transition-opacity"
              >
                Next →
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }}>
              {mode === 'ambient' ? (
                <>
                  <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">Your squad is ready.</h2>
                  <p className="text-text-secondary text-sm font-body mb-5">
                    You'll focus alongside {miniSquad.length} others right now. Silent, no chat — just knowing others are working too.
                  </p>
                  <div className="flex gap-3 mb-6 justify-center">
                    {miniSquad.map((m, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-full bg-squad-dim flex items-center justify-center text-squad font-heading font-bold text-xs">
                            {m.initials}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-squad-glow rounded-full border-2 border-bg-card animate-pulse" />
                        </div>
                        <span className="text-text-hint text-[10px] mt-1">{m.subject}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleStart}
                    className="w-full h-14 bg-squad text-primary-foreground font-heading font-bold rounded-button">
                    Let's go →
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-heading font-extrabold text-foreground mb-1">
                    {isJoining ? `Your friend is waiting!` : 'Invite your study buddy'}
                  </h2>
                  {isJoining ? (
                    <>
                      <p className="text-text-secondary text-sm font-body mb-5">They're already working. Set up and join them.</p>
                      <button onClick={handleStart}
                        className="w-full h-14 bg-squad text-primary-foreground font-heading font-bold rounded-button">
                        Start together →
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-text-secondary text-sm font-body mb-4">Share this link with your study partner:</p>
                      <div className="dose-card p-3 text-center mb-4">
                        <p className="text-foreground text-xs font-body break-all select-all">
                          {window.location.origin}/squad/invite/{sessionCode}
                        </p>
                      </div>
                      <button onClick={handleCopy}
                        className={`w-full h-14 font-heading font-bold rounded-button mb-3 transition-all
                          ${copied ? 'bg-squad text-primary-foreground' : 'bg-bg-elevated text-foreground border-2 border-squad'}`}>
                        {copied ? 'Copied! ✓' : 'Copy link'}
                      </button>
                      <p className="text-text-secondary text-xs font-body text-center mb-4 animate-pulse">Waiting for them to join...</p>
                      <button onClick={handleStart}
                        className="text-text-hint text-sm font-body underline w-full text-center">
                        Or start without them →
                      </button>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SquadSetup;
