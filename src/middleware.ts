import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !rawKey || rawUrl.includes("your-project-id") || rawUrl.includes("demo-hostel-hub")) {
    return response;
  }

  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const supabaseAnonKey = rawKey;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Skip auth token network verification on login and auth routes to ensure instant load
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth")
  ) {
    return response;
  }

  // Calling getUser() refreshes the auth token if expired.
  // We guard with a 2.5s timeout so network latency never blocks the page load on mobile/other devices.
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500)),
    ]);
  } catch {
    // ignore server-side network errors or timeouts
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, favicon, manifest
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
