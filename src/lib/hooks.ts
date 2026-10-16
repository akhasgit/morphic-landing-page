"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  };
}

/** Media query that is `fallback` on the server and during hydration. */
export function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)", true);
export const useIsTouch = () => useMediaQuery("(hover: none) and (pointer: coarse)", false);
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)", false);

/** True once mounted (client only). */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** setInterval that pauses when `ms` is null. */
export function useInterval(cb: () => void, ms: number | null) {
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(cb, ms);
    return () => window.clearInterval(id);
  }, [cb, ms]);
}

/** True from the first time `value` is true onward (mount-on-first-open for lazy dialogs). */
export function useOnceTrue(value: boolean) {
  const [seen, setSeen] = useState(value);
  useEffect(() => {
    if (value) setSeen(true);
  }, [value]);
  return seen || value;
}
