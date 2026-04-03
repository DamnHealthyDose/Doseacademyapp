import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import { differenceInYears } from 'date-fns';

type AgeGateResult = 'input' | 'under13' | 'pass';

const SignupAgeCheck = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/squad';
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<AgeGateResult>('input');

  const handleCheck = () => {
    if (!dob) return;
    const age = differenceInYears(new Date(), new Date(dob));

    if (age < 13) {
      setResult('under13');
      return;
    }

    // 13+ can proceed to create account — pass DOB and age bracket forward
    const bracket = age < 16 ? '13-15' : '16+';
    navigate(`/auth?redirect=${encodeURIComponent(redirect)}&dob=${dob}&bracket=${bracket}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[420px] px-6 pt-6">
        <button onClick={() => navigate(-1)} className="text-text-secondary hover:text-foreground mb-4">
          <ArrowLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {result === 'input' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={24} className="text-primary" />
                <h1 className="text-2xl font-heading font-extrabold text-foreground">Before we start</h1>
              </div>
              <p className="text-text-secondary text-sm font-body mb-6">
                To keep everyone safe, we need to check your age before creating an account.
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
                onClick={handleCheck}
                disabled={!dob}
                className="w-full h-12 mt-6 bg-primary text-primary-foreground font-heading font-bold rounded-button disabled:opacity-30"
              >
                Continue
              </button>

              <p className="text-text-hint text-xs font-body text-center mt-4">
                Your date of birth is only used to verify your age and is never shared.
              </p>
            </>
          )}

          {result === 'under13' && (
            <div className="text-center pt-8">
              <AlertTriangle size={48} className="text-warning mx-auto mb-4" />
              <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">
                Not available yet
              </h2>
              <p className="text-text-secondary text-sm font-body mb-6">
                You need to be at least 13 to create an account. You can still use all the tools in DOSE Academy without signing up!
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full h-12 bg-primary text-primary-foreground font-heading font-bold rounded-button"
              >
                Back to home
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignupAgeCheck;
