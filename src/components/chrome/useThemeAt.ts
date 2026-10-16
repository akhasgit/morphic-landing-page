"use client";

import { useSyncExternalStore } from "react";
import { chromeTheme, tiles } from "@/config/tiles";

/**
 * Theme of the tile painted under a given viewport y. Incoming tiles slide up over the
 * outgoing one, so the tile on top at y is the last section whose (untransformed) top
 * is above it. Floating chrome uses this so each piece flips ink exactly when the new
 * tile passes underneath it, instead of all at once at the 60% "active" mark.
 */
type Probe = number | "center" | "bottom";

let tops: number[] = [];
const listeners = new Set<() => void>();
let frame = 0;
let started = false;

function measure() {
  const sections = document.querySelectorAll<HTMLElement>("section[data-tile]");
  tops = Array.from(sections, (s) => s.getBoundingClientRect().top + window.scrollY);
}

function notify() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    listeners.forEach((l) => l());
  });
}

function start() {
  if (started) return;
  started = true;
  measure();
  window.addEventListener("scroll", notify, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    notify();
  });
  // Fonts/layout can shift tops right after hydration.
  window.addEventListener("load", () => {
    measure();
    notify();
  });
}

function subscribe(cb: () => void) {
  start();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function themeAt(probe: Probe): "light" | "dark" {
  if (!tops.length) measure();
  const vy = probe === "center" ? window.innerHeight / 2 : probe === "bottom" ? window.innerHeight - 36 : probe;
  const y = window.scrollY + vy;
  let index = 0;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= y + 0.5) index = i;
  return chromeTheme(tiles[Math.min(index, tiles.length - 1)].theme);
}

export function useThemeAt(probe: Probe) {
  return useSyncExternalStore(
    subscribe,
    () => themeAt(probe),
    () => "light" as const,
  );
}
