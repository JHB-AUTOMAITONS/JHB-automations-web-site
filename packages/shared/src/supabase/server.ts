import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cleanEnv } from "./client";

export async function createClient() {
  // During the website's STATIC EXPORT build there is no request/cookie context,
  // and calling cookies() would force dynamic rendering (which static export
  // forbids). Public content is read with the anon key, so a plain cookieless
  // client works at build time. This branch is ONLY taken when STATIC_EXPORT=true
  // is set for the website build — the admin app never sets it, so its cookie-
  // based auth/session reads are completely unchanged.
  if (process.env.STATIC_EXPORT === "true") {
    // supabase-js eagerly constructs a realtime client that requires a global
    // WebSocket constructor; Node < 22 has none, which would throw. We never use
    // realtime during the build, so a stub constructor satisfies the check
    // without ever opening a connection.
    const g = globalThis as { WebSocket?: unknown };
    if (typeof g.WebSocket === "undefined") {
      g.WebSocket = class {};
    }
    return createSupabaseClient(
      cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
      cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      { auth: { persistSession: false } }
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware refreshes sessions.
          }
        },
      },
    }
  );
}
