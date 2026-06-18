"use client";

import { useEffect, useState } from "react";

type Mode = "date" | "datetime" | "time";

/**
 * Renders a locale/timezone-formatted date *only after mount*, so the server
 * HTML and the first client render are identical (both show `fallback`). This
 * eliminates the hydration mismatch that `new Date(x).toLocale*()` causes — the
 * server formats in the server's locale/timezone while the browser formats in
 * the visitor's, producing different text (e.g. "17:03:31" vs "5:03:31 PM").
 */
export default function LocalDateTime({
  value,
  mode = "date",
  options,
  fallback = "",
  prefix = "",
}: {
  value: string | number | Date | null | undefined;
  mode?: Mode;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  prefix?: string;
}) {
  const [text, setText] = useState(fallback);

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setText(fallback);
      return;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      setText(fallback);
      return;
    }
    if (options) setText(d.toLocaleString(undefined, options));
    else if (mode === "time") setText(d.toLocaleTimeString());
    else if (mode === "datetime") setText(d.toLocaleString());
    else setText(d.toLocaleDateString());
    // options is typically an inline literal; re-running on identity change is
    // harmless (setText is idempotent) and keeps the output current.
  }, [value, mode, fallback, options]);

  // suppressHydrationWarning is belt-and-suspenders: the value only changes
  // after mount, so server and initial client render already match `fallback`.
  return (
    <span suppressHydrationWarning>
      {text ? `${prefix}${text}` : text}
    </span>
  );
}
