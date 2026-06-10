import { createClient } from "@jhb/shared/supabase/server";
import UsersTable, { type Profile } from "@/components/UsersTable";

export default async function AdminUsers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profiles }, { data: me }] = await Promise.all([
    supabase
      .from("jhb_profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at"),
    supabase.from("jhb_profiles").select("role").eq("id", user?.id).maybeSingle(),
  ]);

  const isAdmin = me?.role === "admin";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>
      <p className="mt-1 text-sm text-muted">
        Manage team members and their permission roles.
      </p>

      {!isAdmin && (
        <p className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          You can view users, but only admins can change roles.
        </p>
      )}

      <UsersTable
        profiles={(profiles as Profile[]) ?? []}
        canEdit={isAdmin}
        currentUserId={user?.id ?? ""}
      />

      <div className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-surface p-5 text-sm text-muted">
        <p className="font-medium text-ink">Adding new team members</p>
        <p className="mt-1">
          Inviting brand-new users requires Supabase&apos;s service-role key
          (kept server-side only). Share it and I&apos;ll enable an{" "}
          <span className="text-ink">“Invite user”</span> button here. For now,
          roles of existing accounts can be managed above.
        </p>
      </div>
    </div>
  );
}
