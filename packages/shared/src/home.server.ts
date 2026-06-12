import { createClient } from "./supabase/server";
import { mergeHome, type HomeContent } from "./home";

async function fetchHome(key: "draft" | "published"): Promise<Partial<HomeContent> | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_home")
      .select("data")
      .eq("key", key)
      .maybeSingle();
    return (data?.data as Partial<HomeContent>) ?? null;
  } catch {
    return null;
  }
}

export async function getPublishedHome(): Promise<HomeContent> {
  return mergeHome(await fetchHome("published"));
}

export async function getDraftHome(): Promise<HomeContent> {
  return mergeHome(await fetchHome("draft"));
}
