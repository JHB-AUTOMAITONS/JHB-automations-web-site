import type { Metadata } from "next";
import Link from "next/link";
import type { LegalDoc } from "@jhb/shared/content";

// Shared metadata builder for the legal pages — pulls every SEO field from the
// CMS doc with sensible fallbacks.
export function buildLegalMeta(doc: LegalDoc, path: string): Metadata {
  const title = doc.seoTitle?.trim() || doc.title;
  const description = doc.metaDescription?.trim() || undefined;
  const canonical = doc.canonical?.trim() || path;
  return {
    title,
    description,
    keywords: doc.metaKeywords ? doc.metaKeywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    alternates: { canonical },
    ...(doc.enabled ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      siteName: "JHB Automations",
      type: "website",
      url: canonical,
      title: doc.ogTitle?.trim() || title,
      description: doc.ogDescription?.trim() || description,
      images: doc.ogImage?.trim() ? [doc.ogImage.trim()] : undefined,
    },
  };
}

// Shared, fully-dynamic render for a legal page. Matches the site's content-page
// typography/spacing and is responsive. No hardcoded body — everything comes
// from the CMS doc.
export default function LegalPageView({ doc }: { doc: LegalDoc }) {
  return (
    <main className="relative pt-24">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <article className="mx-auto w-full max-w-[860px] px-6 pb-20 md:px-10">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          <span>/</span>
          <span className="truncate text-primary">{doc.title}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{doc.title}</h1>
        {doc.lastUpdated && <p className="mt-3 text-sm text-muted">Last updated: {doc.lastUpdated}</p>}

        <div
          className="prose-jhb mt-8 text-base leading-relaxed text-ink/80 [&_a]:text-primary [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:font-semibold [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_p]:mt-3"
          dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
        />
      </article>
    </main>
  );
}
