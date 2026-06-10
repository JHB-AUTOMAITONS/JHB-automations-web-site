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
}: {
  items?: ServiceCardData[];
}) {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="What We Do"
          title={
            <>
              Premium <span className="grad-text">AI &amp; Growth</span> Services
            </>
          }
          desc="Everything you need to automate operations, generate leads and scale — engineered under one roof."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((s, i) => (
            <ServiceCard key={s.slug} index={i} {...s} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/services" className="btn btn-ghost">
            View All Services →
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
}: {
  title: string;
  desc: string;
  icon: string;
  slug: string;
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 5) * 0.06 }}
    >
      <Link
        href={`/services/${slug}`}
        ref={ref}
        data-tilt
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group glass glow-border relative block h-full overflow-hidden rounded-2xl p-6 transition-transform duration-200 will-change-transform"
      >
        {/* spotlight */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--mx) var(--my), rgba(0,212,255,0.14), transparent 60%)",
          }}
        />
        <div className="relative">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-ink/10 transition-all duration-300 group-hover:from-primary group-hover:to-secondary group-hover:text-white group-hover:shadow-glow">
            <Icon
              name={icon}
              className="h-6 w-6 transition-transform duration-300 group-hover:animate-wiggle"
            />
          </span>
          <h3 className="mt-5 font-display text-lg font-semibold leading-tight">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            Learn more →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
