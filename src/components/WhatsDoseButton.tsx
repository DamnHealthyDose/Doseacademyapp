import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

interface WhatsDoseButtonProps {
  className: string;
  /** Hide the text label (icon-only), keeping an accessible name. */
  iconOnly?: boolean;
  animated?: boolean;
}

const WhatsDoseButton = ({ className, iconOnly = false, animated = false }: WhatsDoseButtonProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const [videoVersion, setVideoVersion] = useState<'narrated' | 'music'>('narrated');

  const content = (
    <>
      <Play size={12} className="fill-current" />
      {iconOnly ? <span className="sr-only">What's DOSE?</span> : <>What's DOSE?</>}
    </>
  );

  return (
    <>
      {animated ? (
        <motion.button
          onClick={() => setShowVideo(true)}
          className={className}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          whileTap={{ scale: 0.95 }}
        >
          {content}
        </motion.button>
      ) : (
        <button onClick={() => setShowVideo(true)} className={className} title={iconOnly ? "What's DOSE?" : undefined}>
          {content}
        </button>
      )}
      {createPortal(
        <AnimatePresence>
          {showVideo && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideo(false)}
            >
              <motion.div
                className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-black shadow-2xl"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Close video"
                >
                  <X size={16} />
                </button>
                <div className="flex bg-black/80 border-b border-white/10">
                  <button
                    onClick={() => setVideoVersion('narrated')}
                    className={`flex-1 py-2.5 text-xs font-heading font-bold transition-colors ${
                      videoVersion === 'narrated' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    🎙 Narrated
                  </button>
                  <button
                    onClick={() => setVideoVersion('music')}
                    className={`flex-1 py-2.5 text-xs font-heading font-bold transition-colors ${
                      videoVersion === 'music' ? 'text-white bg-white/10' : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    🎵 Music Only
                  </button>
                </div>
                <video
                  key={videoVersion}
                  src={videoVersion === 'narrated' ? '/dose-onboarding-narrated.mp4' : '/dose-onboarding-music.mp4'}
                  controls
                  autoPlay
                  className="w-full"
                  style={{ aspectRatio: '16/9' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default WhatsDoseButton;
