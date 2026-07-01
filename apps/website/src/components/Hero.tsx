"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { HERO_DEFAULT, type HeroContent } from "@jhb/shared/content";
import { PARTNERS_DEFAULT } from "@jhb/shared/partners";

const MARQUEE_DEFAULT = PARTNERS_DEFAULT.items.map((p) => p.name);

export default function Hero({
  content = HERO_DEFAULT,
  heroImage = null,
  heroImageAlt = "JHB Automations",
  heroImageTitle,
  marquee = MARQUEE_DEFAULT,
}: {
  content?: HeroContent;
  heroImage?: string | null;
  heroImageAlt?: string;
  heroImageTitle?: string;
  marquee?: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 120,
    damping: 18,
  });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-24"
    >
      {/* ambient blobs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[420px] w-[420px] rounded-full bg-secondary/20 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left copy */}
        <div className="min-w-0">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {content.badge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 max-w-full break-words font-display text-[1.95rem] font-bold leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.05] lg:text-6xl [&_p]:m-0 [&_p]:inline [&>div]:inline"
            dangerouslySetInnerHTML={{ __html: content.title }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="prose-jhb mt-6 max-w-full break-words text-base leading-relaxed text-muted sm:max-w-xl sm:text-lg [&_a]:break-words [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: content.subtitle }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <a
              href={content.ctaPrimaryHref}
              className="btn btn-primary w-full sm:w-auto"
            >
              {content.ctaPrimaryLabel}
              <span aria-hidden>→</span>
            </a>
            <a
              href={content.ctaSecondaryHref}
              className="btn btn-ghost w-full sm:w-auto"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ink/[0.06]">
                ▶
              </span>
              {content.ctaSecondaryLabel}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 max-w-md"
          >
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted/70">
              We work with industry-leading tools
            </p>
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
              <div className="flex w-max animate-marquee gap-8">
                {[...marquee, ...marquee].map((m, i) => (
                  <span
                    key={i}
                    className="whitespace-nowrap text-sm font-medium text-ink/60"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: 3D holographic dashboard */}
        <motion.div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ perspective: 1200 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="relative mx-auto w-full min-w-0 max-w-lg"
        >
          {heroImage ? (
            <motion.div
              style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
              className="glass-strong glow-border relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-glow"
            >
              <Image
                src={heroImage}
                alt={heroImageAlt}
                {...(heroImageTitle ? { title: heroImageTitle } : {})}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 512px"
                className="object-cover"
              />
            </motion.div>
          ) : (
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            className="glass-strong glow-border relative rounded-3xl p-5 shadow-glow"
          >
            {/* header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs font-medium text-muted">
                AI Control Center
              </span>
            </div>

            {/* metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <DashStat label="Revenue" value="₹4.8M" trend="+38%" />
              <DashStat label="Leads Today" value="1,284" trend="+12%" />
            </div>

            {/* live chart */}
            <div className="mt-3 rounded-2xl border border-ink/10 bg-ink/[0.03] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-muted">Automation Activity</span>
                <span className="flex items-center gap-1.5 text-xs text-accent">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Live
                </span>
              </div>
              <Sparkline />
            </div>

            {/* AI chat row */}
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-ink/10 bg-ink/[0.03] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm">
                🤖
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-ink">
                  Lead qualified &amp; routed to sales
                </p>
                <p className="text-[11px] text-muted">WhatsApp · just now</p>
              </div>
              <span className="ml-auto rounded-full bg-accent/15 px-2 py-1 text-[10px] font-semibold text-accent">
                AUTO
              </span>
            </div>
          </motion.div>
          )}

          {/* floating cards */}
          <motion.div
            style={{ transform: "translateZ(60px)" }}
            className="glass absolute -left-8 top-16 hidden rounded-2xl p-3 shadow-glow-purple animate-float sm:block"
          >
            <p className="text-[11px] text-muted">Conversion</p>
            <p className="font-display text-xl font-bold text-accent">+143%</p>
          </motion.div>
          <motion.div
            className="glass absolute -right-6 bottom-10 hidden rounded-2xl p-3 shadow-glow animate-float-slow sm:block"
          >
            <p className="text-[11px] text-muted">AI Replies</p>
            <p className="font-display text-xl font-bold text-primary">24/7</p>
          </motion.div>
        </motion.div>
      </div>

      <a
        href="#services"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted/70 md:flex"
      >
        <span className="flex h-9 w-5 justify-center rounded-full border border-ink/15 pt-1.5">
          <span className="h-2 w-1 animate-float rounded-full bg-primary" />
        </span>
        Scroll
      </a>
    </section>
  );
}

function DashStat({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-ink/[0.03] p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold text-accent">{trend}</p>
    </div>
  );
}

function Sparkline() {
  const points = [10, 22, 16, 30, 24, 40, 34, 52, 44, 60];
  const max = Math.max(...points);
  const w = 220;
  const h = 56;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path
        d={d}
        fill="none"
        stroke="#FF2E7E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
