import { createClient } from "@jhb/shared/supabase/server";
import { getAbout } from "@jhb/shared/about-server";
import AboutManager from "@/components/AboutManager";

export default async function AdminAbout() {
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
        <h1 className="font-display text-2xl font-bold sm:text-3xl">About Page</h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">This module can only be accessed by a Super Admin (admin role).</p>
        </div>
      </div>
    );
  }

  const about = await getAbout();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">About Page</h1>
      <p className="mt-1 text-sm text-muted">
        All copy on the public <code>/about</code> page — hero, mission, vision,
        values and the call-to-action.
      </p>
      <AboutManager initial={about} />
    </div>
  );
}
