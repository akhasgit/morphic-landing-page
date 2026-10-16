import { create } from "zustand";
import { motionValue, type MotionValue } from "motion/react";
import { tiles, type TileId } from "@/config/tiles";

interface TileState {
  /** Index of the tile that fills ≥60% of the viewport. */
  activeIndex: number;
  /** Tiles up to this index may load their heavy code (active + one ahead). */
  loadedThrough: number;
  /** False while the tab is hidden: every loop pauses. */
  pageVisible: boolean;
  setActive: (index: number) => void;
  setPageVisible: (visible: boolean) => void;
}

export const useTileStore = create<TileState>()((set, get) => ({
  activeIndex: 0,
  loadedThrough: 1,
  pageVisible: true,
  setActive: (index) => set({ activeIndex: index, loadedThrough: Math.max(get().loadedThrough, index + 1) }),
  setPageVisible: (pageVisible) => set({ pageVisible }),
}));

/**
 * Per-tile progress (0–1) for tiles with an internal sequence (Use cases carousel,
 * How it works stepper). Motion values so the glass pill and dock can read them
 * every frame without React re-renders.
 */
export const innerProgress = Object.fromEntries(tiles.map((t) => [t.id, motionValue(0)])) as Record<
  TileId,
  MotionValue<number>
>;

/** Tiles whose active indicator fills with innerProgress. */
export const sequenceTiles: ReadonlySet<TileId> = new Set<TileId>(["use-cases", "how-it-works"]);

/** Smooth-scroll to a tile; snap finishes the landing. */
export function jumpToTile(index: number) {
  const el = document.querySelector<HTMLElement>(`section[data-tile="${index}"]`);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
