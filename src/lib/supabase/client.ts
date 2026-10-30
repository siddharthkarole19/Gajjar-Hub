import { createBrowserClient } from "@supabase/ssr";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo-hostel-hub.supabase.co";
// Clean URL by stripping any accidentally pasted /rest/v1 or trailing slashes
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id") &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("demo-hostel-hub")
  );
};

export const createClient = () => {
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      isSingleton: true,
      cookieOptions: {
        path: "/",
        sameSite: "lax",
      },
      auth: {
        // Bypass navigator.locks to completely prevent lock deadlocks on mobile/multi-device
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
};
