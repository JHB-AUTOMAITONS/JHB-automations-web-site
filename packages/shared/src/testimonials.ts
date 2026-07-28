// Testimonials types — client-safe (no server-only imports).

export type TestimonialRow = {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  photo_url: string | null;
  sort_order: number;
  active: boolean;
};

export type TestimonialAccent = "blue" | "cyan" | "purple" | "orange";

// Normalized shape the public TestimonialCard renders. Both the DB rows and
// the hardcoded fallback in data.ts map onto this.
export type TestimonialCard = {
  name: string;
  role: string;
  company: string;
  rating: number;
  quote: string;
  photo?: string | null;
  result?: string;
  tags?: string[];
  // One-line summary of the solution delivered — shown between the
  // designation/company line and the star rating. DB-driven rows don't carry
  // this yet (rowToCard leaves it undefined), only the data.ts fallback set.
  solution?: string;
  // Client company logo — rendered object-contain (never cropped), unlike
  // `photo` (a person's headshot, rendered object-cover). DB-driven rows
  // don't carry this yet, only the data.ts fallback set.
  logo?: string | null;
  accent: TestimonialAccent;
};

export const TESTIMONIAL_ACCENTS: TestimonialAccent[] = [
  "blue",
  "cyan",
  "purple",
  "orange",
];

// Map a DB row to a card; accent rotates by index to keep the colorful grid.
export function rowToCard(r: TestimonialRow, index = 0): TestimonialCard {
  return {
    name: r.name,
    role: r.role,
    company: r.company,
    rating: r.rating,
    quote: r.quote,
    photo: r.photo_url,
    accent: TESTIMONIAL_ACCENTS[index % TESTIMONIAL_ACCENTS.length],
  };
}

const normalizeCompanyName = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

const namesMatch = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
};

// Fuzzy-match a testimonial's company name against the Client Logos upload
// list (see getClientLogoNameMap) so testimonial avatars can reuse the same
// logos already uploaded for the marquee, with no hardcoded URLs needed.
// Matches on a normalized (lowercase, alphanumeric-only) equality or
// containment check — safe here since these are short, distinct business
// names, not generic overlapping words. Tries `name` first (set once from
// the upload filename, never editable again), then falls back to `alt_text`
// (editable on the Client Logos admin page) — so a mismatched auto-derived
// name can always be fixed by editing the logo's alt text to include the
// company name, with no further code changes needed.
export function matchLogoForCompany(
  company: string,
  logos: { name: string; alt_text?: string | null; logo_url: string }[]
): string | undefined {
  const target = normalizeCompanyName(company);
  if (!target) return undefined;
  for (const l of logos) {
    if (namesMatch(normalizeCompanyName(l.name), target)) return l.logo_url;
  }
  for (const l of logos) {
    if (l.alt_text && namesMatch(normalizeCompanyName(l.alt_text), target)) return l.logo_url;
  }
  return undefined;
}
