import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

interface CookiePrefs {
  essential: boolean;
  analytics: boolean;
  date: string;
}

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("dose_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = (acceptAll?: boolean) => {
    const prefs: CookiePrefs = {
      essential: true,
      analytics: acceptAll ? true : analytics,
      date: new Date().toISOString(),
    };
    localStorage.setItem("dose_cookie_consent", JSON.stringify(prefs));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            onClick={() => save(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl border-t border-white/10 bg-card px-5 pb-6 pt-5 shadow-2xl"
            style={{ maxWidth: 480, margin: "0 auto" }}
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1">
              <div className="rounded-xl bg-primary/15 p-2">
                <Cookie size={20} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground font-nunito">
                Your privacy, your call 🍪
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground font-dm-sans mb-5 pl-[42px]">
              We only use cookies to make DOSE Academy work and (optionally) to understand how you use it. Nothing is ever shared or sold.
            </p>

            {/* Toggles */}
            <div className="space-y-3 mb-5">
              {/* Essential — always on */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-background/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground font-nunito">Essential</p>
                    <p className="text-[11px] text-muted-foreground font-dm-sans">Keeps the app working — always on</p>
                  </div>
                </div>
                <div className="h-6 w-11 rounded-full bg-primary/80 flex items-center justify-end px-0.5 cursor-not-allowed">
                  <div className="h-5 w-5 rounded-full bg-white shadow" />
                </div>
              </div>

              {/* Analytics — toggleable */}
              <button
                onClick={() => setAnalytics(!analytics)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-background/50 px-4 py-3 transition-colors hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-muted-foreground shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground font-nunito">Analytics</p>
                    <p className="text-[11px] text-muted-foreground font-dm-sans">Helps us improve — totally optional</p>
                  </div>
                </div>
                <div
                  className={`h-6 w-11 rounded-full flex items-center px-0.5 transition-colors duration-200 ${
                    analytics ? "bg-primary/80 justify-end" : "bg-white/15 justify-start"
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="h-5 w-5 rounded-full bg-white shadow"
                  />
                </div>
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => save(true)}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] font-nunito"
              >
                Accept all
              </button>
              <button
                onClick={() => save(false)}
                className="flex-1 rounded-xl border border-white/10 bg-transparent py-3 text-sm font-bold text-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] font-nunito"
              >
                Save my choices
              </button>
            </div>

            <p className="text-center text-[11px] text-muted-foreground font-dm-sans mt-3">
              Read our{" "}
              <Link to="/privacy" className="text-primary underline hover:text-primary/80" onClick={() => setVisible(false)}>
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
