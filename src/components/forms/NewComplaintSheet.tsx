"use client";

import React, { useState, useEffect } from "react";
import { BottomSheet } from "../BottomSheet";
import { ComplaintCategory } from "../../lib/types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, Clock } from "lucide-react";

interface NewComplaintSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: ComplaintCategory[] = ["Room", "Water", "Power", "Wi-Fi", "Other"];

export const NewComplaintSheet: React.FC<NewComplaintSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addComplaint, complaints } = useData();
  const { profile, user, isCaptain } = useAuth();

  const [category, setCategory] = useState<ComplaintCategory>("Room");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownMins, setCooldownMins] = useState(0);

  const currentUserId = user?.id || profile?.id;

  useEffect(() => {
    if (isCaptain || !currentUserId) {
      setCooldownMins(0);
      return;
    }

    const oneHourMs = 60 * 60 * 1000;
    const userComplaints = complaints.filter((c) => c.user_id === currentUserId);
    let latestTime = 0;
    if (userComplaints.length > 0) {
      const times = userComplaints
        .map((c) => new Date(c.created_at).getTime())
        .filter((t) => !isNaN(t));
      if (times.length > 0) latestTime = Math.max(...times);
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("gh_last_complaint_time_" + currentUserId);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (parsed && parsed > latestTime) latestTime = parsed;
        }
      } catch {}
    }

    if (latestTime > 0 && Date.now() - latestTime < oneHourMs) {
      const remaining = Math.max(1, Math.ceil((oneHourMs - (Date.now() - latestTime)) / 60000));
      setCooldownMins(remaining);
    } else {
      setCooldownMins(0);
    }
  }, [isOpen, complaints, currentUserId, isCaptain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cooldownMins > 0) {
      setErrorMsg(`Rate limit: Please wait ${cooldownMins} more minute(s) before filing another complaint.`);
      return;
    }

    if (title.trim().length < 3) {
      setErrorMsg("Title must be at least 3 characters long");
      return;
    }
    if (title.length > 100) {
      setErrorMsg("Title must not exceed 100 characters");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please describe the issue");
      return;
    }
    if (description.length > 500) {
      setErrorMsg("Description must not exceed 500 characters");
      return;
    }

    setIsSubmitting(true);
    const res = await addComplaint({
      category,
      title: title.trim(),
      description: description.trim(),
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setTitle("");
      setDescription("");
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Submit a complaint">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        {cooldownMins > 0 && (
          <div className="p-3.5 rounded-xl bg-amber/10 border border-amber/30 text-amber text-xs font-mono flex items-center gap-2.5">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>
              Hourly limit active: You can file another complaint in <strong>{cooldownMins} min{cooldownMins > 1 ? "s" : ""}</strong>. (Limit: 1 complaint per hour)
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wing (Read-only from profile as per PRD) */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Wing (From Profile)
          </label>
          <input
            type="text"
            readOnly
            value={profile?.wing_name || "Wing A (Assigned)"}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-text-muted font-mono text-sm cursor-not-allowed select-none"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  category === cat
                    ? "bg-amber text-[#0D1224] font-bold shadow-md"
                    : "bg-white/[0.04] border border-white/10 text-text-muted hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
              Issue Title
            </label>
            <span className="text-[11px] font-mono text-text-dim">{title.length}/100</span>
          </div>
          <input
            type="text"
            placeholder="e.g. Geyser not heating water in 2nd floor"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
              Description
            </label>
            <span className="text-[11px] font-mono text-text-dim">{description.length}/500</span>
          </div>
          <textarea
            rows={4}
            placeholder="Describe the exact location and problem details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className="w-full p-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || cooldownMins > 0}
          className="w-full h-[52px] btn-primary flex items-center justify-center text-[15px] mt-2 disabled:opacity-50"
        >
          {isSubmitting
            ? "Submitting..."
            : cooldownMins > 0
            ? `Limit reached (wait ${cooldownMins}m)`
            : "Submit complaint"}
        </button>
      </form>
    </BottomSheet>
  );
};
