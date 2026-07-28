import { createClient } from "./supabase/server";
import type { ClientLogo } from "./clientLogos";

// Names are intentionally NOT selected — the section is logo-only.
const COLS = "id, logo_url, alt_text, sort_order, active, updated_at";

// Public: active client logos in display order.
export async function getActiveClientLogos(): Promise<ClientLogo[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_client_logos")
      .select(COLS)
      .eq("active", true)
      .order("sort_order", { ascending: true });
    return (data as ClientLogo[]) ?? [];
  } catch {
    return [];
  }
}

// Admin: all client logos (active + inactive) in display order.
export async function getAllClientLogos(): Promise<ClientLogo[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_client_logos")
      .select(COLS)
      .order("sort_order", { ascending: true });
    return (data as ClientLogo[]) ?? [];
  } catch {
    return [];
  }
}

export type ClientLogoNameEntry = { name: string; alt_text: string | null; logo_url: string };

// Server-only: the internal `name` column (never part of the public
// ClientLogo type/marquee — see COLS above) is read here ONLY so a
// testimonial's `company` can be matched to its uploaded logo. Callers must
// resolve the match server-side and pass down just the resulting logo_url —
// never this raw name/alt_text list — so no client name reaches the browser
// bundle. `alt_text` is included as a second matching signal: `name` is set
// once from the upload filename and is never shown/editable in the admin UI
// again, so if it doesn't match a testimonial's company, alt_text — which IS
// editable on the Client Logos page — gives an admin a way to fix the match
// without needing another code change.
export async function getClientLogoNameMap(): Promise<ClientLogoNameEntry[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_client_logos")
      .select("name, alt_text, logo_url")
      .eq("active", true);
    return (
      (data as { name: string | null; alt_text: string | null; logo_url: string | null }[]) ?? []
    ).filter((r): r is ClientLogoNameEntry => !!r.name && !!r.logo_url);
  } catch {
    return [];
  }
}
