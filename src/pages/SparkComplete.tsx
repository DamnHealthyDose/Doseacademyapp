import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

const SparkComplete = () => {
  const navigate = useNavigate();
  const { streak, resetSpark } = useAppState();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-[420px] w-full px-6 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center mb-6"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-4xl">⚡</span>
        </motion.div>

        <motion.h1
          className="text-2xl font-heading font-extrabold text-foreground mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          You SPARKed it!
        </motion.h1>

        <motion.p
          className="text-text-secondary text-sm font-body leading-relaxed mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{ textWrap: 'balance' }}
        >
          That took courage. You named what was happening and chose a next step. That's the whole skill.
        </motion.p>

        <motion.div
          className="inline-flex items-center gap-2 bg-success/15 text-success font-heading font-bold text-sm px-4 py-2 rounded-button mb-3"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          +20 XP
        </motion.div>

        <motion.p
          className="text-foreground font-heading font-bold text-base mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ⚡ Streak: {streak} days
        </motion.p>

        <motion.div className="flex flex-col gap-3 w-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <button
            onClick={() => { resetSpark(); navigate('/'); }}
            className="w-full h-14 bg-primary text-primary-foreground font-heading font-bold rounded-button flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
          >
            <Home size={18} /> Go home
          </button>
          <button
            onClick={() => { resetSpark(); navigate('/spark'); }}
            className="w-full h-14 border-2 border-primary text-primary font-heading font-bold rounded-button flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
          >
            <RotateCcw size={18} /> Do it again
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SparkComplete;
