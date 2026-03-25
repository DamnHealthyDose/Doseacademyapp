import { motion } from 'framer-motion';
import slickImg from '@/assets/slick-character.png';

interface SlickMessageProps {
  message: string;
}

const SlickMessage = ({ message }: SlickMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-start gap-3 px-2 py-3"
    >
      <div className="relative flex-shrink-0">
        <motion.div
          className="w-10 h-10 rounded-full overflow-hidden bg-white border-2 border-muted"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img src={slickImg} alt="Slick" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-bg-deep" />
      </div>
      <p className="text-text-secondary text-sm font-body leading-relaxed pt-1" style={{ textWrap: 'balance' }}>
        {message}
      </p>
    </motion.div>
  );
};

export default SlickMessage;
