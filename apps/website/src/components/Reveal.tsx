"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  /** Vertical offset of the entrance (default 28). Set 0 to disable. */
  y?: number;
  /** Horizontal offset of the entrance (default 0, e.g. -30 to slide in from left). */
  x?: number;
  /** Entrance scale (default 1, e.g. 0.95 to scale up into place). */
  scale?: number;
  /** Transition duration in seconds (default 0.7). */
  duration?: number;
  /** Element rendered (default "div"). Use "li" inside a list to keep valid HTML. */
  as?: "div" | "li" | "span";
  className?: string;
};

/**
 * The single client-side scroll-reveal primitive. Server components render
 * their markup on the server and wrap only the animated parts in <Reveal>, so
 * sections stay out of the client bundle while keeping their entrance motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  scale = 1,
  duration = 0.7,
  as = "div",
  className,
}: RevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
