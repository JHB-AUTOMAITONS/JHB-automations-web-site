/**
 * Instant navigation feedback. Next.js streams this skeleton the moment a
 * sidebar link is clicked — before the destination page's server data (or, in
 * dev, its compilation) finishes — so transitions feel immediate instead of
 * freezing on the previous page. The persistent sidebar/layout stays mounted;
 * only this content area is replaced.
 */
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Title */}
      <div className="h-8 w-56 rounded-lg bg-ink/[0.06]" />
      <div className="mt-2 h-4 w-80 rounded bg-ink/[0.05]" />

      {/* Stat / summary row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <div className="h-11 w-11 rounded-xl bg-ink/[0.06]" />
            <div className="mt-4 h-7 w-20 rounded bg-ink/[0.08]" />
            <div className="mt-2 h-3 w-24 rounded bg-ink/[0.05]" />
          </div>
        ))}
      </div>

      {/* Content panels */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <div className="h-5 w-40 rounded bg-ink/[0.07]" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 w-full rounded bg-ink/[0.04]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
