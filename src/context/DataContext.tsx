"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  HostelLeader,
  MealType,
  MessMenuItem,
  Notice,
  NoticeCategory,
  Poll,
} from "../lib/types";
import {
  MOCK_COMPLAINTS,
  MOCK_LEADERS,
  MOCK_MESS_MENUS,
  MOCK_NOTICES,
  MOCK_POLLS,
} from "../lib/mockData";
import { createClient, isSupabaseConfigured } from "../lib/supabase/client";
import { useAuth } from "./AuthContext";

interface DataContextType {
  // Notices
  notices: Notice[];
  addNotice: (data: { title: string; body: string; category: NoticeCategory }) => Promise<{ error?: string }>;
  editNotice: (id: string, data: { title: string; body: string; category: NoticeCategory }) => Promise<{ error?: string }>;
  deleteNotice: (id: string) => Promise<{ error?: string }>;

  // Complaints
  complaints: Complaint[];
  addComplaint: (data: { title: string; description: string; category: ComplaintCategory }) => Promise<{ error?: string }>;
  voteComplaint: (complaintId: string, value: 1 | -1) => Promise<{ error?: string }>;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus) => Promise<{ error?: string }>;
  deleteComplaint: (complaintId: string) => Promise<{ error?: string }>;

  // Mess Menus
  messMenus: MessMenuItem[];
  getMealItems: (mess: 1 | 2, dayOfWeek: number, meal: MealType) => string[];
  updateMealItems: (mess: 1 | 2, dayOfWeek: number, meal: MealType, items: string[]) => Promise<{ error?: string }>;

  // Polls
  polls: Poll[];
  votePoll: (pollId: string, optionId: string) => Promise<{ error?: string }>;
  createPoll: (data: { mess: 1 | 2; title: string; options: string[]; closes_at: string }) => Promise<{ error?: string }>;
  closePollEarly: (pollId: string) => Promise<{ error?: string }>;
  deletePoll: (pollId: string) => Promise<{ error?: string }>;

  // Hostel Leaders (HS)
  leaders: HostelLeader[];
  addLeader: (leader: Omit<HostelLeader, "id">) => Promise<{ error?: string }>;
  editLeader: (id: string, leader: Partial<HostelLeader>) => Promise<{ error?: string }>;
  deleteLeader: (id: string) => Promise<{ error?: string }>;
  reorderLeaders: (newLeaders: HostelLeader[]) => Promise<{ error?: string }>;

  isLoadingData: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const isValidUUID = (id?: string | null): boolean => {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
};

const getStoredUserPollVotes = (): Record<string, Record<string, string>> => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("gh_user_poll_votes") || "{}");
  } catch {
    return {};
  }
};

