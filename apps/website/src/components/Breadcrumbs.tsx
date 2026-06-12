import { Fragment } from "react";
import Link from "next/link";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export type Crumb = { name: string; href: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.href === "/" ? "" : it.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted"
      >
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={it.href}>
              {last ? (
                <span className="truncate text-primary" aria-current="page">
                  {it.name}
                </span>
              ) : (
                <>
                  <Link href={it.href} className="transition-colors hover:text-ink">
                    {it.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </Fragment>
          );
        })}
      </nav>
    </>
  );
}
