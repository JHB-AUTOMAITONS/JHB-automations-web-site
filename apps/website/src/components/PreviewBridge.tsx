"use client";

import { useEffect } from "react";

/**
 * When the site is embedded in the admin Live Preview iframe it is cross-origin,
 * so the parent can't read our scroll height. We report it over postMessage
 * whenever it changes, letting the preview panel size its scroll area to the
 * full page (Hero -> Footer, nothing cropped).
 *
 * Completely inert when loaded normally (not inside a frame) — returns null and
 * skips the effect, so it has zero effect on the public site.
 */
export default function PreviewBridge() {
  useEffect(() => {
    // Not embedded → do nothing.
    if (window.top === window.self) return;

    const post = () => {
      const h = Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight ?? 0
      );
      if (h > 0) window.parent?.postMessage({ type: "jhb-preview:height", height: h }, "*");
    };

    post();

    // Height changes as content streams in, images/fonts load, sections expand.
    const ro = new ResizeObserver(post);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);

    const onLoad = () => post();
    window.addEventListener("load", onLoad);
    // A couple of late ticks catch layout that settles after first paint.
    const t1 = window.setTimeout(post, 600);
    const t2 = window.setTimeout(post, 1800);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", onLoad);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return null;
}
