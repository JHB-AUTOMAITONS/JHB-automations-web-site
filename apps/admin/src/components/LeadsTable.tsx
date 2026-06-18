"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus, deleteLead } from "@/app/actions";
import LocalDateTime from "./LocalDateTime";

export type Lead = {
  id: number;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  contacted: "bg-amber-500/10 text-amber-600",
  closed: "bg-green-500/10 text-green-600",
};

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const setStatus = async (id: number, status: string) => {
    await updateLeadStatus(id, status);
    startTransition(() => router.refresh());
  };
  const remove = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    await deleteLead(id);
    startTransition(() => router.refresh());
  };

  if (leads.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-ink/10 bg-surface p-10 text-center text-sm text-muted">
        No leads yet. Submissions from the contact form will appear here.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {leads.map((l) => (
        <div
          key={l.id}
          className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display font-semibold">
                {l.name}{" "}
                {l.company && (
                  <span className="text-sm font-normal text-muted">
                    · {l.company}
                  </span>
                )}
              </p>
              <p className="text-sm text-muted">
                <a href={`mailto:${l.email}`} className="hover:text-primary">
                  {l.email}
                </a>
                {l.phone && <> · {l.phone}</>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                  statusColors[l.status] ?? ""
                }`}
              >
                {l.status}
              </span>
              <span className="text-xs text-muted">
                <LocalDateTime value={l.created_at} />
              </span>
            </div>
          </div>
          <p className="mt-3 rounded-xl bg-base p-3 text-sm text-ink/80">
            {l.message}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {["new", "contacted", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(l.id, s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  l.status === s
                    ? "border-primary text-primary"
                    : "border-ink/10 text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => remove(l.id)}
              className="ml-auto rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
