import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("dose_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (level: "all" | "essential") => {
    localStorage.setItem("dose_cookie_consent", JSON.stringify({ level, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-lg rounded-2xl border border-white/10 bg-card p-5 shadow-2xl backdrop-blur-md"
        >
          <button onClick={() => accept("essential")} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
            <X size={18} />
          </button>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary/15 p-2">
              <Cookie size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground font-nunito">We respect your privacy 🍪</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground font-dm-sans">
                DOSE Academy uses essential cookies to keep the app working and optional analytics cookies to improve your experience. No data is shared with third parties.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => accept("all")}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] font-nunito"
            >
              Accept all
            </button>
            <button
              onClick={() => accept("essential")}
              className="flex-1 rounded-xl border border-white/10 bg-transparent py-2.5 text-xs font-bold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] font-nunito"
            >
              Essential only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
