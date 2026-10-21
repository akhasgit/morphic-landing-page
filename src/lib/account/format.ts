import type { AccountInfo, PlanId } from "./types";

export function planLabel(plan: PlanId): string {
  return plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Power";
}

export function shortDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function daysLeft(ms: number): string {
  const days = Math.max(1, Math.ceil((ms - Date.now()) / 86_400_000));
  return `${days} day${days === 1 ? "" : "s"} left`;
}

/** One line about the plan: trial days, renewal, end date, or a past plan. Same wording as the extension. */
export function statusLine(account: AccountInfo): string {
  const name = planLabel(account.plan);
  if (account.status === "trialing" && account.trialEndsAt) return `${name} trial · ${daysLeft(account.trialEndsAt)} (first charge ${shortDate(account.trialEndsAt)})`;
  if (account.plan !== "free" && account.cancelAtPeriodEnd && account.periodEnd) return `${name} until ${shortDate(account.periodEnd)}`;
  if (account.status === "past_due") return `${name} · payment failed`;
  if (account.plan !== "free" && account.periodEnd) return `${name} · renews ${shortDate(account.periodEnd)}`;
  if (account.status === "canceled") return "Free · your paid plan has ended";
  return `${name} plan`;
}
