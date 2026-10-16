"use client";

import { useEffect } from "react";
import { tiles } from "@/config/tiles";
import { track } from "@/lib/analytics";
import { useTileStore } from "@/store/tiles";

/**
 * Drives the tile system (§6.2–6.4). Renders nothing.
 * - Active tile = the section covering ≥60% of the viewport (IntersectionObserver).
 * - Replays a tile's entrance each time it becomes active; resets it once fully covered.
 * - Mirrors the active tile into the URL hash (replaceState) and fires tile_view.
 * - Pauses everything while the tab is hidden.
 * - Keyboard focus landing inside another tile scrolls that tile into view.
 */
export function TileController() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-tile]"));
    const coverage = sections.map(() => 0);
    const { setActive, setPageVisible } = useTileStore.getState();
    let current = -1; // the first observer callback activates whichever tile we loaded on
    let settleTimer = 0;

    const activate = (index: number) => {
      current = index;
      setActive(index);
      sections[index].dataset.revealed = "true";
      window.clearTimeout(settleTimer);
      // Hash + analytics only once the user stays on a tile (smooth jumps pass through others).
      settleTimer = window.setTimeout(() => {
        const id = tiles[index].id;
        const hash = index === 0 ? "" : `#${id}`;
        if (window.location.hash !== hash) {
          window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}${hash}`);
        }
        track("tile_view", { id });
      }, 450);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = Number((entry.target as HTMLElement).dataset.tile);
          const vh = entry.rootBounds?.height || window.innerHeight;
          coverage[i] = entry.isIntersecting ? entry.intersectionRect.height / vh : 0;
        }
        const next = coverage.findIndex((c) => c >= 0.6);
        if (next >= 0 && next !== current) activate(next);
        // Fully covered → reset so its entrance replays next time.
        coverage.forEach((c, i) => {
          if (c === 0 && i !== current) sections[i].dataset.revealed = "false";
        });
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    sections.forEach((s) => io.observe(s));

    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const onFocusIn = (e: FocusEvent) => {
      const section = (e.target as Element | null)?.closest?.<HTMLElement>("section[data-tile]");
      if (!section) return;
      const i = Number(section.dataset.tile);
      if (i === current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    };
    document.addEventListener("focusin", onFocusIn);

    // Snap assist (passive — never blocks or replaces native scrolling). Mouse wheels with
    // precise deltas and short trackpad swipes use Chrome's "nearest snap point" strategy,
    // so a deliberate small gesture can snap back to the tile it started on. When a vertical
    // wheel gesture of ≥50px ends and native snap left us where we began, nudge one tile on.
    const shortViewport = window.matchMedia("(max-height: 620px)");
    const nearest = () => {
      let best = 0;
      let dist = Infinity;
      sections.forEach((s, i) => {
        const d = Math.abs(s.getBoundingClientRect().top);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best;
    };
    let gestureStart = -1;
    let gestureSum = 0;
    let gestureTimer = 0;
    let checkTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || shortViewport.matches) return;
      if ((e.target as Element | null)?.closest?.('[role="dialog"]')) return;
      if (gestureStart < 0) {
        gestureStart = nearest();
        gestureSum = 0;
      }
      gestureSum += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      window.clearTimeout(gestureTimer);
      window.clearTimeout(checkTimer);
      gestureTimer = window.setTimeout(() => {
        const start = gestureStart;
        const dir = Math.sign(gestureSum);
        const big = Math.abs(gestureSum) >= 50;
        gestureStart = -1;
        // Give native snapping a moment to settle, then check where it landed.
        checkTimer = window.setTimeout(() => {
          if (!big || nearest() !== start) return;
          const target = start + dir;
          if (target >= 0 && target < sections.length) {
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            sections[target].scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
          }
        }, 240);
      }, 170);
    };
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      io.disconnect();
      window.clearTimeout(settleTimer);
      window.clearTimeout(gestureTimer);
      window.clearTimeout(checkTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return null;
}
