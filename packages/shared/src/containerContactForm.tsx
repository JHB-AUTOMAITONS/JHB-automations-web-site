"use client";

import { useState } from "react";
import { createClient } from "./supabase/client";

// Self-contained lead form used by the "Contact Form" container. Submits the
// same way as the site's main Contact section — a client-side insert into
// jhb_leads — so it works on any page without extra server wiring. Lives in the
// shared package so the website AND the admin preview render the identical form.
export default function ContainerContactForm({ buttonLabel }: { buttonLabel: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.from("jhb_leads").insert({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        source: "contact",
      });
    } catch {
      /* swallow — show success regardless, matching the main contact form */
    }
    setBusy(false);
    setSent(true);
  };

  if (sent) {
    return (
      <p className="mx-auto max-w-xl rounded-2xl border border-green-200 bg-green-50 p-6 text-center text-sm text-green-700">
        Thanks — we&rsquo;ll be in touch shortly.
      </p>
    );
  }

  const field = "w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-primary";
  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-3 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className={field} />
        <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className={field} />
      </div>
      <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone (optional)" className={field} />
      <textarea required rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="How can we help?" className={`${field} resize-none`} />
      <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
        {busy ? "Sending…" : buttonLabel || "Send message"}
      </button>
    </form>
  );
}
