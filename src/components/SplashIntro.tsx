"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const SplashIntro: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show once per browser tab session to keep navigation fast
    const hasSeen = typeof window !== "undefined" ? sessionStorage.getItem("gh_intro_seen") : null;
    if (hasSeen) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("gh_splash_fade"));
      }
      return;
    }

    setIsVisible(true);

    // Duration: 1.6 seconds display time before the slow fade-out
    const timer = setTimeout(() => {
      handleDismiss();
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("gh_intro_seen", "true");
      window.dispatchEvent(new CustomEvent("gh_splash_fade"));
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="editorial-splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.9,
              ease: [0.4, 0, 0.2, 1], // Slow, graceful fade-out
            },
          }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] bg-[#0c0d10] flex flex-col items-center justify-center p-6 cursor-pointer select-none overflow-hidden"
          style={{ touchAction: "manipulation" }}
        >
          {/* Subtle Ambient Depth Glow */}
          <div className="absolute w-[360px] h-[360px] bg-[#6B95FF]/[0.08] rounded-full blur-[100px] pointer-events-none" />

          {/* Central Editorial Typographic Block */}
          <motion.div
            exit={{
              opacity: 0,
              scale: 0.98,
              transition: {
                duration: 0.6,
                ease: "easeOut",
              },
            }}
            className="relative flex flex-col items-center justify-center gap-3 w-full max-w-sm text-center px-4"
          >
            {/* Top Micro-Badge & Dot */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex items-center gap-2 mb-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B95FF] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#dea32c] font-bold">
                Gajjar Hub
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#F3F4F6]"
            >
              Gajjar Hub
            </motion.h1>

            {/* Luminous Expanding Hairline Rule */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                duration: 0.75,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-48 sm:w-56 h-[1.5px] bg-gradient-to-r from-transparent via-[#6B95FF] to-transparent shadow-[0_0_10px_rgba(107,149,255,0.7)]"
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
              className="text-xs sm:text-sm font-mono text-text-muted tracking-wide"
            >
              Everything in one place.
            </motion.p>
          </motion.div>

          {/* Subtle tap to skip hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute bottom-8 text-[11px] font-mono text-text-dim tracking-wider"
          >
            tap to skip
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
