"use client";

import Link from "next/link";

type Toast = { type: "success" | "error"; msg: string } | null;
type Status = "published" | "draft";

const STATUS_CLS: Record<Status, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
};
const STATUS_LBL: Record<Status, string> = {
  published: "🟢 Published",
  draft: "🟡 Draft",
};

export default function EditorHeader({
  title,
  subtitle,
  backHref,
  backLabel = "← Back",
  status,
  busy = "",
  toast,
  onSave,
  onPublish,
  saveLabel = "Save draft",
  publishLabel = "Publish",
  publishDisabled = false,
  showPreview,
  onTogglePreview,
  extra,
}: {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  status?: Status | null;
  busy?: "" | "save" | "publish";
  toast?: Toast;
  onSave?: () => void;
  onPublish?: () => void;
  saveLabel?: string;
  publishLabel?: string;
  // When true, the Publish button is disabled even while idle (e.g. no
  // unpublished changes). Defaults to false so existing callers are unchanged.
  publishDisabled?: boolean;
  showPreview?: boolean;
  onTogglePreview?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <>
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {backHref && (
            <Link href={backHref} className="text-sm text-muted transition-colors hover:text-ink">
              {backLabel}
            </Link>
          )}
          <h1 className={`font-display text-2xl font-bold sm:text-3xl ${backHref ? "mt-1" : ""}`}>
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLS[status]}`}>
              {STATUS_LBL[status]}
            </span>
          )}
          {onTogglePreview !== undefined && (
            <button
              type="button"
              onClick={onTogglePreview}
              className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
          )}
          {extra}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={busy !== ""}
              className="btn btn-ghost !px-5 !py-2.5 !text-sm disabled:opacity-60"
            >
              {busy === "save" ? "Saving…" : saveLabel}
            </button>
          )}
          {onPublish && (
            <button
              type="button"
              onClick={onPublish}
              disabled={busy !== "" || publishDisabled}
              className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
            >
              {busy === "publish" ? "Publishing…" : publishLabel}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
