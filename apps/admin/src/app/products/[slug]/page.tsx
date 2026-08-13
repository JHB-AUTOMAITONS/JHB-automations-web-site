import { notFound } from "next/navigation";
import { createClient } from "@jhb/shared/supabase/server";
import { getProducts } from "@jhb/shared/products-server";
import { getInternalPages } from "@jhb/shared/service-pages-server";
import ProductsManager from "@/components/ProductsManager";

// Generic per-product editor — reachable at /products/{slug} for ANY item in
// the products array, so a new product added to the data (e.g. from a
// migration, or via "Add" in the products list) is immediately editable here
// with no new route file. Mirrors the existing dedicated /vasool-app route
// exactly (kept as-is, untouched, so nothing that already works changes) —
// this is the same editor, reached a second way.
export default async function AdminProductBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("jhb_profiles").select("role").eq("id", user?.id).maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Product</h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">This module can only be accessed by a Super Admin (admin role).</p>
        </div>
      </div>
    );
  }

  const [productsResult, internalPages, draftRow] = await Promise.all([
    getProducts(),
    getInternalPages(),
    supabase.from("jhb_content").select("data").eq("key", "products_draft").maybeSingle(),
  ]);

  const hasDraft = !!draftRow.data?.data;
  const initialStatus: "draft" | "published" = hasDraft ? "draft" : "published";

  const items = hasDraft
    ? ((draftRow.data!.data as { items?: unknown[] }).items ?? productsResult.items)
    : productsResult.items;

  if (!(items as { slug: string }[]).some((p) => p.slug === slug)) notFound();

  return (
    <ProductsManager
      initial={items as typeof productsResult.items}
      internalPages={internalPages}
      focusSlug={slug}
      section="product"
      initialStatus={initialStatus}
    />
  );
}
