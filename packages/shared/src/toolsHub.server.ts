import { createClient } from "./supabase/server";
import { TOOLS_HUB_DEFAULT, type ToolsHub } from "./toolsHub";

// Read the editable hub document (jhb_content "tools_hub"); fall back to the
// seeded defaults until an admin saves. The admin always persists the full
// document, so a shallow merge over the defaults is sufficient.
export async function getToolsHub(): Promise<ToolsHub> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_content")
      .select("data")
      .eq("key", "tools_hub")
      .maybeSingle();
    const saved = (data?.data as Partial<ToolsHub>) ?? null;
    return saved ? { ...TOOLS_HUB_DEFAULT, ...saved } : TOOLS_HUB_DEFAULT;
  } catch {
    return TOOLS_HUB_DEFAULT;
  }
}
