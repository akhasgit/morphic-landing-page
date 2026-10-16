"use client";

import { AnimatePresence, motion, motionValue } from "motion/react";
import { useState } from "react";
import { pad2, tiles } from "@/config/tiles";
import { track } from "@/lib/analytics";
import { innerProgress, jumpToTile, sequenceTiles, useTileStore } from "@/store/tiles";
import { InstallButton } from "../ui/InstallButton";
import { Sheet } from "../ui/Sheet";
import { useThemeAt } from "./useThemeAt";

const FULL = motionValue(1);

/** Bottom glass dock with story-style segments (§6.6). Hidden on the hero. */
export function MobileDock() {
  const active = useTileStore((s) => s.activeIndex);
  const theme = useThemeAt("bottom");
  const [sheet, setSheet] = useState(false);
  const visible = active > 0;
  const activeId = tiles[active].id;

  return (
    <div className="dock-wrap" data-theme={theme}>
      <motion.div
        className="dock glass"
        initial={false}
        animate={visible ? { y: 0, opacity: 1 } : { y: 90, opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 34 }}
        aria-hidden={!visible}
        inert={!visible}
      >
        <button
          type="button"
          className="dock-nav"
          onClick={() => setSheet(true)}
          aria-label={`Section ${active + 1} of ${tiles.length}: ${tiles[active].label}. Show all sections`}
        >
          <span className="dock-segs" aria-hidden="true">
            {tiles.map((t, k) => (
              <span key={t.id} className="dock-seg" data-state={k < active ? "passed" : k === active ? "active" : "upcoming"}>
                {k === active && (
                  <motion.span
                    className="dock-seg-fill"
                    style={{ scaleX: sequenceTiles.has(activeId) ? innerProgress[activeId] : FULL }}
                  />
                )}
              </span>
            ))}
          </span>
          <span className="dock-label" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={active}
                className="absolute inset-0 truncate"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {tiles[active].label}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
        <InstallButton tile="dock" size="sm" short className="h-10 rounded-[12px] px-4" />
      </motion.div>

      <Sheet open={sheet} onOpenChange={setSheet} title="Sections">
        <ul className="-mx-2 grid gap-0.5 pb-1">
          {tiles.map((t, k) => (
            <li key={t.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[16px] text-ink transition-colors hover:bg-white/5"
                aria-current={k === active ? "true" : undefined}
                onClick={() => {
                  setSheet(false);
                  track("pill_nav", { to: t.id, from: "dock" });
                  window.setTimeout(() => jumpToTile(k), 220);
                }}
              >
                <span className="font-mono text-[12px] text-ink-3">{pad2(k + 1)}</span>
                <span className={k === active ? "font-semibold" : ""}>{t.label}</span>
                {k === active && <span className="ml-auto h-1.5 w-5 rounded-full bg-accent" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}
