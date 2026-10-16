"use client";

import { useEffect } from "react";
import { DotField } from "@/components/dotfield/DotField";
import { useTile } from "../TileContext";

/**
 * The hero's full-bleed light dot field (§7.1, §8) and the first-visit intro's skip logic:
 * any input ends the intro immediately (text appears, dots fast-forward, autoplay starts).
 */
export function HeroField() {
  const { isActive } = useTile();

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") return;
    const end = () => {
      if (root.dataset.intro !== "play") return;
      root.dataset.intro = "done";
      window.dispatchEvent(new Event("morphic:intro-skip"));
      cleanup();
    };
    const t = window.setTimeout(() => {
      root.dataset.intro = "done";
      cleanup();
    }, 2000);
    const evs = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, end, { passive: true }));
    function cleanup() {
      window.clearTimeout(t);
      evs.forEach((e) => window.removeEventListener(e, end));
    }
    return cleanup;
  }, []);

  return <DotField theme="light" active={isActive} intro="logo-burst" textSafe="#hero-copy" />;
}
