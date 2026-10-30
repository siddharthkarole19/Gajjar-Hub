"use client";

import React, { useState } from "react";
import { BottomSheet } from "../BottomSheet";
import { useData } from "../../context/DataContext";
import { Plus, Trash2, AlertCircle } from "lucide-react";

interface NewPollSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMess?: 1 | 2;
}

export const NewPollSheet: React.FC<NewPollSheetProps> = ({
  isOpen,
  onClose,
  defaultMess = 1,
}) => {
  const { createPoll } = useData();

  const [mess, setMess] = useState<1 | 2>(defaultMess);
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  // default closes in 3 days
  const defaultCloseDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const [closesAt, setClosesAt] = useState(defaultCloseDate);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOptionField = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Poll title is required");
      return;
    }

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setErrorMsg("Please provide at least 2 poll options");
      return;
    }

    if (!closesAt) {
      setErrorMsg("Please set a closing date and time");
      return;
    }

    setIsSubmitting(true);
    const res = await createPoll({
      mess,
      title: title.trim(),
      options: cleanOptions,
      closes_at: new Date(closesAt).toISOString(),
    });
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setTitle("");
      setOptions(["", ""]);
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Create Mess Poll">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mess selection */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Target Mess
          </label>
          <div className="flex gap-2">
            {[1, 2].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMess(m as 1 | 2)}
                className={`flex-1 py-2 rounded-xl text-xs font-mono uppercase transition-all ${
                  mess === m
                    ? "bg-primary text-[#0D1224] font-bold shadow-md"
                    : "bg-white/[0.04] border border-white/10 text-text-muted hover:text-white"
                }`}
              >
                Mess {m}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Poll Question / Title
          </label>
          <input
            type="text"
            placeholder="e.g. Sunday dinner, next week"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Options list */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-text-dim">
              Voting Options (2 to 6)
            </label>
            {options.length < 6 && (
              <button
                type="button"
                onClick={addOptionField}
                className="text-xs font-mono text-amber hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add option
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOptionField(idx)}
                    className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-text-muted hover:text-status-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Closing Date & Time */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-1.5">
            Poll Closes At (Asia/Kolkata)
          </label>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[52px] btn-primary flex items-center justify-center text-[15px] mt-2 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Publish Mess Poll"}
        </button>
      </form>
    </BottomSheet>
  );
};
