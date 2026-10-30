"use client";

import React, { useState, useEffect } from "react";
import { BottomSheet } from "../BottomSheet";
import { HostelLeader } from "../../lib/types";
import { useData } from "../../context/DataContext";
import { AlertCircle } from "lucide-react";

interface LeaderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  leaderToEdit?: HostelLeader | null;
}

export const LeaderSheet: React.FC<LeaderSheetProps> = ({
  isOpen,
  onClose,
  leaderToEdit,
}) => {
  const { addLeader, editLeader } = useData();

  const [name, setName] = useState("");
  const [post, setPost] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leaderToEdit) {
      setName(leaderToEdit.name);
      setPost(leaderToEdit.post);
      setPhone(leaderToEdit.phone || "");
      setEmail(leaderToEdit.email || "");
      setSortOrder(leaderToEdit.sort_order || 1);
    } else {
      setName("");
      setPost("");
      setPhone("+91");
      setEmail("");
      setSortOrder(1);
    }
    setErrorMsg(null);
  }, [leaderToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Leader name is required");
      return;
    }
    if (!post.trim()) {
      setErrorMsg("Post / designation is required");
      return;
    }

    setIsSubmitting(true);
    let res;
    if (leaderToEdit) {
      res = await editLeader(leaderToEdit.id, {
        name: name.trim(),
        post: post.trim().toUpperCase(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        sort_order: Number(sortOrder),
      });
    } else {
      res = await addLeader({
        name: name.trim(),
        post: post.trim().toUpperCase(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        sort_order: Number(sortOrder),
      });
    }
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onClose();
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={leaderToEdit ? "Edit Hostel Leader" : "Add Hostel Leader"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Aarav Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Post */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Post / Role (Uppercase)
          </label>
          <input
            type="text"
            placeholder="e.g. HOSTEL CAPTAIN"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary uppercase font-mono"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Phone Number (Include +91...)
          </label>
          <input
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Official Email
          </label>
          <input
            type="email"
            placeholder="aarav.sharma@hostel.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Display Sort Order
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] text-sm focus:outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[52px] btn-primary flex items-center justify-center text-[15px] mt-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : leaderToEdit ? "Update Leader" : "Add Leader"}
        </button>
      </form>
    </BottomSheet>
  );
};