const getStoredUserComplaintVotes = (): Record<string, Record<string, 1 | -1 | 0>> => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("gh_user_complaint_votes") || "{}");
  } catch {
    return {};
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, wings, isCaptain } = useAuth();
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [messMenus, setMessMenus] = useState<MessMenuItem[]>(MOCK_MESS_MENUS);
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS);
  const [leaders, setLeaders] = useState<HostelLeader[]>(MOCK_LEADERS);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Load local cache if available in demo mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const deletedComplaintIds: string[] = JSON.parse(
        localStorage.getItem("gh_deleted_complaint_ids") || "[]"
      );
      const localNotices = localStorage.getItem("gh_notices");
      const localComplaints = localStorage.getItem("gh_complaints");
      const localMenus = localStorage.getItem("gh_menus");
      const localPolls = localStorage.getItem("gh_polls");
      const localLeaders = localStorage.getItem("gh_leaders");

      if (localNotices) try { setNotices(JSON.parse(localNotices)); } catch {}
      if (localComplaints) {
        try {
          const parsed: Complaint[] = JSON.parse(localComplaints);
          const currentUserId = user?.id || profile?.id || "demo-student";
          const userComplaintVotes = getStoredUserComplaintVotes()[currentUserId] || {};
          setComplaints(
            parsed
              .filter((c) => !deletedComplaintIds.includes(c.id))
              .map((c) => ({
                ...c,
                user_vote: userComplaintVotes[c.id] !== undefined ? userComplaintVotes[c.id] : (c.user_vote || 0),
              }))
          );
        } catch {}
      } else if (deletedComplaintIds.length > 0) {
        setComplaints((prev) => prev.filter((c) => !deletedComplaintIds.includes(c.id)));
      }
      if (localMenus) try { setMessMenus(JSON.parse(localMenus)); } catch {}
      if (localPolls) {
        try {
          const parsed: Poll[] = JSON.parse(localPolls);
          const currentUserId = user?.id || profile?.id || "demo-student";
          const userVotes = getStoredUserPollVotes()[currentUserId] || {};
          setPolls(
            parsed.map((p) => ({
              ...p,
              user_voted_option_id: userVotes[p.id] || undefined,
            }))
          );
        } catch {}
      }
      if (localLeaders) try { setLeaders(JSON.parse(localLeaders)); } catch {}
    }
  }, []);

  const refreshData = async () => {
    if (!isSupabaseConfigured()) {
      setIsLoadingData(false);
      return;
    }

    try {
      const supabase = createClient();

      // 1. Fetch notices
      const { data: noticesData } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });
      if (noticesData && noticesData.length > 0) setNotices(noticesData);

      // 2. Fetch complaint feed view
      const { data: complaintsData } = await supabase
        .from("complaint_feed")
        .select("*")
        .order("created_at", { ascending: false });
      if (complaintsData && complaintsData.length > 0) {
        const deletedComplaintIds: string[] = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("gh_deleted_complaint_ids") || "[]")
          : [];
        const currentUserId = user?.id || profile?.id || "demo-student";
        const storedVotes = getStoredUserComplaintVotes()[currentUserId] || {};
        const parsed = complaintsData
          .filter((c: any) => !deletedComplaintIds.includes(c.id))
          .map((c: any) => ({
            ...c,
            user_vote: storedVotes[c.id] !== undefined ? storedVotes[c.id] : (c.user_vote || 0),
          }));
        setComplaints(parsed);
      }

      // 3. Fetch mess menu
      const { data: menuData } = await supabase
        .from("mess_menu")
        .select("*");
      if (menuData && menuData.length > 0) setMessMenus(menuData);

      // 4. Fetch polls and options
      const { data: pollsData } = await supabase
        .from("polls")
        .select(`
          *,
          poll_options (*),
          poll_votes (option_id, user_id)
        `)
        .order("closes_at", { ascending: true });

      if (pollsData && pollsData.length > 0) {
        const parsedPolls: Poll[] = pollsData.map((p: any) => {
          const userVote = user?.id ? p.poll_votes?.find((v: any) => v.user_id === user.id)?.option_id : undefined;
          const totalVotes = p.poll_votes?.length || 0;
          const options = (p.poll_options || []).map((opt: any) => {
            const count = p.poll_votes?.filter((v: any) => v.option_id === opt.id).length || 0;
            return {
              id: opt.id,
              poll_id: opt.poll_id,
              label: opt.label,
              sort_order: opt.sort_order,
              vote_count: count,
              percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
            };
          });
          return {
            id: p.id,
            mess: p.mess,
            title: p.title,
            closes_at: p.closes_at,
            is_closed: p.is_closed,
            created_at: p.created_at,
            created_by: p.created_by,
            options,
            user_voted_option_id: userVote,
            total_votes: totalVotes,
          };
        });
        setPolls(parsedPolls);

        if (typeof window !== "undefined" && user?.id) {
          try {
            const allVotes = getStoredUserPollVotes();
            const currentVotes = allVotes[user.id] || {};
            parsedPolls.forEach((p) => {
              if (p.user_voted_option_id) {
                currentVotes[p.id] = p.user_voted_option_id;
              }
            });
            allVotes[user.id] = currentVotes;
            localStorage.setItem("gh_user_poll_votes", JSON.stringify(allVotes));
          } catch {}
        }
      }

      // 5. Fetch hostel leaders
      const { data: leadersData } = await supabase
        .from("hostel_leaders")
        .select("*")
        .order("sort_order", { ascending: true });
      if (leadersData && leadersData.length > 0) setLeaders(leadersData);
    } catch {
      // Supabase fetch fallback
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const currentUserId = user?.id || profile?.id || "demo-student";
    const userComplaintVotes = getStoredUserComplaintVotes()[currentUserId] || {};
    const deletedComplaintIds: string[] = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("gh_deleted_complaint_ids") || "[]")
      : [];

    setComplaints((prev) =>
      prev
        .filter((c) => !deletedComplaintIds.includes(c.id))
        .map((c) => ({
          ...c,
          user_vote: userComplaintVotes[c.id] !== undefined ? userComplaintVotes[c.id] : (c.user_vote || 0),
        }))
    );

    if (!isSupabaseConfigured() || !user) {
      const userVotes = getStoredUserPollVotes()[currentUserId] || {};
      setPolls((prev) =>
        prev.map((p) => ({
          ...p,
          user_voted_option_id: userVotes[p.id] || undefined,
        }))
      );
    }
    refreshData();
  }, [user]);

  // ================= NOTICES =================
  const addNotice = async (data: { title: string; body: string; category: NoticeCategory }) => {
    if (!isCaptain) return { error: "Only the hostel captain can post notices" };

    const newNotice: Notice = {
      id: "notice-" + Date.now(),
      title: data.title,
      body: data.body,
      category: data.category,
      created_at: new Date().toISOString(),
      created_by: user?.id || profile?.id,
    };

    if (!isSupabaseConfigured()) {
      const updated = [newNotice, ...notices];
      setNotices(updated);
      if (typeof window !== "undefined") {
        try { localStorage.setItem("gh_notices", JSON.stringify(updated)); } catch {}
      }
      return {};
    }

    try {
      const supabase = createClient();
      const currentUserId = user?.id || profile?.id;
      const { data: inserted, error } = await supabase.from("notices").insert({
        title: data.title,
        body: data.body,
        category: data.category,
        created_by: isValidUUID(currentUserId) ? currentUserId : null,
      }).select().single();

      if (error) {
        console.warn("Could not insert notice to Supabase:", error.message);
        const updated = [newNotice, ...notices];
        setNotices(updated);
        if (typeof window !== "undefined") {
          try { localStorage.setItem("gh_notices", JSON.stringify(updated)); } catch {}
        }
        return { error: error.message };
      }

      await refreshData();
      return {};
    } catch (err: any) {
      console.warn("Error adding notice:", err);
      const updated = [newNotice, ...notices];
      setNotices(updated);
      if (typeof window !== "undefined") {
        try { localStorage.setItem("gh_notices", JSON.stringify(updated)); } catch {}
      }
      return {};
    }
  };

  const editNotice = async (id: string, data: { title: string; body: string; category: NoticeCategory }) => {
    if (!isCaptain) return { error: "Only the hostel captain can edit notices" };

    const updated = notices.map((n) => (n.id === id ? { ...n, ...data } : n));
    setNotices(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("gh_notices", JSON.stringify(updated)); } catch {}
    }

    if (!isSupabaseConfigured() || !isValidUUID(id)) {
      return {};
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("notices").update(data).eq("id", id);
      if (error) console.warn("Supabase notice update error:", error.message);
      await refreshData();
      return {};
    } catch (err: any) {
      console.warn("Error editing notice:", err);
      return {};
    }
  };

  const deleteNotice = async (id: string) => {
    if (!isCaptain) return { error: "Only the hostel captain can delete notices" };

    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("gh_notices", JSON.stringify(updated)); } catch {}
    }

    if (!isSupabaseConfigured() || !isValidUUID(id)) {
      return {};
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) console.warn("Supabase notice delete error:", error.message);
      await refreshData();
      return {};
    } catch (err: any) {
      console.warn("Error deleting notice:", err);
      return {};
    }
  };

  // ================= COMPLAINTS =================
  const addComplaint = async (data: { title: string; description: string; category: ComplaintCategory }) => {
    if (!profile && !user) {
      return { error: "Please log in before submitting complaints" };
    }

    const currentUserId = user?.id || profile?.id;

    // Rate limit check: 1 complaint per hour per resident (captains exempt)
    if (!isCaptain && currentUserId) {
      const oneHourMs = 60 * 60 * 1000;
      let latestComplaintTime = 0;

      // 1. Check local complaints state
      const userComplaints = complaints.filter((c) => c.user_id === currentUserId);
      if (userComplaints.length > 0) {
        const times = userComplaints.map((c) => new Date(c.created_at).getTime()).filter((t) => !isNaN(t));
        if (times.length > 0) latestComplaintTime = Math.max(...times);
      }

      // 2. Check localStorage timestamp
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("gh_last_complaint_time_" + currentUserId);
          if (stored) {
            const parsed = parseInt(stored, 10);
            if (parsed && parsed > latestComplaintTime) latestComplaintTime = parsed;
          }
        } catch {}
      }

      if (latestComplaintTime > 0 && Date.now() - latestComplaintTime < oneHourMs) {
        const remainingMinutes = Math.max(1, Math.ceil((oneHourMs - (Date.now() - latestComplaintTime)) / 60000));
        return {
          error: `Rate limit: You can only file 1 complaint per hour. Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} before filing another.`,
        };
      }
    }

    let targetWingId = profile?.wing_id;
    if (!targetWingId || !isValidUUID(targetWingId) || !wings.some(w => w.id === targetWingId)) {
      const matched = wings.find(
        (w) =>
          w.name.toLowerCase() === profile?.wing_name?.toLowerCase() ||
          w.name.toLowerCase() === (profile?.wing_id || "").toLowerCase()
      );
      if (matched && isValidUUID(matched.id)) {
        targetWingId = matched.id;
      } else if (wings.length > 0 && isValidUUID(wings[0].id)) {
        targetWingId = wings[0].id;
      }
    }

    const newComplaint: Complaint = {
      id: "complaint-" + Date.now(),
      user_id: currentUserId || "student-1",
      author_name: profile?.full_name || "Resident",
      wing_id: targetWingId || "wing-a",
      wing_name: profile?.wing_name || "Wing A",
      category: data.category,
      title: data.title,
      description: data.description,
      status: "open",
      created_at: new Date().toISOString(),
      like_count: 0,
      dislike_count: 0,
      user_vote: 0,
    };

    if (!isSupabaseConfigured() || !currentUserId || !isValidUUID(currentUserId) || !targetWingId || !isValidUUID(targetWingId)) {
      const updated = [newComplaint, ...complaints];
      setComplaints(updated);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("gh_complaints", JSON.stringify(updated));
          if (currentUserId) {
            localStorage.setItem("gh_last_complaint_time_" + currentUserId, Date.now().toString());
          }
        } catch {}
      }
      return {};
    }

    try {
      const supabase = createClient();

      // Database-level check for complaints submitted in the last hour
      if (!isCaptain && currentUserId && isValidUUID(currentUserId)) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: dbRecent } = await supabase
          .from("complaints")
          .select("created_at")
          .eq("user_id", currentUserId)
          .gte("created_at", oneHourAgo)
          .order("created_at", { ascending: false })
          .limit(1);

        if (dbRecent && dbRecent.length > 0) {
          const dbTime = new Date(dbRecent[0].created_at).getTime();
          const remMs = 60 * 60 * 1000 - (Date.now() - dbTime);
          const remMins = Math.max(1, Math.ceil(remMs / 60000));
          return {
            error: `Rate limit: You can only file 1 complaint per hour. Please wait ${remMins} minute${remMins > 1 ? "s" : ""} before filing another.`,
          };
        }
      }

      // Ensure user profile exists in profiles table
      await supabase.from("profiles").upsert(
        {
          id: currentUserId,
          full_name: profile?.full_name || user?.email || "Resident",
          room_no: profile?.room_no || "101",
          wing_id: targetWingId,
          mess: profile?.mess || 1,
          role: profile?.role || "student",
        },
        { onConflict: "id" }
      );

      const { data: inserted, error } = await supabase
        .from("complaints")
        .insert({
          user_id: currentUserId,
          wing_id: targetWingId,
          category: data.category,
          title: data.title,
          description: data.description,
          status: "open",
        })
        .select()
        .single();

      if (error) {
        console.warn("Could not insert complaint to Supabase:", error.message);
        return { error: error.message };
      }

      if (typeof window !== "undefined" && currentUserId) {
        try {
          localStorage.setItem("gh_last_complaint_time_" + currentUserId, Date.now().toString());
        } catch {}
      }

      await refreshData();
      return {};
    } catch (err: any) {
      console.warn("Error adding complaint:", err);
      return { error: err?.message || "Failed to submit complaint" };
    }
  };

  const voteComplaint = async (complaintId: string, value: 1 | -1) => {
    const currentUserId = user?.id || profile?.id || "demo-student";
    const allUserVotes = getStoredUserComplaintVotes();
    const currentUserVotes = allUserVotes[currentUserId] || {};

    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return { error: "Complaint not found" };

    const previousVote: 1 | -1 | 0 =
      currentUserVotes[complaintId] !== undefined
        ? currentUserVotes[complaintId]
        : (target.user_vote || 0);

    let newVote: 1 | -1 | 0 = value;
    let newLikeCount = target.like_count || 0;
    let newDislikeCount = target.dislike_count || 0;

    if (previousVote === value) {
      // User clicked the active button again -> Unlike / Undislike (toggle off)
      newVote = 0;
      if (value === 1) newLikeCount = Math.max(0, newLikeCount - 1);
      if (value === -1) newDislikeCount = Math.max(0, newDislikeCount - 1);
    } else {
      // User clicked a new vote or switched vote
      if (previousVote === 1) newLikeCount = Math.max(0, newLikeCount - 1);
      if (previousVote === -1) newDislikeCount = Math.max(0, newDislikeCount - 1);

      if (value === 1) newLikeCount += 1;
      if (value === -1) newDislikeCount += 1;
    }

    const updatedComplaints = complaints.map((c) => {
      if (c.id !== complaintId) return c;
      return {
        ...c,
        like_count: newLikeCount,
        dislike_count: newDislikeCount,
        user_vote: newVote,
      };
    });

    // 1. Optimistic state update
    setComplaints(updatedComplaints);

    // 2. Persist per-user vote in local storage
    currentUserVotes[complaintId] = newVote;
    allUserVotes[currentUserId] = currentUserVotes;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gh_user_complaint_votes", JSON.stringify(allUserVotes));
        localStorage.setItem("gh_complaints", JSON.stringify(updatedComplaints));
      } catch {}
    }

    // 3. Supabase sync (only if user and complaint have valid UUIDs in database)
    const hasRealSession =
      isSupabaseConfigured() &&
      user &&
      isValidUUID(user.id) &&
      isValidUUID(complaintId);

    if (!hasRealSession) {
      return {};
    }

    try {
      const supabase = createClient();
      // Ensure user profile exists for foreign key
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: profile?.full_name || user.email || "Resident",
          role: profile?.role || "student",
        },
        { onConflict: "id" }
      );

      if (newVote === 0) {
        // User unliked / removed vote
        await supabase
          .from("complaint_votes")
          .delete()
          .match({ complaint_id: complaintId, user_id: user.id });
      } else {
        // User added or switched vote
        await supabase
          .from("complaint_votes")
          .upsert(
            { complaint_id: complaintId, user_id: user.id, value: newVote },
            { onConflict: "complaint_id,user_id" }
          );
      }
      return {};
    } catch (err: any) {
      console.warn("Could not sync complaint vote with Supabase:", err);
      return {};
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: ComplaintStatus) => {
    if (!isCaptain) return { error: "Only the hostel captain can update complaint status" };

    const updated = complaints.map((c) => (c.id === complaintId ? { ...c, status } : c));
    setComplaints(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gh_complaints", JSON.stringify(updated));
      } catch {}
    }

    const hasRealSession = isSupabaseConfigured() && isValidUUID(complaintId);
    if (!hasRealSession) {
      return {};
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("complaints").update({ status }).eq("id", complaintId);
      if (error) {
        console.warn("Could not update complaint status in Supabase:", error.message);
      }
      return {};
    } catch (err: any) {
      console.warn("Supabase complaint update error:", err);
      return {};
    }
  };

  const deleteComplaint = async (complaintId: string) => {
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return { error: "Complaint not found" };

    const canDelete = isCaptain || (profile && target.user_id === profile.id);
    if (!canDelete) return { error: "You can only delete your own complaints" };

    const previousComplaints = complaints;
    const updated = complaints.filter((c) => c.id !== complaintId);
    setComplaints(updated);

    // 1. If it is a real database complaint UUID, delete from Supabase
    const isRealDbComplaint = isSupabaseConfigured() && isValidUUID(complaintId);
    if (!isRealDbComplaint) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("gh_complaints", JSON.stringify(updated));
          const deletedIds: string[] = JSON.parse(
            localStorage.getItem("gh_deleted_complaint_ids") || "[]"
          );
          if (!deletedIds.includes(complaintId)) {
            deletedIds.push(complaintId);
            localStorage.setItem("gh_deleted_complaint_ids", JSON.stringify(deletedIds));
          }
        } catch {}
      }
      return {};
    }

    try {
      const supabase = createClient();

      // Try calling RPC function if installed
      const { error: rpcError } = await supabase.rpc("delete_complaint_admin", {
        target_complaint_id: complaintId,
      });

      if (rpcError) {
        // Fallback to direct deletion: delete child votes first, then delete complaint
        await supabase.from("complaint_votes").delete().eq("complaint_id", complaintId);
        const { error: directError } = await supabase.from("complaints").delete().eq("id", complaintId);

        if (directError) {
          console.error("Could not delete complaint from Supabase:", directError.message);
          setComplaints(previousComplaints);
          return { error: directError.message };
        }
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("gh_complaints", JSON.stringify(updated));
        } catch {}
      }

      await refreshData();
      return {};
    } catch (err: any) {
      console.error("Supabase complaint delete error:", err);
      setComplaints(previousComplaints);
      return { error: err?.message || "Failed to delete complaint from server" };
    }
  };

  // ================= MESS MENUS =================
  const getMealItems = (mess: 1 | 2, dayOfWeek: number, meal: MealType): string[] => {
    const entry = messMenus.find(
      (m) => m.mess === mess && m.day_of_week === dayOfWeek && m.meal === meal
    );
    return entry?.items || [];
  };

  const updateMealItems = async (
    mess: 1 | 2,
    dayOfWeek: number,
    meal: MealType,
    items: string[]
  ) => {
    if (!isCaptain) return { error: "Only the hostel captain can edit the mess menu" };

    const existingIdx = messMenus.findIndex(
      (m) => m.mess === mess && m.day_of_week === dayOfWeek && m.meal === meal
    );
    let updated = [...messMenus];
    if (existingIdx >= 0) {
      updated[existingIdx] = { ...updated[existingIdx], items };
    } else {
      updated.push({ mess, day_of_week: dayOfWeek, meal, items });
    }
    setMessMenus(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gh_menus", JSON.stringify(updated));
      } catch {}
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("mess_menu").upsert(
          { mess, day_of_week: dayOfWeek, meal, items, updated_at: new Date().toISOString() },
          { onConflict: "mess,day_of_week,meal" }
        );
        if (error) {
          console.warn("Could not update mess menu in Supabase:", error.message);
        } else {
          await refreshData();
        }
      } catch (err: any) {
        console.warn("Error updating mess menu in Supabase:", err);
      }
    }
    return {};
  };

  // ================= POLLS =================
  const votePoll = async (pollId: string, optionId: string) => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll) return { error: "Poll not found" };

    if (poll.is_closed || new Date(poll.closes_at) <= new Date()) {
      return { error: "This poll is closed for voting" };
    }

    if (profile && profile.mess !== poll.mess && profile.role !== "captain") {
      return { error: `Only residents of Mess ${poll.mess} can vote in this poll` };
    }

    const currentUserId = user?.id || profile?.id || "demo-student";
    const allUserVotes = getStoredUserPollVotes();
    const currentUserVotes = allUserVotes[currentUserId] || {};
    // Accurately determine if THIS user already voted for an option
    const previousUserChoice = currentUserVotes[pollId] || poll.user_voted_option_id;

    // Optimistic calculation
    const updated = polls.map((p) => {
      if (p.id !== pollId) return p;

      let newTotalVotes = p.total_votes || 0;
      // Only increment total votes if this user hasn't voted yet
      if (!previousUserChoice) {
        newTotalVotes += 1;
      }

      const updatedOptions = p.options.map((opt) => {
        let count = opt.vote_count;
        if (opt.id === previousUserChoice && opt.id !== optionId) {
          count = Math.max(0, count - 1);
        }
        if (opt.id === optionId && opt.id !== previousUserChoice) {
          count += 1;
        }
        return {
          ...opt,
          vote_count: count,
          percentage: newTotalVotes > 0 ? Math.round((count / newTotalVotes) * 100) : 0,
        };
      });

      return {
        ...p,
        user_voted_option_id: optionId,
        total_votes: newTotalVotes,
        options: updatedOptions,
      };
    });

    setPolls(updated);

    // Save per-user vote tracking in local storage
    allUserVotes[currentUserId] = {
      ...currentUserVotes,
      [pollId]: optionId,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gh_user_poll_votes", JSON.stringify(allUserVotes));
        localStorage.setItem(
          "gh_polls",
          JSON.stringify(updated.map((p) => ({ ...p, user_voted_option_id: undefined })))
        );
      } catch {}
    }

    if (isSupabaseConfigured() && user && isValidUUID(user.id) && isValidUUID(pollId) && isValidUUID(optionId)) {
      try {
        const supabase = createClient();
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            full_name: profile?.full_name || user.email || "Student",
            mess: profile?.mess || poll.mess,
            role: profile?.role || "student",
          },
          { onConflict: "id" }
        );

        const { error } = await supabase
          .from("poll_votes")
          .upsert(
            { poll_id: pollId, option_id: optionId, user_id: user.id },
            { onConflict: "poll_id,user_id" }
          );

        if (error) {
          console.warn("Could not upsert poll vote in Supabase:", error.message);
        } else {
          await refreshData();
        }
      } catch (err: any) {
        console.warn("Error voting poll in Supabase:", err);
      }
    }

    return {};
  };

  const createPoll = async (data: {
    mess: 1 | 2;
    title: string;
    options: string[];
    closes_at: string;
  }) => {
    if (!isCaptain) return { error: "Only the hostel captain can create polls" };

    const pollId = "poll-" + Date.now();
    const optionsWithIds = data.options.map((label, idx) => ({
      id: "opt-" + Date.now() + "-" + idx,
      poll_id: pollId,
      label,
      sort_order: idx + 1,
      vote_count: 0,
      percentage: 0,
    }));

    const newPoll: Poll = {
      id: pollId,
      mess: data.mess,
      title: data.title,
      closes_at: data.closes_at,
      is_closed: false,
      created_at: new Date().toISOString(),
      created_by: user?.id || profile?.id,
      options: optionsWithIds,
      total_votes: 0,
    };

    if (!isSupabaseConfigured()) {
      const updated = [newPoll, ...polls];
      setPolls(updated);
      if (typeof window !== "undefined") {
        try { localStorage.setItem("gh_polls", JSON.stringify(updated)); } catch {}
      }
      return {};
    }

    try {
      const supabase = createClient();
      const currentUserId = user?.id || profile?.id;

      if (currentUserId && isValidUUID(currentUserId)) {
        await supabase.from("profiles").upsert(
          {
            id: currentUserId,
            full_name: profile?.full_name || user?.email || "Hostel Captain",
            role: "captain",
          },
          { onConflict: "id" }
        );
      }

      const { data: insertedPoll, error: pollError } = await supabase
        .from("polls")
        .insert({
          mess: data.mess,
          title: data.title,
          closes_at: data.closes_at,
          is_closed: false,
          created_by: isValidUUID(currentUserId) ? currentUserId : null,
        })
        .select()
        .single();

      if (pollError) throw new Error(pollError.message);

      const optionsToInsert = data.options.map((label, idx) => ({
        poll_id: insertedPoll.id,
        label,
        sort_order: idx + 1,
      }));

      const { error: optionsError } = await supabase.from("poll_options").insert(optionsToInsert);
      if (optionsError) throw new Error(optionsError.message);

      await refreshData();
      return {};
    } catch (err: any) {
      console.warn("Could not insert poll to Supabase:", err);
      const updated = [newPoll, ...polls];
      setPolls(updated);
      if (typeof window !== "undefined") {
        try { localStorage.setItem("gh_polls", JSON.stringify(updated)); } catch {}
      }
      return {};
    }
  };

  const closePollEarly = async (pollId: string) => {
    if (!isCaptain) return { error: "Only the hostel captain can close polls" };

    const updated = polls.map((p) => (p.id === pollId ? { ...p, is_closed: true } : p));
    setPolls(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("gh_polls", JSON.stringify(updated)); } catch {}
    }

    if (isSupabaseConfigured() && isValidUUID(pollId)) {
      try {
        const supabase = createClient();
        await supabase.from("polls").update({ is_closed: true }).eq("id", pollId);
        await refreshData();
      } catch (err) {
        console.warn("Error closing poll in Supabase:", err);
      }
    }
    return {};
  };

  const deletePoll = async (pollId: string) => {
    if (!isCaptain) return { error: "Only the hostel captain can delete polls" };

    const updated = polls.filter((p) => p.id !== pollId);
    setPolls(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("gh_polls", JSON.stringify(updated)); } catch {}
    }

    if (isSupabaseConfigured() && isValidUUID(pollId)) {
      try {
        const supabase = createClient();
        await supabase.from("polls").delete().eq("id", pollId);
        await refreshData();
      } catch (err) {
        console.warn("Error deleting poll in Supabase:", err);
      }
    }
    return {};
  };

  // ================= HOSTEL LEADERS =================
  const addLeader = async (leader: Omit<HostelLeader, "id">) => {
    if (!isCaptain) return { error: "Only the hostel captain can manage hostel leaders" };

    const newLeader: HostelLeader = {
      ...leader,
      id: "leader-" + Date.now(),
    };
    const updated = [...leaders, newLeader].sort((a, b) => a.sort_order - b.sort_order);
    setLeaders(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("gh_leaders", JSON.stringify(updated)); } catch {}
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("hostel_leaders").insert(leader);
        if (error) {
          console.warn("Could not insert leader in Supabase:", error.message);
        } else {
          await refreshData();
        }
      } catch (err: any) {
        console.warn("Error inserting leader in Supabase:", err);
      }
    }
    return {};
  };

  const editLeader = async (id: string, leader: Partial<HostelLeader>) => {
    if (!isCaptain) return { error: "Only the hostel captain can edit hostel leaders" };

    const updated = leaders.map((l) => (l.id === id ? { ...l, ...leader } : l));
    setLeaders(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("gh_leaders", JSON.stringify(updated)); } catch {}
    }

    if (isSupabaseConfigured() && isValidUUID(id)) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("hostel_leaders").update(leader).eq("id", id);
        if (error) {
          console.warn("Could not update leader in Supabase:", error.message);
        } else {
          await refreshData();
        }
      } catch (err: any) {
        console.warn("Error updating leader in Supabase:", err);
      }
    }
    return {};
  };

  const deleteLeader = async (id: string) => {
    if (!isCaptain) return { error: "Only the hostel captain can delete hostel leaders" };

    const updated = leaders.filter((l) => l.id !== id);
    setLeaders(updated);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("gh_leaders", JSON.stringify(updated)); } catch {}
    }

    if (isSupabaseConfigured() && isValidUUID(id)) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("hostel_leaders").delete().eq("id", id);
        if (error) {
          console.warn("Could not delete leader in Supabase:", error.message);
        } else {
          await refreshData();
        }
      } catch (err: any) {
        console.warn("Error deleting leader in Supabase:", err);
      }
    }
    return {};
  };

  const reorderLeaders = async (newLeaders: HostelLeader[]) => {
    if (!isCaptain) return { error: "Only the hostel captain can reorder leaders" };

    const reordered = newLeaders.map((l, idx) => ({ ...l, sort_order: idx + 1 }));
    setLeaders(reordered);

    if (!isSupabaseConfigured()) {
      localStorage.setItem("gh_leaders", JSON.stringify(reordered));
      return {};
    }

    const supabase = createClient();
    for (const leader of reordered) {
      await supabase.from("hostel_leaders").update({ sort_order: leader.sort_order }).eq("id", leader.id);
    }
    return {};
  };

  return (
    <DataContext.Provider
      value={{
        notices,
        addNotice,
        editNotice,
        deleteNotice,
        complaints,
        addComplaint,
        voteComplaint,
        updateComplaintStatus,
        deleteComplaint,
        messMenus,
        getMealItems,
        updateMealItems,
        polls,
        votePoll,
        createPoll,
        closePollEarly,
        deletePoll,
        leaders,
        addLeader,
        editLeader,
        deleteLeader,
        reorderLeaders,
        isLoadingData,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
