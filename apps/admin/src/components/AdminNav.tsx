"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Leaf = { href: string; label: string; icon?: string };
type Item = {
  href?: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  children?: Leaf[];
};

const items: Item[] = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/home", label: "Home Page", icon: "🏠", adminOnly: true },
  { href: "/content", label: "Content", icon: "✎" },
  {
    label: "Services",
    icon: "🧩",
    children: [
      { href: "/services", label: "All Services" },
      { href: "/services/new", label: "Add New Service" },
      { href: "/services/categories", label: "Service Categories" },
      { href: "/faqs", label: "FAQ Management" },
      { href: "/seo", label: "SEO Settings" },
    ],
  },
  { href: "/posts", label: "Blog", icon: "📝" },
  { href: "/leads", label: "Leads", icon: "✉" },
  { href: "/analytics", label: "Analytics", icon: "📊" },
  { href: "/media", label: "Media", icon: "🖼" },
  { href: "/users", label: "Users", icon: "👥" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function AdminNav({
  horizontal = false,
  role = "editor",
}: {
  horizontal?: boolean;
  role?: string;
}) {
  const pathname = usePathname();
  const visible = items.filter((i) => !i.adminOnly || role === "admin");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/services")
      return (
        pathname === "/services" ||
        (pathname.startsWith("/services/") &&
          pathname !== "/services/new" &&
          pathname !== "/services/categories")
      );
    return pathname === href || pathname.startsWith(href + "/");
  };

  const leafClass = (active: boolean) =>
    `flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      active ? "bg-primary/10 text-primary" : "text-muted hover:bg-ink/[0.04] hover:text-ink"
    }`;

  return (
    <nav className={horizontal ? "flex gap-1 overflow-x-auto pt-3" : "flex flex-col gap-1"}>
      {visible.map((item) =>
        item.children ? (
          horizontal ? (
            // Mobile: flatten children inline
            item.children.map((c) => (
              <Link key={c.href} href={c.href} className={leafClass(isActive(c.href))}>
                {c.label}
              </Link>
            ))
          ) : (
            <div key={item.label} className="mt-1">
              <p className="flex items-center gap-3 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </p>
              <div className="flex flex-col gap-1 border-l border-ink/10 pl-3">
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(c.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted hover:bg-ink/[0.04] hover:text-ink"
                    }`}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        ) : (
          <Link key={item.href} href={item.href!} className={leafClass(isActive(item.href!))}>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        )
      )}
      <a
        href={WEBSITE_URL}
        target="_blank"
        className="mt-1 flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
      >
        <span className="text-base">↗</span>
        View site
      </a>
    </nav>
  );
}
