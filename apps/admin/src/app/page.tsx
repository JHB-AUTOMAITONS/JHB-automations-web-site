import Link from "next/link";
import { createClient } from "@jhb/shared/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: mediaCount },
    { count: leadCount },
    { count: viewCount },
    { data: activity },
  ] = await Promise.all([
    supabase.from("jhb_media").select("*", { count: "exact", head: true }),
    supabase.from("jhb_leads").select("*", { count: "exact", head: true }),
    supabase.from("jhb_pageviews").select("*", { count: "exact", head: true }),
    supabase
      .from("jhb_activity_log")
      .select("action, detail, user_email, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const cards = [
    { label: "Leads", value: leadCount ?? 0, href: "/leads", icon: "✉" },
    { label: "Page Views", value: viewCount ?? 0, href: "/analytics", icon: "📊" },
    { label: "Media Files", value: mediaCount ?? 0, href: "/media", icon: "🖼" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Manage your website content, settings and media.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-lg text-primary">
                {c.icon}
              </span>
              <span className="text-muted transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/home" className="btn btn-primary !px-5 !py-2.5 !text-sm">
              Edit Home Page
            </Link>
            <Link href="/settings" className="btn btn-ghost !px-5 !py-2.5 !text-sm">
              Edit Settings
            </Link>
            <Link href="/media" className="btn btn-ghost !px-5 !py-2.5 !text-sm">
              Upload Media
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
            <Link href="/activity" className="text-xs font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {activity && activity.length > 0 ? (
              activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-ink">{a.detail}</p>
                    <p className="text-xs text-muted">
                      {a.user_email} ·{" "}
                      {new Date(a.created_at as string).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">No activity yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
