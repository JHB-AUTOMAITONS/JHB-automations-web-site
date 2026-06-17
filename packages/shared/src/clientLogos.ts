// "Our Valuable Clients" marquee logo types — client-safe.
// Only the logo image data is editable; client names + section design are fixed.

// Logo-only — client names are never sent to the frontend (kept internal in DB).
export type ClientLogo = {
  id: string;
  logo_url: string | null;
  alt_text: string | null;
  image_title?: string | null;
  sort_order: number;
  active: boolean;
  updated_at?: string | null;
};
