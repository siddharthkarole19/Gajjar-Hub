"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { createClient } from "../../lib/supabase/client";
import { EyebrowBadge } from "../../components/Badge";
import { AlertCircle, CheckCircle2, Lock, ExternalLink, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, wings, updateProfile, isLoading, isCaptain } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [wingId, setWingId] = useState(profile?.wing_id || (wings[0]?.id || ""));
  const [roomNo, setRoomNo] = useState(profile?.room_no || "");
  const [mess, setMess] = useState<1 | 2>(profile?.mess || 1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if student has already registered their hostel room and mess
  const isAlreadyRegistered = !isCaptain && Boolean(profile?.room_no && profile.room_no.trim().length > 0);

  // Handle URL confirmation tokens (e.g. redirected from email confirmation)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes("code=") || hash.includes("access_token=")) {
        setIsVerifying(true);
        const supabase = createClient();
        if (search.includes("code=")) {
          const params = new URLSearchParams(search);
          const code = params.get("code");
          if (code) {
            supabase.auth.exchangeCodeForSession(code).finally(() => {
              setIsVerifying(false);
            });
          } else {
            setIsVerifying(false);
          }
        } else {
          supabase.auth.getSession().finally(() => {
            setIsVerifying(false);
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.wing_id) setWingId(profile.wing_id);
      if (profile.room_no) setRoomNo(profile.room_no);
      if (profile.mess) setMess(profile.mess);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isAlreadyRegistered) {
      setErrorMsg("Contact HMS to edit your details");
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg("Full name is required");
      return;
    }
    if (!roomNo.trim()) {
      setErrorMsg("Room number is required (e.g. A-304)");
      return;
    }
    if (!wingId) {
      setErrorMsg("Please select your wing");
      return;
    }

    setIsSubmitting(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      wing_id: wingId,
      room_no: roomNo.trim(),
      mess,
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      router.push("/");
    }
  };

  // Verifying session state
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen pb-16 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto px-6 w-full flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <h2 className="text-lg font-semibold text-[#E5E7EB]">
            Verifying your hostel session...
          </h2>
          <p className="text-xs text-text-muted font-mono">
            Please wait while we confirm your account.
          </p>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (!user) {
    return (
      <div className="min-h-screen pb-16 flex flex-col justify-center">
        <main className="max-w-md mx-auto px-6 w-full flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <EyebrowBadge>SETUP HOSTEL PROFILE</EyebrowBadge>
            <h1 className="text-[32px] font-bold text-[#E5E7EB] tracking-tight">
              Sign In to Continue
            </h1>
            <p className="text-sm text-text-muted">
              Sign in with your email and password to complete your hostel wing and room allocation.
            </p>
          </div>

          <div className="card-surface p-6 sm:p-7 flex flex-col gap-4 text-center shadow-xl">
            <div className="p-3.5 rounded-xl bg-amber/10 border border-amber/25 text-amber text-xs font-mono leading-relaxed">
              If you just registered with email verification, make sure you clicked the link received in your inbox.
            </div>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full h-12 btn-primary font-semibold text-sm flex items-center justify-center mt-1"
            >
              Sign In as Student
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Already Registered View (Prevent altering details)
  if (isAlreadyRegistered) {
    const assignedWing = wings.find((w) => w.id === profile?.wing_id);
    return (
      <div className="min-h-screen pb-16 flex flex-col justify-center">
        <main className="max-w-[430px] mx-auto px-6 w-full flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <EyebrowBadge>PROFILE REGISTERED</EyebrowBadge>
            <h1 className="text-[32px] font-bold text-[#E5E7EB] tracking-tight">
              Student Details Locked
            </h1>
            <p className="text-sm text-text-muted">
              Your hostel profile and mess allocations are already registered.
            </p>
          </div>

          <div className="card-surface p-6 flex flex-col gap-4 shadow-xl">
            {/* Warning Message */}
            <div className="p-4 rounded-xl bg-amber/10 border border-amber/25 text-amber text-xs font-mono flex items-start gap-3">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber" />
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="font-semibold uppercase tracking-wider text-amber">
                  Student Details Locked
                </span>
                <p className="text-xs text-[#E5E7EB] font-sans leading-relaxed">
                  Your details have already been registered. To request room reallocation or change your assigned mess, please contact the Hostel Management Society.
                </p>
              </div>
            </div>

            {/* Read-Only Summary of Current Allocations */}
            <div className="flex flex-col gap-3 py-3 border-y border-white/[0.08] text-sm">
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-text-dim">FULL NAME</span>
                <span className="text-[#E5E7EB] font-medium font-sans">{profile?.full_name}</span>
              </div>
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-text-dim">HOSTEL WING</span>
                <span className="text-primary font-semibold">{assignedWing?.name || profile?.wing_name || "Assigned"}</span>
              </div>
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-text-dim">ROOM NUMBER</span>
                <span className="text-[#E5E7EB] font-semibold">{profile?.room_no}</span>
              </div>
              <div className="flex justify-between items-center font-mono text-xs">
                <span className="text-text-dim">ASSIGNED MESS</span>
                <span className="text-amber font-semibold">Mess {profile?.mess || 1}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                href="/hs"
                className="w-full h-12 rounded-xl bg-white/[0.06] border border-amber/30 text-amber hover:bg-amber/15 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-amber" />
                <span>Contact HMS to edit your details</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full h-12 btn-primary font-semibold text-sm flex items-center justify-center"
              >
                Go to Gajjar Hub Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Initial Onboarding Form (When student has not yet set room/wing/mess)
  return (
    <div className="min-h-screen pb-16 flex flex-col justify-center">
      <main className="max-w-[430px] mx-auto px-6 w-full flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <EyebrowBadge>SETUP PROFILE</EyebrowBadge>
          <h1 className="text-[32px] font-bold text-[#E5E7EB] tracking-tight">
            Hostel Onboarding
          </h1>
          <p className="text-sm text-text-muted">
            Tell us where you stay to link your wing complaints and mess polls.
          </p>
        </div>

        <div className="card-surface p-6 flex flex-col gap-4 shadow-2xl">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Verma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-primary"
              />
            </div>

            {/* Wing Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
                Hostel Wing
              </label>
              <div className="grid grid-cols-2 gap-2">
                {wings.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWingId(w.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono uppercase transition-all ${
                      wingId === w.id
                        ? "bg-primary text-[#0D1224] font-bold shadow-md"
                        : "bg-white/[0.04] border border-white/10 text-text-muted hover:text-white"
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Number */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1">
                Room Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A-304"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-[#E5E7EB] placeholder:text-text-dim focus:outline-none focus:border-primary font-mono uppercase"
              />
            </div>

            {/* Mess Choice */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
                Assigned Mess
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMess(m as 1 | 2)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono uppercase transition-all ${
                      mess === m
                        ? "bg-amber text-[#0D1224] font-bold shadow-md"
                        : "bg-white/[0.04] border border-white/10 text-text-muted hover:text-white"
                    }`}
                  >
                    Mess {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Role indicator (PRD: Never editable by user) */}
            <div className="pt-2">
              <span className="text-[11px] font-mono text-text-dim">
                Assigned Role: <span className="uppercase text-text-muted font-bold">{profile?.role || "STUDENT"}</span> (Admin managed)
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] btn-primary text-sm font-semibold flex items-center justify-center mt-2 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
