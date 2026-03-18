import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '@/assets/dose-logo.png';

const SquadInvite = () => {
  const navigate = useNavigate();
  const { code } = useParams();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <motion.img src={logo} alt="DOSE Academy" className="w-16 h-16 mb-6"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />

        <motion.h1 className="text-2xl font-heading font-extrabold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          A friend wants to study with you
        </motion.h1>
        <motion.p className="text-text-secondary text-sm font-body mb-8"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Squad Focus — silent co-working for ADHD brains
        </motion.p>

        <motion.div className="w-full dose-card p-5 text-left space-y-3 mb-8"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-start gap-3">
            <span className="text-squad text-lg">1.</span>
            <p className="text-foreground text-sm font-body">Set your task (what you're working on)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-squad text-lg">2.</span>
            <p className="text-foreground text-sm font-body">Pick your timer (10, 15, 25, or 45 min)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-squad text-lg">3.</span>
            <p className="text-foreground text-sm font-body">You both focus — silently, separately, together</p>
          </div>
        </motion.div>

        <motion.button
          onClick={() => navigate(`/squad/setup?mode=invite&joined=true&code=${code}`)}
          className="w-full h-14 bg-squad text-primary-foreground font-heading font-bold rounded-button"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          Join the session →
        </motion.button>

        <p className="text-text-hint text-xs font-body mt-4">No account needed for your first session.</p>
      </div>
    </div>
  );
};

export default SquadInvite;
