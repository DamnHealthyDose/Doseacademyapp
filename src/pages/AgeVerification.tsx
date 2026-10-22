import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type AgeStatus = 'input' | 'under13' | 'needs-parent' | 'verified';

const AgeVerification = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/squad/setup?mode=invite';
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [dob, setDob] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [status, setStatus] = useState<AgeStatus>('input');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/auth?redirect=/age-verify', { replace: true });
    return null;
  }

  // Already verified
  if (profile?.age_verified) {
    navigate(redirect, { replace: true });
    return null;
  }

  // Age bracket, verification and the parental-consent token are set server-side
  // (verify-age edge function). The browser can't write those columns.
  const callVerifyAge = async (payload: { dob: string; parent_email?: string }) => {
    const { data, error } = await supabase.functions.invoke('verify-age', { body: payload });
    if (error) {
      let message = error.message;
      try {
        const body = await (error as { context?: Response }).context?.json();
        if (body?.error) message = body.error;
      } catch { /* keep generic message */ }
      throw new Error(message);
    }
    return data as { status: 'verified' | 'under13' | 'needs-parent' | 'consent-requested' };
  };

  const handleVerify = async () => {
    if (!dob) return;
    setLoading(true);
    try {
      const { status: result } = await callVerifyAge({ dob });
      if (result === 'verified') {
        await refreshProfile();
        setStatus('verified');
        setTimeout(() => navigate(redirect, { replace: true }), 1500);
      } else if (result === 'under13' || result === 'needs-parent') {
        setStatus(result);
      }
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleParentConsent = async () => {
    if (!parentEmail) return;
    setLoading(true);
    try {
      await callVerifyAge({ dob, parent_email: parentEmail });
      await refreshProfile();
      toast({
        title: 'Request sent',
        description: "We've emailed your parent or guardian. This feature unlocks once they approve.",
      });
    } catch (e) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] px-6 pt-6">
        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-foreground mb-4" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {status === 'input' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={24} className="text-primary-strong" />
                <h1 className="text-2xl font-heading font-extrabold text-foreground">Age Verification</h1>
              </div>
              <p className="text-text-secondary text-sm font-body mb-6">
                To keep everyone safe, we need to verify your age before you can study with friends.
              </p>

              <label className="text-foreground font-body text-sm font-medium mb-2 block">Date of birth</label>
              <input
                type="date" aria-label="Date of birth"
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-12 bg-bg-elevated rounded-card px-4 text-foreground font-body text-base outline-none border-2 border-transparent focus:border-primary-strong transition-colors"
              />

              <button
                onClick={handleVerify}
                disabled={!dob || loading}
                className="w-full h-12 mt-6 bg-primary text-primary-foreground font-heading font-bold rounded-button disabled:opacity-30"
              >
                Verify my age
              </button>

              <p className="text-text-hint text-xs font-body text-center mt-4">
                Your date of birth is stored securely and never shared.
              </p>
            </>
          )}

          {status === 'under13' && (
            <div className="text-center pt-8">
              <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">
                Not available yet
              </h2>
              <p className="text-text-secondary text-sm font-body mb-6">
                You need to be at least 13 to use the Study with a Friend feature.
                You can still use all other features in the app!
              </p>
              <button
                onClick={() => navigate('/squad')}
                className="w-full h-12 bg-squad text-squad-foreground font-heading font-bold rounded-button"
              >
                Back to Squad Focus
              </button>
            </div>
          )}

          {status === 'needs-parent' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={24} className="text-warning" />
                <h2 className="text-xl font-heading font-extrabold text-foreground">Parental Consent Needed</h2>
              </div>
              <p className="text-text-secondary text-sm font-body mb-6">
                Since you're between 13 and 15, we need a parent or guardian's permission.
                Enter their email and we'll send them a consent request.
              </p>

              <label className="text-foreground font-body text-sm font-medium mb-2 block">Parent/guardian email</label>
              <input
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={e => setParentEmail(e.target.value)}
                className="w-full h-12 bg-bg-elevated rounded-card px-4 text-foreground font-body text-base outline-none border-2 border-transparent focus:border-primary-strong transition-colors placeholder:text-text-hint"
              />

              <button
                onClick={handleParentConsent}
                disabled={!parentEmail || loading}
                className="w-full h-12 mt-4 bg-primary text-primary-foreground font-heading font-bold rounded-button disabled:opacity-30"
              >
                Send consent request
              </button>

              <button
                onClick={() => navigate('/squad')}
                className="text-text-hint text-sm font-body underline w-full text-center mt-4"
              >
                Go back to Squad Focus
              </button>
            </>
          )}

          {status === 'verified' && (
            <div className="text-center pt-8">
              <ShieldCheck size={48} className="text-squad mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">
                Verified! ✓
              </h2>
              <p className="text-text-secondary text-sm font-body">
                Redirecting you now...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgeVerification;
