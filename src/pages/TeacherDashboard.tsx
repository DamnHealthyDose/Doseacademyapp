import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Flame, AlertTriangle, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SessionRow {
  student_id: string;
  age_group: string;
  steps_completed: number;
  spark_handoff: boolean;
  session_completed: boolean;
  streak_day: number;
  created_at: string;
}

interface StreakRow {
  user_id: string;
  current_streak: number;
  last_activity_date: string | null;
}

interface StudentSummary {
  id: string;
  sessionsThisWeek: number;
  avgSteps: number;
  sparkHandoffs: number;
  currentStreak: number;
  totalSessions: number;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [streaks, setStreaks] = useState<StreakRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    checkRole();
  }, [user, authLoading]);

  const checkRole = async () => {
    const { data } = await supabase.rpc('has_role', { _user_id: user!.id, _role: 'admin' });
    if (data) { setAuthorized(true); fetchData(); return; }
    const { data: isMod } = await supabase.rpc('has_role', { _user_id: user!.id, _role: 'moderator' });
    if (isMod) { setAuthorized(true); fetchData(); return; }
    setAuthorized(false);
  };

  const fetchData = async () => {
    const [sessionsRes, streaksRes] = await Promise.all([
      supabase.from('barkley_memory').select('student_id, age_group, steps_completed, spark_handoff, session_completed, streak_day, created_at'),
      supabase.from('ignite_streaks').select('user_id, current_streak, last_activity_date'),
    ]);
    setSessions((sessionsRes.data as SessionRow[]) || []);
    setStreaks((streaksRes.data as StreakRow[]) || []);
    setLoading(false);
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const filteredSessions = useMemo(() => {
    const cutoff = timeRange === 'week' ? weekAgo : monthAgo;
    return sessions.filter(s => new Date(s.created_at) >= cutoff);
  }, [sessions, timeRange]);

  const students: StudentSummary[] = useMemo(() => {
    const map = new Map<string, SessionRow[]>();
    filteredSessions.forEach(s => {
      if (!map.has(s.student_id)) map.set(s.student_id, []);
      map.get(s.student_id)!.push(s);
    });

    return Array.from(map.entries()).map(([id, rows]) => {
      const streak = streaks.find(s => s.user_id === id);
      const totalSteps = rows.reduce((a, r) => a + r.steps_completed, 0);
      return {
        id: id.slice(0, 8),
        sessionsThisWeek: rows.length,
        avgSteps: rows.length ? Math.round(totalSteps / rows.length * 10) / 10 : 0,
        sparkHandoffs: rows.filter(r => r.spark_handoff).length,
        currentStreak: streak?.current_streak ?? 0,
        totalSessions: rows.length,
      };
    });
  }, [filteredSessions, streaks]);

  const totals = useMemo(() => ({
    sessions: filteredSessions.length,
    avgSteps: filteredSessions.length
      ? Math.round(filteredSessions.reduce((a, s) => a + s.steps_completed, 0) / filteredSessions.length * 10) / 10
      : 0,
    sparkRate: filteredSessions.length
      ? Math.round(filteredSessions.filter(s => s.spark_handoff).length / filteredSessions.length * 100)
      : 0,
    activeStudents: new Set(filteredSessions.map(s => s.student_id)).size,
  }), [filteredSessions]);

  if (authLoading || authorized === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary font-body">Loading dashboard...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <AlertTriangle size={32} className="text-amber-400 mx-auto" />
          <h1 className="text-xl font-heading font-extrabold text-foreground">Access Denied</h1>
          <p className="text-text-secondary font-body text-sm">You need an admin or moderator role to view this dashboard.</p>
          <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-heading font-bold text-sm">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="w-full max-w-3xl mx-auto px-6 pt-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-text-secondary hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-foreground flex items-center gap-2">
              <BarChart3 size={24} className="text-primary" /> Teacher Dashboard
            </h1>
            <p className="text-text-secondary font-body text-sm">IGNITE session data — aggregated, no raw task text</p>
          </div>
        </div>

        {/* Time range toggle */}
        <div className="flex gap-2 mb-6">
          {(['week', 'month'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-4 py-2 rounded-lg font-heading font-bold text-sm transition-colors ${
                timeRange === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-text-secondary'
              }`}
            >
              {t === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard icon={<Users size={18} />} label="Active Students" value={totals.activeStudents} />
          <SummaryCard icon={<TrendingUp size={18} />} label="Total Sessions" value={totals.sessions} />
          <SummaryCard icon={<Flame size={18} />} label="Avg Steps/Session" value={totals.avgSteps} />
          <SummaryCard icon={<AlertTriangle size={18} />} label="SPARK Handoff Rate" value={`${totals.sparkRate}%`} />
        </div>

        {/* Student table */}
        <div className="bg-secondary/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 font-heading font-bold text-text-secondary">Student</th>
                  <th className="text-right px-4 py-3 font-heading font-bold text-text-secondary">Sessions</th>
                  <th className="text-right px-4 py-3 font-heading font-bold text-text-secondary">Avg Steps</th>
                  <th className="text-right px-4 py-3 font-heading font-bold text-text-secondary">SPARK</th>
                  <th className="text-right px-4 py-3 font-heading font-bold text-text-secondary">Streak</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-secondary font-body">
                      No session data yet
                    </td>
                  </tr>
                ) : (
                  students.map(s => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-body text-foreground">#{s.id}</td>
                      <td className="px-4 py-3 text-right font-body text-foreground">{s.sessionsThisWeek}</td>
                      <td className="px-4 py-3 text-right font-body text-foreground">{s.avgSteps}</td>
                      <td className="px-4 py-3 text-right font-body">
                        <span className={s.sparkHandoffs > 2 ? 'text-amber-400' : 'text-foreground'}>
                          {s.sparkHandoffs}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-body text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Flame size={14} className="text-primary" /> {s.currentStreak}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-text-secondary/60 font-body text-xs mt-4 text-center">
          Raw task text is never displayed. Only aggregated behavioral data is shown to preserve student trust.
        </p>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <motion.div
    className="bg-secondary/50 rounded-xl p-4 space-y-1"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="text-primary">{icon}</div>
    <p className="text-lg font-heading font-extrabold text-foreground">{value}</p>
    <p className="text-xs font-body text-text-secondary">{label}</p>
  </motion.div>
);

export default TeacherDashboard;
