import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Roles permitted to use the admin panel — the same set RLS grants write access
// to. Anonymous visitors and any signed-in account WITHOUT one of these roles
// are bounced to /login (defense-in-depth on top of database RLS).
const STAFF_ROLES = ["admin", "editor", "manager"];

// Tolerate an accidental "Value: "/"Key: " prefix or quotes/whitespace pasted
// into the env vars (a common dashboard mistake) -> avoids "Invalid API key".
const cleanEnv = (v?: string) =>
  (v ?? "").trim().replace(/^(?:value|key)\s*:\s*/i, "").replace(/^["']|["']$/g, "").trim();

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A signed-in user must also be staff. Self-read on jhb_profiles is allowed by
  // RLS (jhb_profiles_self_read), so this can't lock out a legitimate user.
  let isStaff = false;
  if (user) {
    const { data: profile } = await supabase
      .from("jhb_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isStaff = !!profile && STAFF_ROLES.includes(profile.role as string);
  }

  const path = request.nextUrl.pathname;
  const isLogin = path === "/login";

  // Not authenticated staff → only the login page is reachable.
  if (!isStaff && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Signed in but not staff → tell them why (avoids a silent bounce loop).
    url.search = user ? "?error=not_authorized" : "";
    return NextResponse.redirect(url);
  }

  // Authenticated staff → skip the login page.
  if (isStaff && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Protect everything except Next internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
