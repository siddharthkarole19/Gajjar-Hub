"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal / Sheet Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-[#1a1a1c] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[24px] p-6 sm:p-8 shadow-2xl flex flex-col z-10 safe-bottom overflow-hidden"
          >
            {/* Top Drag Indicator (mobile only) */}
            <div className="sm:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-white/10">
              <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#E5E7EB]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.09] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[calc(85vh-110px)] py-1 pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
