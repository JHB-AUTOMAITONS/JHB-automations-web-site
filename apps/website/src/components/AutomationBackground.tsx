"use client";

import { useEffect, useRef } from "react";

/**
 * Premium DARK live "AI automation ecosystem" background — pure Canvas 2D.
 *
 * Paints the page's deep-space backdrop plus a living network: digital fog,
 * ambient light waves, a faint intelligence grid, glowing/activating nodes,
 * softly pulsing AI hubs with energy rings, dynamically illuminating
 * connections, and flowing data packets with trails. Multi-layer depth +
 * gentle scroll parallax. No pointer interaction.
 *
 * Performance: glows are pre-rendered sprites drawn via drawImage (GPU
 * compositing, no per-frame gradient allocation); node count + packets are
 * capped and scaled down on mobile; DPR clamped; the RAF loop pauses on a
 * hidden tab; prefers-reduced-motion draws a single static frame.
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number;
  r: number;
  hub: boolean;
  phase: number;
  actPhase: number;
  actSpeed: number;
  color: [number, number, number];
};
type Packet = { from: number; to: number; t: number; speed: number; px: number; py: number };
type Fog = { x: number; y: number; vx: number; vy: number; r: number; sprite: HTMLCanvasElement; a: number };

const BLUE: [number, number, number] = [37, 99, 235];
const PURPLE: [number, number, number] = [76, 29, 149]; // deep purple #4C1D95
const VIOLET: [number, number, number] = [124, 58, 237];
const CYAN: [number, number, number] = [6, 182, 212];
const PALETTE: [number, number, number][] = [BLUE, CYAN, VIOLET, BLUE, CYAN];

const LINK_DIST = 155;
const LINK_DIST2 = LINK_DIST * LINK_DIST;

const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// Pre-render a soft radial glow sprite for a colour (drawn with drawImage).
function makeGlow(c: [number, number, number]): HTMLCanvasElement {
  const s = document.createElement("canvas");
  s.width = 64;
  s.height = 64;
  const g = s.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, rgba(c, 1));
  grad.addColorStop(0.35, rgba(c, 0.45));
  grad.addColorStop(1, rgba(c, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return s;
}

export default function AutomationBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    const glowCyan = makeGlow(CYAN);
    const glowBlue = makeGlow(BLUE);
    const glowViolet = makeGlow(VIOLET);
    const glowPurple = makeGlow(PURPLE);
    const glowFor = (c: [number, number, number]) =>
      c === CYAN ? glowCyan : c === BLUE ? glowBlue : c === PURPLE ? glowPurple : glowViolet;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let fogs: Fog[] = [];
    let bgGrad: CanvasGradient | null = null;
    let raf = 0;
    let scrollY = window.scrollY || 0;
    let t = 0;
    let gridOffset = 0;

    const nearest = (i: number): number => {
      const a = nodes[i];
      let best = i;
      let bestD = Infinity;
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        const dx = nodes[j].x - a.x;
        const dy = nodes[j].y - a.y;
        const d = dx * dx + dy * dy;
        if (d > 4 && d < bestD) {
          bestD = d;
          best = j;
        }
      }
      return best;
    };

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep-space vertical gradient backdrop (cached).
      bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#050816");
      bgGrad.addColorStop(0.5, "#0B1120");
      bgGrad.addColorStop(1, "#050816");

      const target = Math.floor((width * height) / (isMobile ? 34000 : 20000));
      const count = Math.max(16, Math.min(target, isMobile ? 32 : 72));
      nodes = Array.from({ length: count }, (_, i) => {
        const depth = 0.35 + Math.random() * 0.65;
        const hub = i % 10 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          depth,
          r: (hub ? 3.4 : 1.5) * (0.7 + depth * 0.6),
          hub,
          phase: Math.random() * Math.PI * 2,
          actPhase: Math.random() * Math.PI * 2,
          actSpeed: 0.006 + Math.random() * 0.014,
          color: hub ? VIOLET : PALETTE[i % PALETTE.length],
        };
      });

      const pc = Math.max(8, Math.min(Math.floor(count / 2), isMobile ? 14 : 28));
      packets = Array.from({ length: pc }, () => {
        const from = Math.floor(Math.random() * nodes.length);
        return { from, to: nearest(from), t: Math.random(), speed: 0.004 + Math.random() * 0.007, px: 0, py: 0 };
      });

      // Distant digital fog blobs (slow drift, low alpha, multi-layer depth).
      const fogColors = [BLUE, PURPLE, CYAN];
      const fogCount = isMobile ? 2 : 3;
      fogs = Array.from({ length: fogCount }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.05,
        r: Math.max(width, height) * (0.35 + Math.random() * 0.25),
        sprite: glowFor(fogColors[i % fogColors.length]),
        a: 0.06 + Math.random() * 0.04,
      }));
    };

    const linkKey = (a: number, b: number) => (a < b ? a * 100000 + b : b * 100000 + a);

    const render = () => {
      t += 1;
      gridOffset += 0.15;
      const par = Math.min(scrollY * 0.04, 50);

      // Backdrop
      ctx.fillStyle = bgGrad!;
      ctx.fillRect(0, 0, width, height);

      // Digital fog + ambient light waves (drawn with screen blend for glow)
      ctx.globalCompositeOperation = "lighter";
      for (const f of fogs) {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < -f.r) f.x = width + f.r;
        else if (f.x > width + f.r) f.x = -f.r;
        if (f.y < -f.r) f.y = height + f.r;
        else if (f.y > height + f.r) f.y = -f.r;
        const breathe = 0.85 + 0.15 * Math.sin(t * 0.004 + f.x);
        ctx.globalAlpha = f.a * breathe;
        ctx.drawImage(f.sprite, f.x - f.r, f.y - f.r - par * 0.3, f.r * 2, f.r * 2);
      }
      // two slow ambient light waves
      const w1r = Math.max(width, height) * 0.5;
      ctx.globalAlpha = 0.05;
      ctx.drawImage(glowBlue, width * (0.3 + 0.12 * Math.sin(t * 0.0016)) - w1r, height * 0.2 - w1r, w1r * 2, w1r * 2);
      ctx.drawImage(glowViolet, width * (0.7 + 0.12 * Math.cos(t * 0.0013)) - w1r, height * 0.8 - w1r, w1r * 2, w1r * 2);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Intelligence grid
      const gap = 64;
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba([120, 150, 220], 0.05);
      const oy = gridOffset % gap;
      ctx.beginPath();
      for (let x = 0; x <= width; x += gap) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = -gap + oy; y <= height; y += gap) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20;
        else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        else if (n.y > height + 20) n.y = -20;
      }

      // Which links currently carry a packet → illuminate them
      const active = new Set<number>();
      for (const p of packets) active.add(linkKey(p.from, p.to));

      // Connection pathways
      ctx.lineWidth = 0.9;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ay = a.y - par * a.depth;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST2) {
            const closeness = 1 - Math.sqrt(d2) / LINK_DIST;
            const lit = active.has(linkKey(i, j));
            const alpha = closeness * (lit ? 0.6 : 0.22);
            if (alpha < 0.015) continue;
            ctx.strokeStyle = lit ? rgba(CYAN, alpha) : rgba([70, 110, 200], alpha);
            ctx.lineWidth = lit ? 1.4 : 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, ay);
            ctx.lineTo(b.x, b.y - par * b.depth);
            ctx.stroke();
          }
        }
      }

      // Nodes, hubs, glows, energy rings
      ctx.globalCompositeOperation = "lighter";
      for (const n of nodes) {
        const ny = n.y - par * n.depth;
        const act = 0.5 + 0.5 * Math.sin(t * n.actSpeed + n.actPhase); // activate/deactivate
        const sprite = glowFor(n.color);
        if (n.hub) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.03 + n.phase);
          const R = (n.r + pulse * 2.6) * 7;
          ctx.globalAlpha = 0.3 + pulse * 0.18;
          ctx.drawImage(sprite, n.x - R, ny - R, R * 2, R * 2);
          // expanding energy ring
          const ringT = ((t * 0.5 + n.phase * 50) % 130) / 130;
          ctx.globalAlpha = (1 - ringT) * 0.25;
          ctx.strokeStyle = rgba(n.color, 1);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(n.x, ny, ringT * 75, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const R = n.r * (5 + n.depth * 3);
          ctx.globalAlpha = (0.12 + 0.45 * act) * (0.5 + n.depth * 0.5);
          ctx.drawImage(sprite, n.x - R, ny - R, R * 2, R * 2);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Solid node cores
      for (const n of nodes) {
        const ny = n.y - par * n.depth;
        const act = 0.5 + 0.5 * Math.sin(t * n.actSpeed + n.actPhase);
        ctx.fillStyle = rgba(n.hub ? [220, 230, 255] : n.color, n.hub ? 0.95 : 0.4 + act * 0.5);
        ctx.beginPath();
        ctx.arc(n.x, ny, n.hub ? n.r + 0.6 : n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flowing data packets (glow head + trail)
      ctx.globalCompositeOperation = "lighter";
      for (const p of packets) {
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0;
          p.from = p.to;
          p.to = nearest(p.from);
        }
        const a = nodes[p.from];
        const b = nodes[p.to];
        const e = p.t < 0.5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2;
        const x = a.x + (b.x - a.x) * e;
        const y = a.y + (b.y - a.y) * e - par * a.depth;
        // trail
        if (p.px || p.py) {
          ctx.strokeStyle = rgba(CYAN, 0.5);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        p.px = x;
        p.py = y;
        const R = 9;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(glowCyan, x - R, y - R, R * 2, R * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      // packet cores
      for (const p of packets) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.arc(p.px, p.py, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    const onResize = () => build();
    const onScroll = () => {
      scrollY = window.scrollY || 0;
    };
    const onVisibility = () => {
      if (!started) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !reduce) {
        raf = requestAnimationFrame(render);
      }
    };

    // Defer the (heavy) canvas build + RAF loop until the browser is idle, so it
    // never competes with hydration or the LCP paint. visibilitychange is wired
    // up immediately but no-ops until start() has run.
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      build();
      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onScroll, { passive: true });
      if (reduce) {
        render();
        cancelAnimationFrame(raf);
        raf = 0;
      } else {
        raf = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    const ric = window.requestIdleCallback;
    const idleId: number =
      typeof ric === "function" ? ric(start, { timeout: 2000 }) : window.setTimeout(start, 1200);

    return () => {
      cancelAnimationFrame(raf);
      const cic = window.cancelIdleCallback;
      if (typeof ric === "function" && typeof cic === "function") cic(idleId);
      else clearTimeout(idleId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={{ transform: "translateZ(0)", willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
