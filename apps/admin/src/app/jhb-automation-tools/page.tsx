import { createClient } from "@jhb/shared/supabase/server";
import { getToolsHub } from "@jhb/shared/tools-hub-server";
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
        <h1 className="font-display text-2xl font-bold sm:text-3xl">JHB Automation Tools</h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">This module can only be accessed by a Super Admin (admin role).</p>
        </div>
      </div>
    );
  }

  const [hub, internalPages] = await Promise.all([getToolsHub(), getInternalPages()]);
  return <ToolsHubManager initial={hub} internalPages={internalPages} />;
}
