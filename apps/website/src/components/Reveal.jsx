"use client";

import { motion } from "framer-motion";

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
}) {
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
