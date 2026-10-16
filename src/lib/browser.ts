"use client";

// Browser detection for install CTAs (§10). Runs after hydration: the server and the
// first client render assume desktop Chrome, then the label swaps in place
// (labels are stacked in one grid cell, so the button never changes size).
import { useSyncExternalStore } from "react";

export type BrowserKind = "chromium" | "other" | "mobile";

type UAData = { mobile?: boolean; brands?: { brand: string }[] };

let cached: BrowserKind | null = null;

export function detectBrowser(): BrowserKind {
  if (cached) return cached;
  const nav = navigator as Navigator & { userAgentData?: UAData };
  const ua = nav.userAgent;
  const iPadOS = /Macintosh/.test(ua) && nav.maxTouchPoints > 1;
  const mobile = nav.userAgentData?.mobile ?? (/Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(ua) || iPadOS);
  if (mobile || iPadOS || /Android/i.test(ua)) return (cached = "mobile");
  const brands = nav.userAgentData?.brands?.map((b) => b.brand) ?? [];
  const chromium =
    brands.some((b) => /Chromium|Google Chrome|Microsoft Edge|Brave|Opera|Arc/i.test(b)) ||
    (/Chrome\/|Chromium\//.test(ua) && !/Firefox|FxiOS|EdgiOS|CriOS/.test(ua));
  return (cached = chromium ? "chromium" : "other");
}

const noop = () => () => {};

export function useBrowserKind(): BrowserKind {
  return useSyncExternalStore(noop, detectBrowser, () => "chromium");
}

export function isChromiumDesktop() {
  return typeof navigator !== "undefined" && detectBrowser() === "chromium";
}
