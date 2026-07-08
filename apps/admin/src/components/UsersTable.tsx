"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

// Assignable roles (value = DB role, label = display name).
const ROLES: { value: string; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];
const labelFor = (role: string) => ROLES.find((r) => r.value === role)?.label ?? role;

type Toast = { type: "success" | "error"; msg: string } | null;

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
  const [toast, setToast] = useState<Toast>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const change = async (id: string, role: string) => {
    if (savingId) return;
    setSavingId(id);
    try {
      const res = await withTimeout(updateUserRole(id, role));
      if (res.ok) {
        flash({ type: "success", msg: "Role updated." });
        startTransition(() => router.refresh());
      } else {
        flash({ type: "error", msg: res.error || "Could not update role." });
      }
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Could not update role. Please try again.") });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mt-8">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const isSelf = p.id === currentUserId;
              return (
                <tr key={p.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3 font-medium">
                    {p.full_name ?? "—"}
                    {isSelf && (
                      <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted">{p.email}</td>
                  <td className="px-5 py-3">
                    {canEdit && !isSelf ? (
                      <select
                        value={p.role}
                        disabled={savingId === p.id}
                        onChange={(e) => change(p.id, e.target.value)}
                        className="rounded-lg border border-ink/10 bg-base px-3 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg bg-ink/[0.05] px-3 py-1.5"
                        title={isSelf ? "You can't change your own role" : undefined}
                      >
                        {labelFor(p.role)}
                        {isSelf && <span className="text-[10px] text-muted">(locked)</span>}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
