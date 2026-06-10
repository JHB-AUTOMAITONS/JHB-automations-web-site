import { createClient } from "@jhb/shared/supabase/server";

export default async function AdminAnalytics() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: views }, { count: leadCount }, { count: totalViews }] =
    await Promise.all([
      supabase
        .from("jhb_pageviews")
        .select("path, created_at")
        .gte("created_at", since)
        .limit(5000),
      supabase.from("jhb_leads").select("*", { count: "exact", head: true }),
      supabase.from("jhb_pageviews").select("*", { count: "exact", head: true }),
    ]);

  const rows = views ?? [];

  // Per-day buckets (last 14 days)
  const days: { label: string; key: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      count: 0,
    });
  }
  const dayMap = new Map(days.map((d) => [d.key, d]));
  const pathCounts = new Map<string, number>();
  for (const r of rows) {
    const key = (r.created_at as string).slice(0, 10);
    const day = dayMap.get(key);
    if (day) day.count += 1;
    pathCounts.set(r.path as string, (pathCounts.get(r.path as string) ?? 0) + 1);
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const views14 = rows.length;
  const conversion =
    views14 > 0 ? ((leadCount ?? 0) / views14) * 100 : 0;

  const cards = [
    { label: "Total Page Views", value: (totalViews ?? 0).toLocaleString() },
    { label: "Views (14 days)", value: views14.toLocaleString() },
    { label: "Total Leads", value: (leadCount ?? 0).toLocaleString() },
    { label: "Conversion Rate", value: `${conversion.toFixed(1)}%` },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Analytics</h1>
      <p className="mt-1 text-sm text-muted">
        Website traffic and lead performance (last 14 days).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft"
          >
            <p className="font-display text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Traffic chart */}
        <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Daily Traffic</h2>
          <div className="mt-6 flex h-44 items-end justify-between gap-1.5">
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary/40 to-primary"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: 2 }}
                  title={`${d.count} views`}
                />
                <span className="text-[9px] text-muted">{d.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top pages */}
        <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Top Pages</h2>
          <ul className="mt-4 space-y-3">
            {topPaths.length === 0 && (
              <li className="text-sm text-muted">No data yet.</li>
            )}
            {topPaths.map(([path, count]) => (
              <li key={path} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-mono text-xs text-ink/80">{path}</span>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
