"use client";

import React, { useState, useEffect } from "react";
import { BottomSheet } from "../BottomSheet";
import { Notice, NoticeCategory } from "../../lib/types";
import { useData } from "../../context/DataContext";
import { AlertCircle } from "lucide-react";

interface NewNoticeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  noticeToEdit?: Notice | null;
}

const CATEGORIES: NoticeCategory[] = ["General", "Mess", "Maintenance", "Event", "Urgent"];

export const NewNoticeSheet: React.FC<NewNoticeSheetProps> = ({
  isOpen,
  onClose,
  noticeToEdit,
}) => {
  const { addNotice, editNotice } = useData();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<NoticeCategory>("General");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (noticeToEdit) {
      setTitle(noticeToEdit.title);
      setBody(noticeToEdit.body);
      setCategory(noticeToEdit.category);
    } else {
      setTitle("");
      setBody("");
      setCategory("General");
    }
    setErrorMsg(null);
  }, [noticeToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Notice title is required");
      return;
    }
    if (!body.trim()) {
      setErrorMsg("Notice content is required");
      return;
    }

    setIsSubmitting(true);
    let res;
    if (noticeToEdit) {
      res = await editNotice(noticeToEdit.id, {
        title: title.trim(),
        body: body.trim(),
        category,
      });
    } else {
      res = await addNotice({
        title: title.trim(),
        body: body.trim(),
        category,
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
      title={noticeToEdit ? "Edit Notice" : "Post Official Notice"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Category */}
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
                    ? "bg-primary text-[#0D1224] font-bold shadow-md"
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
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Notice Title
          </label>
          <input
            type="text"
            placeholder="e.g. Wi-Fi Maintenance Tonight"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Notice Announcement Body
          </label>
          <textarea
            rows={5}
            placeholder="Write official announcement details..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[52px] btn-primary flex items-center justify-center text-[15px] mt-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : noticeToEdit ? "Update Notice" : "Publish Notice"}
        </button>
      </form>
    </BottomSheet>
  );
};
