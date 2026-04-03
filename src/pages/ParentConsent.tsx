import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type ConsentStatus = 'loading' | 'valid' | 'expired' | 'invalid' | 'confirmed';

const ParentConsent = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<ConsentStatus>('loading');
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, consent_token_expires_at')
      .eq('consent_token', token)
      .single();

    if (error || !data) {
      setStatus('invalid');
      return;
    }

    if (data.consent_token_expires_at && new Date(data.consent_token_expires_at) < new Date()) {
      setStatus('expired');
      return;
    }

    setChildName(data.display_name || 'your child');
    setStatus('valid');
  };

  const handleConsent = async () => {
    if (!token) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        parent_consent_given: true,
        parent_consent_at: new Date().toISOString(),
        age_verified: true,
        consent_token: null,
        consent_token_expires_at: null,
      })
      .eq('consent_token', token);

    if (error) {
      setStatus('invalid');
    } else {
      setStatus('confirmed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-full max-w-[420px] px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          {status === 'loading' && (
            <p className="text-text-secondary font-body">Verifying consent request...</p>
          )}

          {status === 'valid' && (
            <>
              <ShieldCheck size={48} className="text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">
                Parental Consent Request
              </h1>
              <p className="text-text-secondary text-sm font-body mb-6">
                <strong>{childName}</strong> wants to use the "Study with a Friend" feature on DOSE Academy.
                This feature allows paired study sessions with another verified user. No chat, messaging, or personal info is shared — only silent co-presence and a single-word check-in.
              </p>
              <p className="text-text-secondary text-sm font-body mb-6">
                By giving consent, you confirm you are the parent or legal guardian of this user and authorize them to use this feature.
              </p>
              <button
                onClick={handleConsent}
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground font-heading font-bold rounded-button disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'I give my consent'}
              </button>
              <p className="text-text-hint text-xs font-body mt-4">
                You can revoke consent at any time by contacting us at getdose.app
              </p>
            </>
          )}

          {status === 'expired' && (
            <>
              <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">Link expired</h2>
              <p className="text-text-secondary text-sm font-body">
                This consent link has expired. Your child can request a new one from the app.
              </p>
            </>
          )}

          {status === 'invalid' && (
            <>
              <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">Invalid link</h2>
              <p className="text-text-secondary text-sm font-body">
                This consent link is no longer valid or has already been used.
              </p>
            </>
          )}

          {status === 'confirmed' && (
            <>
              <CheckCircle size={48} className="text-squad mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">
                Consent confirmed ✓
              </h2>
              <p className="text-text-secondary text-sm font-body">
                Thank you! Your child can now use the Study with a Friend feature. You can close this page.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ParentConsent;
