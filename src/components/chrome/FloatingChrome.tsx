"use client";

import { AnimatePresence, motion } from "motion/react";
import { tileIndex } from "@/config/tiles";
import { track } from "@/lib/analytics";
import { jumpToTile, useTileStore } from "@/store/tiles";
import { AppIcon } from "../ui/AppIcon";
import { InstallButton } from "../ui/InstallButton";
import { useThemeAt } from "./useThemeAt";
import "./chrome.css";

/** Top-left mark and top-right glass pill (§6.3). Ink follows the tile passing underneath. */
export function FloatingChrome() {
  const theme = useThemeAt(36);
  const active = useTileStore((s) => s.activeIndex);

  return (
    <>
      <a
        href="#intro"
        data-theme={theme}
        className="chrome-logo"
        aria-label="Morphic — back to the top"
        onClick={(e) => {
          e.preventDefault();
          jumpToTile(0);
        }}
      >
        <AppIcon size={28} />
        <span className="font-display text-[19px] font-semibold tracking-[-0.02em]">Morphic</span>
      </a>

      <div data-theme={theme} className="chrome-top">
        <div className="glass flex h-[46px] items-center rounded-full py-[5px] pr-[5px] pl-2 text-ink">
          <a
            href="#pricing"
            className="rounded-full px-3 py-2 text-[14px] font-medium text-ink-2 transition-colors hover:text-ink"
            onClick={(e) => {
              e.preventDefault();
              track("pill_nav", { to: "pricing", from: "top-bar" });
              jumpToTile(tileIndex("pricing"));
            }}
          >
            Pricing
          </a>
          <AnimatePresence initial={false}>
            {active > 0 && (
              <motion.div
                key="cta"
                className="overflow-hidden"
                initial={{ width: 0, opacity: 0, filter: "blur(6px)" }}
                animate={{ width: "auto", opacity: 1, filter: "blur(0px)" }}
                exit={{ width: 0, opacity: 0, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              >
                <div className="pl-1">
                  <InstallButton tile="nav" size="sm" short className="rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
