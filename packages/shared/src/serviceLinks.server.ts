import { createClient } from "./supabase/server";
import type { ServiceLinkRow } from "./serviceLinks";

const COLS =
  "id, service_key, anchor_text, url, type, new_tab, link_type, sponsored, ugc, sort_order";

export async function getServiceAnchorLinks(
  key: string
): Promise<ServiceLinkRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_links")
      .select(COLS)
      .eq("service_key", key)
      .order("sort_order", { ascending: true });
    return (data as ServiceLinkRow[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllServiceAnchorLinks(): Promise<ServiceLinkRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_links")
      .select(COLS)
      .order("service_key", { ascending: true })
      .order("sort_order", { ascending: true });
    return (data as ServiceLinkRow[]) ?? [];
  } catch {
    return [];
  }
}
