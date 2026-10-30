"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { EyebrowBadge } from "../../components/Badge";
import { HeroDecoration } from "../../components/HeroDecoration";
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  ArrowRight,
  ArrowLeft,
  Info,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, isLoading, signIn, signUp, resetPassword, resendConfirmationEmail } = useAuth();

  // If already logged in, redirect to home page
  useEffect(() => {
    if (!isLoading && (user || profile)) {
      router.replace("/");
    }
  }, [user, profile, isLoading, router]);

  // Tab: 'student' or 'management'
  const [portalType, setPortalType] = useState<"student" | "management">("student");
  // Auth Mode: 'signin', 'signup', or 'forgot'
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN;

  // Sample credentials for quick testing
  const SAMPLE_ADMIN = {
    email: "admin@gajjarhub.edu",
    password: "Admin@2026",
  };

  const SAMPLE_STUDENT = {
    email: "student@hostel.edu",
    password: "password123",
  };

  const handleFillAdmin = () => {
    setEmail(SAMPLE_ADMIN.email);
    setPassword(SAMPLE_ADMIN.password);
    setErrorMsg(null);
  };

  const handleFillStudent = () => {
    setEmail(SAMPLE_STUDENT.email);
    setPassword(SAMPLE_STUDENT.password);
    setErrorMsg(null);
  };

  const handlePortalSwitch = (type: "student" | "management") => {
    setPortalType(type);
    setErrorMsg(null);
    setSuccessMsg(null);
    setMode("signin"); // Management is signin only

    if (type === "management") {
      setEmail(SAMPLE_ADMIN.email);
      setPassword(SAMPLE_ADMIN.password);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    if (portalType === "student" && allowedDomain && !email.toLowerCase().endsWith(allowedDomain.toLowerCase())) {
      setErrorMsg(`Student registration is restricted to ${allowedDomain} email addresses`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          router.push("/");
        }
      } else if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMsg("Full name is required");
          return;
        }
        if (password.length < 6) {
          setErrorMsg("Password must be at least 6 characters");
          return;
        }

        const res = await signUp(email.trim(), password, fullName.trim());
        if (res.error) {
          setErrorMsg(res.error);
          if (res.error.toLowerCase().includes("already registered") || res.error.toLowerCase().includes("already exists")) {
            setMode("signin");
          }
        } else if (res.requiresEmailConfirmation) {
          setSuccessMsg(
            `Verification email sent to ${email.trim()}! Please click the confirmation link in your inbox, then sign in below.`
          );
          setMode("signin");
        } else {
          router.push("/onboarding");
        }
      } else if (mode === "forgot") {
        const res = await resetPassword(email.trim());
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg("Password reset email sent! Please check your inbox.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-10 sm:py-16 flex flex-col justify-center overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-36 w-80 h-80 rounded-full bg-primary/15 blur-[120px] pointer-events-none animate-pulse" />
      <div
        className="absolute bottom-1/4 -right-36 w-80 h-80 rounded-full bg-amber/12 blur-[120px] pointer-events-none animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />

      <HeroDecoration />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md mx-auto px-6 w-full flex flex-col gap-5"
      >
        {/* Top Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <EyebrowBadge>AUTHENTICATION PORTAL</EyebrowBadge>
          <h1 className="text-[34px] sm:text-[38px] font-bold text-[#E5E7EB] tracking-tight">
            Gajjar Hub
          </h1>
          <p className="text-sm text-text-muted">
            {portalType === "management"
              ? "Hostel Committee, Captain and Warden Access"
              : "Resident student portal for complaints, mess, and notices"}
          </p>
        </div>

        {/* ================= NOTICE FOR NEW RESIDENTS ================= */}
        {portalType === "student" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber/15 via-amber/10 to-white/[0.02] border border-amber/30 text-amber flex items-start gap-3 shadow-[0_0_24px_rgba(230,168,53,0.12)] relative overflow-hidden"
          >
            <div className="w-7 h-7 rounded-xl bg-amber/20 border border-amber/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider font-bold text-amber mb-0.5">
                <span>First Time Here?</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber/20 border border-amber/30 font-semibold">
                  Required
                </span>
              </div>
              <p className="text-[#E5E7EB]/90 text-[12px] leading-relaxed">
                New residents must <strong>register your account first</strong> before signing in to the hostel portal.
              </p>
            </div>
            {mode !== "signup" && (
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="self-center px-3 py-1.5 rounded-xl bg-amber text-[#0D1224] text-[11px] font-mono font-bold hover:bg-amber-hover active:scale-95 transition-all shadow-md whitespace-nowrap flex items-center gap-1"
              >
                <span>Register</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        )}

        {/* ================= PORTAL SWITCHER: Student vs Management ================= */}
        <div className="p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-2 gap-1.5 relative">
          <button
            type="button"
            onClick={() => handlePortalSwitch("student")}
            className={`relative z-10 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors ${
              portalType === "student" ? "text-[#0D1224] font-bold" : "text-text-muted hover:text-white"
            }`}
          >
            {portalType === "student" && (
              <motion.div
                layoutId="activePortalTab"
                className="absolute inset-0 rounded-xl bg-amber shadow-md"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Student Portal</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("management")}
            className={`relative z-10 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors ${
              portalType === "management" ? "text-[#0D1224] font-bold" : "text-text-muted hover:text-white"
            }`}
          >
            {portalType === "management" && (
              <motion.div
                layoutId="activePortalTab"
                className="absolute inset-0 rounded-xl bg-primary shadow-[0_0_20px_rgba(107,149,255,0.4)]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Management</span>
            </span>
          </button>
        </div>

        {/* ================= MAIN INTERACTIVE CARD ================= */}
        <div className="card-surface p-6 sm:p-7 flex flex-col gap-5 shadow-2xl relative border border-white/10">
          {/* Sub-Switcher for Student: Sign In vs Register */}
          {portalType === "student" && mode !== "forgot" && (
            <div className="p-1 rounded-xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-1 relative">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`relative z-10 py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                  mode === "signin" ? "text-white font-bold" : "text-text-muted hover:text-white"
                }`}
              >
                {mode === "signin" && (
                  <motion.div
                    layoutId="activeStudentMode"
                    className="absolute inset-0 rounded-lg bg-white/[0.1] border border-white/15"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`relative z-10 py-2.5 px-3 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                  mode === "signup" ? "text-amber font-bold" : "text-text-muted hover:text-white"
                }`}
              >
                {mode === "signup" && (
                  <motion.div
                    layoutId="activeStudentMode"
                    className="absolute inset-0 rounded-lg bg-amber/15 border border-amber/30"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-amber" />
                  <span>Register Account</span>
                </span>
              </button>
            </div>
          )}

          {/* Sample Management Credentials Banner */}
          {portalType === "management" && (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-primary">
                  <KeyRound className="w-4 h-4" />
                  <span>SAMPLE ADMIN CREDENTIALS</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary text-[#0D1224] font-bold hover:bg-primary-hover flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Fill
                </button>
              </div>
              <div className="text-xs font-mono space-y-1 text-text-muted bg-black/30 p-2.5 rounded-lg border border-white/5">
                <div>
                  <span className="text-text-dim">Admin ID: </span>
                  <span className="text-[#E5E7EB] font-semibold">{SAMPLE_ADMIN.email}</span>
                </div>
                <div>
                  <span className="text-text-dim">Password: </span>
                  <span className="text-primary font-semibold">{SAMPLE_ADMIN.password}</span>
                </div>
              </div>
              <p className="text-[11px] text-text-dim leading-snug">
                Grants full Captain/Warden privileges to edit menus, post notices, launch polls, and resolve complaints.
              </p>
            </div>
          )}

          {/* Quick Demo Student Autofill */}
          {portalType === "student" && mode === "signin" && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-text-dim">Testing student account?</span>
              <button
                type="button"
                onClick={handleFillStudent}
                className="text-amber hover:underline font-semibold flex items-center gap-1 active:scale-95 transition-all"
              >
                Auto-fill Demo
              </button>
            </div>
          )}

          {/* Alerts */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs font-mono flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.toLowerCase().includes("invalid login credentials") && mode === "signin" && (
                <div className="text-[11px] text-text-dim pt-1 border-t border-status-danger/20 flex items-center justify-between">
                  <span>Haven't created an account yet?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMsg(null);
                    }}
                    className="text-amber font-semibold hover:underline"
                  >
                    Register here →
                  </button>
                </div>
              )}
              {errorMsg.toLowerCase().includes("confirm") && email.trim() && (
                <button
                  type="button"
                  disabled={isResending}
                  onClick={async () => {
                    setIsResending(true);
                    const res = await resendConfirmationEmail(email.trim());
                    setIsResending(false);
                    if (res.error) {
                      setErrorMsg(res.error);
                    } else {
                      setSuccessMsg(`Confirmation email resent to ${email.trim()}! Please check your inbox.`);
                      setErrorMsg(null);
                    }
                  }}
                  className="self-start text-[11px] underline font-semibold text-amber hover:text-white transition-colors"
                >
                  {isResending ? "Resending email..." : "Click here to resend confirmation email"}
                </button>
              )}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-mono flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Dynamic Animated Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={portalType + mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {/* Full Name (Sign Up only) */}
              {portalType === "student" && mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-text-dim" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all duration-200"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
                  {portalType === "management" ? "Admin / Official Email" : "Student Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-text-dim" />
                  <input
                    type="email"
                    required
                    placeholder={portalType === "management" ? "admin@gajjarhub.edu" : "student@hostel.edu"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                {portalType === "management" && (
                  <p className="mt-1.5 text-[11px] font-mono text-text-dim">
                    Management Login: <span className="text-primary font-semibold">admin@gajjarhub.edu</span> (Pass:{" "}
                    <span className="text-[#E5E7EB] font-semibold">Admin@2026</span>)
                  </p>
                )}
              </div>

              {/* Password */}
              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
                      Password
                    </label>
                    {mode === "signin" && portalType === "student" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[11px] font-mono text-amber hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-text-dim" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-10 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-text-dim hover:text-white transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-[52px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-1 disabled:opacity-50 transition-all shadow-lg ${
                  portalType === "management"
                    ? "btn-primary shadow-[0_0_24px_rgba(107,149,255,0.3)]"
                    : mode === "signup"
                    ? "bg-amber text-[#0D1224] hover:bg-amber-hover font-bold shadow-[0_0_24px_rgba(230,168,53,0.3)]"
                    : "bg-amber text-[#0D1224] hover:bg-amber-hover font-bold shadow-[0_0_20px_rgba(230,168,53,0.25)]"
                }`}
              >
                {isSubmitting ? (
                  portalType === "management" ? (
                    "Verifying Management Access..."
                  ) : mode === "signup" ? (
                    "Creating Student Account..."
                  ) : mode === "signin" ? (
                    "Signing In..."
                  ) : (
                    "Sending Reset Link..."
                  )
                ) : portalType === "management" ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Login as Management</span>
                  </>
                ) : mode === "signin" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In as Student</span>
                  </>
                ) : mode === "signup" ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Student Account</span>
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Student Footer Toggle Links */}
          {portalType === "student" && (
            <div className="pt-3 border-t border-white/10 text-center text-xs">
              {mode === "signin" && (
                <p className="text-text-muted">
                  New hostel resident?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-amber font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              )}

              {mode === "signup" && (
                <p className="text-text-muted">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in to your account
                  </button>
                </p>
              )}

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                  }}
                  className="text-primary font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to student sign in</span>
                </button>
              )}
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
