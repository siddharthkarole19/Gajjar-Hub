"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, User, Sparkles, ChevronDown } from "lucide-react";

export const DemoRoleSwitcher: React.FC = () => {
  const { profile, isCaptain, isDemoMode, switchDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Show only in demo mode or for testing convenience
  if (!isDemoMode && !process.env.NEXT_PUBLIC_SHOW_TEST_SWITCHER) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-[280px]">
      <div className="bg-[#1e1f24]/95 border border-white/15 rounded-2xl shadow-2xl p-2.5 backdrop-blur-md text-xs">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 cursor-pointer select-none text-[#E5E7EB]"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>Role:</span>
            <span className={`font-mono font-semibold uppercase ${isCaptain ? "text-primary" : "text-amber"}`}>
              {profile?.role || "student"}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>

        {isOpen && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <p className="text-[11px] text-text-dim leading-snug">
              Toggle role to test Student vs. Captain permissions (Notices, Menus, Polls, HS).
            </p>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  switchDemoRole("student");
                  setIsOpen(false);
                }}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-mono text-[11px] transition-all ${
                  !isCaptain
                    ? "bg-amber text-[#0D1224] font-bold shadow-md"
                    : "bg-white/[0.05] text-text-muted hover:bg-white/[0.1]"
                }`}
              >
                <User className="w-3 h-3" /> Student
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole("captain");
                  setIsOpen(false);
                }}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-mono text-[11px] transition-all ${
                  isCaptain
                    ? "bg-primary text-[#0D1224] font-bold shadow-md"
                    : "bg-white/[0.05] text-text-muted hover:bg-white/[0.1]"
                }`}
              >
                <ShieldCheck className="w-3 h-3" /> Captain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
