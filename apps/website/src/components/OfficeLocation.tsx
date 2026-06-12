"use client";

import { motion } from "framer-motion";
import type { SiteSettings } from "@jhb/shared/content";

const OFFICE = {
  name: "JHB Automations",
  addressLines: [
    "DNO: 30, 2nd Floor,",
    "Swarnapuri Annexe,",
    "Indira Nagar,",
    "Narasothipatti,",
    "Salem, Tamil Nadu 636004",
  ],
  // Single-line address used for maps + schema
  addressString:
    "JHB Automations, DNO 30, 2nd Floor, Swarnapuri Annexe, Indira Nagar, Narasothipatti, Salem, Tamil Nadu 636004",
};

export default function OfficeLocation({ settings }: { settings: SiteSettings }) {
  const phone = settings.phone || "+91 97918 22718";
  const email = settings.email || "jhbautomations@gmail.com";
  const hours = settings.hours || "Mon–Sat, 9:30 AM – 6:00 PM";
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  const q = encodeURIComponent(OFFICE.addressString);
  const embedSrc = `https://www.google.com/maps?q=${q}&output=embed`;
  const viewHref = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name: OFFICE.name,
    description:
      "Digital Marketing Company in Salem offering IT Services and AI Automation. JHB Automations helps businesses generate leads, automate workflows and scale faster.",
    image: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/founder.jpg`,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://jhbautomations.com",
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "DNO 30, 2nd Floor, Swarnapuri Annexe, Indira Nagar, Narasothipatti",
      addressLocality: "Salem",
      addressRegion: "Tamil Nadu",
      postalCode: "636004",
      addressCountry: "IN",
    },
    areaServed: "Salem, Tamil Nadu, India",
    openingHours: "Mo-Sa 09:30-18:00",
    keywords:
      "Digital Marketing Company in Salem, IT Services in Salem, AI Automation Company in Salem",
  };

  return (
    <section
      id="office-location"
      className="relative py-20 sm:py-24"
      aria-labelledby="office-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="container-x">
        <div className="glass-strong glow-border overflow-hidden rounded-3xl shadow-soft">
          <div className="grid lg:grid-cols-2">
            {/* Left: details */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="p-8 sm:p-10"
            >
              <span className="eyebrow">Visit Us</span>
              <h2
                id="office-heading"
                className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl"
              >
                Our Office in <span className="grad-text">Salem</span>
              </h2>
              <p className="mt-2 text-sm text-muted">
                Digital Marketing, IT Services &amp; AI Automation Company in
                Salem.
              </p>

              <ul className="mt-7 space-y-5 text-sm">
                <li className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-lg">
                    📍
                  </span>
                  <div>
                    <p className="font-display font-semibold">{OFFICE.name}</p>
                    <address className="mt-0.5 not-italic leading-relaxed text-muted">
                      {OFFICE.addressLines.map((l) => (
                        <span key={l} className="block">
                          {l}
                        </span>
                      ))}
                    </address>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-lg">
                    📞
                  </span>
                  <a href={telHref} className="font-medium transition-colors hover:text-primary">
                    {phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-lg">
                    ✉️
                  </span>
                  <a href={`mailto:${email}`} className="font-medium transition-colors hover:text-primary">
                    {email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-lg">
                    🕘
                  </span>
                  <span className="font-medium">{hours}</span>
                </li>
              </ul>

              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-8"
              >
                Get Directions <span aria-hidden>→</span>
              </a>
            </motion.div>

            {/* Right: map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative min-h-[320px] lg:min-h-full"
            >
              <iframe
                title={`Map showing ${OFFICE.name}, Salem`}
                src={embedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
              />
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-3 rounded-lg bg-base/90 px-3 py-1.5 text-xs font-semibold text-primary shadow-soft backdrop-blur transition-colors hover:text-secondary"
              >
                Open in Google Maps ↗
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
