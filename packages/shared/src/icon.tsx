import type { ReactNode } from "react";

// Named line-icon set shared by the website AND the admin editor previews, so a
// service icon picked in the admin renders identically on the published page and
// in the live preview. To add an icon: add a path here and its name flows into
// ICON_NAMES automatically.
type IconProps = { name: string; className?: string };

const paths: Record<string, ReactNode> = {
  spark: (
    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
  ),
  chat: (
    <path d="M4 4h16v12H7l-3 3V4z" />
  ),
  code: (
    <>
      <path d="M8 9l-3 3 3 3" />
      <path d="M16 9l3 3-3 3" />
    </>
  ),
  crm: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0112 0" />
      <path d="M16 11h5M16 15h5" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3z" />
      <path d="M8.5 9c0 3.5 3 6.5 6.5 6.5" />
    </>
  ),
  rocket: (
    <>
      <path d="M5 15c-1 3 0 4 0 4s1 1 4 0" />
      <path d="M14 4c4 1 6 5 5 9l-5 5-4-4 4-5c0-2 0-4 0-5z" />
      <circle cx="14.5" cy="9.5" r="1.2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2 12h12l2-8H7" />
    </>
  ),
  flow: (
    <>
      <rect x="3" y="4" width="6" height="4" rx="1" />
      <rect x="15" y="16" width="6" height="4" rx="1" />
      <path d="M6 8v4a4 4 0 004 4h5" />
    </>
  ),
  app: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </>
  ),
};

// All icon names — drives the admin icon picker.
export const ICON_NAMES = Object.keys(paths);

export default function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? paths.spark}
    </svg>
  );
}
