export default function Loading() {
  return (
    <div>
      <div className="h-8 w-56 animate-pulse rounded bg-ink/10" />
      <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-ink/10" />
      <div className="mt-8 space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <div className="h-6 w-40 animate-pulse rounded bg-ink/10" />
            <div className="mt-5 space-y-4">
              <div className="h-10 w-full animate-pulse rounded bg-ink/10" />
              <div className="h-16 w-full animate-pulse rounded bg-ink/10" />
              <div className="h-10 w-full animate-pulse rounded bg-ink/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
