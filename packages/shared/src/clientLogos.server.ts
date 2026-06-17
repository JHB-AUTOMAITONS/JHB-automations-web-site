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
