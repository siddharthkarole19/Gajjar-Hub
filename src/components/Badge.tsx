"use client";

import React from "react";
import { ComplaintStatus } from "../lib/types";

interface EyebrowBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const EyebrowBadge: React.FC<EyebrowBadgeProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`inline-flex items-center justify-center h-[30px] px-3.5 rounded-full bg-[#0D1224] border border-[#1F2A4D] font-mono text-[12px] font-semibold text-primary uppercase tracking-[0.2em] shadow-[0_0_12px_rgba(107,149,255,0.18)] ${className}`}
    >
      {children}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber/15 text-amber border border-amber/30 uppercase tracking-wider">
          OPEN
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider">
          IN PROGRESS
        </span>
      );
    case "resolved":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-status-success/15 text-status-success border border-status-success/30 uppercase tracking-wider">
          RESOLVED
        </span>
      );
    default:
      return null;
  }
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.06] text-text-muted border border-white/10 uppercase tracking-wider">
      {category}
    </span>
  );
};
