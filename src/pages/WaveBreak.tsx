import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppState } from '@/context/AppContext';

const breakOptions = ['Get water', 'Stretch', 'Close your eyes'];

const WaveBreak = () => {
  const navigate = useNavigate();
  const { waveSession } = useAppState();
  const [remaining, setRemaining] = useState(5 * 60); // 5 min
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0) {
      const t = setTimeout(() => navigate('/wave/setup'), 2000);
      return () => clearTimeout(t);
    }
  }, [remaining, navigate]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Purple-themed ring
  const ringSize = 200;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / (5 * 60);
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.h1
        className="text-3xl font-heading font-extrabold text-foreground mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ color: '#7C3AED' }}
      >
        BREAK TIME
      </motion.h1>
      <p className="text-text-secondary text-sm font-body mb-8">Your brain earned this. Step away.</p>

      <div className="relative mb-8">
        <svg width={ringSize} height={ringSize} className="transform -rotate-90">
          <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" stroke="hsl(var(--bg-elevated))" strokeWidth={strokeWidth} />
          <circle
            cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none"
            stroke="#7C3AED"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-heading font-extrabold text-foreground tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {breakOptions.map(opt => (
          <div key={opt} className="px-3 py-2 rounded-button bg-bg-card text-text-secondary text-xs font-body">
            {opt}
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/wave/setup')}
        className="text-text-hint text-sm font-body hover:text-foreground transition-colors"
      >
        Skip break →
      </button>
    </div>
  );
};

export default WaveBreak;
