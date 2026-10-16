"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TileId } from "@/config/tiles";
import { useTileStore } from "@/store/tiles";

type TileCtx = { index: number; id: TileId };

const Ctx = createContext<TileCtx | null>(null);

export function TileProvider({ index, id, children }: TileCtx & { children: ReactNode }) {
  return <Ctx.Provider value={{ index, id }}>{children}</Ctx.Provider>;
}

/**
 * Active-tile lifecycle (§6.4).
 * - `isCurrent`: this is the tile on screen (use the rising edge for "on activation" behavior).
 * - `isActive`: current AND the tab is visible — run loops, physics and video only while true.
 * - `isNear`: the heavy code for this tile may load (it's active or the next one).
 */
export function useTile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTile must be used inside a <Tile>");
  const isCurrent = useTileStore((s) => s.activeIndex === ctx.index);
  const isActive = useTileStore((s) => s.activeIndex === ctx.index && s.pageVisible);
  const isNear = useTileStore((s) => s.loadedThrough >= ctx.index);
  return { ...ctx, isCurrent, isActive, isNear };
}
