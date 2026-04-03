import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/dose-logo.png';

const SquadInvite = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const { user, profile } = useAuth();

  const handleJoin = () => {
    if (!user) {
      navigate(`/auth?redirect=/squad/invite/${code}`);
    } else if (!profile?.age_verified) {
      navigate(`/age-verify?redirect=/squad/invite/${code}`);
    } else {
      navigate(`/squad/setup?mode=invite&joined=true&code=${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <motion.img src={logo} alt="DOSE Academy" className="w-16 h-16 mb-6"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />

        <motion.h1 className="text-2xl font-heading font-extrabold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          You've been invited to study!
        </motion.h1>
        <motion.p className="text-text-secondary text-sm font-body mb-8"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Someone wants to focus with you. Sign in and verify your age to join them.
        </motion.p>

        <motion.button
          onClick={handleJoin}
          className="w-full h-14 bg-squad text-primary-foreground font-heading font-bold rounded-button"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          {!user ? 'Sign in to join →' : !profile?.age_verified ? 'Verify age to join →' : 'Join the session →'}
        </motion.button>
      </div>
    </div>
  );
};

export default SquadInvite;
