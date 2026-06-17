"use client";

import { Fragment, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { navItems, serviceMenu } from "@jhb/shared/data";
import { LOGO_DEFAULT, type LogoSettings } from "@jhb/shared/content";
import Icon from "./Icon";

type DropItem = { label: string; href: string; icon: string };

export default function Navbar({
  serviceLinks = serviceMenu,
  productLinks = [],
  branding = LOGO_DEFAULT,
}: {
  serviceLinks?: DropItem[];
  productLinks?: DropItem[];
  branding?: LogoSettings;
}) {
  const pathname = usePathname();
  // Resolve the dropdown for a top-level item. "JHB Products" is data-driven.
  const dropdownFor = (label: string, fallback?: DropItem[]) => {
    if (label === "Services") return serviceLinks;
    if (label === "JHB Products") return productLinks.length ? productLinks : undefined;
    return fallback;
  };
  // A non-hash route link is active when the current path matches it
  const isActive = (href: string) =>
    !href.includes("#") && href !== "/" && pathname.startsWith(href);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="container-x">
        <div
          className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass-strong shadow-glow" : "bg-transparent"
          }`}
        >
          <a href="#home" className="flex items-center gap-3">
            <span
              className={`flex shrink-0 items-center justify-center overflow-hidden border shadow-glow ${
                logoFailed
                  ? "border-white/15 bg-gradient-to-br from-primary to-secondary font-display text-sm font-bold text-white"
                  : "border-ink/10"
              }`}
              style={
                logoFailed
                  ? { width: 44, height: 44, borderRadius: 12 }
                  : {
                      width: branding.width,
                      height: branding.height,
                      padding: branding.padding,
                      borderRadius: branding.radius,
                      background: branding.bgColor,
                    }
              }
            >
              {logoFailed ? (
                "JH"
              ) : branding.mobileLogo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={branding.mobileLogo} alt="JHB Automations logo" onError={() => setLogoFailed(true)} decoding="async" className="max-h-full max-w-full object-contain sm:hidden" style={{ objectPosition: branding.align }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={branding.headerLogo || "/logo.png"} alt="JHB Automations logo" onError={() => setLogoFailed(true)} decoding="async" className="hidden max-h-full max-w-full object-contain sm:block" style={{ objectPosition: branding.align }} />
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branding.headerLogo || "/logo.png"}
                  alt="JHB Automations logo"
                  onError={() => setLogoFailed(true)}
                  decoding="async"
                  className="max-h-full max-w-full object-contain"
                  style={{ objectPosition: branding.align }}
                />
              )}
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              JHB <span className="grad-text">Automations</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Fragment key={item.label + item.href}>
                {dropdownFor(item.label, item.dropdown) ? (
                  <div className="group relative">
                    <a
                      href={item.href}
                      className="nav-underline flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-ink"
                    >
                      {item.label}
                      <span className="text-[10px] transition-transform duration-300 group-hover:rotate-180">
                        ▾
                      </span>
                    </a>
                    {/* hover bridge + dropdown */}
                    <div className="invisible absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="glass-strong grid max-h-[60vh] grid-cols-1 gap-1 overflow-y-auto rounded-2xl p-3 shadow-soft no-scrollbar">
                        {(dropdownFor(item.label, item.dropdown) ?? []).map((d) => (
                          <a
                            key={d.label}
                            href={d.href}
                            className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-ink/10 transition-all group-hover/item:from-primary group-hover/item:to-secondary group-hover/item:text-white">
                              <Icon name={d.icon} className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-medium text-muted transition-colors group-hover/item:text-ink">
                              {d.label}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className={`nav-underline text-sm font-medium transition-colors hover:text-ink ${
                      isActive(item.href) ? "text-primary" : "text-muted"
                    }`}
                  >
                    {item.label}
                  </a>
                )}
              </Fragment>
            ))}
          </nav>

          <button
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-white transition-all ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container-x lg:hidden"
          >
            <div className="glass-strong mt-3 flex flex-col gap-1 rounded-2xl p-4">
              {navItems.map((item, i) => (
                <Fragment key={item.label + item.href}>
                  {dropdownFor(item.label, item.dropdown) ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => setMobileOpen((o) => (o === item.label ? null : item.label))}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
                      >
                        {item.label}
                        <span
                          className={`text-xs transition-transform duration-300 ${
                            mobileOpen === item.label ? "rotate-180" : ""
                          }`}
                        >
                          ▾
                        </span>
                      </button>
                      <AnimatePresence>
                        {mobileOpen === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-3 flex max-h-[40vh] flex-col gap-0.5 overflow-y-auto border-l border-ink/10 py-1 pl-3 no-scrollbar">
                              {(dropdownFor(item.label, item.dropdown) ?? []).map((d) => (
                                <a
                                  key={d.label}
                                  href={d.href}
                                  onClick={() => setOpen(false)}
                                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
                                >
                                  <Icon
                                    name={d.icon}
                                    className="h-4 w-4 shrink-0 text-primary"
                                  />
                                  {d.label}
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-ink/[0.04] hover:text-ink ${
                        isActive(item.href) ? "text-primary" : "text-muted"
                      }`}
                    >
                      {item.label}
                    </motion.a>
                  )}
                </Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
