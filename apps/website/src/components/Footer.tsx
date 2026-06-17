"use client";

import { useState } from "react";
import Link from "next/link";
import { SETTINGS_DEFAULT, type SiteSettings } from "@jhb/shared/content";

type ServiceLink = { label: string; href: string; icon: string };

export default function Footer({
  settings = SETTINGS_DEFAULT,
  serviceLinks = [],
}: {
  settings?: SiteSettings;
  serviceLinks?: ServiceLink[];
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const socials = [
    { label: "in", href: settings.linkedin },
    { label: "f", href: settings.facebook },
    { label: "ig", href: settings.instagram },
  ];

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 4000);
  };

  return (
    <footer className="relative border-t border-ink/10 pt-16">
      <div className="container-x">
        <div className="grid gap-10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2">
              {settings.branding?.footerLogo ? (
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.branding.footerLogo} alt={`${settings.companyName} logo`} className="max-h-full max-w-full object-contain" />
                </span>
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary font-display text-sm font-bold text-white">
                  JH
                </span>
              )}
              <span className="font-display text-lg font-bold">
                JHB <span className="grad-text">Automations</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">{settings.tagline}</p>
            <div className="mt-5 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href || "#"}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-ink/[0.04] text-xs uppercase text-muted transition-all hover:border-primary hover:text-primary"
                  aria-label={`Social ${s.label}`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* links */}
          <FooterCol
            title="Services"
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
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "All Services", href: "/services" },
              { label: "Testimonials", href: "/#testimonials" },
              { label: "Contact", href: "/contact" },
            ]}
          />

          {/* newsletter */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink/90">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-muted">
              Get automation insights and growth tips in your inbox.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-ink/10 bg-ink/[0.03] px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              >
                →
              </button>
            </form>
            {done && (
              <p className="mt-2 text-xs text-accent">
                ✓ You&apos;re subscribed. Welcome aboard!
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 py-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} JHB Automations. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <span className="text-accent">⚡</span> for the future.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
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
