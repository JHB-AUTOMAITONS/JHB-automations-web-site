"use client";

import { testimonials, type Testimonial } from "@/lib/data";
import SectionHeading from "./SectionHeading";

const accents: Record<
  Testimonial["accent"],
  { ring: string; glow: string; text: string; grad: string; dot: string }
> = {
  blue: {
    ring: "hover:border-[#2563EB]/60",
    glow: "hover:shadow-[0_18px_40px_-12px_rgba(37,99,235,0.45)]",
    text: "text-[#2563EB]",
    grad: "from-[#2563EB] to-[#3B82F6]",
    dot: "bg-[#2563EB]",
  },
  cyan: {
    ring: "hover:border-[#0891B2]/60",
    glow: "hover:shadow-[0_18px_40px_-12px_rgba(8,145,178,0.45)]",
    text: "text-[#0891B2]",
    grad: "from-[#06B6D4] to-[#0891B2]",
    dot: "bg-[#0891B2]",
  },
  purple: {
    ring: "hover:border-[#7C3AED]/60",
    glow: "hover:shadow-[0_18px_40px_-12px_rgba(124,58,237,0.5)]",
    text: "text-[#7C3AED]",
    grad: "from-[#7C3AED] to-[#A78BFA]",
    dot: "bg-[#7C3AED]",
  },
  orange: {
    ring: "hover:border-[#FF8A3D]/70",
    glow: "hover:shadow-[0_0_40px_-8px_rgba(255,138,61,0.55)]",
    text: "text-[#FF8A3D]",
    grad: "from-[#FF8A3D] to-[#FF5F6D]",
    dot: "bg-[#FF8A3D]",
  },
};

// Split into rows
const row1 = testimonials.slice(0, 6);
const row2 = testimonials.slice(6, 12);

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      {/* glowing background */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[150px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:70px_70px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      {/* light streaks */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="absolute left-0 top-[20%] h-px w-1/3 animate-streak bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <span
          className="absolute left-0 top-[55%] h-px w-1/4 animate-streak bg-gradient-to-r from-transparent via-accent/60 to-transparent"
          style={{ animationDelay: "2.5s" }}
        />
        <span
          className="absolute left-0 top-[80%] h-px w-1/3 animate-streak bg-gradient-to-r from-transparent via-secondary/60 to-transparent"
          style={{ animationDelay: "4.5s" }}
        />
      </div>

      {/* floating particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-ink/20 animate-float"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      <div className="container-x">
        <SectionHeading
          eyebrow="Social Proof"
          title={
            <>
              Trusted by <span className="grad-text">Ambitious Teams</span>
            </>
          }
          desc="Real businesses. Real automation. Real growth. Hover any card to pause and read."
        />
      </div>

      {/* Marquee rows */}
      <div className="relative flex flex-col gap-5">
        <MarqueeRow items={row1} duration={55} />
        <MarqueeRow items={row2} duration={68} reverse />

        {/* edge fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-base to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-base to-transparent sm:w-40" />
      </div>

      {/* rating summary */}
      <div className="container-x mt-14">
        <div className="glass glow-border mx-auto flex max-w-md items-center justify-center gap-4 rounded-2xl px-6 py-4">
          <div className="flex text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <p className="text-sm text-muted">
            <span className="font-display font-bold text-ink">4.9/5</span> from{" "}
            <span className="font-display font-bold text-ink">200+</span>{" "}
            happy clients
          </p>
        </div>
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  duration,
  reverse = false,
}: {
  items: Testimonial[];
  duration: number;
  reverse?: boolean;
}) {
  // duplicate for seamless loop
  const loop = [...items, ...items];
  return (
    <div className="group flex w-max gap-5 px-2.5">
      <div
        className={`flex w-max gap-5 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        } group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((t, i) => (
          <TestimonialCard key={`${t.company}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const a = accents[t.accent];
  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <article
      className={`glass group/card relative w-[300px] shrink-0 rounded-2xl border border-ink/10 p-6 transition-all duration-300 will-change-transform hover:-translate-y-1.5 hover:scale-[1.03] sm:w-[360px] ${a.ring} ${a.glow}`}
    >
      {/* header */}
      <div className="flex items-center gap-3">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${a.grad} font-display text-sm font-bold text-white shadow-lg`}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-ink">
            {t.name}
          </p>
          <p className="truncate text-xs text-muted">
            {t.role} · <span className={a.text}>{t.company}</span>
          </p>
        </div>
      </div>

      {/* stars */}
      <div className="mt-4 flex gap-0.5 text-sm text-accent">
        {Array.from({ length: t.rating }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>

      {/* quote */}
      <p className="mt-3 text-sm leading-relaxed text-ink/80">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* result */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1.5 text-xs font-semibold ${a.text} ring-1 ring-ink/10`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
          {t.result}
        </span>
      </div>

      {/* tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {t.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-ink/[0.04] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted ring-1 ring-ink/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

const PARTICLES = [
  { left: "8%", top: "20%", delay: "0s", dur: "7s" },
  { left: "22%", top: "70%", delay: "1.5s", dur: "9s" },
  { left: "40%", top: "30%", delay: "3s", dur: "8s" },
  { left: "58%", top: "75%", delay: "0.8s", dur: "10s" },
  { left: "72%", top: "25%", delay: "2.2s", dur: "7.5s" },
  { left: "88%", top: "60%", delay: "4s", dur: "9.5s" },
  { left: "15%", top: "45%", delay: "2.8s", dur: "8.5s" },
  { left: "65%", top: "50%", delay: "1.2s", dur: "7s" },
];
