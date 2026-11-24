/** Public, server-verified pricing. Amounts are USD for the complete billing interval. */
export interface PlanCatalog {
  trialDays: number;
  plans: Array<{
    id: "free" | "pro" | "power"; name: string; morphs: number; savedViews: number | null;
    selfRepair: boolean; chartsAndChat: boolean;
    prices: Array<{ interval: "month" | "year"; amountUsd: number }>;
  }>;
}

export function planFeatures(p: PlanCatalog["plans"][number]): string[] {
  return [`${p.morphs} morphs/month`, p.savedViews === null ? "Unlimited saved views" : `${p.savedViews} saved views`, "Versions & undo", ...(p.selfRepair ? ["Self-repairing views"] : []), ...(p.chartsAndChat ? ["Charts & chat over data"] : [])];
}
export const usd = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);
