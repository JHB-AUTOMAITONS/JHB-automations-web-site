"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches errors thrown by the root layout itself (which
 * `error.tsx` cannot, since it lives inside that layout). It must render its own
 * <html>/<body>. Plain inline styles only — the app stylesheet may not be
 * available at this level.
 */
export default function AdminGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[admin] global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, sans-serif", background: "#f6f7fb" }}>
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div
            style={{
              maxWidth: 460,
              width: "100%",
              textAlign: "center",
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 10px 40px -12px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 32 }}>⚠️</div>
            <h1 style={{ margin: "12px 0 4px", fontSize: 22 }}>The admin app crashed</h1>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "#555" }}>
              An unexpected error stopped the page from rendering. Reloading usually fixes it.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
