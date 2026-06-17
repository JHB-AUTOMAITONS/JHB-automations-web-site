"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Friendly fallback for any unmatched admin route (replaces the bare Next 404).
 * Logs the bad path to the console for debugging and offers a safe way back.
 */
export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    // Log routing errors for debugging.
    console.warn(`[admin] 404 — no route matched: ${pathname}`);
  }, [pathname]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-surface p-8 text-center shadow-soft">
        <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl">
          🧭
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        {pathname && (
          <p className="mt-2 break-all rounded-lg bg-ink/[0.04] px-3 py-2 font-mono text-xs text-muted">
            {pathname}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className="btn btn-primary !px-5 !py-2.5 !text-sm">
            Back to Dashboard
          </Link>
          <Link
            href="/media"
            className="btn btn-ghost !px-5 !py-2.5 !text-sm"
          >
            Media Library
          </Link>
        </div>
      </div>
    </div>
  );
}
