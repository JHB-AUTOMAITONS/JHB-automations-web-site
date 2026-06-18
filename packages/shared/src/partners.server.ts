import { createClient } from "./supabase/server";
import { PARTNERS_DEFAULT, withPartnerDefaults, type PartnersDoc } from "./partners";

// Read the editable partners document (jhb_content "partners"); fall back to the
// built-in default until an admin saves.
export async function getPartners(): Promise<PartnersDoc> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_content")
      .select("data")
      .eq("key", "partners")
      .maybeSingle();
    const saved = (data?.data as Partial<PartnersDoc> | null) ?? null;
    if (!saved) return PARTNERS_DEFAULT;
    return withPartnerDefaults(saved);
  } catch {
    return PARTNERS_DEFAULT;
  }
}
