import { createClient } from "./supabase/server";
import type { ServiceSections } from "./servicePage";

export async function getServiceSectionsRaw(
  serviceKey: string,
  state: "draft" | "published"
): Promise<Partial<ServiceSections> | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_pages")
      .select("data")
      .eq("service_key", serviceKey)
      .eq("state", state)
      .maybeSingle();
    return (data?.data as Partial<ServiceSections>) ?? null;
  } catch {
    return null;
  }
}
