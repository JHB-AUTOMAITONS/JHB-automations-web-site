import { createClient } from "./supabase/server";
import { ABOUT_DEFAULT, withAboutDefaults, type AboutDoc } from "./about";

// Read the editable About page document (jhb_content "about"); fall back to the
// built-in default until an admin saves.
export async function getAbout(): Promise<AboutDoc> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_content")
      .select("data")
      .eq("key", "about")
      .maybeSingle();
    const saved = (data?.data as Partial<AboutDoc> | null) ?? null;
    if (!saved) return ABOUT_DEFAULT;
    return withAboutDefaults(saved);
  } catch {
    return ABOUT_DEFAULT;
  }
}
