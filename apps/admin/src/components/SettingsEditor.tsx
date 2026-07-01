"use client";

import { useState } from "react";
import { saveSettings } from "@/app/actions";
import type { SiteSettings } from "@jhb/shared/content";

export default function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState<SiteSettings>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const set = (k: keyof SiteSettings) => (v: string) => setS((p) => ({ ...p, [k]: v }));
  const str = (k: keyof SiteSettings) => (s[k] ?? "") as string;

  const save = async () => {
    setState("saving");
    const res = await saveSettings(s as unknown as Record<string, unknown>);
    setState(res.ok ? "saved" : "error");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Company</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Company name" value={s.companyName} onChange={set("companyName")} />
          <Field label="Tagline" value={s.tagline} onChange={set("tagline")} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Contact</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Phone" value={s.phone} onChange={set("phone")} />
          <Field label="Email" value={s.email} onChange={set("email")} />
          <Field label="Address" value={s.address} onChange={set("address")} />
          <Field label="Office hours" value={s.hours} onChange={set("hours")} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Office Location &amp; Map</h2>
        <p className="mt-1 text-xs text-muted">
          Shown in the home page &ldquo;Visit Us&rdquo; block + Google Map. Leave any
          field blank to keep the built-in default.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Office display name" value={str("officeName")} onChange={set("officeName")} />
          <Field label="Map address (full, single line)" value={str("officeMapQuery")} onChange={set("officeMapQuery")} />
        </div>
        <div className="mt-4">
          <Textarea
            label="Display address (one line per row)"
            value={str("officeAddressLines")}
            onChange={set("officeAddressLines")}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Street (schema)" value={str("addressStreet")} onChange={set("addressStreet")} />
          <Field label="City / locality" value={str("addressLocality")} onChange={set("addressLocality")} />
          <Field label="Region / state" value={str("addressRegion")} onChange={set("addressRegion")} />
          <Field label="Postal code" value={str("addressPostalCode")} onChange={set("addressPostalCode")} />
          <Field label="Country code (e.g. IN)" value={str("addressCountry")} onChange={set("addressCountry")} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Social Links</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Instagram URL" value={s.instagram} onChange={set("instagram")} />
          <Field label="Facebook URL" value={s.facebook} onChange={set("facebook")} />
          <Field label="LinkedIn URL" value={s.linkedin} onChange={set("linkedin")} />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">
          Save Settings
        </button>
        {state === "saving" && <span className="text-xs text-muted">Saving…</span>}
        {state === "saved" && <span className="text-xs text-green-600">✓ Saved</span>}
        {state === "error" && <span className="text-xs text-red-500">Error saving</span>}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
