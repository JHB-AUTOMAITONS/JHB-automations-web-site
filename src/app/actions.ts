"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitLead(input: {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  message: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("jhb_leads").insert({
      name: input.name,
      company: input.company || null,
      email: input.email,
      phone: input.phone || null,
      message: input.message,
      source: "contact",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
