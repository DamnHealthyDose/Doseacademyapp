import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Trash2, XCircle, AlertTriangle, CheckCircle, Flame, TrendingUp, Zap } from 'lucide-react';

type DashboardStatus = 'loading' | 'valid' | 'invalid' | 'revoked' | 'deleted';

interface IgniteData {
  currentStreak: number;
  lastActivity: string | null;
  weeklySessionCount: number;
  weeklyAvgSteps: number;
  weeklySparkHandoffs: number;
  totalSessions: number;
  todayActive: boolean;
}

interface ChildData {
  display_name: string | null;
  age_bracket: string | null;
  age_verified: boolean;
  parent_consent_given: boolean;
  created_at: string;
  ignite?: IgniteData;
}

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parent-account-action`;

const ParentDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'revoke' | 'delete' | null>(null);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    fetchChildData();
  }, [token]);

  const fetchChildData = async () => {
    try {
      const resp = await fetch(FUNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: 'validate', token }),
      });

      if (!resp.ok) { setStatus('invalid'); return; }
      const data = await resp.json();
      setChildData(data as ChildData);
      setStatus('valid');
    } catch {
      setStatus('invalid');
    }
  };

  const handleAction = async (action: 'revoke-consent' | 'delete') => {
    if (!token) return;
    setLoading(true);

    try {
      const resp = await fetch(FUNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action, token }),
      });

      if (resp.ok) {
        setStatus(action === 'delete' ? 'deleted' : 'revoked');
      } else {
        setStatus('invalid');
      }
    } catch {
      setStatus('invalid');
    }
    setLoading(false);
    setConfirmAction(null);
  };

  const ignite = childData?.ignite;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {status === 'loading' && (
            <p className="text-text-secondary font-body text-center">Loading dashboard...</p>
          )}

          {status === 'valid' && childData && (
            <div className="space-y-6">
              <div className="text-center">
                <Shield size={48} className="text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-heading font-extrabold text-foreground mb-1">Parent Dashboard</h1>
                <p className="text-text-secondary font-body text-sm">
                  Manage your child's DOSE Academy account
                </p>
              </div>

              {/* Stored Data */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <h2 className="font-heading font-bold text-foreground">Stored Data</h2>
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Display Name</span>
                    <span className="text-foreground">{childData.display_name || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Age Group</span>
                    <span className="text-foreground">{childData.age_bracket || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Consent</span>
                    <span className={childData.parent_consent_given ? 'text-primary' : 'text-destructive'}>
                      {childData.parent_consent_given ? 'Granted' : 'Not granted'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Account Created</span>
                    <span className="text-foreground">{new Date(childData.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* IGNITE Weekly Summary */}
              {ignite && (
                <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                  <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                    <Flame size={18} className="text-primary" /> IGNITE Weekly Summary
                  </h2>

                  {/* Today's status */}
                  <div className="flex items-center gap-2 text-sm font-body">
                    <div className={`w-2 h-2 rounded-full ${ignite.todayActive ? 'bg-primary' : 'bg-text-secondary/30'}`} />
                    <span className="text-foreground">
                      {ignite.todayActive ? 'Active today' : 'Not yet active today'}
                    </span>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
                    <Flame size={16} className="text-primary" />
                    <span className="text-foreground font-heading font-bold text-sm">
                      {ignite.currentStreak}-day streak
                    </span>
                    {ignite.currentStreak >= 7 && (
                      <span className="text-primary text-xs font-body ml-auto">🎉 Milestone!</span>
                    )}
                  </div>

                  {/* Weekly stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2">
                      <TrendingUp size={14} className="text-primary mx-auto mb-1" />
                      <p className="text-lg font-heading font-extrabold text-foreground">{ignite.weeklySessionCount}</p>
                      <p className="text-xs font-body text-text-secondary">Sessions</p>
                    </div>
                    <div className="text-center p-2">
                      <Zap size={14} className="text-primary mx-auto mb-1" />
                      <p className="text-lg font-heading font-extrabold text-foreground">{ignite.weeklyAvgSteps}</p>
                      <p className="text-xs font-body text-text-secondary">Avg Steps</p>
                    </div>
                    <div className="text-center p-2">
                      <AlertTriangle size={14} className="text-amber-400 mx-auto mb-1" />
                      <p className="text-lg font-heading font-extrabold text-foreground">{ignite.weeklySparkHandoffs}</p>
                      <p className="text-xs font-body text-text-secondary">Extra Support</p>
                    </div>
                  </div>

                  {ignite.weeklySparkHandoffs > 0 && (
                    <p className="text-xs font-body text-text-secondary">
                      Your child needed extra support {ignite.weeklySparkHandoffs} time{ignite.weeklySparkHandoffs !== 1 ? 's' : ''} this week. This is normal — it means they recognized when they needed help.
                    </p>
                  )}
                </div>
              )}

              {!confirmAction && (
                <div className="space-y-3">
                  <button
                    onClick={() => setConfirmAction('revoke')}
                    className="w-full py-3 rounded-xl border-2 border-amber-500 text-amber-600 font-heading font-bold flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Revoke Consent
                  </button>
                  <button
                    onClick={() => setConfirmAction('delete')}
                    className="w-full py-3 rounded-xl border-2 border-destructive text-destructive font-heading font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Delete Account
                  </button>
                </div>
              )}

              {confirmAction && (
                <div className="bg-destructive/10 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-body text-foreground">
                    {confirmAction === 'delete'
                      ? 'This will permanently delete your child\'s account and all associated data. This cannot be undone.'
                      : 'This will revoke consent and disable peer features for your child.'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmAction(null)}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-secondary text-foreground font-heading font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction(confirmAction === 'delete' ? 'delete' : 'revoke-consent')}
                      disabled={loading}
                      className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground font-heading font-bold"
                    >
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'revoked' && (
            <div className="text-center">
              <CheckCircle size={48} className="text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">Consent Revoked</h1>
              <p className="text-text-secondary font-body">Peer features have been disabled.</p>
            </div>
          )}

          {status === 'deleted' && (
            <div className="text-center">
              <CheckCircle size={48} className="text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">Account Deleted</h1>
              <p className="text-text-secondary font-body">All data has been permanently removed.</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center">
              <AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">Invalid Link</h1>
              <p className="text-text-secondary font-body">This dashboard link is no longer valid.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard;
