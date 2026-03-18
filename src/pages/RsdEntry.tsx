import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RsdEntry = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center">
        <motion.h1
          className="text-[28px] font-heading font-extrabold text-foreground leading-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          That really stung, didn't it.
        </motion.h1>

        <motion.p
          className="text-[15px] font-body text-rsd-warm/80 mt-4 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Your feelings are real. Your brain is doing its ADHD thing. Let's get through it together.
        </motion.p>

        <motion.button
          onClick={() => navigate('/rsd/flow')}
          className="w-full h-14 mt-10 bg-rsd-warm text-primary-foreground font-heading font-bold text-base rounded-button
                     hover:brightness-110 transition-all"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileTap={{ scale: 0.97 }}
        >
          Yeah. Let's go →
        </motion.button>

        <motion.button
          onClick={() => navigate('/rsd/breathe', { state: { returnTo: '/rsd/flow', returnStep: 2 } })}
          className="mt-4 text-rsd-calm text-sm font-body hover:underline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
        >
          I just need to breathe first
        </motion.button>
      </div>
    </div>
  );
};

export default RsdEntry;
