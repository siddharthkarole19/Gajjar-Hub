"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { EyebrowBadge } from "../../components/Badge";
import { HeroDecoration } from "../../components/HeroDecoration";
import { Lock, Mail, User, AlertCircle, CheckCircle2, ShieldCheck, KeyRound, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, resetPassword, resendConfirmationEmail } = useAuth();

  // Tab: 'student' or 'management'
  const [portalType, setPortalType] = useState<"student" | "management">("student");
  // Auth Mode: 'signin', 'signup', or 'forgot'
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN;

  // Sample credentials
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
    <div className="relative min-h-[calc(100vh-140px)] py-12 flex flex-col justify-center overflow-hidden">
      <HeroDecoration />

      <main className="relative z-10 max-w-md mx-auto px-6 w-full flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <EyebrowBadge>AUTHENTICATION PORTAL</EyebrowBadge>
          <h1 className="text-[34px] font-bold text-[#E5E7EB] tracking-tight">
            Gajjar Hub
          </h1>
          <p className="text-sm text-text-muted">
            {portalType === "management"
              ? "Hostel Committee, Captain and Warden Access"
              : "Resident student portal for complaints, mess, and notices"}
          </p>
        </div>

        {/* Portal Type Switcher: Student vs Management */}
        <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/10 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => handlePortalSwitch("student")}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider transition-all ${
              portalType === "student"
                ? "bg-amber text-[#0D1224] font-bold shadow-md"
                : "text-text-muted hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("management")}
            className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider transition-all ${
              portalType === "management"
                ? "bg-primary text-[#0D1224] font-bold shadow-[0_0_20px_rgba(107,149,255,0.4)]"
                : "text-text-muted hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Management</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="card-surface p-6 sm:p-7 flex flex-col gap-5 shadow-2xl relative">
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
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary text-[#0D1224] font-bold hover:bg-primary-hover flex items-center gap-1 shadow-sm"
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

          {/* Sample Student Banner */}
          {portalType === "student" && mode === "signin" && (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-text-dim">Quick demo student?</span>
              <button
                type="button"
                onClick={handleFillStudent}
                className="text-amber hover:underline font-semibold flex items-center gap-1"
              >
                Auto-fill Student
              </button>
            </div>
          )}

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs font-mono flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
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
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {portalType === "student" && mode === "signup" && (
              <div>
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
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

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
                  className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-primary"
                />
              </div>
              {portalType === "management" && (
                <p className="mt-1.5 text-[11px] font-mono text-text-dim">
                  Management Login: <span className="text-primary font-semibold">admin@gajjarhub.edu</span> (Pass: <span className="text-[#E5E7EB] font-semibold">Admin@2026</span>)
                </p>
              )}
            </div>

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
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-[52px] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2 disabled:opacity-50 transition-all ${
                portalType === "management"
                  ? "btn-primary"
                  : "bg-amber text-[#0D1224] hover:bg-amber-hover font-bold shadow-lg"
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
                "Sign In as Student"
              ) : mode === "signup" ? (
                "Create Student Account"
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Student Toggle Links (Sign In / Sign Up) */}
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
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in
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
                  className="text-primary font-semibold hover:underline"
                >
                  ← Back to student sign in
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
