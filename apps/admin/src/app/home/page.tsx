import { createClient } from "@jhb/shared/supabase/server";
import { getDraftHome, getPublishedHome } from "@jhb/shared/home-server";
import { getServices } from "@jhb/shared/services-server";
import HomeManager from "@/components/HomeManager";

export default async function AdminHome() {
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
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Home Page Content
        </h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">
            The Home Page Content Manager can only be accessed by a Super Admin
            (admin role). Your current role doesn&apos;t have permission.
          </p>
        </div>
      </div>
    );
  }

  const [draft, published, services] = await Promise.all([
    getDraftHome(),
    getPublishedHome(),
    getServices(),
  ]);

  const serviceList = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    short: s.short,
  }));

  return (
    <HomeManager
      draft={draft}
      published={published}
      services={serviceList}
    />
  );
}
