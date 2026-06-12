import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { createClient } from "@jhb/shared/supabase/server";
import { signOut } from "./actions";
import AdminNav from "@/components/AdminNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JHB Admin",
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { role: string; full_name: string | null; email: string | null } | null =
    null;
  if (user) {
    const { data } = await supabase
      .from("jhb_profiles")
      .select("role, full_name, email")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }
  const role = profile?.role ?? "editor";

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        {!user ? (
          // Login page renders without the dashboard shell (own scroll, just in case)
          <div className="h-[100dvh] cursor-auto overflow-y-auto">{children}</div>
        ) : (
          <div className="flex h-[100dvh] cursor-auto overflow-hidden bg-base text-ink">
            {/* Sidebar — fixed full height, scrolls internally only if its own content overflows */}
            <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-ink/10 bg-surface p-5 lg:flex">
              <Link href="/" className="mb-8 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary font-display text-sm font-bold text-white">
                  JH
                </span>
                <span className="font-display text-base font-bold">
                  JHB <span className="grad-text">Admin</span>
                </span>
              </Link>

              <AdminNav role={role} />

              <div className="mt-auto rounded-2xl border border-ink/10 bg-base p-4">
                <p className="truncate text-sm font-semibold">
                  {profile?.full_name ?? user.email}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {role}
                </span>
                <form action={signOut} className="mt-3">
                  <button className="w-full rounded-lg border border-ink/10 px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500">
                    Sign out
                  </button>
                </form>
              </div>
            </aside>

            {/* Main column — fills height; header(s) stay fixed, only <main> scrolls */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {/* Mobile top bar */}
              <header className="flex shrink-0 items-center justify-between border-b border-ink/10 bg-surface px-5 py-3 lg:hidden">
                <Link href="/" className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                    JH
                  </span>
                  <span className="font-display text-sm font-bold">JHB Admin</span>
                </Link>
                <form action={signOut}>
                  <button className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs text-muted">
                    Sign out
                  </button>
                </form>
              </header>
              <div className="shrink-0 lg:hidden">
                <div className="border-b border-ink/10 bg-surface px-3 pb-3">
                  <AdminNav horizontal role={role} />
                </div>
              </div>

              {/* The only scrollable region */}
              <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
