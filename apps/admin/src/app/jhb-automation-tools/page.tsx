import { createClient } from "@jhb/shared/supabase/server";
import { getToolsHub } from "@jhb/shared/tools-hub-server";
import { getProducts } from "@jhb/shared/products-server";
import { getInternalPages } from "@jhb/shared/service-pages-server";
import ToolsHubManager from "@/components/ToolsHubManager";

export default async function AdminToolsHub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("jhb_profiles")
    .select("role")
    .eq("id", user?.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">JHB HR Management System</h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">This module can only be accessed by a Super Admin (admin role).</p>
        </div>
      </div>
    );
  }

  const [hub, internalPages, productsResult, draftRow] = await Promise.all([
    getToolsHub(),
    getInternalPages(),
    getProducts(),
    supabase.from("jhb_content").select("data").eq("key", "products_draft").maybeSingle(),
  ]);

  // Same draft-over-published precedence as the /products/[slug] editor, so
  // this page reflects the latest saved slug even before it's published.
  const hasDraft = !!draftRow.data?.data;
  const productItems = hasDraft
    ? ((draftRow.data!.data as { items?: unknown[] }).items ?? productsResult.items)
    : productsResult.items;
  const hrProduct = (productItems as { id: string; href?: string }[]).find(
    (p) => p.id === "jhb-automation-tools"
  );
  const hrSlug = (hrProduct?.href || "/jhb-automation-tools").trim().replace(/^\//, "") || "jhb-automation-tools";

  return <ToolsHubManager initial={hub} internalPages={internalPages} initialSlug={hrSlug} />;
}
