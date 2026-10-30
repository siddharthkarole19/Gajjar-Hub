"use client";

import React, { useState } from "react";
import {
  Users,
  Phone,
  MessageSquare,
  Mail,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
} from "lucide-react";
import { EyebrowBadge } from "../../components/Badge";
import { ScrollReveal } from "../../components/ScrollReveal";
import { LeaderSheet } from "../../components/forms/LeaderSheet";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { HostelLeader } from "../../lib/types";

export default function HostelManagementPage() {
  const { isCaptain } = useAuth();
  const { leaders, deleteLeader, reorderLeaders } = useData();

  const [isLeaderSheetOpen, setIsLeaderSheetOpen] = useState(false);
  const [leaderToEdit, setLeaderToEdit] = useState<HostelLeader | null>(null);

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= leaders.length) return;

    const updated = [...leaders];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    reorderLeaders(updated);
  };

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-4 sm:pt-8 flex flex-col gap-6 sm:gap-8">
        {/* ================= PAGE HEADER ================= */}
        <section className="flex flex-col gap-4">
          <EyebrowBadge>CONTACTS & LEADERSHIP</EyebrowBadge>
          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-bold text-[#E5E7EB] tracking-tight">
              Hostel Management
            </h1>

            {/* Captain Action */}
            {isCaptain && (
              <button
                onClick={() => {
                  setLeaderToEdit(null);
                  setIsLeaderSheetOpen(true);
                }}
                className="h-10 px-3.5 rounded-xl bg-primary text-[#0D1224] font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_16px_rgba(107,149,255,0.3)] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> Add leader
              </button>
            )}
          </div>

          <p className="text-[15px] leading-[22px] text-text-muted">
            Direct contact information for hostel committee members, captains and conveners.
          </p>
        </section>

        {/* ================= LEADERS LIST ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.length === 0 ? (
            <div className="card-surface p-8 text-center text-text-dim font-mono text-sm">
              No hostel leaders listed yet.
            </div>
          ) : (
            leaders.map((leader, idx) => {
              const cleanPhone = leader.phone ? leader.phone.replace(/[^0-9]/g, "") : "";
              const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

              return (
                <ScrollReveal key={leader.id} delay={idx * 0.05}>
                  <div className="card-surface p-6 flex flex-col gap-4 group relative">
                    {/* Top Row: Post label & Captain controls */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-amber">
                        {leader.post}
                      </span>

                      {/* Captain Controls */}
                      {isCaptain && (
                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              onClick={() => handleMove(idx, "up")}
                              title="Move up"
                              className="w-7 h-7 rounded bg-white/[0.04] text-text-muted hover:text-white flex items-center justify-center"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {idx < leaders.length - 1 && (
                            <button
                              onClick={() => handleMove(idx, "down")}
                              title="Move down"
                              className="w-7 h-7 rounded bg-white/[0.04] text-text-muted hover:text-white flex items-center justify-center"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setLeaderToEdit(leader);
                              setIsLeaderSheetOpen(true);
                            }}
                            title="Edit"
                            className="w-7 h-7 rounded bg-white/[0.04] text-text-muted hover:text-white flex items-center justify-center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${leader.name} from management?`)) {
                                deleteLeader(leader.id);
                              }
                            }}
                            title="Delete"
                            className="w-7 h-7 rounded bg-white/[0.04] text-text-muted hover:text-status-danger flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Leader Name */}
                    <h2 className="text-[20px] font-semibold text-[#E5E7EB] leading-tight">
                      {leader.name}
                    </h2>

                    {/* Metadata details */}
                    <div className="flex flex-col gap-1 text-xs font-mono text-text-muted">
                      {leader.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-text-dim">TEL:</span>
                          <span>{leader.phone}</span>
                        </div>
                      )}
                      {leader.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-text-dim">EMAIL:</span>
                          <span className="truncate">{leader.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Call, WhatsApp, Email */}
                    <div className="pt-2 flex items-center gap-2">
                      {leader.phone && (
                        <a
                          href={`tel:${leader.phone}`}
                          className="flex-1 h-11 rounded-xl btn-surface flex items-center justify-center gap-1.5 text-xs font-mono font-medium hover:border-primary/50 hover:text-primary transition-all active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      )}

                      {leader.phone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 h-11 rounded-xl bg-status-success/15 border border-status-success/30 text-status-success flex items-center justify-center gap-1.5 text-xs font-mono font-medium hover:bg-status-success/25 transition-all active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {leader.email && (
                        <a
                          href={`mailto:${leader.email}`}
                          className="flex-1 h-11 rounded-xl btn-surface flex items-center justify-center gap-1.5 text-xs font-mono font-medium hover:border-amber/50 hover:text-amber transition-all active:scale-95"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })
          )}
        </div>
      </main>

      {/* Leader form sheet */}
      <LeaderSheet
        isOpen={isLeaderSheetOpen}
        onClose={() => setIsLeaderSheetOpen(false)}
        leaderToEdit={leaderToEdit}
      />
    </div>
  );
}
