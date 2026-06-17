import { createClient } from "./supabase/server";
import type { HomeFaq } from "./homeFaqs";

const COLS = "id, question, answer, sort_order, active";

// Public: active FAQs in display order.
export async function getActiveHomeFaqs(): Promise<HomeFaq[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_home_faqs")
      .select(COLS)
      .eq("active", true)
      .order("sort_order", { ascending: true });
    return (data as HomeFaq[]) ?? [];
  } catch {
    return [];
  }
}

// Admin: every FAQ (active + inactive).
export async function getAllHomeFaqs(): Promise<HomeFaq[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_home_faqs")
      .select(COLS)
      .order("sort_order", { ascending: true });
    return (data as HomeFaq[]) ?? [];
  } catch {
    return [];
  }
}
