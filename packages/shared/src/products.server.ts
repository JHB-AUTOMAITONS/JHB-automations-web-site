import { createClient } from "./supabase/server";
import { PRODUCTS_DEFAULT, withDefaults, type ProductsDoc, type Product } from "./products";

// Read the editable products document (jhb_content "products"); fall back to the
// seeded default until an admin saves. The admin persists the full document.
export async function getProducts(): Promise<ProductsDoc> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_content")
      .select("data")
      .eq("key", "products")
      .maybeSingle();
    const saved = (data?.data as ProductsDoc | null) ?? null;
    if (!saved || !Array.isArray(saved.items)) return PRODUCTS_DEFAULT;
    // Apply per-product defaults so docs saved before newer fields still render.
    return { items: saved.items.map((p) => withDefaults(p)) };
  } catch {
    return PRODUCTS_DEFAULT;
  }
}

// Public: published products in display order.
export async function getPublishedProducts(): Promise<Product[]> {
  const { items } = await getProducts();
  return items
    .filter((p) => p.status === "published")
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { items } = await getProducts();
  return items.find((p) => p.slug === slug) ?? null;
}
