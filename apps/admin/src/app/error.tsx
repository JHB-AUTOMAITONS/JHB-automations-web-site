"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary for the admin dashboard. Next.js renders this
 * automatically whenever a client/server component in the route subtree throws
 * during render — instead of the bare "Application error: a client-side exception
 * has occurred" white screen. Crucially it keeps the app shell (sidebar, nav)
 * mounted and offers `reset()` to re-render the segment, so a transient render
 * error (e.g. a half-typed edit that briefly produced bad state) recovers without
 * a full reload and without losing the rest of the session.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error for debugging (the overlay hides it in production).
    // eslint-disable-next-line no-console
    console.error("[admin] route error boundary caught:", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-surface p-8 text-center shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-2xl">⚠️</span>
        <h1 className="mt-4 font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          This screen hit an unexpected error. Your other work is safe — try again, and if it keeps
          happening, reload the page.
        </p>
        {error?.message && (
          <p className="mt-3 break-all rounded-lg bg-ink/[0.04] px-3 py-2 text-left font-mono text-[11px] text-muted">
            {error.message}
            {error.digest ? ` (ref: ${error.digest})` : ""}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button onClick={reset} className="btn btn-primary !px-5 !py-2.5 !text-sm">
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-ghost !px-5 !py-2.5 !text-sm"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}
