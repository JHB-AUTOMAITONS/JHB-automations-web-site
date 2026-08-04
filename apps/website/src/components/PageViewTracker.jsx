"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@jhb/shared/supabase/client";

export default function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (last.current === pathname) return;
    last.current = pathname;

    const supabase = createClient();
    supabase
      .from("jhb_pageviews")
      .insert({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : null,
      })
      .then(() => {});
  }, [pathname]);

  return null;
}
