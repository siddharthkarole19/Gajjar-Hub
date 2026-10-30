"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Menu, X, Bell, Utensils, Users, User, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, isCaptain, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const desktopNavLinks = [
    { href: "/notices?tab=complaints", label: "Complaints" },
    { href: "/notices?tab=notices", label: "Notices" },
    { href: "/mess", label: "Mess" },
    { href: "/hs", label: "Contact" },
  ];

  const drawerLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/notices?tab=complaints", label: "Complaints", icon: Bell },
    { href: "/notices?tab=notices", label: "Notices", icon: Bell },
    { href: "/mess", label: "Mess", icon: Utensils },
    { href: "/hs", label: "Hostel Management", icon: Users },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#171718]/90 backdrop-blur-md border-b border-white/10 shadow-lg"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-[76px] flex items-center justify-between safe-top">
          {/* Left: Brand Logo & Title */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          >
            <div className="w-[44px] h-[44px] rounded-[12px] bg-white/[0.06] border border-white/10 flex items-center justify-center transition-all group-hover:border-primary/50 group-hover:bg-white/[0.09]">
              <Home className="w-5 h-5 text-[#E5E7EB] group-hover:text-primary transition-colors" strokeWidth={1.75} />
            </div>
            <span className="font-semibold text-[20px] tracking-tight text-[#E5E7EB]">
              Gajjar Hub
            </span>
          </Link>

          {/* Center: Desktop Navigation Links (matching reference image) */}
          <nav className="hidden md:flex items-center gap-8">
            {desktopNavLinks.map((item) => {
              const isActive = pathname === item.href || (item.href.includes("tab=") && pathname === "/notices");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-[15px] font-medium transition-colors hover:text-white ${
                    isActive ? "text-primary font-semibold" : "text-text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: User Login / Profile Pill Button (Desktop) & Hamburger (Mobile) */}
          <div className="flex items-center gap-3">
            {/* Desktop Account / Login Action */}
            <div className="hidden md:flex items-center gap-3">
              {profile ? (
                <div className="flex items-center gap-3">
                  {isCaptain && (
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> CAPTAIN
                    </span>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-sm font-medium text-[#E5E7EB] hover:bg-white/[0.1] hover:border-white/20 transition-all"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span>{profile.full_name || "Profile"}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    title="Sign out"
                    className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-text-muted hover:text-status-danger hover:bg-white/[0.08] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono uppercase tracking-wider text-[#E5E7EB] hover:bg-white/[0.1] hover:border-white/20 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-amber" />
                    <span>Student login</span>
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-xs font-mono uppercase tracking-wider text-primary hover:bg-primary/25 transition-all shadow-sm flex items-center gap-1.5 font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Management</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="md:hidden w-[44px] h-[44px] rounded-[12px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#E5E7EB] hover:bg-white/[0.09] hover:border-white/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-[#1a1a1c] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl safe-top safe-bottom"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-[#E5E7EB]">Gajjar Hub</span>
                    {isCaptain && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> CAPTAIN
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                    className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#E5E7EB] hover:bg-white/[0.09]"
                  >
                    <X className="w-5 h-5" strokeWidth={1.75} />
                  </button>
                </div>

                <nav className="mt-6 flex flex-col gap-2">
                  {drawerLinks.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all ${
                          isActive
                            ? "bg-primary text-[#0D1224] font-semibold shadow-[0_0_20px_rgba(107,149,255,0.3)]"
                            : "text-[#E5E7EB] hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-[#0D1224]" : "text-text-muted"}`} strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-col gap-2">
                {profile ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        pathname === "/profile"
                          ? "bg-primary text-[#0D1224] font-semibold"
                          : "bg-white/[0.04] border border-white/10 text-[#E5E7EB] hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-text-muted" strokeWidth={1.75} />
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium leading-snug">
                            {profile.full_name || "Profile"}
                          </span>
                          <span className="text-[12px] font-mono text-text-dim">
                            {profile.wing_name || "Wing"} • Room {profile.room_no || "---"}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await signOut();
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-status-danger/90 hover:bg-status-danger/10 transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5" strokeWidth={1.75} />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono uppercase tracking-wider text-[#E5E7EB]"
                    >
                      <User className="w-4 h-4 text-amber" />
                      <span>Student Login</span>
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-xl btn-primary text-xs font-mono uppercase tracking-wider font-semibold text-[#0D1224]"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Hostel Management</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
