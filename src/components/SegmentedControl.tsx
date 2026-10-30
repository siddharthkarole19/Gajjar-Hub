"use client";

import React from "react";
import { motion } from "framer-motion";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 select-none ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative font-mono uppercase tracking-wider text-center transition-colors duration-200 z-10 focus:outline-none ${
              size === "sm" ? "px-3.5 py-1.5 text-[12px]" : "px-4 py-2 text-[13px]"
            } ${
              isSelected ? "text-[#0D1224] font-semibold" : "text-text-muted hover:text-white"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={`segment-active-${options.map((o) => o.value).join("-")}`}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-primary rounded-lg shadow-[0_0_16px_rgba(107,149,255,0.4)] -z-10"
              />
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
