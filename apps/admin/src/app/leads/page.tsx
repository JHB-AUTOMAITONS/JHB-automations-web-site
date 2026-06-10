import { createClient } from "@jhb/shared/supabase/server";
import LeadsTable, { type Lead } from "@/components/LeadsTable";

export default async function AdminLeads() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jhb_leads")
    .select("id, name, company, email, phone, message, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Leads</h1>
      <p className="mt-1 text-sm text-muted">
        Inquiries submitted through the contact form.
      </p>
      <LeadsTable leads={(data as Lead[]) ?? []} />
    </div>
  );
}
