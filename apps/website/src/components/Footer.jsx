"use client";

import { useState } from "react";
import Link from "next/link";
import { SETTINGS_DEFAULT } from "@jhb/shared/content";
import { createClient } from "@jhb/shared/supabase/client";

export default function Footer({
  settings = SETTINGS_DEFAULT,
  serviceLinks = [],
  legalLinks = [],
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const socials = [
    { label: "in", href: settings.linkedin },
    { label: "f", href: settings.facebook },
    { label: "ig", href: settings.instagram },
  ];

  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Please enter a valid email address.");
      return;
    }
    if (busy) return;
    setErr(null);
    setBusy(true);
    // Persist the signup before confirming — previously it showed "subscribed"
    // and cleared the field WITHOUT storing anything, silently dropping every
    // signup. Stored in jhb_leads with source "newsletter" (all columns nullable
    // except source/status). Requires the anon INSERT RLS policy, like the contact form.
    try {
      const supabase = createClient();
      const { error } = await supabase.from("jhb_leads").insert({ email, source: "newsletter" });
      if (error) throw error;
      setDone(true);
      setEmail("");
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      console.error("Newsletter signup failed:", e);
      setErr("Couldn't subscribe — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="relative border-t border-ink/10 pt-12">
      <div className="container-x">
        <div className="grid gap-8 pb-10 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* brand */}
          <div>
            {/* Single logo image — footer logo → header logo → built-in /logo.png */}
            <Link href="/" aria-label={`${settings.companyName || "JHB Automations"} — go to homepage`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.branding?.footerLogo || settings.branding?.headerLogo || "/logo.png"}
                alt={settings.companyName || "JHB Automations"}
                loading="lazy"
                decoding="async"
                className="h-10 w-auto object-contain transition-opacity hover:opacity-80"
              />
            </Link>
            <p className="mt-4 max-w-xs break-words text-sm text-muted">{settings.tagline}</p>
            <div className="mt-5 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href || "#"}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-ink/10 bg-ink/[0.04] text-xs uppercase text-muted transition-all hover:border-primary hover:text-primary"
                  aria-label={`Social ${s.label}`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* links */}
          <FooterCol
            title={settings.footerServicesTitle || "Services"}
            links={
              serviceLinks.length
                ? serviceLinks.slice(0, 5).map((s) => ({
                    label: s.label,
                    href: s.href,
                  }))
                : [{ label: "All Services", href: "/services" }]
            }
          />
          <FooterCol
            title={settings.footerCompanyTitle || "Company"}
            links={
              settings.footerCompanyLinks?.length
                ? settings.footerCompanyLinks
                : [
                    { label: "About", href: "/about" },
                    { label: "All Services", href: "/services" },
                    { label: "Testimonials", href: "/#testimonials" },
                    { label: "Contact", href: "/contact" },
                  ]
            }
          />

          {/* newsletter */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink/90">
              {settings.footerNewsletterTitle || "Newsletter"}
            </h4>
            <p className="mt-4 break-words text-sm text-muted">
              {settings.footerNewsletterDesc || "Get automation insights and growth tips in your inbox."}
            </p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={settings.footerNewsletterPlaceholder || "you@company.com"}
                className="w-full rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
              <button
                type="submit"
                disabled={busy}
                className="shrink-0 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
              >
                {busy ? "…" : "→"}
              </button>
            </form>
            {done && (
              <p className="mt-2 text-xs text-accent">
                ✓ You&apos;re subscribed. Welcome aboard!
              </p>
            )}
            {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 py-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.footerCopyrightName || "JHB Automations. All rights reserved."}</p>
          {legalLinks.length > 0 && (
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label="Legal">
              {legalLinks.map((l) => (
                <Link key={l.href} href={l.href} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
          <p className="flex items-center gap-1.5">
            {settings.footerBottomTagline || "Crafted with ⚡ for the future."}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink/90">
        {title}
      </h4>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-muted transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
