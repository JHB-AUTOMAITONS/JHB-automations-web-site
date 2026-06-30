"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Leaf = { href: string; label: string; icon: string; adminOnly?: boolean };
type Group = { label: string; icon: string; adminOnly?: boolean; children: Leaf[] };
type Entry = Leaf | Group;

const isGroup = (e: Entry): e is Group => "children" in e;

const items: Entry[] = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/home", label: "Home Page", icon: "🏠", adminOnly: true },
  { href: "/about", label: "About Page", icon: "📖", adminOnly: true },
  { href: "/client-logos", label: "Client Logos", icon: "🏢", adminOnly: true },
  { href: "/services", label: "Services", icon: "🧩" },
  { href: "/service-pages", label: "Service Pages", icon: "📄", adminOnly: true },
  {
    label: "JHB Products",
    icon: "📦",
    adminOnly: true,
    children: [
      { href: "/jhb-automation-tools", label: "JHB Automation Tools", icon: "🧰" },
      { href: "/vasool-app", label: "Vasool App", icon: "📱" },
      { href: "/about-vasool", label: "About Vasool", icon: "ℹ️" },
    ],
  },
  {
    label: "Recent Activity",
    icon: "🕑",
    children: [
      { href: "/activity", label: "Activity Log", icon: "📋" },
      { href: "/activity/versions", label: "Version History", icon: "🗂", adminOnly: true },
    ],
  },
  { href: "/testimonials", label: "Testimonials", icon: "⭐", adminOnly: true },
  { href: "/posts", label: "Blog", icon: "📝" },
  { href: "/faqs", label: "FAQs", icon: "❓" },
  { href: "/seo", label: "Home Page SEO", icon: "🔍" },
  {
    label: "AI SEO Assistant",
    icon: "✨",
    adminOnly: true,
    children: [
      { href: "/ai-seo", label: "Dashboard", icon: "▦" },
      { href: "/ai-seo/content-generator", label: "AI Content Generator", icon: "✍️" },
      { href: "/ai-seo/analyzer", label: "SEO Analyzer", icon: "🔬" },
      { href: "/ai-seo/keyword-research", label: "Keyword Research", icon: "🔑" },
      { href: "/ai-seo/competitor", label: "Competitor Analysis", icon: "🥊" },
      { href: "/ai-seo/blog-writer", label: "Blog Writer", icon: "📝" },
      { href: "/ai-seo/service-writer", label: "Service Page Writer", icon: "🧩" },
      { href: "/ai-seo/image-seo", label: "Image SEO", icon: "🖼" },
      { href: "/ai-seo/faq-generator", label: "FAQ Generator", icon: "❓" },
      { href: "/ai-seo/schema-generator", label: "Schema Generator", icon: "🧷" },
      { href: "/ai-seo/internal-links", label: "Internal Link Suggestions", icon: "🔗" },
      { href: "/ai-seo/reports", label: "SEO Reports", icon: "📊" },
      { href: "/ai-seo/history", label: "AI History", icon: "🕑" },
    ],
  },
  { href: "/leads", label: "Leads", icon: "✉" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/media", label: "Gallery", icon: "🖼" },
  { href: "/users", label: "Users", icon: "👥" },
  { href: "/branding", label: "Logo Management", icon: "🖼", adminOnly: true },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

const leafClasses = (active: boolean, indent: boolean) =>
  `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    indent ? "text-[13px]" : ""
  } ${active ? "bg-primary/10 text-primary" : "text-muted hover:bg-ink/[0.04] hover:text-ink"}`;

function NavGroup({ group, pathname, role }: { group: Group; pathname: string; role: string }) {
  const children = group.children.filter((c) => !c.adminOnly || role === "admin");
  const inGroup = children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
  const [open, setOpen] = useState(inGroup);
  useEffect(() => {
    if (inGroup) setOpen(true);
  }, [inGroup]);

  if (children.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
      >
        <span className="flex items-center gap-3">
          <span className="text-base">{group.icon}</span>
          {group.label}
        </span>
        <span className={`text-xs transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-ink/10 pl-2">
          {children.map((c) => (
            <Link key={c.href} href={c.href} className={leafClasses(pathname === c.href, true)}>
              <span className="text-sm">{c.icon}</span>
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminNav({
  horizontal = false,
  role = "editor",
}: {
  horizontal?: boolean;
  role?: string;
}) {
  const pathname = usePathname();
  // Only recompute the visible set when the role changes (not on every nav).
  const visible = useMemo(
    () => items.filter((i) => !i.adminOnly || role === "admin"),
    [role]
  );

  return (
    <nav className={horizontal ? "flex gap-1 overflow-x-auto pt-3" : "flex flex-col gap-1"}>
      {visible.map((item) => {
        if (isGroup(item)) {
          const kids = item.children.filter((c) => !c.adminOnly || role === "admin");
          // Horizontal (mobile) bar: flatten the group's children into inline links.
          if (horizontal) {
            return kids.map((c) => (
              <Link key={c.href} href={c.href} className={leafClasses(pathname === c.href, false)}>
                <span className="text-base">{c.icon}</span>
                {c.label}
              </Link>
            ));
          }
          return <NavGroup key={item.label} group={item} pathname={pathname} role={role} />;
        }
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={leafClasses(active, false)}>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
      <a
        href={WEBSITE_URL}
        target="_blank"
        className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
      >
        <span className="text-base">↗</span>
        View site
      </a>
    </nav>
  );
}

// Memoized: re-renders only when its props (role/horizontal) change, not when
// sibling page content changes during navigation.
export default memo(AdminNav);
