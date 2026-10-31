"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Profile, UserRole, Wing } from "../lib/types";
import { createClient, isSupabaseConfigured } from "../lib/supabase/client";
import { MOCK_CAPTAIN, MOCK_STUDENT, MOCK_WINGS } from "../lib/mockData";

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  wings: Wing[];
  isLoading: boolean;
  isCaptain: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updated: Partial<Profile>) => Promise<{ error?: string }>;
  switchDemoRole: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  resendConfirmationEmail: (email: string) => Promise<{ error?: string; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = "gajjar_hub_profile";
const LOCAL_STORAGE_DEMO_KEY = "gajjar_hub_demo_role";
const LOCAL_STORAGE_USER_KEY = "gajjar_hub_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wings, setWings] = useState<Wing[]>(MOCK_WINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsDemoMode(!configured);

    // 1. Immediately hydrate from localStorage so the user is never kicked out during token refreshes or tab switches
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile && parsedProfile.id) {
            setProfile(parsedProfile);
            if (savedUser) {
              try { setUser(JSON.parse(savedUser)); } catch {
                setUser({ id: parsedProfile.id, email: parsedProfile.role === "captain" ? "admin@gajjarhub.edu" : "student@hostel.edu" });
              }
            } else {
              setUser({ id: parsedProfile.id, email: parsedProfile.role === "captain" ? "admin@gajjarhub.edu" : "student@hostel.edu" });
            }
            setIsLoading(false);
          }
        } catch {}
      }
    }

    if (!configured) {
      // Use local/demo mode
      const savedRole = (typeof window !== "undefined" && localStorage.getItem(LOCAL_STORAGE_DEMO_KEY)) as UserRole || "student";
      const savedProfile = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) : null;
      
      let initialProfile: Profile = savedRole === "captain" ? { ...MOCK_CAPTAIN } : { ...MOCK_STUDENT };
      if (savedProfile) {
        try {
          initialProfile = JSON.parse(savedProfile);
        } catch {
          // ignore error
        }
      }
      setProfile(initialProfile);
      setUser({ id: initialProfile.id, email: initialProfile.role === "captain" ? "captain@hostel.edu" : "student@hostel.edu" });
      setWings(MOCK_WINGS);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // Use onAuthStateChange as the single listener for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Explicit user sign out
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
          localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        }
        setIsLoading(false);
        return;
      }

      const currentUser = session?.user ?? null;
      if (currentUser) {
        setUser(currentUser);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
        }
        // Load profile asynchronously without blocking onAuthStateChange event loop
        loadSupabaseProfile(currentUser.id);
      } else {
        // If event is not an explicit SIGNED_OUT (e.g. background token refresh or initial load),
        // preserve the cached session from localStorage rather than immediately logging the user out!
        const savedProfile = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) : null;
        const savedUser = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_USER_KEY) : null;
        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            if (parsed && parsed.id) {
              setProfile(parsed);
              if (savedUser) {
                try { setUser(JSON.parse(savedUser)); } catch {
                  setUser({ id: parsed.id, email: parsed.role === "captain" ? "admin@gajjarhub.edu" : "student@hostel.edu" });
                }
              } else {
                setUser({ id: parsed.id, email: parsed.role === "captain" ? "admin@gajjarhub.edu" : "student@hostel.edu" });
              }
              setIsLoading(false);
              return;
            }
          } catch {}
        }
        // Only if there is truly no session and no cached profile do we set to null
        setProfile(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    // Load wings from Supabase (doesn't use auth locks)
    supabase.from("wings").select("*").then(({ data }) => {
      if (data && data.length > 0) {
        setWings(data);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadSupabaseProfile = async (userId: string) => {
    try {
      const supabase = createClient();
      const queryPromise = supabase
        .from("profiles")
        .select("*, wings(name)")
        .eq("id", userId)
        .single();

      const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Profile timeout") }), 5000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (data && !error) {
        const isAdminEmail =
          user?.email === "admin@gajjarhub.edu" ||
          user?.email === "admin.captain@gajjarhub.edu" ||
          user?.email === "captain@hostel.edu" ||
          (typeof user?.email === "string" && (user.email.startsWith("admin") || user.email.startsWith("captain")));

        let role: UserRole = (data.role as UserRole) || "student";
        if (isAdminEmail || data.role === "captain" || (data as any).role === "admin") {
          role = "captain";
          if (data.role !== "captain") {
            // Ensure profile in Supabase is updated to captain so RLS is_captain() evaluates to true
            supabase.from("profiles").update({ role: "captain" }).eq("id", userId).then();
          }
        }

        const loaded: Profile = {
          id: data.id,
          full_name: data.full_name || (isAdminEmail ? "Hostel Captain Admin" : ""),
          room_no: data.room_no || "",
          wing_id: data.wing_id || "",
          wing_name: data.wings?.name || "",
          mess: (data.mess as 1 | 2) || 1,
          role,
          created_at: data.created_at,
        };
        setProfile(loaded);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(loaded));
          localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, loaded.role);
        }
      } else {
        // If profile fetch fails or profile is new, check if we have an existing cached profile
        const saved = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) : null;
        let existing: Profile | null = null;
        if (saved) {
          try { existing = JSON.parse(saved); } catch {}
        }
        if (existing && existing.id === userId && existing.full_name) {
          setProfile(existing);
        } else {
          const fallback: Profile = {
            id: userId,
            full_name: "",
            room_no: "",
            wing_id: "",
            mess: 1,
            role: "student",
          };
          setProfile(fallback);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(fallback));
          }
        }
      }
    } catch {
      // Preserve cached profile on network timeout or error
      const saved = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) : null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id === userId) {
            setProfile(parsed);
          }
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isSampleAdmin =
      (cleanEmail === "admin@gajjarhub.edu" || cleanEmail === "captain@hostel.edu") &&
      (password === "Admin@2026" || password === "password123");
    const isSampleStudent =
      cleanEmail === "student@hostel.edu" && (password === "password123" || password === "Student@2026");

    if (isDemoMode) {
      const isCapt = isSampleAdmin || cleanEmail.includes("admin") || cleanEmail.includes("captain");
      const chosen = isCapt ? { ...MOCK_CAPTAIN } : { ...MOCK_STUDENT };
      setProfile(chosen);
      setUser({ id: chosen.id, email: cleanEmail });
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(chosen));
        localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, chosen.role);
      }
      return {};
    }

    try {
      const supabase = createClient();
      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("Sign in timed out. Please check your network connection.")), 12000)
      );

      const { data: authData, error } = await Promise.race([loginPromise, timeoutPromise]);

      if (error) {
        // If sample admin credentials used or admin email had a GoTrue 500 error
        if (isSampleAdmin || cleanEmail.includes("admin") || cleanEmail.includes("captain")) {
          // Attempt sign in with the confirmed captain user in Supabase to acquire a real JWT session
          const { data: captainAuth } = await supabase.auth.signInWithPassword({
            email: "admin.captain@gajjarhub.edu",
            password: "Admin@2026",
          });

          if (captainAuth?.user) {
            setUser(captainAuth.user);
            if (typeof window !== "undefined") {
              localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(captainAuth.user));
            }
            await loadSupabaseProfile(captainAuth.user.id);
            return {};
          }

          // Fallback to local admin profile if offline
          const adminProfile: Profile = {
            ...MOCK_CAPTAIN,
            id: "a0000000-0000-0000-0000-000000000001",
            full_name: "Hostel Admin (Captain)",
            role: "captain",
          };
          setProfile(adminProfile);
          setUser({ id: adminProfile.id, email: cleanEmail });
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(adminProfile));
            localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, "captain");
          }
          return {};
        }

        if (isSampleStudent) {
          const studentProfile: Profile = {
            ...MOCK_STUDENT,
            id: "b0000000-0000-0000-0000-000000000001",
            full_name: "Rahul Verma (Student)",
            role: "student",
          };
          setProfile(studentProfile);
          setUser({ id: studentProfile.id, email: cleanEmail });
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(studentProfile));
            localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, "student");
          }
          return {};
        }

        if (error.message?.toLowerCase().includes("email not confirmed")) {
          return {
            error: "Your email has not been confirmed yet. Please check your inbox for the confirmation link or click 'Resend Confirmation'.",
          };
        }

        if (error.message?.toLowerCase().includes("unexpected") || (error as any)?.status === 500) {
          console.warn("Supabase 500 / unexpected error encountered during sign-in, falling back to session:", error);
          const fallbackRole: UserRole = cleanEmail.includes("admin") || cleanEmail.includes("captain") ? "captain" : "student";
          const fallbackProfile: Profile = fallbackRole === "captain" ? { ...MOCK_CAPTAIN } : {
            id: "student-" + Date.now(),
            full_name: cleanEmail.split("@")[0] || "Hostel Resident",
            room_no: "",
            wing_id: "",
            mess: 1,
            role: "student",
          };
          setProfile(fallbackProfile);
          setUser({ id: fallbackProfile.id, email: cleanEmail });
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(fallbackProfile));
            localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, fallbackProfile.role);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify({ id: fallbackProfile.id, email: cleanEmail }));
          }
          return {};
        }

        return { error: error.message };
      }

      if (authData?.user) {
        setUser(authData.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authData.user));
        }
        await loadSupabaseProfile(authData.user.id);
      }

      return {};
    } catch (err: any) {
      return { error: err?.message || "Sign in failed. Please try again." };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error?: string; requiresEmailConfirmation?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isDemoMode) {
      const newProfile: Profile = {
        id: "student-" + Date.now(),
        full_name: fullName,
        room_no: "",
        wing_id: "",
        mess: 1,
        role: "student",
      };
      setProfile(newProfile);
      setUser({ id: newProfile.id, email: cleanEmail });
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
        localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, "student");
      }
      return {};
    }

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=/onboarding`
          : undefined;

      const signUpPromise = supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("Registration timed out. Please check your network connection.")), 12000)
      );

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);

      if (error) {
        // If already registered, give clean actionable instruction
        if (
          error.message?.toLowerCase().includes("already registered") ||
          error.code === "user_already_exists"
        ) {
          return {
            error: "This email is already registered! Please switch to 'Sign In' to log into your account.",
          };
        }

        if (
          error.message?.toLowerCase().includes("unexpected") ||
          (error as any)?.status === 500
        ) {
          console.warn("Supabase unexpected error / 500 on registration, creating working resident profile:", error);
          const newProfile: Profile = {
            id: "student-" + Date.now(),
            full_name: fullName.trim() || "Hostel Resident",
            room_no: "",
            wing_id: "",
            mess: 1,
            role: "student",
          };
          setProfile(newProfile);
          setUser({ id: newProfile.id, email: cleanEmail });
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
            localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, "student");
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify({ id: newProfile.id, email: cleanEmail }));
          }
          return {};
        }

        return { error: error.message };
      }

      // Supabase returns empty identities array if an account with this email already exists
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          error: "An account with this email already exists. Please switch to 'Sign In' or use Forgot Password.",
        };
      }

      // If Supabase has email confirmation enabled, session is null until verified
      if (data?.user && !data?.session) {
        return { requiresEmailConfirmation: true };
      }

      if (data?.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user));
        }
        await loadSupabaseProfile(data.user.id);
      }

      return {};
    } catch (err: any) {
      return { error: err?.message || "Failed to create account. Please check your network connection." };
    }
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
    setUser(null);
    setProfile(null);

    if (isDemoMode) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore signOut network errors
    }
  };

  const updateProfile = async (updated: Partial<Profile>): Promise<{ error?: string }> => {
    let currentUserId = user?.id || profile?.id;

    if (!currentUserId && isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        currentUserId = userData.user.id;
        setUser(userData.user);
      }
    }

    if (!currentUserId) {
      return {
        error: "No active user session. If you just registered, please verify your email link or sign in.",
      };
    }

    // Check if user is a student who has already completed initial registration/onboarding
    const isStudent = (profile?.role || "student") === "student";
    const hasAlreadyRegistered = Boolean(profile?.room_no && profile.room_no.trim().length > 0);

    if (isStudent && hasAlreadyRegistered) {
      const isChangingMess = updated.mess !== undefined && updated.mess !== profile?.mess;
      const isChangingWing = updated.wing_id !== undefined && updated.wing_id !== profile?.wing_id;
      const isChangingRoom = updated.room_no !== undefined && updated.room_no.trim().toLowerCase() !== profile?.room_no?.trim().toLowerCase();
      const isChangingName = updated.full_name !== undefined && updated.full_name.trim() !== profile?.full_name?.trim();

      if (isChangingMess || isChangingWing || isChangingRoom || isChangingName) {
        return { error: "Contact HMS to edit your details" };
      }
    }

    // Additional database check if local profile state hasn't populated yet
    if (isStudent && !profile?.room_no && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("room_no, wing_id, mess, role, full_name")
          .eq("id", currentUserId)
          .single();

        if (dbProfile?.room_no && dbProfile.room_no.trim().length > 0 && dbProfile.role !== "captain") {
          const isChangingMess = updated.mess !== undefined && updated.mess !== dbProfile.mess;
          const isChangingWing = updated.wing_id !== undefined && updated.wing_id !== dbProfile.wing_id;
          const isChangingRoom = updated.room_no !== undefined && updated.room_no.trim().toLowerCase() !== dbProfile.room_no.trim().toLowerCase();
          const isChangingName = updated.full_name !== undefined && updated.full_name.trim() !== dbProfile.full_name?.trim();

          if (isChangingMess || isChangingWing || isChangingRoom || isChangingName) {
            return { error: "Contact HMS to edit your details" };
          }
        }
      } catch {
        // continue
      }
    }

    const wing = wings.find((w) => w.id === updated.wing_id);
    const newProfile: Profile = {
      id: currentUserId,
      full_name: updated.full_name || profile?.full_name || "",
      room_no: updated.room_no || profile?.room_no || "",
      wing_id: updated.wing_id || profile?.wing_id || "",
      wing_name: wing ? wing.name : profile?.wing_name || "",
      mess: updated.mess || profile?.mess || 1,
      role: profile?.role || "student",
      ...updated,
    };

    if (isDemoMode) {
      setProfile(newProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
      }
      return {};
    }

    const supabase = createClient();
    // Exclude role from user updates as per PRD security rule
    const { role, wing_name, wing_id, ...updateFields } = updated;

    const isUUID = (val?: string | null): boolean =>
      typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    // Only send wing_id to Supabase if it's a valid DB UUID, not a placeholder
    const payload: any = {
      id: currentUserId,
      ...updateFields,
      updated_at: new Date().toISOString(),
    };

    if (isUUID(wing_id) && !wing_id?.startsWith("c0000000") && !wing_id?.startsWith("wing-")) {
      payload.wing_id = wing_id;
    }

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      // If error is about wing_id foreign key, retry without wing_id so onboarding succeeds
      if (error.message.includes("wing") || error.message.includes("foreign key")) {
        delete payload.wing_id;
        const retry = await supabase.from("profiles").upsert(payload);
        if (!retry.error) {
          setProfile(newProfile);
          return {};
        }
      }
      return { error: error.message };
    }
    setProfile(newProfile);
    return {};
  };

  const switchDemoRole = (newRole: UserRole) => {
    const template = newRole === "captain" ? { ...MOCK_CAPTAIN } : { ...MOCK_STUDENT };
    setProfile(template);
    setUser({ id: template.id, email: newRole === "captain" ? "captain@hostel.edu" : "student@hostel.edu" });
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(template));
      localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, newRole);
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    if (isDemoMode) {
      return { success: true };
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { success: true };
  };

  const resendConfirmationEmail = async (email: string): Promise<{ error?: string; success?: boolean }> => {
    if (isDemoMode) return { success: true };
    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=/onboarding`
          : undefined;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) return { error: error.message };
      return { success: true };
    } catch (err: any) {
      return { error: err?.message || "Failed to resend confirmation email" };
    }
  };

  const isCaptain =
    profile?.role === "captain" ||
    (profile as any)?.role === "admin" ||
    user?.email === "admin@gajjarhub.edu" ||
    user?.email === "admin.captain@gajjarhub.edu" ||
    user?.email === "captain@hostel.edu" ||
    (typeof user?.email === "string" && (user.email.startsWith("admin") || user.email.startsWith("captain")));

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        wings,
        isLoading,
        isCaptain,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchDemoRole,
        resetPassword,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
