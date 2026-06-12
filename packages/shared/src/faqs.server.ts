import { createClient } from "./supabase/server";
import type { ServiceFaq } from "./faqs";

export async function getServiceFaqs(serviceKey: string): Promise<ServiceFaq[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_faqs")
      .select("id, service_key, question, answer, sort_order")
      .eq("service_key", serviceKey)
      .order("sort_order", { ascending: true });
    return (data as ServiceFaq[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAllServiceFaqs(): Promise<ServiceFaq[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_service_faqs")
      .select("id, service_key, question, answer, sort_order")
      .order("service_key", { ascending: true })
      .order("sort_order", { ascending: true });
    return (data as ServiceFaq[]) ?? [];
  } catch {
    return [];
  }
}
