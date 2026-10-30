"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bell,
  MessageCircleWarning as MessageCircleAlert,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Edit,
  Clock,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { EyebrowBadge, StatusBadge, CategoryBadge } from "../../components/Badge";
import { SegmentedControl } from "../../components/SegmentedControl";
import { ScrollReveal } from "../../components/ScrollReveal";
import { NewComplaintSheet } from "../../components/forms/NewComplaintSheet";
import { NewNoticeSheet } from "../../components/forms/NewNoticeSheet";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { ComplaintStatus, Notice } from "../../lib/types";
import { format, formatDistanceToNow } from "date-fns";

function NoticesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, isCaptain } = useAuth();
  const {
    notices,
    deleteNotice,
    complaints,
    voteComplaint,
    updateComplaintStatus,
    deleteComplaint,
  } = useData();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"notices" | "complaints">(
    tabParam === "complaints" ? "complaints" : "notices"
  );

  // Complaints filter: 'my-wing', 'all', or wing-id
  const [selectedWingFilter, setSelectedWingFilter] = useState<string>("my-wing");
  const [isComplaintSheetOpen, setIsComplaintSheetOpen] = useState(false);
  const [isNoticeSheetOpen, setIsNoticeSheetOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState<Notice | null>(null);

  // Expanded notice / complaint body tracking
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (tabParam === "complaints" || tabParam === "notices") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (val: "notices" | "complaints") => {
    setActiveTab(val);
    router.replace(`/notices?tab=${val}`, { scroll: false });
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (selectedWingFilter === "all") return true;
    if (selectedWingFilter === "my-wing") {
      if (!profile?.wing_id && !profile?.wing_name) return true;
      return (
        c.wing_id === profile?.wing_id ||
        c.wing_name === profile?.wing_name ||
        c.wing_name === "Wing A"
      );
    }
    return c.wing_name?.toLowerCase() === selectedWingFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-4 sm:pt-8 flex flex-col gap-6 sm:gap-8">
        {/* ================= PAGE HEADER ================= */}
        <section className="flex flex-col gap-4">
          <EyebrowBadge>ANNOUNCEMENTS & ISSUES</EyebrowBadge>
          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-bold text-[#E5E7EB] tracking-tight">
              {activeTab === "notices" ? "Notices" : "Complaints"}
            </h1>

            {/* Captain Action Button for Notices */}
            {activeTab === "notices" && isCaptain && (
              <button
                onClick={() => {
                  setNoticeToEdit(null);
                  setIsNoticeSheetOpen(true);
                }}
                className="h-10 px-3.5 rounded-xl bg-primary text-[#0D1224] font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_16px_rgba(107,149,255,0.3)] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> New notice
              </button>
            )}
          </div>

          {/* Segmented Control: Notices | Complaints */}
          <SegmentedControl
            options={[
              { value: "notices", label: "Notices" },
              { value: "complaints", label: "Complaints" },
            ]}
            value={activeTab}
            onChange={handleTabChange}
          />
        </section>

        {/* ================= NOTICES TAB CONTENT ================= */}
        {activeTab === "notices" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.length === 0 ? (
              <div className="card-surface p-8 text-center text-text-dim font-mono text-sm">
                No official notices have been posted yet.
              </div>
            ) : (
              notices.map((notice, idx) => {
                const noticeDate = format(new Date(notice.created_at), "dd MMM yyyy").toUpperCase();
                const isExpanded = !!expandedItems[notice.id];

                return (
                  <ScrollReveal key={notice.id} delay={idx * 0.05}>
                    <div className="card-surface p-6 flex flex-col gap-3 group relative">
                      {/* Top Meta: Date / Category and Captain options */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-[12px] text-text-dim uppercase tracking-wider">
                          <span>{noticeDate}</span>
                          <span>/</span>
                          <span className="text-amber font-semibold">{notice.category}</span>
                        </div>

                        {/* Captain actions */}
                        {isCaptain && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setNoticeToEdit(notice);
                                setIsNoticeSheetOpen(true);
                              }}
                              title="Edit notice"
                              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this notice?")) {
                                  deleteNotice(notice.id);
                                }
                              }}
                              title="Delete notice"
                              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-text-muted hover:text-status-danger transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-[20px] font-semibold text-[#E5E7EB] leading-snug">
                        {notice.title}
                      </h2>

                      {/* Body clamped to 3 lines or expanded */}
                      <p
                        className={`text-[15px] leading-[24px] text-text-muted ${
                          !isExpanded ? "line-clamp-3" : ""
                        }`}
                      >
                        {notice.body}
                      </p>

                      {/* Read More button */}
                      {notice.body.length > 130 && (
                        <button
                          onClick={() => toggleExpand(notice.id)}
                          className="self-start font-mono text-[12px] text-amber hover:underline uppercase tracking-wider mt-0.5"
                        >
                          {isExpanded ? "Show less" : "Read more →"}
                        </button>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })
            )}
          </div>
        )}

        {/* ================= COMPLAINTS TAB CONTENT ================= */}
        {activeTab === "complaints" && (
          <div className="flex flex-col gap-5">
            {/* Submit Complaint Primary Button */}
            <button
              onClick={() => setIsComplaintSheetOpen(true)}
              className="w-full h-[52px] btn-primary text-[15px] font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Submit a complaint
            </button>

            {/* Filter Chips: My wing (default), All wings, Wing A, Wing B... */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "my-wing", label: "My wing" },
                { id: "all", label: "All wings" },
                { id: "Wing A", label: "Wing A" },
                { id: "Wing B", label: "Wing B" },
                { id: "Wing C", label: "Wing C" },
                { id: "Wing D", label: "Wing D" },
              ].map((chip) => {
                const isSelected = selectedWingFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedWingFilter(chip.id)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl font-mono text-[12px] uppercase tracking-wider transition-all ${
                      isSelected
                        ? "bg-amber text-[#0D1224] font-bold shadow-md"
                        : "bg-white/[0.04] border border-white/10 text-text-muted hover:text-white"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Complaints List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredComplaints.length === 0 ? (
                <div className="card-surface p-8 text-center text-text-dim font-mono text-sm">
                  No complaints found for this wing filter.
                </div>
              ) : (
                filteredComplaints.map((complaint, idx) => {
                  const isExpanded = !!expandedItems[complaint.id];
                  const timeAgo = formatDistanceToNow(new Date(complaint.created_at), {
                    addSuffix: true,
                  });
                  const isAuthor = profile && complaint.user_id === profile.id;
                  const canDelete = isAuthor || isCaptain;

                  return (
                    <ScrollReveal key={complaint.id} delay={idx * 0.04}>
                      <div className="card-surface p-6 flex flex-col gap-3.5">
                        {/* Meta Row: WING / CATEGORY / STATUS */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 font-mono text-[12px] text-text-dim uppercase tracking-wider">
                            <span className="text-amber font-semibold">
                              {complaint.wing_name || "WING"}
                            </span>
                            <span>/</span>
                            <span>{complaint.category}</span>
                          </div>
                          <StatusBadge status={complaint.status} />
                        </div>

                        {/* Title */}
                        <h2 className="text-[19px] font-semibold text-[#E5E7EB] leading-snug">
                          {complaint.title}
                        </h2>

                        {/* Description clamped to 4 lines */}
                        <p
                          className={`text-[15px] leading-[23px] text-text-muted ${
                            !isExpanded ? "line-clamp-4" : ""
                          }`}
                        >
                          {complaint.description}
                        </p>

                        {complaint.description.length > 180 && (
                          <button
                            onClick={() => toggleExpand(complaint.id)}
                            className="self-start font-mono text-[12px] text-amber hover:underline uppercase tracking-wider"
                          >
                            {isExpanded ? "Show less" : "Read more →"}
                          </button>
                        )}

                        {/* Author name and relative time */}
                        <div className="pt-2 row-divider pb-3 flex items-center justify-between text-xs text-text-dim font-mono">
                          <span>
                            {complaint.author_name || "Hostel Resident"}
                          </span>
                          <span>{timeAgo}</span>
                        </div>

                        {/* Action Bar: Like/Dislike, Captain Status, and Delete */}
                        <div className="flex items-center justify-between pt-1">
                          {/* Voting: Thumbs up & Thumbs down */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => voteComplaint(complaint.id, 1)}
                              aria-label="Upvote complaint"
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all active:scale-95 ${
                                complaint.user_vote === 1
                                  ? "bg-primary/20 text-primary border-primary/40 font-bold shadow-[0_0_12px_rgba(107,149,255,0.3)]"
                                  : "bg-white/[0.04] border-white/10 text-text-muted hover:text-white"
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{complaint.like_count}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => voteComplaint(complaint.id, -1)}
                              aria-label="Downvote complaint"
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all active:scale-95 ${
                                complaint.user_vote === -1
                                  ? "bg-status-danger/20 text-status-danger border-status-danger/40 font-bold shadow-[0_0_12px_rgba(248,113,113,0.3)]"
                                  : "bg-white/[0.04] border-white/10 text-text-muted hover:text-white"
                              }`}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              <span>{complaint.dislike_count}</span>
                            </button>
                          </div>

                          {/* Captain status selector & Delete */}
                          <div className="flex items-center gap-2">
                            {isCaptain && (
                              <select
                                value={complaint.status}
                                onChange={(e) =>
                                  updateComplaintStatus(
                                    complaint.id,
                                    e.target.value as ComplaintStatus
                                  )
                                }
                                className="h-8 px-2 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-mono text-[#E5E7EB] focus:outline-none focus:border-primary"
                              >
                                <option value="open" className="bg-[#1e1f24]">Status: Open</option>
                                <option value="in_progress" className="bg-[#1e1f24]">Status: In Progress</option>
                                <option value="resolved" className="bg-[#1e1f24]">Status: Resolved</option>
                              </select>
                            )}

                            {canDelete && (
                              <button
                                onClick={async () => {
                                  if (confirm("Delete this complaint?")) {
                                    const res = await deleteComplaint(complaint.id);
                                    if (res?.error) {
                                      alert(res.error);
                                    }
                                  }
                                }}
                                title="Delete complaint"
                                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-text-muted hover:text-status-danger transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* Forms */}
      <NewComplaintSheet
        isOpen={isComplaintSheetOpen}
        onClose={() => setIsComplaintSheetOpen(false)}
      />
      <NewNoticeSheet
        isOpen={isNoticeSheetOpen}
        onClose={() => setIsNoticeSheetOpen(false)}
        noticeToEdit={noticeToEdit}
      />
    </div>
  );
}

export default function NoticesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center font-mono text-sm text-text-dim">Loading notices...</div>}>
      <NoticesContent />
    </Suspense>
  );
}
