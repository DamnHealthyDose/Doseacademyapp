import { motion } from 'framer-motion';

interface ProgressDotsProps {
  total: number;
  current: number;
  completed: number[];
}

const ProgressDots = ({ total, current, completed }: ProgressDotsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        const isCompleted = completed.includes(i);
        return (
          <motion.div
            key={i}
            className={`rounded-full transition-colors duration-200
              ${isActive ? 'bg-primary' : isCompleted ? 'bg-success' : 'bg-bg-elevated'}`}
            animate={{
              width: isActive ? 18 : 6,
              height: 6,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
};

export default ProgressDots;
