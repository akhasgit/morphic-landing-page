import { site } from "@/config/site";
import { isSet } from "./placeholder";

/** Install buttons link to chromeStoreUrl?utm_source=site&utm_medium={tile-id}. */
export function installUrl(medium: string): string | null {
  if (!isSet(site.chromeStoreUrl)) return null;
  try {
    const url = new URL(site.chromeStoreUrl);
    url.searchParams.set("utm_source", "site");
    url.searchParams.set("utm_medium", medium);
    return url.toString();
  } catch {
    return site.chromeStoreUrl;
  }
}

export type Plan = "pro" | "power";
export type Billing = "monthly" | "yearly";

/** Paid CTAs: checkout URL, or the store when upgrading happens inside the extension. */
export function checkoutUrl(plan: Plan, billing: Billing): string | null {
  if (site.upgradeFlow === "in-extension") return installUrl(`pricing-${plan}`);
  const url = site.checkout[plan][billing];
  return isSet(url) ? url : null;
}

export const demoVideoConfigured = isSet(site.demoVideo.src);
