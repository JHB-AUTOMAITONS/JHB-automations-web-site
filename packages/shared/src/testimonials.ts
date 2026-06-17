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
