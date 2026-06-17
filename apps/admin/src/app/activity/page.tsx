import Link from "next/link";
import { createClient } from "@jhb/shared/supabase/server";

export const dynamic = "force-dynamic";

// Friendly category + colour derived from the action key (e.g. "products.update").
function meta(action: string): { type: string; cls: string } {
  if (action.includes("restore")) return { type: "Restore", cls: "bg-violet-100 text-violet-700" };
  if (action.includes("delete")) return { type: "Delete", cls: "bg-red-100 text-red-700" };
  if (action.includes("create") || action.includes("upload") || action.includes("insert"))
    return { type: "Create", cls: "bg-green-100 text-green-700" };
  if (action.includes("status") || action.includes("publish") || action.includes("role"))
    return { type: "Status", cls: "bg-amber-100 text-amber-700" };
  return { type: "Update", cls: "bg-blue-100 text-blue-700" };
}

export default async function ActivityLogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("jhb_profiles")
    .select("role")
    .eq("id", user?.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  // Admins see everything; everyone else sees only their own activity.
  let q = supabase
    .from("jhb_activity_log")
    .select("action, detail, user_email, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (!isAdmin && user?.id) q = q.eq("user_id", user.id);
  const { data: rows } = await q;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Activity Log</h1>
          <p className="mt-1 text-sm text-muted">
            {isAdmin
              ? "Every change made through the Admin Dashboard, newest first."
              : "Your recent changes, newest first."}
          </p>
        </div>
        <Link href="/activity/versions" className="btn btn-ghost !px-5 !py-2.5 !text-sm">
          Version History →
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Change</th>
              <th className="px-4 py-3 font-semibold">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows && rows.length > 0 ? (
              rows.map((r, i) => {
                const m = meta(r.action as string);
                return (
                  <tr key={i} className="align-top hover:bg-ink/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                      {new Date(r.created_at as string).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.cls}`}>{m.type}</span>
                    </td>
                    <td className="px-4 py-3 text-ink">{r.detail}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{r.user_email}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
