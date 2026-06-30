// Schema.org JSON-LD builders for the Author & Publisher SEO system. Pure
// helpers (no server/client deps) — safe to import anywhere. Output is plain
// objects; every builder omits empty fields so the JSON-LD stays valid.

import type { AuthorPublisher, SeoAuthor, SeoPublisher } from "./content";

export function authorPersonLD(a: SeoAuthor): Record<string, unknown> | undefined {
  if (!a?.name?.trim()) return undefined;
  const ld: Record<string, unknown> = { "@type": "Person", name: a.name.trim() };
  if (a.jobTitle) ld.jobTitle = a.jobTitle;
  if (a.profileUrl) ld.url = a.profileUrl;
  if (a.image) ld.image = a.image;
  if (a.bio) ld.description = a.bio;
  if (a.email) ld.email = a.email;
  return ld;
}

export function publisherOrgLD(p: SeoPublisher, fallbackName = ""): Record<string, unknown> | undefined {
  const name = (p?.name || fallbackName).trim();
  if (!name) return undefined;
  const ld: Record<string, unknown> = { "@type": p.orgType?.trim() || "Organization", name };
  if (p.website) ld.url = p.website;
  if (p.logo) ld.logo = { "@type": "ImageObject", url: p.logo };
  if (p.description) ld.description = p.description;
  return ld;
}

// The E-E-A-T fields to merge into an Article/BlogPosting/WebPage schema:
// author + creator (Person), publisher + copyrightHolder (Organization), dates
// and mainEntityOfPage. Only includes what's available.
export function eeatSchemaFields(
  ap: AuthorPublisher,
  opts: { url?: string; datePublished?: string; dateModified?: string; siteName?: string } = {}
): Record<string, unknown> {
  const author = authorPersonLD(ap.author);
  const publisher = publisherOrgLD(ap.publisher, opts.siteName);
  const fields: Record<string, unknown> = {};
  if (author) {
    fields.author = author;
    fields.creator = author;
  }
  if (publisher) {
    fields.publisher = publisher;
    fields.copyrightHolder = publisher;
  }
  if (opts.datePublished) fields.datePublished = opts.datePublished;
  if (opts.dateModified) fields.dateModified = opts.dateModified;
  if (opts.url) fields.mainEntityOfPage = { "@type": "WebPage", "@id": opts.url };
  return fields;
}

// A standalone Organization node (used for the sitewide publisher schema).
export function organizationLD(p: SeoPublisher, fallbackName = ""): Record<string, unknown> | undefined {
  const org = publisherOrgLD(p, fallbackName);
  if (!org) return undefined;
  return { "@context": "https://schema.org", ...org };
}
