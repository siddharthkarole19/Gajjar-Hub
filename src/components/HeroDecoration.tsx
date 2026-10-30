"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const HeroDecoration: React.FC<{ isDesktopHero?: boolean }> = ({ isDesktopHero = false }) => {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 45]);

  if (isDesktopHero) {
    return (
      <div
        aria-hidden="true"
        className="relative w-full h-[480px] flex items-center justify-center pointer-events-none select-none overflow-visible"
      >
        {/* Soft Radial Ambient Glow */}
        <div className="absolute w-[340px] h-[340px] bg-[#6B95FF]/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Rotated Dark Charcoal Squares Cluster */}
        <motion.div
          style={{ y: yParallax }}
          className="relative w-[380px] h-[380px] flex items-center justify-center"
        >
          {/* Back Largest Square */}
          <div
            className="absolute w-[320px] h-[320px] bg-[#232427]/70 border border-white/[0.04] rounded-[42px] shadow-2xl"
            style={{ transform: "rotate(45deg)" }}
          />

          {/* Mid Layer Rotated Square */}
          <div
            className="absolute w-[260px] h-[260px] bg-[#1c1d20]/90 border border-white/[0.08] rounded-[36px] shadow-2xl"
            style={{ transform: "rotate(45deg)" }}
          />

          {/* Primary Blue Diamond Outline with Ambient Glow */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-[140px] h-[140px] border-2 border-[#6B95FF] rounded-[22px] shadow-[0_0_40px_rgba(107,149,255,0.45)] bg-[#0D1224]/40 backdrop-blur-sm"
            style={{ transform: "rotate(45deg)" }}
          />

          {/* Floating Small Diamond */}
          <motion.div
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-4 right-10 w-[36px] h-[36px] bg-[#6B95FF]/20 border border-[#6B95FF]/50 rounded-[8px] shadow-[0_0_20px_rgba(107,149,255,0.3)]"
            style={{ transform: "rotate(45deg)" }}
          />

          {/* Accent Mini Diamond */}
          <div
            className="absolute -bottom-2 left-12 w-[24px] h-[24px] bg-white/[0.05] border border-white/10 rounded-[6px]"
            style={{ transform: "rotate(45deg)" }}
          />
        </motion.div>
      </div>
    );
  }

  // Mobile Top-Right Floating Decoration
  return (
    <div
      aria-hidden="true"
      className="md:hidden absolute top-0 right-0 w-[240px] h-[340px] overflow-hidden pointer-events-none select-none z-0"
    >
      <div className="absolute top-[80px] right-[40px] w-40 h-40 bg-[#6B95FF]/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div style={{ y: yParallax }} className="relative w-full h-full">
        <div
          className="absolute -top-[10px] -right-[50px] w-[210px] h-[210px] bg-[#282930]/60 rounded-3xl"
          style={{ transform: "rotate(45deg)" }}
        />
        <div
          className="absolute top-[75px] -right-[15px] w-[170px] h-[170px] bg-[#23242a]/80 border border-white/5 rounded-2xl shadow-2xl"
          style={{ transform: "rotate(45deg)" }}
        />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[68px] right-[52px] w-[62px] h-[62px] border-2 border-[#6B95FF] rounded-lg shadow-[0_0_24px_rgba(107,149,255,0.45)] bg-[#0D1224]/30"
          style={{ transform: "rotate(45deg)" }}
        />
        <div
          className="absolute top-[152px] right-[100px] w-[20px] h-[20px] bg-[#6B95FF]/20 border border-[#6B95FF]/40 rounded-sm"
          style={{ transform: "rotate(45deg)" }}
        />
      </motion.div>
    </div>
  );
};
