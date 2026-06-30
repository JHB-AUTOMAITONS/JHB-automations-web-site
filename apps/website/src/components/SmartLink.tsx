import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  children: ReactNode;
};

// One link primitive that picks the right element by destination:
//   • internal paths ("/about", "/#contact", "/blog/x") → Next.js <Link>, which
//     navigates client-side (no full reload) and prefetches the route, so clicks
//     feel instant.
//   • everything else (https://…, mailto:, tel:, bare "#hash" on the same page)
//     → a plain <a>, so behaviour for those is byte-for-byte unchanged.
// `prefetch` is consumed here (never forwarded to <a>) to avoid an invalid DOM
// attribute warning on the external branch.
export default function SmartLink({ href, prefetch, children, ...rest }: SmartLinkProps) {
  if (typeof href === "string" && href.startsWith("/")) {
    return (
      <Link href={href} prefetch={prefetch} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
