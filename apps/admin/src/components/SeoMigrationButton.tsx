"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runSeoMigration } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";

// "Run Migration" control for Admin → SEO. Repairs the jhb_seo table (adds any
// missing columns) and reloads the PostgREST schema cache by calling the
// jhb_seo_run_migration() DB function. Shown prominently when the page reports a
// load error; otherwise available as a quiet "Repair schema" affordance.
export default function SeoMigrationButton({ hasError = false }: { hasError?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err" | "sql"; text: string } | null>(null);

  const run = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await withTimeout(runSeoMigration());
      if (res.ok) {
        const n = res.columns?.length ?? 0;
        setMsg({ kind: "ok", text: `Migration applied ✓ (${n} columns). Reloading…` });
        // Re-fetch the server component so the form loads with the fixed schema.
        setTimeout(() => router.refresh(), 800);
      } else if ("needsSql" in res && res.needsSql) {
        setMsg({ kind: "sql", text: res.error });
      } else {
        setMsg({ kind: "err", text: res.error || "Migration failed." });
      }
    } catch (e) {
      setMsg({ kind: "err", text: actionErrorMessage(e, "Migration failed. Please try again.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        disabled={busy}
        className={
          hasError
            ? "btn btn-primary !px-4 !py-2 !text-sm disabled:opacity-60"
            : "rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60"
        }
      >
        {busy ? "Running migration…" : hasError ? "Run Migration" : "Repair SEO schema"}
      </button>
      {msg && (
        <p
          className={`text-xs ${
            msg.kind === "ok"
              ? "text-green-600"
              : msg.kind === "sql"
                ? "text-amber-700"
                : "text-red-600"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
