"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/app/actions";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

const ROLES = ["admin", "editor", "manager"];

export default function UsersTable({
  profiles,
  canEdit,
  currentUserId,
}: {
  profiles: Profile[];
  canEdit: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const change = async (id: string, role: string) => {
    await updateUserRole(id, role);
    startTransition(() => router.refresh());
  };

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} className="border-b border-ink/5 last:border-0">
              <td className="px-5 py-3 font-medium">
                {p.full_name ?? "—"}
                {p.id === currentUserId && (
                  <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                    You
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-muted">{p.email}</td>
              <td className="px-5 py-3">
                {canEdit ? (
                  <select
                    value={p.role}
                    onChange={(e) => change(p.id, e.target.value)}
                    className="rounded-lg border border-ink/10 bg-base px-3 py-1.5 text-sm outline-none focus:border-primary"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="capitalize">{p.role}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
