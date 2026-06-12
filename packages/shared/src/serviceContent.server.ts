import { createClient } from "./supabase/server";
import type { ServiceContent, ServiceContentVersion } from "./serviceContent";

export async function getPublishedServiceContent(
  key: string
): Promise<ServiceContent | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_content")
      .select("pub_title, pub_html")
      .eq("service_key", key)
      .maybeSingle();
    if (!data || !data.pub_html) return null;
    return { title: data.pub_title ?? "", html: data.pub_html };
  } catch {
    return null;
  }
}

export async function getDraftServiceContent(
  key: string
): Promise<ServiceContent> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_content")
      .select("draft_title, draft_html, pub_title, pub_html")
      .eq("service_key", key)
      .maybeSingle();
    if (!data) return { title: "", html: "" };
    // Prefer the draft; fall back to published so editing starts from live content
    return {
      title: data.draft_title || data.pub_title || "",
      html: data.draft_html || data.pub_html || "",
    };
  } catch {
    return { title: "", html: "" };
  }
}

export async function getServiceContentVersions(
  key: string
): Promise<ServiceContentVersion[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_content_versions")
      .select("id, title, content_html, created_at")
      .eq("service_key", key)
      .order("created_at", { ascending: false })
      .limit(10);
    return (data as ServiceContentVersion[]) ?? [];
  } catch {
    return [];
  }
}
