"use client";

import { useState } from "react";
import { saveSettings } from "@/app/actions";
import type { NavItemOverride, PageHeroContent, SiteSettings } from "@jhb/shared/content";
import EditorHeader from "./EditorHeader";

type Toast = { type: "success" | "error"; msg: string } | null;

export default function SettingsEditor({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState<SiteSettings>(initial);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);

  const set = (k: keyof SiteSettings) => (v: string) => setS((p) => ({ ...p, [k]: v }));
  const str = (k: keyof SiteSettings) => (s[k] ?? "") as string;

  const setHero = (page: keyof SiteSettings["pageHeroes"], k: keyof PageHeroContent, v: string) =>
    setS((p) => ({ ...p, pageHeroes: { ...p.pageHeroes, [page]: { ...p.pageHeroes[page], [k]: v } } }));

  const setNavItem = (id: string, k: keyof NavItemOverride, v: string | boolean) =>
    setS((p) => ({
      ...p,
      navItems: p.navItems.map((item) => (item.id === id ? { ...item, [k]: v } : item)),
    }));

  const setFooterLink = (i: number, k: "label" | "href", v: string) =>
    setS((p) => ({
      ...p,
      footerCompanyLinks: p.footerCompanyLinks.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)),
    }));

  const addFooterLink = () =>
    setS((p) => ({ ...p, footerCompanyLinks: [...p.footerCompanyLinks, { label: "", href: "" }] }));

  const removeFooterLink = (i: number) =>
    setS((p) => ({ ...p, footerCompanyLinks: p.footerCompanyLinks.filter((_, idx) => idx !== i) }));

  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };

  const saveDraft = async () => {
    setBusy("save");
    const res = await saveSettings(s as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) flash({ type: "success", msg: "Draft saved." });
    else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const publish = async () => {
    setBusy("publish");
    const res = await saveSettings(s as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) flash({ type: "success", msg: "Settings saved & live." });
    else flash({ type: "error", msg: res.error || "Save failed." });
  };

  return (
    <div className="space-y-6">
      <EditorHeader
        title="Website Settings"
        subtitle="Company info, contact details and social links — used across the site."
        busy={busy}
        toast={toast}
        onSave={saveDraft}
        onPublish={publish}
        publishLabel="Save Settings"
      />

      {/* ── Company ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Company</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Company name" value={s.companyName} onChange={set("companyName")} />
          <Field label="Tagline" value={s.tagline} onChange={set("tagline")} />
        </div>
      </section>

      {/* ── FAQ display ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">FAQ Display</h2>
        <label className="mt-4 flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium">Show question numbers</span>
            <span className="text-xs text-muted">Adds automatic “01.”, “02.”… numbers (Meta Blue) before every FAQ question, across the whole site.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={s.faqShowNumbers !== false}
            onClick={() => setS((p) => ({ ...p, faqShowNumbers: !(p.faqShowNumbers !== false) }))}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${s.faqShowNumbers !== false ? "bg-primary" : "bg-ink/20"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${s.faqShowNumbers !== false ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>
      </section>

      {/* ── Contact ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Contact</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Phone" value={s.phone} onChange={set("phone")} />
          <Field label="Email" value={s.email} onChange={set("email")} />
          <Field label="Address" value={s.address} onChange={set("address")} />
          <Field label="Office hours" value={s.hours} onChange={set("hours")} />
        </div>
      </section>

      {/* ── Office Location ── */}
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

      {/* ── Social Links ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Social Links</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Instagram URL" value={s.instagram} onChange={set("instagram")} />
          <Field label="Facebook URL" value={s.facebook} onChange={set("facebook")} />
          <Field label="LinkedIn URL" value={s.linkedin} onChange={set("linkedin")} />
        </div>
      </section>

      {/* ── Navigation ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Navigation</h2>
        <p className="mt-1 text-xs text-muted">
          Brand wordmark text shown next to the logo. Toggle visibility or rename any menu item.
        </p>

        <div className="mt-5 space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Brand wordmark</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Line 1 (large, e.g. JHB)"
                value={s.branding?.wordmarkPrimary ?? "JHB"}
                onChange={(v) => setS((p) => ({ ...p, branding: { ...p.branding, wordmarkPrimary: v } }))}
              />
              <Field
                label="Line 2 (small, e.g. Automations)"
                value={s.branding?.wordmarkSecondary ?? "Automations"}
                onChange={(v) => setS((p) => ({ ...p, branding: { ...p.branding, wordmarkSecondary: v } }))}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Menu items</p>
            <div className="space-y-2">
              {s.navItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-base px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(e) => setNavItem(item.id, "visible", e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  <input
                    value={item.label}
                    onChange={(e) => setNavItem(item.id, "label", e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                    placeholder={item.id}
                  />
                  <span className="shrink-0 text-xs text-muted/60">{item.id}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">Uncheck to hide an item. Edit the label to rename it.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Footer</h2>
        <p className="mt-1 text-xs text-muted">
          Column headings, company links, newsletter copy and the bottom bar.
        </p>

        <div className="mt-5 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Services column title" value={s.footerServicesTitle} onChange={set("footerServicesTitle")} />
            <Field label="Company column title" value={s.footerCompanyTitle} onChange={set("footerCompanyTitle")} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Company column links</p>
            <div className="space-y-2">
              {s.footerCompanyLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={link.label}
                    onChange={(e) => setFooterLink(i, "label", e.target.value)}
                    placeholder="Label"
                    className="w-32 shrink-0 rounded-xl border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={link.href}
                    onChange={(e) => setFooterLink(i, "href", e.target.value)}
                    placeholder="/path or /#anchor"
                    className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeFooterLink(i)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink/10 text-xs text-muted hover:border-red-300 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFooterLink}
                className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary"
              >
                + Add link
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Newsletter column title" value={s.footerNewsletterTitle} onChange={set("footerNewsletterTitle")} />
            <Field label="Newsletter email placeholder" value={s.footerNewsletterPlaceholder} onChange={set("footerNewsletterPlaceholder")} />
          </div>
          <Textarea label="Newsletter description" value={s.footerNewsletterDesc} onChange={set("footerNewsletterDesc")} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Copyright (after © year)"
              value={s.footerCopyrightName}
              onChange={set("footerCopyrightName")}
            />
            <Field label="Bottom tagline (right side)" value={s.footerBottomTagline} onChange={set("footerBottomTagline")} />
          </div>
        </div>
      </section>

      {/* ── Contact Form Copy ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Contact Form</h2>
        <p className="mt-1 text-xs text-muted">
          Field labels, button text and success messages on the contact form.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Field labels</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Name field" value={str("contactFormName")} onChange={set("contactFormName")} />
              <Field label="Company field" value={str("contactFormCompany")} onChange={set("contactFormCompany")} />
              <Field label="Email field" value={str("contactFormEmail")} onChange={set("contactFormEmail")} />
              <Field label="Phone field" value={str("contactFormPhone")} onChange={set("contactFormPhone")} />
              <Field label="Message field" value={str("contactFormMessage")} onChange={set("contactFormMessage")} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Buttons</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Submit button" value={str("contactFormSubmit")} onChange={set("contactFormSubmit")} />
              <Field label="Phone CTA button" value={str("contactFormCallCta")} onChange={set("contactFormCallCta")} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Info panel labels</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Phone label" value={str("contactInfoCallLabel")} onChange={set("contactInfoCallLabel")} />
              <Field label="Email label" value={str("contactInfoEmailLabel")} onChange={set("contactInfoEmailLabel")} />
              <Field label="Address label" value={str("contactInfoVisitLabel")} onChange={set("contactInfoVisitLabel")} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Success overlay</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading" value={str("contactSuccessHeading")} onChange={set("contactSuccessHeading")} />
              <Field label="Message" value={str("contactSuccessText")} onChange={set("contactSuccessText")} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog Search Copy ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Blog Search</h2>
        <p className="mt-1 text-xs text-muted">
          Placeholder, button and empty-state text for the blog search bar.
          Use <code className="rounded bg-ink/10 px-1 text-[11px]">{"{query}"}</code> in
          the no-match message to insert the user&apos;s search term.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Search placeholder" value={str("blogSearchPlaceholder")} onChange={set("blogSearchPlaceholder")} />
          <Field label="Search button label" value={str("blogSearchButton")} onChange={set("blogSearchButton")} />
          <Field label="No-match message (use {query})" value={str("blogSearchNoMatch")} onChange={set("blogSearchNoMatch")} />
          <Field label="Empty state (no posts yet)" value={str("blogSearchEmpty")} onChange={set("blogSearchEmpty")} />
        </div>
      </section>

      {/* ── Office Section Copy ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Office Section Copy</h2>
        <p className="mt-1 text-xs text-muted">
          Visible heading text and SEO schema fields for the &ldquo;Visit Us&rdquo; block on the home page.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Heading</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Eyebrow" value={str("officeEyebrow")} onChange={set("officeEyebrow")} />
              <Field label="Heading lead" value={str("officeHeadingLead")} onChange={set("officeHeadingLead")} />
              <Field label="Heading highlight (gradient)" value={str("officeHeadingHighlight")} onChange={set("officeHeadingHighlight")} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Textarea label="Sub-description" value={str("officeDesc")} onChange={set("officeDesc")} />
              <Field label="Directions button label" value={str("officeDirectionsLabel")} onChange={set("officeDirectionsLabel")} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">JSON-LD / SEO schema</p>
            <div className="mt-2">
              <Textarea label="Business description (schema)" value={str("officeSchemaDesc")} onChange={set("officeSchemaDesc")} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Opening hours (schema, e.g. Mo-Sa 09:30-18:00)" value={str("officeSchemaHours")} onChange={set("officeSchemaHours")} />
              <Textarea label="Keywords (schema, comma-separated)" value={str("officeSchemaKeywords")} onChange={set("officeSchemaKeywords")} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Page Heroes ── */}
      <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Page Heroes</h2>
        <p className="mt-1 text-xs text-muted">
          Hero text for the Services, Blog and Contact landing pages. Leave any field blank to keep the built-in default.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Services page (/services)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Eyebrow" value={s.pageHeroes.services.eyebrow} onChange={(v) => setHero("services", "eyebrow", v)} />
              <Field label="Heading lead" value={s.pageHeroes.services.headingLead} onChange={(v) => setHero("services", "headingLead", v)} />
              <Field label="Heading highlight (gradient)" value={s.pageHeroes.services.headingHighlight} onChange={(v) => setHero("services", "headingHighlight", v)} />
            </div>
            <div className="mt-3">
              <Textarea label="Description" value={s.pageHeroes.services.description} onChange={(v) => setHero("services", "description", v)} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Blog page (/blog)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Eyebrow" value={s.pageHeroes.blog.eyebrow} onChange={(v) => setHero("blog", "eyebrow", v)} />
              <Field label="Heading lead" value={s.pageHeroes.blog.headingLead} onChange={(v) => setHero("blog", "headingLead", v)} />
              <Field label="Heading highlight (gradient)" value={s.pageHeroes.blog.headingHighlight} onChange={(v) => setHero("blog", "headingHighlight", v)} />
            </div>
            <div className="mt-3">
              <Textarea label="Description" value={s.pageHeroes.blog.description} onChange={(v) => setHero("blog", "description", v)} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Contact page (/contact)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Eyebrow" value={s.pageHeroes.contact.eyebrow} onChange={(v) => setHero("contact", "eyebrow", v)} />
              <Field label="Heading lead" value={s.pageHeroes.contact.headingLead} onChange={(v) => setHero("contact", "headingLead", v)} />
              <Field label="Heading highlight (gradient)" value={s.pageHeroes.contact.headingHighlight} onChange={(v) => setHero("contact", "headingHighlight", v)} />
            </div>
            <div className="mt-3">
              <Textarea label="Description" value={s.pageHeroes.contact.description} onChange={(v) => setHero("contact", "description", v)} />
            </div>
          </div>
        </div>
      </section>

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
