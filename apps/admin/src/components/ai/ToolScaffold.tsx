import Link from "next/link";

// Honest placeholder for AI tools planned for a later phase. States exactly what
// the tool will do and what it depends on, with pointers to the tools that
// already cover part of the job — so the menu is complete and never misleading.
export default function ToolScaffold({
  title,
  summary,
  willDo,
  dependsOn,
  related,
}: {
  title: string;
  summary: string;
  willDo: string[];
  dependsOn?: string;
  related?: { href: string; label: string }[];
}) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">{summary}</p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        🚧 Planned — next phase
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">What it will do</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {willDo.map((w) => (
              <li key={w} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">›</span>
                {w}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
          {dependsOn && (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Depends on</h2>
              <p className="mt-3 text-sm text-muted">{dependsOn}</p>
            </>
          )}
          {related && related.length > 0 && (
            <>
              <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Available now</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {related.map((r) => (
                  <Link key={r.href} href={r.href} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary">
                    {r.label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
