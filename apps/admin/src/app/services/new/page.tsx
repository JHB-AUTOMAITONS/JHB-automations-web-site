import Link from "next/link";

export default function AddNewService() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Add New Service</h1>
      <p className="mt-1 text-sm text-muted">Create a brand-new service page.</p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-dashed border-ink/15 bg-surface p-8 shadow-soft">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-xl text-primary">
          ＋
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold">
          Coming in the next phase
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your current <b>12 services</b> are fully editable today — open{" "}
          <Link href="/services" className="text-primary underline">All Services</Link>{" "}
          and use the page builder (sections, content, slug, SEO, FAQs).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Creating an entirely new service from scratch requires moving each
          service&apos;s base definition (name, icon, category) fully into the
          database. That migration is the next step — once done, this screen will
          let you spin up a new service page, pick an icon, set the slug and start
          editing immediately.
        </p>
        <Link href="/services" className="btn btn-primary mt-6 !px-5 !py-2.5 !text-sm">
          Go to All Services
        </Link>
      </div>
    </div>
  );
}
