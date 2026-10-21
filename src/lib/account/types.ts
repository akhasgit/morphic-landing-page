// Shapes returned by the Morphic API (kept in step with packages/shared/src/protocol.ts in the morphic repo).

export type PlanId = "free" | "pro" | "power";
export type SubscriptionStatus = "free" | "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "unpaid" | "paused";

export interface AccountInfo {
  user: { id: string; email: string; name: string };
  plan: PlanId;
  status: SubscriptionStatus;
  interval: "month" | "year" | null;
  trialEndsAt: number | null;
  periodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  morphs: { used: number; limit: number; resetsAt: number };
  savedViews: { used: number; limit: number | null; hosts: string[] };
  features: { selfRepair: boolean; chartsAndChat: boolean };
  key: { present: boolean; hint: string | null };
  trialEligible: boolean;
  billingEnabled: boolean;
}

export interface SessionInfo {
  token: string;
  expiresAt: number;
  user: { id: string; email: string; name: string };
}

export interface ServerConfig {
  googleClientId: string | null;
  devAuth: boolean;
  billingEnabled: boolean;
  trialDays: number;
  accountUrl: string | null;
}
