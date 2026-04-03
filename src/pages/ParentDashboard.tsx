import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Trash2, XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type DashboardStatus = 'loading' | 'valid' | 'invalid' | 'revoked' | 'deleted';

interface ChildData {
  display_name: string | null;
  age_bracket: string | null;
  age_verified: boolean;
  parent_consent_given: boolean;
  created_at: string;
  user_id: string;
}

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
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, age_bracket, age_verified, parent_consent_given, created_at, user_id')
      .eq('consent_token', token)
      .single();

    if (error || !data) {
      // Try parent_email-based lookup for already-confirmed tokens
      setStatus('invalid');
      return;
    }

    setChildData(data as ChildData);
    setStatus('valid');
  };

  const handleRevoke = async () => {
    if (!token) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        parent_consent_given: false,
        age_verified: false,
        parent_consent_at: null,
      })
      .eq('consent_token', token);

    if (error) {
      setStatus('invalid');
    } else {
      setStatus('revoked');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!childData) return;
    setLoading(true);
    // Call the edge function for account deletion
    const { error } = await supabase.functions.invoke('parent-account-action', {
      body: { action: 'delete', userId: childData.user_id, token },
    });

    if (error) {
      setStatus('invalid');
    } else {
      setStatus('deleted');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {status === 'loading' && (
            <p className="text-text-secondary font-body text-center">Loading...</p>
          )}

          {status === 'valid' && childData && (
            <>
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Shield size={24} className="text-primary" />
                <h1 className="text-2xl font-heading font-extrabold text-foreground">Parent Dashboard</h1>
              </div>
              <p className="text-text-secondary text-sm font-body text-center mb-6">
                Review and manage your child's data on DOSE Academy.
              </p>

              <div className="rounded-card bg-bg-elevated p-4 space-y-3 mb-6">
                <DataRow label="Display name" value={childData.display_name || 'Not set'} />
                <DataRow label="Age group" value={childData.age_bracket || 'Not verified'} />
                <DataRow label="Account created" value={new Date(childData.created_at).toLocaleDateString()} />
                <DataRow label="Consent status" value={childData.parent_consent_given ? 'Granted' : 'Pending'} />
              </div>

              <p className="text-text-secondary text-xs font-body mb-4">
                <strong>What we store:</strong> Display name (initials only shown to others), age bracket, and session progress. No photos, school info, or location data.
              </p>

              {!confirmAction ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setConfirmAction('revoke')}
                    className="w-full h-12 border-2 border-warning text-warning font-heading font-bold rounded-button flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> Revoke consent
                  </button>
                  <button
                    onClick={() => setConfirmAction('delete')}
                    className="w-full h-12 border-2 border-destructive text-destructive font-heading font-bold rounded-button flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Delete account & data
                  </button>
                </div>
              ) : (
                <div className="rounded-card bg-bg-elevated p-4">
                  <p className="text-foreground font-body text-sm font-bold mb-2">
                    {confirmAction === 'revoke' ? 'Revoke consent?' : 'Delete account?'}
                  </p>
                  <p className="text-text-secondary text-xs font-body mb-4">
                    {confirmAction === 'revoke'
                      ? "Your child will lose access to Study with a Friend until consent is re-granted."
                      : "This permanently deletes your child's account and all associated data. This cannot be undone."}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 h-10 bg-bg-elevated border border-border rounded-button font-body text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAction === 'revoke' ? handleRevoke : handleDelete}
                      disabled={loading}
                      className="flex-1 h-10 bg-destructive text-primary-foreground rounded-button font-body text-sm font-bold disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {status === 'invalid' && (
            <div className="text-center">
              <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">Invalid link</h2>
              <p className="text-text-secondary text-sm font-body">This link is no longer valid.</p>
            </div>
          )}

          {status === 'revoked' && (
            <div className="text-center">
              <CheckCircle size={48} className="text-warning mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">Consent revoked</h2>
              <p className="text-text-secondary text-sm font-body">Your child's access to peer features has been removed.</p>
            </div>
          )}

          {status === 'deleted' && (
            <div className="text-center">
              <CheckCircle size={48} className="text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">Account deleted</h2>
              <p className="text-text-secondary text-sm font-body">All data has been permanently removed. You can close this page.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-text-hint text-xs font-body">{label}</span>
    <span className="text-foreground text-xs font-body font-medium">{value}</span>
  </div>
);

export default ParentDashboard;
