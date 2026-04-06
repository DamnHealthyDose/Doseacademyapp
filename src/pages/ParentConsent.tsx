import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

type ConsentStatus = 'loading' | 'valid' | 'expired' | 'invalid' | 'confirmed';

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parent-account-action`;

const ParentConsent = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<ConsentStatus>('loading');
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('invalid'); return; }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const resp = await fetch(FUNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: 'validate', token }),
      });

      if (resp.status === 410) { setStatus('expired'); return; }
      if (!resp.ok) { setStatus('invalid'); return; }

      const data = await resp.json();
      setChildName(data.display_name || 'your child');
      setStatus('valid');
    } catch {
      setStatus('invalid');
    }
  };

  const handleConsent = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const resp = await fetch(FUNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: 'grant-consent', token }),
      });

      if (resp.ok) {
        setStatus('confirmed');
      } else {
        setStatus('invalid');
      }
    } catch {
      setStatus('invalid');
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
              <p className="text-text-secondary font-body mb-6">
                {childName} would like to use peer features in DOSE Academy.
                By granting consent, you confirm you are their parent or legal guardian.
              </p>
              <button
                onClick={handleConsent}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg disabled:opacity-50"
              >
                {loading ? 'Confirming...' : 'Grant Consent'}
              </button>
            </>
          )}

          {status === 'expired' && (
            <>
              <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">Link Expired</h1>
              <p className="text-text-secondary font-body">
                This consent link has expired. Your child can request a new one from within the app.
              </p>
            </>
          )}

          {status === 'invalid' && (
            <>
              <AlertTriangle size={48} className="text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">Invalid Link</h1>
              <p className="text-text-secondary font-body">
                This consent link is no longer valid.
              </p>
            </>
          )}

          {status === 'confirmed' && (
            <>
              <CheckCircle size={48} className="text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-heading font-extrabold text-foreground mb-2">Consent Granted!</h1>
              <p className="text-text-secondary font-body">
                {childName} can now access peer features. You can manage this from the link in your email.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ParentConsent;
