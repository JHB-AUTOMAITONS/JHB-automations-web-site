"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SETTINGS_DEFAULT, type SiteSettings } from "@jhb/shared/content";
import { createClient } from "@jhb/shared/supabase/client";

type Fields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  details: string;
};

const empty: Fields = { name: "", company: "", email: "", phone: "", details: "" };

export default function Contact({
  settings = SETTINGS_DEFAULT,
}: {
  settings?: SiteSettings;
}) {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {}
  );
  const [sent, setSent] = useState(false);

  const update =
    (key: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      setErrors((er) => ({ ...er, [key]: undefined }));
    };

  const validate = () => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) e.name = "Please enter your name";
    if (!fields.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      e.email = "Enter a valid email";
    if (!fields.details.trim()) e.details = "Tell us a little about your project";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSent(true);
    const payload = {
      name: fields.name,
      company: fields.company || null,
      email: fields.email,
      phone: fields.phone || null,
      message: fields.details,
      source: "contact",
    };
    setFields(empty);
    setTimeout(() => setSent(false), 6000);
    // Persist the lead directly from the browser (static site, no server).
    // Requires an RLS INSERT policy on jhb_leads for the anon role.
    try {
      const supabase = createClient();
      await supabase.from("jhb_leads").insert(payload);
    } catch {
      // Swallow — the visitor already saw the success state; we don't block on it.
    }
  };

  return (
    <section id="contact" className="relative py-16 sm:py-24">
      <div className="container-x">
        <div className="glass-strong glow-border relative overflow-hidden rounded-3xl">
          <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
            {/* left */}
            <div>
              <span className="eyebrow">Let&apos;s Talk</span>
              <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
                Get in <span className="grad-text">Touch</span>
              </h2>
              <p className="mt-4 text-muted">
                Tell us about your goals and we&apos;ll map the fastest path to
                automated, predictable growth — no obligation.
              </p>

              <ul className="mt-8 space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/[0.04] ring-1 ring-ink/10">
                    📞
                  </span>
                  <div>
                    <p className="text-muted">Call us</p>
                    <p className="font-medium">{settings.phone}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/[0.04] ring-1 ring-ink/10">
                    ✉️
                  </span>
                  <div>
                    <p className="text-muted">Email us</p>
                    <p className="font-medium">{settings.email}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/[0.04] ring-1 ring-ink/10">
                    📍
                  </span>
                  <div>
                    <p className="text-muted">Visit us</p>
                    <p className="font-medium">{settings.address}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* form */}
            <div className="relative">
              <AnimatePresence>
                {sent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-surface/90 backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-3xl shadow-glow"
                      >
                        ✓
                      </motion.div>
                      <h3 className="mt-4 font-display text-xl font-bold">
                        Message Sent!
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        Our team will reach out within 24 hours.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="name"
                    label="Full Name"
                    value={fields.name}
                    onChange={update("name")}
                    error={errors.name}
                  />
                  <Field
                    id="company"
                    label="Company Name"
                    value={fields.company}
                    onChange={update("company")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="email"
                    label="Email Address"
                    type="email"
                    value={fields.email}
                    onChange={update("email")}
                    error={errors.email}
                  />
                  <Field
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    value={fields.phone}
                    onChange={update("phone")}
                  />
                </div>
                <Field
                  id="details"
                  label="Project Details"
                  textarea
                  value={fields.details}
                  onChange={update("details")}
                  error={errors.details}
                />

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button type="submit" className="btn btn-primary flex-1">
                    Send Message →
                  </button>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="btn btn-ghost flex-1"
                  >
                    Contact Team
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  textarea = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  type?: string;
  textarea?: boolean;
}) {
  const base =
    "peer w-full rounded-xl border bg-ink/[0.03] px-4 pb-2 pt-5 text-sm text-ink outline-none transition-colors placeholder-transparent focus:border-primary";
  const borderClass = error ? "border-red-400/60" : "border-ink/10";

  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={id}
          rows={4}
          placeholder={label}
          value={value}
          onChange={onChange}
          className={`${base} ${borderClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={label}
          value={value}
          onChange={onChange}
          className={`${base} ${borderClass}`}
        />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-xs text-muted transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted/70 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary"
      >
        {label}
      </label>
      {error && <p className="mt-1 pl-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
