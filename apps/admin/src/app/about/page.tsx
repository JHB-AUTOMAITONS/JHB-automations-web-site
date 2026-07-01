import { createClient } from "@jhb/shared/supabase/server";
import { withAboutDefaults, ABOUT_DEFAULT } from "@jhb/shared/about";
import { getLegalDraft } from "@jhb/shared/content-server";
import AboutManager from "@/components/AboutManager";
import LegalPagesEditor from "@/components/LegalPagesEditor";

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

  // Load draft first; fall back to published, then built-in defaults.
  const [draftRow, publishedRow] = await Promise.all([
    supabase.from("jhb_content").select("data").eq("key", "about_draft").maybeSingle(),
    supabase.from("jhb_content").select("data").eq("key", "about").maybeSingle(),
  ]);

  const draftData = draftRow.data?.data as Record<string, unknown> | null | undefined;
  const publishedData = publishedRow.data?.data as Record<string, unknown> | null | undefined;

  const hasDraft = !!draftData;
  const about = hasDraft
    ? withAboutDefaults(draftData)
    : publishedData
    ? withAboutDefaults(publishedData)
    : ABOUT_DEFAULT;

  const initialStatus: "draft" | "published" = hasDraft ? "draft" : "published";
  const legal = await getLegalDraft();

  return (
    <>
      <AboutManager initial={about} initialStatus={initialStatus} />
      <LegalPagesEditor initial={legal} />
    </>
  );
}
