"use client";

import type { ReactNode } from "react";
import { useTile } from "./TileContext";

/**
 * Mounts heavy tile visuals only once the previous tile is active (prefetch one ahead, §13).
 * Pair with next/dynamic({ ssr: false }) so their code is split out of the landing bundle.
 * Once mounted, stays mounted.
 */
export function NearGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isNear } = useTile();
  return <>{isNear ? children : fallback}</>;
}
