"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { EyebrowBadge } from "../../components/Badge";
import { User, LogOut, CheckCircle2, AlertCircle, ShieldCheck, Lock, ExternalLink } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, wings, updateProfile, signOut, isCaptain } = useAuth();

  const [fullName, setFullName] = useState("");
  const [wingId, setWingId] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [mess, setMess] = useState<1 | 2>(1);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Student details are locked once initial registration/onboarding is complete
  const isLocked = !isCaptain && Boolean(profile?.room_no && profile.room_no.trim().length > 0);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setWingId(profile.wing_id || (wings[0]?.id || ""));
      setRoomNo(profile.room_no || "");
      setMess(profile.mess || 1);
    }
  }, [profile, wings]);

  const handleLockedFieldClick = () => {
    setStatusMsg({ type: "error", text: "Contact HMS to edit your details" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (isLocked) {
      setStatusMsg({ type: "error", text: "Contact HMS to edit your details" });
      return;
    }

    if (!fullName.trim()) {
      setStatusMsg({ type: "error", text: "Full name is required" });
      return;
    }
    if (!roomNo.trim()) {
      setStatusMsg({ type: "error", text: "Room number is required" });
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      wing_id: wingId,
      room_no: roomNo.trim(),
      mess,
    });
    setIsSaving(false);

    if (res.error) {
      setStatusMsg({ type: "error", text: res.error });
    } else {
      setStatusMsg({ type: "success", text: "Profile updated successfully!" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-[430px] mx-auto px-6 pt-4 flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <EyebrowBadge>ACCOUNT SETTINGS</EyebrowBadge>
          <h1 className="text-[32px] font-bold text-[#E5E7EB] tracking-tight">
            User Profile
          </h1>
          <p className="text-sm text-text-muted">
            Manage your personal hostel room details and mess preferences.
          </p>
        </section>

        {/* Profile Card */}
        <div className="card-surface p-6 flex flex-col gap-4 shadow-xl">
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                statusMsg.type === "success"
                  ? "bg-status-success/10 border-status-success/30 text-status-success"
                  : "bg-status-danger/10 border-status-danger/30 text-status-danger"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="font-medium">{statusMsg.text}</span>
            </div>
          )}

          {/* Locked Notice Banner for Registered Students */}
          {isLocked && (
            <div className="p-4 rounded-xl bg-amber/10 border border-amber/25 text-amber text-xs font-mono flex items-start gap-3">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wider text-amber">
                    Student Details Locked
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber/20 text-[10px] font-bold text-amber">
                    OFFICIAL RECORD
                  </span>
                </div>
                <p className="text-xs text-[#E5E7EB] font-sans leading-relaxed">
                  Your hostel wing, room number, and assigned mess are official hostel records and cannot be self-modified.
                </p>
                <div className="pt-1.5">
                  <Link
                    href="/hs"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-primary hover:text-white transition-all text-xs font-mono font-semibold"
                  >
                    <span>Contact HMS to edit your details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Role Display (Read-Only) */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase text-text-dim">Hostel Role</span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                isCaptain ? "bg-primary text-[#0D1224]" : "bg-amber text-[#0D1224]"
              }`}
            >
              {profile?.role || "STUDENT"}
            </span>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
                  Full Name
                </label>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                disabled={isLocked}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full h-12 px-3.5 rounded-xl border text-sm text-[#E5E7EB] focus:outline-none ${
                  isLocked
                    ? "bg-white/[0.02] border-white/10 text-text-muted cursor-not-allowed"
                    : "bg-white/[0.05] border-white/10 focus:border-primary"
                }`}
              />
            </div>

            {/* Wing */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
                  Hostel Wing
                </label>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {wings.map((w) => {
                  const isSelected = wingId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => (isLocked ? handleLockedFieldClick() : setWingId(w.id))}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono uppercase transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-primary text-[#0D1224] font-bold shadow-md"
                          : "bg-white/[0.04] border border-white/10 text-text-muted"
                      } ${isLocked ? "cursor-not-allowed opacity-80" : "hover:text-white"}`}
                    >
                      {isSelected && isLocked && <Lock className="w-3 h-3 text-[#0D1224]" />}
                      <span>{w.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room No */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
                  Room Number
                </label>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                disabled={isLocked}
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className={`w-full h-12 px-3.5 rounded-xl border text-sm text-[#E5E7EB] font-mono uppercase focus:outline-none ${
                  isLocked
                    ? "bg-white/[0.02] border-white/10 text-text-muted cursor-not-allowed"
                    : "bg-white/[0.05] border-white/10 focus:border-primary"
                }`}
              />
            </div>

            {/* Mess Choice */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
                  Assigned Mess
                </label>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((m) => {
                  const isSelected = mess === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={isLocked}
                      onClick={() => (isLocked ? handleLockedFieldClick() : setMess(m as 1 | 2))}
                      className={`py-2.5 px-3 rounded-xl text-xs font-mono uppercase transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-amber text-[#0D1224] font-bold shadow-md"
                          : "bg-white/[0.04] border border-white/10 text-text-muted"
                      } ${isLocked ? "cursor-not-allowed opacity-80" : "hover:text-white"}`}
                    >
                      {isSelected && isLocked && <Lock className="w-3 h-3 text-[#0D1224]" />}
                      <span>Mess {m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button: Locked redirect to HMS vs Save Button */}
            {isLocked ? (
              <Link
                href="/hs"
                className="w-full h-[50px] rounded-xl bg-white/[0.05] border border-amber/30 text-amber hover:bg-amber/10 text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-2 font-mono"
              >
                <Lock className="w-4 h-4 text-amber" />
                <span>Contact HMS to edit your details</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </Link>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-[50px] btn-primary text-sm font-semibold flex items-center justify-center mt-2 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="w-full h-[48px] rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm font-medium flex items-center justify-center gap-2 hover:bg-status-danger/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out of Gajjar Hub</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
