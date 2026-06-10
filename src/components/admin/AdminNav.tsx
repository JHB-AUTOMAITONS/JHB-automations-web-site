"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/content", label: "Content", icon: "✎" },
  { href: "/admin/services", label: "Services", icon: "🧩" },
  { href: "/admin/seo", label: "SEO", icon: "🔍" },
  { href: "/admin/leads", label: "Leads", icon: "✉" },
  { href: "/admin/analytics", label: "Analytics", icon: "📊" },
  { href: "/admin/media", label: "Media", icon: "🖼" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        horizontal
          ? "flex gap-1 overflow-x-auto pt-3"
          : "flex flex-col gap-1"
      }
    >
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
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
        href="/"
        target="_blank"
        className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
      >
        <span className="text-base">↗</span>
        View site
      </a>
    </nav>
  );
}
