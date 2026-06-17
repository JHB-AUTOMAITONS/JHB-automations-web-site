import { createClient } from "@jhb/shared/supabase/server";
import { getSettings } from "@jhb/shared/content-server";
import LogoManager from "@/components/LogoManager";

export const dynamic = "force-dynamic";

export default async function AdminBranding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("jhb_profiles").select("role").eq("id", user?.id).maybeSingle();

  if (profile?.role !== "admin") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Logo Management</h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">Logo Management is restricted to Super Admins.</p>
        </div>
      </div>
    );
  }

  const settings = await getSettings();
  return <LogoManager settings={settings} />;
}
