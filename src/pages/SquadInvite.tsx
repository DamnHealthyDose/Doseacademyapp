import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '@/assets/dose-logo.png';

const SquadInvite = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <motion.img src={logo} alt="DOSE Academy" className="w-16 h-16 mb-6"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />

        <motion.h1 className="text-2xl font-heading font-extrabold text-foreground mb-2"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          This feature is coming soon
        </motion.h1>
        <motion.p className="text-text-secondary text-sm font-body mb-8"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          We're adding age verification to keep everyone safe before enabling study-with-a-friend sessions.
        </motion.p>

        <motion.button
          onClick={() => navigate('/squad')}
          className="w-full h-14 bg-squad text-primary-foreground font-heading font-bold rounded-button"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          Go to Squad Focus →
        </motion.button>
      </div>
    </div>
  );
};

export default SquadInvite;
