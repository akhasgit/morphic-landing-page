"use client";

import {
  AnimatePresence,
  m as motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { pad2, tiles } from "@/config/tiles";
import { track } from "@/lib/analytics";
import { innerProgress, jumpToTile, sequenceTiles, useTileStore } from "@/store/tiles";
import { useThemeAt } from "./useThemeAt";

// Geometry (§6.5): 6px dots, 12px gaps, a 6×28 active capsule, 14px padding.
const DOT = 6;
const GAP = 12;
const ACT = 28;
const PAD = 14;
const PITCH = DOT + GAP;
const N = tiles.length;
const HEIGHT = PAD * 2 + (N - 1) * PITCH + ACT;
const slotTop = (k: number, a: number) => PAD + k * PITCH + (k > a ? ACT - DOT : 0);
const slotCenter = (k: number, a: number) => slotTop(k, a) + (k === a ? ACT : DOT) / 2;
const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;

/**
 * Vertical liquid-glass capsule (§6.5). The active indicator is one element whose y runs on
 * a spring; its velocity stretches it (scaleY up to ~1.35, scaleX thins to keep volume),
 * so it reads like a droplet moving between slots.
 */
export function ProgressPill() {
  const active = useTileStore((s) => s.activeIndex);
  const theme = useThemeAt("center");
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<{ index: number; key: number } | null>(null);
  const prevActive = useRef(active);

  const capY = useSpring(slotTop(active, active), { stiffness: 420, damping: 30 });
  const velocity = useVelocity(capY);
  const stretch = useTransform(velocity, (v) => (reduced ? 1 : 1 + Math.min(Math.abs(v) / 1500, 0.35)));
  const thin = useTransform(stretch, (s) => 1 / Math.sqrt(s));

  useEffect(() => {
    if (reduced) capY.jump(slotTop(active, active));
    else capY.set(slotTop(active, active));
  }, [active, capY, reduced]);

  // Label flash on every tile change (not on first load).
  useEffect(() => {
    if (prevActive.current === active) return;
    prevActive.current = active;
    setFlash({ index: active, key: Date.now() });
    const t = window.setTimeout(() => setFlash(null), 1800);
    return () => window.clearTimeout(t);
  }, [active]);

  const activeId = tiles[active].id;
  const fill = innerProgress[activeId];

  return (
    <nav
      aria-label="Page sections"
      data-theme={theme}
      className="pill-nav"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <motion.div
        className="pill-glass glass"
        data-open={open}
        initial={false}
        animate={{ width: open ? 212 : 44, height: open ? HEIGHT + 30 : HEIGHT }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
      >
        {tiles.map((t, k) => (
          <motion.button
            key={t.id}
            type="button"
            className="pill-row"
            data-state={k < active ? "passed" : k === active ? "active" : "upcoming"}
            initial={false}
            animate={{ y: slotCenter(k, active) - 9 }}
            transition={reduced ? { duration: 0 } : SPRING}
            aria-current={k === active ? "true" : undefined}
            aria-label={`${pad2(k + 1)} ${t.label}`}
            onClick={() => {
              track("pill_nav", { to: t.id });
              jumpToTile(k);
            }}
          >
            <span className="pill-label" aria-hidden="true">
              {t.label}
            </span>
            <span className="pill-dot" aria-hidden="true" />
          </motion.button>
        ))}

        <motion.div className="pill-capsule" style={{ y: capY, scaleY: stretch, scaleX: thin }} aria-hidden="true">
          {sequenceTiles.has(activeId) && <motion.div className="pill-capsule-fill" style={{ scaleY: fill }} />}
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="pill-counter"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }}
              transition={{ delay: 0.08, duration: 0.2 }}
              aria-hidden="true"
            >
              {pad2(active + 1)} / {pad2(N)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {flash && !open && (
          <motion.div
            key={flash.key}
            className="pill-flash glass"
            style={{ top: slotCenter(flash.index, flash.index) - 15 }}
            initial={{ opacity: 0, x: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 12, filter: "blur(4px)" }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <span className="num">{pad2(flash.index + 1)}</span>
            {tiles[flash.index].label}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
