import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// On-demand ISR purge, called by the ADMIN app immediately after it publishes
// content. The website is a SEPARATE deployment, so the admin's own
// revalidatePath() can't reach this site's cache — instead it pings this
// endpoint, which purges the cache right away rather than waiting for the
// layout's `revalidate` window (see app/layout.tsx). This is what makes a
// hidden/edited section appear on the live site immediately after Publish.
//
// Secured by a shared secret (REVALIDATE_SECRET) so only our admin can trigger a
// purge. Best-effort on the admin side: publishing never fails if this endpoint
// is unreachable or the secret is unset (it just falls back to timed ISR).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(req) {
  const secret = process.env.REVALIDATE_SECRET;
  // No secret configured → refuse, so the cache can never be purged by an
  // unauthenticated caller. (The admin also skips calling when it has no secret.)
  if (!secret) return false;
  const provided =
    req.headers.get("x-revalidate-secret") ||
    new URL(req.url).searchParams.get("secret") ||
    "";
  return provided === secret;
}

export async function POST(req) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Optional specific paths (e.g. ["/","/about"]); when absent we purge EVERYTHING
  // under the root layout (nav + footer + every public page), so a publish can
  // never leave any stale HTML anywhere.
  let paths = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.paths)) {
      paths = body.paths.filter((p) => typeof p === "string" && p.startsWith("/"));
    }
  } catch {
    /* no / invalid JSON body → layout-wide purge only */
  }

  // "layout" scope revalidates every route that shares the root layout — i.e. the
  // whole public site — so this alone clears all stale pages after any publish.
  revalidatePath("/", "layout");
  for (const p of paths) revalidatePath(p);

  return NextResponse.json({ ok: true, revalidated: paths.length ? paths : ["/ (layout)"] });
}
