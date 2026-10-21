// Pricing copy (§7.7). Numbers come from site.pricing (placeholders until AK sets them).
import { site } from "@/config/site";
import { num, text } from "@/lib/placeholder";

export type PlanId = "free" | "pro" | "power";

export const plans = [
  {
    id: "free" as const,
    name: "Free",
    line: "Try it on your favorite sites.",
    monthly: 0,
    yearly: 0,
    includes: [`${text(site.pricing.free.morphs)} morphs/month`, "All view types", "Versions & undo", `${text(site.pricing.free.savedViews)} saved views`],
    cta: "Add to Chrome",
  },
  {
    id: "pro" as const,
    name: "Pro",
    line: "For everyday browsing, your way.",
    monthly: num(site.pricing.pro.monthly),
    yearly: num(site.pricing.pro.yearly),
    includes: ["Free for 7 days, then billed", `${text(site.pricing.pro.morphs)} morphs/month`, "Unlimited saved views", "Self-repairing views", "Charts & chat over data"],
    cta: "Try free for 7 days",
  },
  {
    id: "power" as const,
    name: "Power",
    line: "For people who morph everything.",
    monthly: num(site.pricing.power.monthly),
    yearly: num(site.pricing.power.yearly),
    includes: ["Free for 7 days, then billed", `${text(site.pricing.power.morphs)} morphs/month`, "Everything in Pro", "Early access to new view types", "Priority support"],
    cta: "Try free for 7 days",
  },
];

// TODO(AK): confirm — the matrix assumes each tier includes everything in the tier below
// (listed in /dev/launch-checklist).
export const compareRows: { label: string; values: [string, string, string] }[] = [
  {
    label: "Morphs per month",
    values: [text(site.pricing.free.morphs), text(site.pricing.pro.morphs), text(site.pricing.power.morphs)],
  },
  { label: "All view types", values: ["✓", "✓", "✓"] },
  { label: "Versions & undo", values: ["✓", "✓", "✓"] },
  { label: "Saved views", values: [text(site.pricing.free.savedViews), "Unlimited", "Unlimited"] },
  { label: "Self-repairing views", values: ["—", "✓", "✓"] },
  { label: "Charts & chat over data", values: ["—", "✓", "✓"] },
  { label: "Early access to new view types", values: ["—", "—", "✓"] },
  { label: "Priority support", values: ["—", "—", "✓"] },
];
