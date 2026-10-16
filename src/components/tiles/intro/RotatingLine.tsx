"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useHeroStore } from "@/store/hero";

export const HERO_LINES = [
  { noun: "dashboard", phrase: "charts you can talk to" },
  { noun: "feed", phrase: "swipeable cards" },
  { noun: "feed", phrase: "a table sorted by views" },
  { noun: "feed", phrase: "a grid of circles" },
];

/**
 * "Turn this {dashboard|feed} into {…}." — synced to the demo's morphs (§7.1). Old letters blur out
 * upward, new letters blur in from below, 15ms stagger. The noun swaps only when the demo
 * changes site (feed ↔ dashboard).
 */
export function RotatingLine() {
  const line = useHeroStore((s) => s.line);
  const { noun, phrase } = HERO_LINES[line];
  return (
    <>
      <span aria-hidden="true">
        Turn this <BlurSwap text={noun} /> into <BlurSwap text={phrase} />.
      </span>
      <span className="sr-only" aria-live="polite">
        Turn this {noun} into {phrase}.
      </span>
    </>
  );
}

function BlurSwap({ text }: { text: string }) {
  return (
    <span className="hero-line-phrase">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} className="hero-line-swap">
          {Array.from(text).map((ch, i) => (
            <motion.span
              key={i}
              className="hero-line-ch"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.12 + i * 0.015, duration: 0.42, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { delay: i * 0.015, duration: 0.3, ease: [0.4, 0, 1, 1] } }}
            >
              {ch === " " ? "\u00a0" : ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
