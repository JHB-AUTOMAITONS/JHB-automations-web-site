"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string; adminOnly?: boolean };

const items: Item[] = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/home", label: "Home Page", icon: "🏠", adminOnly: true },
  { href: "/content", label: "Content", icon: "✎" },
  { href: "/services", label: "Services", icon: "🧩" },
  { href: "/posts", label: "Blog", icon: "📝" },
  { href: "/seo", label: "SEO", icon: "🔍" },
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

  return (
    <nav
      className={
        horizontal
          ? "flex gap-1 overflow-x-auto pt-3"
          : "flex flex-col gap-1"
      }
    >
      {visible.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-ink/[0.04] hover:text-ink"
            }`}
          >
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
