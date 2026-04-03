import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { differenceInYears } from 'date-fns';

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

  const handleVerify = async () => {
    if (!dob) return;
    setLoading(true);

    const birthDate = new Date(dob);
    const age = differenceInYears(new Date(), birthDate);

    if (age < 13) {
      setStatus('under13');
      setLoading(false);
      return;
    }

    if (age < 16) {
      setStatus('needs-parent');
      setLoading(false);
      return;
    }

    // 16+ — verify immediately
    const ageBracket = '16+';
    const { error } = await supabase
      .from('profiles')
      .update({ date_of_birth: dob, age_verified: true, age_bracket: ageBracket })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      setStatus('verified');
      setTimeout(() => navigate(redirect, { replace: true }), 1500);
    }
    setLoading(false);
  };

  const handleParentConsent = async () => {
    if (!parentEmail) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        date_of_birth: dob,
        parent_email: parentEmail,
        // Parent consent is pending — will need email verification in future
        parent_consent_given: false,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      await refreshProfile();
      toast({
        title: 'Request sent',
        description: "We've saved your parent's email. This feature will be available once parental consent is verified.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] px-6 pt-6">
        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-foreground mb-4">
          <ArrowLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {status === 'input' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={24} className="text-primary" />
                <h1 className="text-2xl font-heading font-extrabold text-foreground">Age Verification</h1>
              </div>
              <p className="text-text-secondary text-sm font-body mb-6">
                To keep everyone safe, we need to verify your age before you can study with friends.
              </p>

              <label className="text-foreground font-body text-sm font-medium mb-2 block">Date of birth</label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-12 bg-bg-elevated rounded-card px-4 text-foreground font-body text-base outline-none border-2 border-transparent focus:border-primary transition-colors"
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
                className="w-full h-12 bg-squad text-primary-foreground font-heading font-bold rounded-button"
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
                className="w-full h-12 bg-bg-elevated rounded-card px-4 text-foreground font-body text-base outline-none border-2 border-transparent focus:border-primary transition-colors placeholder:text-text-hint"
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
