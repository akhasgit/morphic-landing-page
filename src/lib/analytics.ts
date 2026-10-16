// Analytics events (§10). Provider + key come from site.analytics; until they're set,
// events only log to the console in development.
import { site } from "@/config/site";
import { isSet, text } from "./placeholder";

export type AnalyticsEvent =
  | "tile_view"
  | "cta_install_click"
  | "demo_chip_click"
  | "video_open"
  | "usecase_focus"
  | "usecase_complete"
  | "usecase_lightbox"
  | "toggle_flip"
  | "pill_nav"
  | "idea_prompt_submit"
  | "pricing_billing_toggle"
  | "checkout_click"
  | "email_capture";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: ((event: string, options?: { props?: Props }) => void) & { q?: unknown[] };
    posthog?: { capture: (event: string, props?: Props) => void };
  }
}

export const analyticsProvider = isSet(site.analytics.provider) ? text(site.analytics.provider) : null;

export function track(event: AnalyticsEvent, props?: Props) {
  if (typeof window === "undefined") return;
  try {
    if (analyticsProvider === "plausible") window.plausible?.(event, props ? { props } : undefined);
    else if (analyticsProvider === "posthog") window.posthog?.capture(event, props);
  } catch {
    // never let analytics break the page
  }
  if (process.env.NODE_ENV !== "production") console.debug(`[analytics] ${event}`, props ?? {});
}
