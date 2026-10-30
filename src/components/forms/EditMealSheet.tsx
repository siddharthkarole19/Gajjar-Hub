"use client";

import React, { useState, useEffect } from "react";
import { BottomSheet } from "../BottomSheet";
import { MealType } from "../../lib/types";
import { useData } from "../../context/DataContext";
import { Plus, X, AlertCircle } from "lucide-react";

interface EditMealSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mess: 1 | 2;
  dayOfWeek: number; // 1 to 7
  dayName: string;
  meal: MealType;
}

export const EditMealSheet: React.FC<EditMealSheetProps> = ({
  isOpen,
  onClose,
  mess,
  dayOfWeek,
  dayName,
  meal,
}) => {
  const { getMealItems, updateMealItems } = useData();

  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getMealItems(mess, dayOfWeek, meal);
      setItems(current ? [...current] : []);
      setNewItem("");
      setErrorMsg(null);
    }
  }, [isOpen, mess, dayOfWeek, meal]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    if (items.includes(newItem.trim())) {
      setErrorMsg("Item already added");
      return;
    }
    setItems([...items, newItem.trim()]);
    setNewItem("");
    setErrorMsg(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const res = await updateMealItems(mess, dayOfWeek, meal, items);
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
      title={`Edit ${meal.toUpperCase()}`}
    >
      <div className="flex flex-col gap-4 text-left">
        {/* Subhead info */}
        <div className="flex items-center gap-2 text-xs font-mono text-text-dim">
          <span>MESS {mess}</span>
          <span>•</span>
          <span>{dayName.toUpperCase()}</span>
          <span>•</span>
          <span className="text-amber uppercase">{meal}</span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Existing items chips */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
            Current Food Items ({items.length})
          </label>
          <div className="flex flex-wrap gap-2 min-h-[50px] p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
            {items.length === 0 ? (
              <span className="text-sm text-text-dim italic">No items listed yet</span>
            ) : (
              items.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-[#E5E7EB]"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-text-muted hover:text-status-danger transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Add item input */}
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            placeholder="Add new dish / item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5E7EB] placeholder:text-text-dim text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-4 h-12 rounded-xl bg-white/[0.08] border border-white/15 text-[#E5E7EB] hover:bg-white/[0.12] flex items-center gap-1 text-sm font-medium"
          >
            <Plus className="w-4 h-4 text-primary" /> Add
          </button>
        </form>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full h-[52px] btn-primary flex items-center justify-center text-[15px] mt-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Meal Menu"}
        </button>
      </div>
    </BottomSheet>
  );
};
