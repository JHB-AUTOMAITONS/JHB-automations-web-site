import { createClient } from "./supabase/server";
import type { TestimonialRow } from "./testimonials";

const COLS =
  "id, name, role, company, quote, rating, photo_url, sort_order, active";

// Public site: active testimonials only, in display order.
export async function getActiveTestimonials(): Promise<TestimonialRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_testimonials")
      .select(COLS)
      .eq("active", true)
      .order("sort_order", { ascending: true });
    return (data as TestimonialRow[]) ?? [];
  } catch {
    return [];
  }
}

// Admin dashboard: every testimonial (active + inactive), in display order.
export async function getAllTestimonials(): Promise<TestimonialRow[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_testimonials")
      .select(COLS)
      .order("sort_order", { ascending: true });
    return (data as TestimonialRow[]) ?? [];
  } catch {
    return [];
  }
}
