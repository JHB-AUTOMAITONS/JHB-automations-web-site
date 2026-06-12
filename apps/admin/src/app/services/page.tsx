import Link from "next/link";
import { getServices } from "@jhb/shared/services-server";

export default async function AdminServices() {
  const services = await getServices();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Services</h1>
      <p className="mt-1 text-sm text-muted">
        Edit each service — URL, SEO and the rich-text Service Content section.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link
            key={s.key}
            href={`/services/${s.key}`}
            className="group rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{s.title}</h2>
              <span className="text-muted transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted">
              /services/{s.slug}
            </p>
            <p className="mt-3 line-clamp-2 text-sm text-muted">{s.short}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
