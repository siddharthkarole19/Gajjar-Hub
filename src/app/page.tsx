"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircleWarning as MessageCircleAlert, Bell, Utensils, ArrowRight, Loader2 } from "lucide-react";
import { EyebrowBadge } from "../components/Badge";
import { HeroDecoration } from "../components/HeroDecoration";
import { SegmentedControl } from "../components/SegmentedControl";
import { ScrollReveal } from "../components/ScrollReveal";
import { NewComplaintSheet } from "../components/forms/NewComplaintSheet";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { format } from "date-fns";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const { notices, getMealItems } = useData();

  const [selectedMess, setSelectedMess] = useState<1 | 2>(1);
  const [isComplaintSheetOpen, setIsComplaintSheetOpen] = useState(false);

  // Require login: Redirect unauthenticated visitors to /login first
  useEffect(() => {
    if (!isLoading && !user && !profile) {
      router.replace("/login");
    }
  }, [user, profile, isLoading, router]);

  useEffect(() => {
    if (profile?.mess) {
      setSelectedMess(profile.mess);
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gh_preferred_mess");
      if (saved === "1" || saved === "2") {
        setSelectedMess(Number(saved) as 1 | 2);
      }
    }
  }, [profile]);

  const handleMessChange = (m: 1 | 2) => {
    setSelectedMess(m);
    if (typeof window !== "undefined") {
      localStorage.setItem("gh_preferred_mess", String(m));
    }
  };

  const today = new Date();
  const dateFormatted = format(today, "EEE, dd MMM").toUpperCase();
  const jsDay = today.getDay();
  const dbDayOfWeek = jsDay === 0 ? 7 : jsDay;

  const breakfastItems = getMealItems(selectedMess, dbDayOfWeek, "breakfast");
  const lunchItems = getMealItems(selectedMess, dbDayOfWeek, "lunch");
  const snacksItems = getMealItems(selectedMess, dbDayOfWeek, "snacks");
  const dinnerItems = getMealItems(selectedMess, dbDayOfWeek, "dinner");

  const latestNotices = notices.slice(0, 4);

  if (isLoading || (!user && !profile)) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_24px_rgba(107,149,255,0.2)]">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm text-[#E5E7EB]">Gajjar Hub</span>
            <span className="font-mono text-xs text-text-dim">Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* Mobile top-right decoration */}
      <HeroDecoration />

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-4 sm:pt-10 flex flex-col gap-10">
        {/* ================= HERO SECTION (2-COL RESPONSIVE GRID) ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 sm:pt-6">
          {/* Left Column: Heading, subtext, action buttons */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="mb-5 sm:mb-6">
              <EyebrowBadge>Welcome 1st year</EyebrowBadge>
            </div>

            <h1 className="flex flex-col gap-1 sm:gap-2 mb-5 font-bold tracking-[-0.025em]">
              <span className="text-[38px] sm:text-[54px] lg:text-[62px] leading-[1.08] sm:leading-[1.05] text-[#dea32c]">
                Gajjar Hub
              </span>
              <span className="text-[22px] min-[375px]:text-[25px] min-[410px]:text-[28px] sm:text-[42px] lg:text-[50px] leading-snug sm:leading-[1.08] text-primary">
                For you, for all of us
              </span>
            </h1>

            <p className="text-[17px] sm:text-[19px] leading-[28px] text-text-muted mb-8 max-w-2xl">
              Raise a complaint, read the latest notices, check today's mess menu and poll for the next menu.
            </p>

            {/* Action Buttons: Stacked on mobile, horizontal row on laptop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <button
                onClick={() => setIsComplaintSheetOpen(true)}
                className="h-[52px] px-7 btn-primary text-[15px] font-semibold flex items-center justify-center transition-all whitespace-nowrap"
              >
                Submit a complaint
              </button>

              <Link
                href="/notices?tab=notices"
                className="h-[52px] px-6 btn-surface rounded-[14px] text-[15px] font-medium flex items-center justify-center whitespace-nowrap"
              >
                View notices
              </Link>

              <Link
                href="/mess"
                className="h-[52px] px-6 btn-surface rounded-[14px] text-[15px] font-medium flex items-center justify-center whitespace-nowrap"
              >
                Mess
              </Link>
            </div>
          </div>

          {/* Right Column (Desktop): Geometric Diamond Parallax Illustration */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <HeroDecoration isDesktopHero={true} />
          </div>
        </section>

        {/* ================= 3 FEATURE CARDS (3-COLUMN RESPONSIVE GRID) ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Complaints Feature Card */}
          <ScrollReveal delay={0.05}>
            <div className="card-surface p-6 sm:p-7 flex flex-col gap-3 group h-full">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
                <MessageCircleAlert className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h2 className="text-[22px] font-semibold text-[#E5E7EB] leading-tight">
                Complaints
              </h2>
              <p className="text-[15px] leading-[24px] text-text-muted flex-1">
                Report an issue with your room, water, power or Wi-Fi and track its status.
              </p>
              <button
                type="button"
                onClick={() => setIsComplaintSheetOpen(true)}
                className="inline-flex items-center gap-1.5 font-mono text-[13px] text-primary hover:text-primary-hover uppercase tracking-wider mt-2 text-left"
              >
                <span>New complaint</span>
                <span className="text-[15px]">→</span>
              </button>
            </div>
          </ScrollReveal>

          {/* 2. Notices Feature Card */}
          <ScrollReveal delay={0.1}>
            <div className="card-surface p-6 sm:p-7 flex flex-col gap-3 group h-full">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
                <Bell className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h2 className="text-[22px] font-semibold text-[#E5E7EB] leading-tight">
                Notices
              </h2>
              <p className="text-[15px] leading-[24px] text-text-muted flex-1">
                Official announcements from the warden and hostel managment committee.
              </p>
              <Link
                href="/notices?tab=notices"
                className="inline-flex items-center gap-1.5 font-mono text-[13px] text-primary hover:text-primary-hover uppercase tracking-wider mt-2"
              >
                <span>Read notices</span>
                <span className="text-[15px]">→</span>
              </Link>
            </div>
          </ScrollReveal>

          {/* 3. Mess Feature Card */}
          <ScrollReveal delay={0.15}>
            <div className="card-surface p-6 sm:p-7 flex flex-col gap-3 group h-full">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
                <Utensils className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <h2 className="text-[22px] font-semibold text-[#E5E7EB] leading-tight">
                Mess
              </h2>
              <p className="text-[15px] leading-[24px] text-text-muted flex-1">
                See what's served for breakfast, lunch, and dinner, every day of the week.
              </p>
              <Link
                href="/mess"
                className="inline-flex items-center gap-1.5 font-mono text-[13px] text-primary hover:text-primary-hover uppercase tracking-wider mt-2"
              >
                <span>Mess</span>
                <span className="text-[15px]">→</span>
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* ================= BOTTOM SECTION: 2-COLUMN RESPONSIVE GRID ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Today's Menu Card */}
          <ScrollReveal delay={0.2}>
            <div className="card-surface p-6 sm:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3 flex-wrap gap-2">
                <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#E5E7EB]">
                  Today's menu
                </h2>
                <span className="font-mono text-[13px] uppercase text-text-dim tracking-wider">
                  [{dateFormatted}]
                </span>
              </div>

              {/* Mess 1 | Mess 2 Segmented Control */}
              <div className="pt-2 pb-4">
                <SegmentedControl
                  size="sm"
                  options={[
                    { value: 1, label: "Mess 1" },
                    { value: 2, label: "Mess 2" },
                  ]}
                  value={selectedMess}
                  onChange={handleMessChange}
                />
              </div>

              {/* 4 Meal Rows */}
              <div className="flex flex-col">
                <div className="py-4 sm:py-5 row-divider flex flex-col gap-1.5">
                  <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-primary">
                    BREAKFAST
                  </span>
                  <p className="text-[16px] sm:text-[17px] text-[#E5E7EB] leading-snug">
                    {breakfastItems.length > 0 ? (
                      breakfastItems.join(", ")
                    ) : (
                      <span className="text-text-dim italic">Not updated yet</span>
                    )}
                  </p>
                </div>

                <div className="py-4 sm:py-5 row-divider flex flex-col gap-1.5">
                  <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-primary">
                    LUNCH
                  </span>
                  <p className="text-[16px] sm:text-[17px] text-[#E5E7EB] leading-snug">
                    {lunchItems.length > 0 ? (
                      lunchItems.join(", ")
                    ) : (
                      <span className="text-text-dim italic">Not updated yet</span>
                    )}
                  </p>
                </div>

                <div className="py-4 sm:py-5 row-divider flex flex-col gap-1.5">
                  <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-primary">
                    SNACKS
                  </span>
                  <p className="text-[16px] sm:text-[17px] text-[#E5E7EB] leading-snug">
                    {snacksItems.length > 0 ? (
                      snacksItems.join(", ")
                    ) : (
                      <span className="text-text-dim italic">Not updated yet</span>
                    )}
                  </p>
                </div>

                <div className="pt-4 sm:pt-5 flex flex-col gap-1.5">
                  <span className="font-mono text-[12px] font-semibold uppercase tracking-wider text-primary">
                    DINNER
                  </span>
                  <p className="text-[16px] sm:text-[17px] text-[#E5E7EB] leading-snug">
                    {dinnerItems.length > 0 ? (
                      dinnerItems.join(", ")
                    ) : (
                      <span className="text-text-dim italic">Not updated yet</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Latest Notices Card */}
          <ScrollReveal delay={0.25}>
            <div className="card-surface p-6 sm:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#E5E7EB]">
                  Latest notices
                </h2>
                <Link
                  href="/notices?tab=notices"
                  className="font-mono text-[13px] text-primary hover:text-primary-hover uppercase tracking-wider font-medium"
                >
                  See all
                </Link>
              </div>

              <div className="flex flex-col">
                {latestNotices.length === 0 ? (
                  <div className="py-8 text-center text-text-dim font-mono text-sm">
                    No notices yet
                  </div>
                ) : (
                  latestNotices.map((notice, index) => {
                    const noticeDate = format(new Date(notice.created_at), "dd MMM").toUpperCase();
                    const isLast = index === latestNotices.length - 1;
                    return (
                      <Link
                        key={notice.id}
                        href="/notices?tab=notices"
                        className={`py-4 sm:py-5 ${!isLast ? "row-divider" : ""} flex flex-col gap-1.5 group`}
                      >
                        <h3 className="text-[17px] sm:text-[18px] font-medium text-[#E5E7EB] group-hover:text-primary transition-colors leading-snug">
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-2 font-mono text-[12px] text-text-dim uppercase tracking-wider">
                          <span>{noticeDate}</span>
                          <span>•</span>
                          <span>{notice.category}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* New Complaint Sheet Form */}
      <NewComplaintSheet
        isOpen={isComplaintSheetOpen}
        onClose={() => setIsComplaintSheetOpen(false)}
        onSuccess={() => router.push("/notices?tab=complaints")}
      />
    </div>
  );
}
