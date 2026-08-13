"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Leaf = { href: string; label: string; icon: string; adminOnly?: boolean };
type Group = { label: string; icon: string; adminOnly?: boolean; children: Leaf[] };
type Entry = Leaf | Group;

const isGroup = (e: Entry): e is Group => "children" in e;

// Pinned entries for the existing, dedicated admin routes — kept exactly as
// they were (same hrefs, same editor) so nothing already working changes.
const PINNED_PRODUCT_ENTRIES: Leaf[] = [
  { href: "/jhb-automation-tools", label: "JHB HR Management System", icon: "🧰" },
  { href: "/vasool-app", label: "Vasool App", icon: "📱" },
  { href: "/about-vasool", label: "About Vasool", icon: "ℹ️" },
];
// Slugs already covered by a pinned entry above — excluded from the dynamic
// list below so a product never appears twice. Every slug that appears in
// PINNED_PRODUCT_ENTRIES must be listed here, or that product renders twice
// (once pinned, once dynamic).
const PINNED_PRODUCT_SLUGS = new Set(["vasool-app", "jhb-automation-tools"]);

// Any OTHER product (added from the admin, or by a future migration) gets its
// nav entry generated from the live data — no code change needed per product,
// reached via the generic /products/{slug} (+ /about) editor routes.
function buildProductsGroup(
  products: { slug: string; title: string; href?: string }[]
): Group {
  const dynamic = products
    .filter((p) => !PINNED_PRODUCT_SLUGS.has(p.slug))
    // A product carrying an `href` override renders at its own custom page and
    // is edited through its own dedicated admin module (that's what the href
    // means), so it must not also get generic /products/{slug} entries. This
    // keeps ONE nav entry per product without needing the pin list to be
    // updated by hand for every such product.
    .filter((p) => !(p.href ?? "").trim())
    // ONE row per product. The product's "About" sub-page is deliberately not
    // listed here — it stays reachable/editable at /products/{slug}/about (that
    // route is unchanged), it just doesn't get its own sidebar entry. Vasool's
    // "About Vasool" row is unaffected: it's a pinned entry above, not generated
    // here.
    .map((p) => ({ href: `/products/${p.slug}`, label: p.title, icon: "📦" }));
  return {
    label: "JHB Products",
    icon: "📦",
    adminOnly: true,
    children: [...PINNED_PRODUCT_ENTRIES, ...dynamic],
  };
}

const BASE_ITEMS: Entry[] = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/home", label: "Home Page", icon: "🏠", adminOnly: true },
  { href: "/about", label: "About Page", icon: "📖", adminOnly: true },
  { href: "/client-logos", label: "Client Logos", icon: "🏢", adminOnly: true },
  { href: "/services", label: "Services", icon: "🧩" },
  { href: "/service-pages", label: "Service Pages", icon: "📄", adminOnly: true },
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
  products = [],
}: {
  horizontal?: boolean;
  role?: string;
  products?: { id: string; slug: string; title: string; href?: string }[];
}) {
  const pathname = usePathname();
  // Rebuild the full nav (with the products group's dynamic entries) only
  // when the product list or role changes, then filter to what's visible.
  const visible = useMemo(() => {
    const items: Entry[] = [
      ...BASE_ITEMS.slice(0, 6),
      buildProductsGroup(products),
      ...BASE_ITEMS.slice(6),
    ];
    return items.filter((i) => !i.adminOnly || role === "admin");
  }, [products, role]);

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
