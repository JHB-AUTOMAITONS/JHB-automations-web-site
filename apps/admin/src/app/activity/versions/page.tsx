import { createClient } from "@jhb/shared/supabase/server";
import VersionHistory, { type VersionRow } from "@/components/VersionHistory";

export const dynamic = "force-dynamic";

export default async function VersionHistoryPage() {
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
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Version History</h1>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Super Admin only</p>
          <p className="mt-1">Restoring previous versions is restricted to Super Admins.</p>
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from("jhb_versions")
    .select("id, module, label, version_number, summary, user_email, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return <VersionHistory versions={(data ?? []) as VersionRow[]} />;
}
