import { createClient } from "@jhb/shared/supabase/server";
import { getProducts } from "@jhb/shared/products-server";
import { getInternalPages } from "@jhb/shared/service-pages-server";
import ProductsManager from "@/components/ProductsManager";

export default async function AdminAboutVasool() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("jhb_profiles").select("role").eq("id", user?.id).maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">About Vasool</h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">This module can only be accessed by a Super Admin (admin role).</p>
        </div>
      </div>
    );
  }

  const [{ items }, internalPages] = await Promise.all([getProducts(), getInternalPages()]);
  return <ProductsManager initial={items} internalPages={internalPages} focusSlug="vasool-app" section="about" />;
}
