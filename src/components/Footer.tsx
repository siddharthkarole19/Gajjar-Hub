"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] mt-auto py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-text-dim">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span>© Gajjar Hub</span>
          <span>•</span>
          <span>Campus Hostel Portal</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          <span>Warden office:</span>
          <a
            href="tel:+919876543210"
            className="text-text-muted hover:text-primary transition-colors"
          >
            +91 98765 43210
          </a>
          <span>•</span>
          <a
            href="mailto:warden.office@hostel.edu"
            className="text-text-muted hover:text-primary transition-colors"
          >
            warden.office@hostel.edu
          </a>
        </div>
      </div>
    </footer>
  );
};
