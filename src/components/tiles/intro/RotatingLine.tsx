"use client";

import { AnimatePresence, motion } from "motion/react";
import { useHeroStore } from "@/store/hero";

export const HERO_LINES = ["a grid of circles", "swipeable cards", "a table sorted by views"];

/**
 * "Turn this feed into …" — synced to the demo's morphs (§7.1). Old letters blur out
 * upward, new letters blur in from below, 15ms stagger.
 */
export function RotatingLine() {
  const line = useHeroStore((s) => s.line);
  const phrase = HERO_LINES[line];
  return (
    <span className="hero-line-phrase">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={phrase} className="hero-line-swap" aria-hidden="true">
          {Array.from(phrase).map((ch, i) => (
            <motion.span
              key={i}
              className="hero-line-ch"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.12 + i * 0.015, duration: 0.42, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { delay: i * 0.015, duration: 0.3, ease: [0.4, 0, 1, 1] } }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {phrase}
      </span>
    </span>
  );
}
