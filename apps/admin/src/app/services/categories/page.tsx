import Link from "next/link";

export default function ServiceCategories() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Service Categories
      </h1>
      <p className="mt-1 text-sm text-muted">
        Group services into categories for navigation and filtering.
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-dashed border-ink/15 bg-surface p-8 shadow-soft">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-xl text-primary">
          🗂
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold">
          Coming in the next phase
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Categories ship alongside DB-defined services (the same migration as
          “Add New Service”). They&apos;ll let you tag each service and offer
          category filters on the public services page.
        </p>
        <Link href="/services" className="btn btn-primary mt-6 !px-5 !py-2.5 !text-sm">
          Go to All Services
        </Link>
      </div>
    </div>
  );
}
