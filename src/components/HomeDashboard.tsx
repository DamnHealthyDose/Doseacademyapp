import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Flame } from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { TOOLS } from '@/lib/tools';
import SlickMessage from './SlickMessage';
import ThemeToggle from './ThemeToggle';
import WhatsDoseButton from './WhatsDoseButton';

const RECENT_SESSIONS = ['English essay draft · 25 min', 'Science reading · 15 min', 'Math problems · 25 min'];

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tool-accent';

/** Home layout for >=768px. Phones (<768px) keep the original single-column Home in Index. */
const HomeDashboard = () => {
  const navigate = useNavigate();
  const { xp, streak, sessionsCount, sessionsToday, minutesToday, hasActiveSession, waveSession } = useAppState();

  const stats = [
    { label: 'Sessions', value: `🔥 ${sessionsToday} Today` },
    { label: 'Minutes', value: `⏱ ${minutesToday} min` },
    { label: 'Streak', value: `⚡ ${streak}-day` },
  ];

  return (
    <div className="hidden md:block w-full max-w-[900px] lg:max-w-[1280px] px-8 lg:px-10 pt-8 pb-8">
      {/* Tablet only: the sidebar carries these on desktop */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <WhatsDoseButton
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/30 text-primary-strong font-heading font-bold text-xs hover:bg-primary/10 transition-colors"
        />
        <ThemeToggle />
      </div>

      {/* Greeting + Slick */}
      <div className="grid lg:grid-cols-12 gap-4 lg:gap-8 items-center mb-8">
        <div className="lg:col-span-5">
          <h1 className="text-3xl font-heading font-extrabold text-foreground tracking-tight mb-1">
            {sessionsCount > 0 ? 'Welcome back!' : 'Ready to ride the WAVE?'}
          </h1>
          <p className="text-text-secondary font-body text-base">Your ADHD-friendly focus toolkit</p>
        </div>
        <div className="lg:col-span-7 dose-card">
          <SlickMessage message="Hey! I'm Slick. Pick a tool — SPARK for emotions, WAVE for focus, RSD for rejection, Squad for studying together." />
        </div>
      </div>

      {hasActiveSession && (
        <div className="dose-card p-4 mb-8">
          <span className="step-label text-xs">PICK UP WHERE YOU LEFT OFF</span>
          <p className="text-foreground font-heading font-bold text-sm mt-1">{waveSession.task}</p>
          <button
            onClick={() => navigate('/wave/session')}
            className={`mt-2 text-primary-strong text-sm font-heading font-bold flex items-center gap-1 hover:underline rounded-button ${focusRing}`}
          >
            Resume <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="dose-card flex flex-col items-center py-5">
            <span className="text-text-secondary font-body text-xs uppercase tracking-wider mb-1">{s.label}</span>
            <span className="text-foreground font-heading font-bold text-base">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tools */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {TOOLS.map(({ id, route, icon, label, description }) => (
          <Link
            key={id}
            to={route}
            className={`flex flex-col items-start gap-3 min-h-[140px] p-5 rounded-button border-2 border-tool-accent bg-transparent text-foreground transition-colors hover:bg-tool-accent/10 ${focusRing}`}
          >
            <span className="flex items-center justify-center w-7 h-7 text-[24px] leading-none" aria-hidden="true">{icon}</span>
            <span className="font-heading font-bold text-lg">{label}</span>
            <span className="text-text-secondary font-body text-sm">{description}</span>
          </Link>
        ))}
      </div>

      {/* Recent sessions + side column */}
      <div className="grid lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 dose-card p-6" aria-labelledby="recent-sessions-heading">
          <h2 id="recent-sessions-heading" className="text-text-secondary text-xs font-body font-medium uppercase tracking-wider mb-2">
            Recent Sessions
          </h2>
          {RECENT_SESSIONS.map((s) => (
            <div key={s} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <span className="text-foreground text-sm font-body">{s}</span>
              <Check size={14} className="text-success" aria-label="Completed" />
            </div>
          ))}
        </section>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="dose-card p-4 flex items-center gap-3">
            <span className="text-foreground font-heading font-bold text-sm">{xp} XP</span>
            <div className="flex-1 h-2 rounded-full bg-bg-elevated overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(xp % 100, 100)}%` }} />
            </div>
          </div>
          <Link
            to="/ignite"
            className={`dose-card p-4 flex items-center gap-3 hover:border-primary/50 transition-colors group ${focusRing}`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flame size={20} className="text-primary-strong" />
            </div>
            <div className="flex-1">
              <span className="text-foreground font-heading font-bold text-sm block">IGNITE</span>
              <span className="text-muted-foreground font-body text-xs">Break any task into your first move</span>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary-strong transition-colors" />
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground font-body">
        <Link to="/privacy" className="hover:text-primary-strong transition-colors">Privacy Policy</Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} DOSE Academy</span>
      </div>
    </div>
  );
};

export default HomeDashboard;
