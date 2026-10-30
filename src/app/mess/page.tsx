"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Utensils,
  Vote,
  Plus,
  Edit2,
  Clock,
  CheckCircle2,
  Trophy,
  ChevronDown,
  Trash2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { EyebrowBadge } from "../../components/Badge";
import { SegmentedControl } from "../../components/SegmentedControl";
import { ScrollReveal } from "../../components/ScrollReveal";
import { EditMealSheet } from "../../components/forms/EditMealSheet";
import { NewPollSheet } from "../../components/forms/NewPollSheet";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { MealType } from "../../lib/types";
import { formatDistanceToNow, isPast } from "date-fns";

const DAYS = [
  { dayOfWeek: 1, name: "Monday" },
  { dayOfWeek: 2, name: "Tuesday" },
  { dayOfWeek: 3, name: "Wednesday" },
  { dayOfWeek: 4, name: "Thursday" },
  { dayOfWeek: 5, name: "Friday" },
  { dayOfWeek: 6, name: "Saturday" },
  { dayOfWeek: 7, name: "Sunday" },
];

const MEALS: MealType[] = ["breakfast", "lunch", "snacks", "dinner"];

function MessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, isCaptain } = useAuth();
  const {
    getMealItems,
    polls,
    votePoll,
    closePollEarly,
    deletePoll,
  } = useData();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"menu" | "polls">(
    tabParam === "polls" ? "polls" : "menu"
  );

  const [selectedMess, setSelectedMess] = useState<1 | 2>(1);

  // Sync default mess
  useEffect(() => {
    if (profile?.mess) {
      setSelectedMess(profile.mess);
    }
  }, [profile]);

  useEffect(() => {
    if (tabParam === "polls" || tabParam === "menu") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (val: "menu" | "polls") => {
    setActiveTab(val);
    router.replace(`/mess?tab=${val}`, { scroll: false });
  };

  // Determine current day for auto-expand (1 = Mon, 7 = Sun)
  const currentJsDay = new Date().getDay();
  const currentDbDay = currentJsDay === 0 ? 7 : currentJsDay;
  const [expandedDay, setExpandedDay] = useState<number>(currentDbDay);

  // Meal edit modal state
  const [editMealState, setEditMealState] = useState<{
    isOpen: boolean;
    dayOfWeek: number;
    dayName: string;
    meal: MealType;
  }>({
    isOpen: false,
    dayOfWeek: 1,
    dayName: "Monday",
    meal: "breakfast",
  });

  // New poll modal state
  const [isPollSheetOpen, setIsPollSheetOpen] = useState(false);

  // Filter polls for selected mess
  const messPolls = polls.filter((p) => p.mess === selectedMess);
  // Sort: active polls first (closing soonest), then closed polls
  const sortedPolls = [...messPolls].sort((a, b) => {
    const aClosed = a.is_closed || isPast(new Date(a.closes_at));
    const bClosed = b.is_closed || isPast(new Date(b.closes_at));
    if (aClosed && !bClosed) return 1;
    if (!aClosed && bClosed) return -1;
    return new Date(a.closes_at).getTime() - new Date(b.closes_at).getTime();
  });

  const isResidentOfMess = profile?.mess === selectedMess;

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-4 sm:pt-8 flex flex-col gap-6 sm:gap-8">
        {/* ================= PAGE HEADER ================= */}
        <section className="flex flex-col gap-4">
          <EyebrowBadge>DINING & POLLS</EyebrowBadge>
          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-bold text-[#E5E7EB] tracking-tight">
              {activeTab === "menu" ? "Mess" : "Mess Polls"}
            </h1>

            {/* Captain Action: New Poll */}
            {activeTab === "polls" && isCaptain && (
              <button
                onClick={() => setIsPollSheetOpen(true)}
                className="h-10 px-3.5 rounded-xl bg-primary text-[#0D1224] font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_16px_rgba(107,149,255,0.3)] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> New poll
              </button>
            )}
          </div>

          {/* Mess 1 | Mess 2 Segmented Control */}
          <div className="flex justify-center">
            <SegmentedControl
              options={[
                { value: 1, label: "Mess 1" },
                { value: 2, label: "Mess 2" },
              ]}
              value={selectedMess}
              onChange={setSelectedMess}
            />
          </div>

          {/* Sub Tab: Mess | Polls */}
          <SegmentedControl
            options={[
              { value: "menu", label: "Mess" },
              { value: "polls", label: "Polls" },
            ]}
            value={activeTab}
            onChange={handleTabChange}
          />
        </section>

        {/* ================= WEEKLY MENU TAB CONTENT ================= */}
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {DAYS.map((day, idx) => {
              const isToday = day.dayOfWeek === currentDbDay;
              const isExpanded = expandedDay === day.dayOfWeek;

              return (
                <ScrollReveal key={day.dayOfWeek} delay={idx * 0.03}>
                  <div
                    className={`card-surface overflow-hidden transition-all duration-200 ${
                      isToday ? "border-primary/40 shadow-[0_0_20px_rgba(107,149,255,0.15)]" : ""
                    }`}
                  >
                    {/* Day Header Accordion Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedDay(isExpanded ? 0 : day.dayOfWeek)}
                      className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[20px] font-semibold text-[#E5E7EB]">
                          {day.name}
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-primary text-[#0D1224] font-bold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>

                    {/* Day Content (4 Meals) */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-1 flex flex-col border-t border-white/[0.08]">
                        {MEALS.map((mealType, mealIdx) => {
                          const items = getMealItems(selectedMess, day.dayOfWeek, mealType);
                          const isLastMeal = mealIdx === MEALS.length - 1;

                          return (
                            <div
                              key={mealType}
                              className={`py-4 ${!isLastMeal ? "row-divider" : ""} flex flex-col gap-1.5`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-amber">
                                  {mealType.toUpperCase()}
                                </span>
                                {isCaptain && (
                                  <button
                                    onClick={() =>
                                      setEditMealState({
                                        isOpen: true,
                                        dayOfWeek: day.dayOfWeek,
                                        dayName: day.name,
                                        meal: mealType,
                                      })
                                    }
                                    title={`Edit ${mealType} items`}
                                    className="p-1 rounded-md text-text-muted hover:text-white hover:bg-white/[0.06] transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-[16px] text-[#E5E7EB] leading-snug">
                                {items.length > 0 ? (
                                  items.join(", ")
                                ) : (
                                  <span className="text-text-dim italic">Not updated yet</span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* ================= POLLS TAB CONTENT ================= */}
        {activeTab === "polls" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* View only notice if resident belongs to other mess */}
            {!isResidentOfMess && (
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-text-muted flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-amber flex-shrink-0" />
                <span>You are assigned to Mess {profile?.mess || 1}. Mess {selectedMess} polls are view-only.</span>
              </div>
            )}

            {sortedPolls.length === 0 ? (
              <div className="card-surface p-8 text-center text-text-dim font-mono text-sm">
                No active or closed polls for Mess {selectedMess} currently.
              </div>
            ) : (
              sortedPolls.map((poll, idx) => {
                const isClosed = poll.is_closed || isPast(new Date(poll.closes_at));
                const userChoiceId = poll.user_voted_option_id;
                const hasVoted = !!userChoiceId;

                // Find highest vote option for closed polls
                const highestVotes = Math.max(...poll.options.map((o) => o.vote_count), 0);

                let closeLabel = "";
                if (isClosed) {
                  closeLabel = "CLOSED";
                } else {
                  closeLabel = `CLOSES IN ${formatDistanceToNow(new Date(poll.closes_at)).toUpperCase()}`;
                }

                return (
                  <ScrollReveal key={poll.id} delay={idx * 0.04}>
                    <div className="card-surface p-6 flex flex-col gap-4">
                      {/* Top Header: Title & Close timer in mono */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${
                              isClosed ? "text-text-dim" : "text-amber"
                            }`}
                          >
                            {closeLabel}
                          </span>

                          {/* Captain Controls */}
                          {isCaptain && (
                            <div className="flex items-center gap-1">
                              {!isClosed && (
                                <button
                                  onClick={() => closePollEarly(poll.id)}
                                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-text-muted hover:text-white"
                                >
                                  Close early
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm("Delete this poll?")) deletePoll(poll.id);
                                }}
                                className="w-7 h-7 rounded bg-white/[0.04] text-text-muted hover:text-status-danger flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <h2 className="text-[20px] font-semibold text-[#E5E7EB] leading-snug">
                          {poll.title}
                        </h2>
                      </div>

                      {/* Options list */}
                      <div className="flex flex-col gap-2.5">
                        {poll.options.map((option) => {
                          const isSelected = userChoiceId === option.id;
                          const isWinner = isClosed && option.vote_count === highestVotes && highestVotes > 0;
                          const showResults = hasVoted || isClosed || !isResidentOfMess;
                          const pct = option.percentage || 0;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              disabled={isClosed || !isResidentOfMess}
                              onClick={() => votePoll(poll.id, option.id)}
                              className={`relative overflow-hidden w-full text-left p-3.5 rounded-xl border transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(107,149,255,0.2)]"
                                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                              } ${isClosed || !isResidentOfMess ? "cursor-default" : "cursor-pointer"}`}
                            >
                              {/* Background vote progress bar */}
                              {showResults && (
                                <div
                                  className={`absolute top-0 bottom-0 left-0 transition-all duration-500 -z-0 ${
                                    isSelected
                                      ? "bg-primary/25"
                                      : isWinner
                                      ? "bg-amber/20"
                                      : "bg-white/[0.05]"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              )}

                              <div className="relative z-10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  {isWinner && (
                                    <Trophy className="w-4 h-4 text-amber flex-shrink-0" />
                                  )}
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                                  )}
                                  <span
                                    className={`text-[15px] leading-snug truncate ${
                                      isSelected ? "text-primary font-semibold" : "text-[#E5E7EB]"
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                </div>

                                {showResults && (
                                  <div className="flex items-center gap-2 font-mono text-xs flex-shrink-0">
                                    <span className="text-text-dim">
                                      {option.vote_count} votes
                                    </span>
                                    <span className={`font-semibold ${isSelected ? "text-primary" : "text-amber"}`}>
                                      {pct}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer total info */}
                      <div className="flex items-center justify-between text-xs font-mono text-text-dim pt-1 border-t border-white/[0.06]">
                        <span>Total votes: {poll.total_votes || 0}</span>
                        {hasVoted && !isClosed && (
                          <span className="text-primary">Tap another option to change vote</span>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Sheets */}
      <EditMealSheet
        isOpen={editMealState.isOpen}
        onClose={() => setEditMealState((prev) => ({ ...prev, isOpen: false }))}
        mess={selectedMess}
        dayOfWeek={editMealState.dayOfWeek}
        dayName={editMealState.dayName}
        meal={editMealState.meal}
      />

      <NewPollSheet
        isOpen={isPollSheetOpen}
        onClose={() => setIsPollSheetOpen(false)}
        defaultMess={selectedMess}
      />
    </div>
  );
}

export default function MessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center font-mono text-sm text-text-dim">Loading mess...</div>}>
      <MessContent />
    </Suspense>
  );
}
