"use client";

import { useState } from "react";
import { savePartners } from "@/app/actions";
import { PARTNERS_DEFAULT, type PartnersDoc, type Partner } from "@jhb/shared/partners";
import ImagePicker from "./ImagePicker";

export default function PartnersManager({ initial }: { initial: PartnersDoc }) {
  const [doc, setDoc] = useState<PartnersDoc>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const setEnabled = (enabled: boolean) => setDoc((d) => ({ ...d, enabled }));
  const setHeading = (heading: string) => setDoc((d) => ({ ...d, heading }));
  const setItem = (i: number, patch: Partial<Partner>) =>
    setDoc((d) => ({ ...d, items: d.items.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));
  const addItem = () =>
    setDoc((d) => ({ ...d, items: [...d.items, { name: "", color: "#4285F4" }] }));
  const removeItem = (i: number) =>
    setDoc((d) => ({ ...d, items: d.items.filter((_, idx) => idx !== i) }));
  const move = (i: number, dir: -1 | 1) =>
    setDoc((d) => {
      const items = [...d.items];
      const j = i + dir;
      if (j < 0 || j >= items.length) return d;
      [items[i], items[j]] = [items[j], items[i]];
      return { ...d, items };
    });

  const save = async () => {
    setState("saving");
    setError("");
    const res = await savePartners(doc as unknown as Record<string, unknown>);
    if (res.ok) {
      setState("saved");
    } else {
      setState("error");
      setError(res.error || "Error saving");
    }
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Enable / disable the whole section */}
      <Toggle
        label="Show the Partners strip on the website"
        checked={doc.enabled}
        onChange={setEnabled}
      />

      {/* Heading */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">Section heading</span>
        <input
          value={doc.heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      {/* Partners list */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Partners ({doc.items.length})
          </p>
          <button
            onClick={addItem}
            className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:bg-ink/[0.04]"
          >
            + Add partner
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Upload a logo, or leave it empty to show a coloured letter badge. Drag the
          arrows to set the display order on the site.
        </p>

        <div className="mt-4 space-y-3">
          {doc.items.map((p, i) => (
            <div key={i} className="rounded-xl border border-ink/10 bg-base p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* preview */}
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="h-9 w-9 shrink-0 rounded-lg border border-ink/10 object-contain bg-white"
                  />
                ) : (
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-base font-bold text-white"
                    style={{ backgroundColor: p.color || "#4285F4" }}
                  >
                    {(p.name || "?")[0]}
                  </span>
                )}
                <input
                  placeholder="Name (e.g. Shopify)"
                  value={p.name}
                  onChange={(e) => setItem(i, { name: e.target.value })}
                  className="min-w-[10rem] flex-1 rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="color"
                  value={p.color || "#4285F4"}
                  onChange={(e) => setItem(i, { color: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-ink/10 bg-surface"
                  aria-label="Badge colour (used when no logo)"
                  title="Badge colour (used when no logo)"
                />
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === doc.items.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
                  <button onClick={() => removeItem(i)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Remove</button>
                </div>
              </div>
              {/* logo upload */}
              <div className="mt-3">
                <ImagePicker
                  label="Logo (optional)"
                  value={p.logo ?? null}
                  onChange={(url) => setItem(i, { logo: url || undefined })}
                  alt={false}
                />
              </div>
            </div>
          ))}
          {doc.items.length === 0 && (
            <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-muted">
              No partners yet. The site falls back to the built-in list until you add some.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">
          Save Partners
        </button>
        <button
          onClick={() => setDoc(PARTNERS_DEFAULT)}
          className="rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-medium hover:bg-ink/[0.04]"
        >
          Reset to defaults
        </button>
        {state === "saving" && <span className="text-xs text-muted">Saving…</span>}
        {state === "saved" && <span className="text-xs text-green-600">✓ Saved</span>}
        {state === "error" && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-primary" : "bg-ink/20"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
      <span className="text-muted">{label}</span>
    </label>
  );
}
