import { planFeatures, type PlanCatalog } from "@/lib/catalog";
export type PlanId = "free" | "pro" | "power";
export function displayPlans(catalog: PlanCatalog) {
  return catalog.plans.map(p => ({
    ...p, line: p.id === "free" ? "Try it on your favorite sites." : p.id === "pro" ? "For everyday browsing, your way." : "For people who morph everything.",
    monthly: p.id === "free" ? 0 : p.prices.find(v => v.interval === "month")?.amountUsd ?? null,
    yearly: p.id === "free" ? 0 : p.prices.find(v => v.interval === "year")?.amountUsd ?? null,
    includes: planFeatures(p), cta: catalog.trialDays > 0 ? `Try free for ${catalog.trialDays} days` : "Choose plan",
  }));
}
export function comparison(catalog: PlanCatalog) {
  return [
    { label: "Morphs per month", values: catalog.plans.map(p => String(p.morphs)) },
    { label: "Versions & undo", values: catalog.plans.map(() => "✓") },
    { label: "Saved views", values: catalog.plans.map(p => p.savedViews === null ? "Unlimited" : String(p.savedViews)) },
    { label: "Self-repairing views", values: catalog.plans.map(p => p.selfRepair ? "✓" : "—") },
    { label: "Charts & chat over data", values: catalog.plans.map(p => p.chartsAndChat ? "✓" : "—") },
  ];
}
