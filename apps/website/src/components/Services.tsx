"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { services as defaultServices } from "@jhb/shared/data";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";

type ServiceCardData = { title: string; desc: string; icon: string; slug: string };

export default function Services({
  items = defaultServices,
  eyebrow = "What We Do",
  heading = "Premium AI & Growth Services",
  subheading = "Everything you need to automate operations, generate leads and scale — engineered under one roof.",
  viewAllText = "View All Services",
  learnMoreText = "Learn more",
}: {
  items?: ServiceCardData[];
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  viewAllText?: string;
  learnMoreText?: string;
}) {
  return (
    <section id="services" className="relative py-12 sm:py-16">
      <div className="container-x">
        <SectionHeading
          eyebrow={eyebrow}
          title={<span className="grad-text [&_p]:m-0 [&_p]:inline [&_a]:underline" dangerouslySetInnerHTML={{ __html: heading }} />}
          descHtml={subheading}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((s, i) => (
            <ServiceCard key={s.slug} index={i} learnMoreText={learnMoreText} {...s} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/services" className="btn btn-ghost">
            {viewAllText} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  title,
  desc,
  icon,
  slug,
  index,
  learnMoreText,
}: {
  title: string;
  desc: string;
  icon: string;
  slug: string;
  index: number;
  learnMoreText: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${
      x * 8
    }deg) translateY(-6px)`;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  // Rich-text classes shared by the title/description HTML so editor formatting
  // (font size, colour, bold, lists, alignment) renders correctly. `pointer-
  // events-none` lets clicks on plain text fall through to the card-wide link,
  // while word-links re-enable pointer events so they stay individually clickable.
  const richText =
    "pointer-events-none [&_a]:pointer-events-auto [&_a]:relative [&_a]:z-20 [&_a]:text-primary [&_a]:underline [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-semibold [&_strong]:font-semibold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.06 }}
    >
      <div
        ref={ref}
        data-tilt
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group glass glow-border relative h-full overflow-hidden rounded-2xl p-6 transition-transform duration-200 will-change-transform"
      >
        {/* Card-wide navigation: a stretched link sits beneath the content so the
            whole card is clickable, yet it is a sibling (not an ancestor) of the
            word-links inside the title/description — keeping the HTML valid. */}
        <Link
          href={`/${slug}`}
          aria-label={`Learn more about ${slug.replace(/-/g, " ")}`}
          className="absolute inset-0 z-0"
        />

        {/* spotlight */}
        <div
          className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mx) var(--my), rgba(0,212,255,0.14), transparent 60%)",
          }}
        />
        {/* Content sits above the stretched link but stays click-transparent so
            EVERY click (icon, text gaps, padding, empty space) falls through to
            the card-wide link. Inline word-links re-enable pointer events (z-20)
            so they remain individually clickable. */}
        <div className="pointer-events-none relative z-10">
          <span className="pointer-events-none grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-ink/10 transition-all duration-300 group-hover:from-primary group-hover:to-secondary group-hover:text-white group-hover:shadow-glow">
            <Icon
              name={icon}
              className="h-6 w-6 transition-transform duration-300 group-hover:animate-wiggle"
            />
          </span>
          <div
            role="heading"
            aria-level={3}
            className={`mt-5 font-display text-lg font-semibold leading-tight ${richText}`}
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <div
            className={`mt-2 text-sm leading-relaxed text-muted ${richText}`}
            dangerouslySetInnerHTML={{ __html: desc }}
          />
          <span className="pointer-events-none mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            {learnMoreText} <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
