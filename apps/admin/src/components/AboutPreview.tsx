"use client";

import type { AboutDoc } from "@jhb/shared/about";
import { AboutView } from "@jhb/shared/about-view";
import { STATS_DEFAULT } from "@jhb/shared/content";
import LivePreviewShell from "./LivePreviewShell";

/**
 * Live preview of the public /about page for the editor. Renders the SAME shared
 * <AboutView> the website renders, so it matches the live page exactly and
 * updates on every keystroke. The animated <Stats> band is shown as a static
 * version here (the admin doesn't depend on framer-motion); everything else —
 * hero, mission, vision, values, CTA and every added container — is identical.
 */
export default function AboutPreview({ about, footer }: { about: AboutDoc; footer?: string }) {
  return (
    <LivePreviewShell footer={footer}>
      <AboutView about={about} stats={<PreviewStats />} />
    </LivePreviewShell>
  );
}

// Static mirror of the website's <Stats> band (same markup/classes, minus the
// framer-motion count-up + progress rings) using the default stat figures the
// public About page shows.
function PreviewStats() {
  return (
    <section className="relative py-12">
      <div className="container-x">
        <div className="glass-strong glow-border relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12">
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <div className="relative mb-10 text-center">
            <span className="eyebrow">Why Choose Us</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Numbers That <span className="grad-text">Speak</span>
            </h2>
          </div>
          <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS_DEFAULT.items.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <span className="font-display text-4xl font-bold">
                  {s.value}
                  <span className="grad-text">{s.suffix}</span>
                </span>
                <p className="mt-3 text-sm font-medium text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
