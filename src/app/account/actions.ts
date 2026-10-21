"use server";

import { redirect } from "next/navigation";
import { api, ApiError, clearSessionCookie, sessionToken, signInPath } from "@/lib/account/server";

async function tokenOr(next: string): Promise<string> {
  const token = await sessionToken();
  if (!token) redirect(signInPath(next));
  return token;
}

function back(path: string, params: Record<string, string>): never {
  redirect(`${path}?${new URLSearchParams(params).toString()}`);
}

export async function signOut(): Promise<void> {
  await clearSessionCookie();
  redirect("/account/signin");
}

/** Opens Stripe Checkout for a plan (7-day trial on the first paid plan; the card is collected up front). */
export async function startCheckout(formData: FormData): Promise<void> {
  const token = await tokenOr("/account/billing");
  const plan = formData.get("plan") === "power" ? "power" : "pro";
  const interval = formData.get("interval") === "year" ? "year" : "month";
  let url: string;
  try {
    url = (await api<{ url: string }>("/v1/billing/checkout", { method: "POST", body: { plan, interval }, token })).url;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(signInPath("/account/billing"));
    back("/account/billing", { error: (e as Error).message });
  }
  redirect(url);
}

/** Stripe's Customer Portal: change plan, card, cancel, invoices. */
export async function openPortal(): Promise<void> {
  const token = await tokenOr("/account/billing");
  let url: string;
  try {
    url = (await api<{ url: string }>("/v1/billing/portal", { method: "POST", body: {}, token })).url;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(signInPath("/account/billing"));
    back("/account/billing", { error: (e as Error).message });
  }
  redirect(url);
}

/** The server checks the key with Anthropic and stores it encrypted; it never comes back. */
export async function saveKey(formData: FormData): Promise<void> {
  const token = await tokenOr("/account/key");
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  if (!apiKey) back("/account/key", { error: "Paste your Anthropic API key first." });
  try {
    await api("/v1/me/anthropic-key", { method: "PUT", body: { apiKey }, token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(signInPath("/account/key"));
    back("/account/key", { error: (e as Error).message });
  }
  back("/account/key", { saved: "1" });
}

export async function removeKey(): Promise<void> {
  const token = await tokenOr("/account/key");
  try {
    await api("/v1/me/anthropic-key", { method: "DELETE", token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(signInPath("/account/key"));
    back("/account/key", { error: (e as Error).message });
  }
  back("/account/key", { removed: "1" });
}
