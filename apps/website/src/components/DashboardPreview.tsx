"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import SectionHeading from "./SectionHeading";

export default function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <section id="dashboard" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="AI Command Center"
          title={
            <>
              Your Entire Business, <span className="grad-text">One Glance</span>
            </>
          }
          desc="Live analytics, automation status and lead intelligence — updating in real time."
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="glass-strong glow-border relative overflow-hidden rounded-3xl p-5 shadow-glow sm:p-8"
        >
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative grid gap-4 lg:grid-cols-3">
            <Widget title="Revenue Analytics" badge="+38%" className="lg:col-span-2">
              <BarChart active={inView} />
            </Widget>

            <Widget title="AI Chat Activity" badge="Live">
              <RingMetric active={inView} value={87} label="Resolution Rate" />
            </Widget>

            <Widget title="Lead Tracking">
              <Counter active={inView} target={1284} label="Leads this week" />
            </Widget>

            <Widget title="Automation Status">
              <div className="space-y-3 pt-1">
                <StatusRow label="WhatsApp Flows" value={98} />
                <StatusRow label="CRM Sync" value={100} />
                <StatusRow label="Email Sequences" value={92} />
              </div>
            </Widget>

            <Widget title="Campaign Results" badge="ROI 5.2x">
              <LineChart active={inView} />
            </Widget>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Widget({
  title,
  badge,
  children,
  className = "",
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink/10 bg-ink/[0.03] p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink/90">{title}</h3>
        {badge && (
          <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
            {badge === "Live" && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            )}
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function BarChart({ active }: { active: boolean }) {
  const bars = [42, 65, 50, 78, 60, 88, 72, 95];
  return (
    <div className="flex h-40 items-end justify-between gap-2">
      {bars.map((b, i) => (
        <motion.div
          key={i}
          className="w-full rounded-t-md bg-gradient-to-t from-primary/40 to-accent"
          initial={{ height: 0 }}
          animate={active ? { height: `${b}%` } : { height: 0 }}
          transition={{ duration: 0.8, delay: i * 0.07, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function LineChart({ active }: { active: boolean }) {
  const pts = [20, 35, 28, 48, 40, 62, 55, 78];
  const w = 240;
  const h = 120;
  const step = w / (pts.length - 1);
  const max = Math.max(...pts);
  const d = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="url(#lineFill)" />
      <motion.path
        d={d}
        fill="none"
        stroke="#FF2E7E"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </svg>
  );
}

function RingMetric({
  active,
  value,
  label,
}: {
  active: boolean;
  value: number;
  label: string;
}) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center pt-1">
      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 110 110">
          <circle
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="9"
          />
          <circle
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={active ? c * (1 - value / 100) : c}
            style={{ transition: "stroke-dashoffset 1.6s ease-out" }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#FF2E7E" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center font-display text-2xl font-bold">
          {value}%
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">{label}</p>
    </div>
  );
}

function Counter({
  active,
  target,
  label,
}: {
  active: boolean;
  target: number;
  label: string;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return (
    <div className="flex h-full flex-col justify-center pt-1">
      <p className="font-display text-4xl font-bold grad-text">
        {n.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
      <div className="mt-3 flex items-center gap-1 text-xs text-accent">
        <span>▲ 12.4%</span>
        <span className="text-muted">vs last week</span>
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="text-ink/80">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
