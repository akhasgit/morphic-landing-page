import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { api, ApiError, SESSION_COOKIE, signInPath } from "@/lib/account/server";

/**
 * /account/upgrade?plan=pro&interval=month — what the site's "Try free" buttons link to.
 * Signs in first if needed, then goes straight to Stripe Checkout (or the portal for people who already pay).
 */
export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan") === "power" ? "power" : "pro";
  const interval = request.nextUrl.searchParams.get("interval") === "year" ? "year" : "month";
  const here = `/account/upgrade?plan=${plan}&interval=${interval}`;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL(signInPath(here), request.url));
  try {
    const { url } = await api<{ url: string }>("/v1/billing/checkout", { method: "POST", body: { plan, interval }, token });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return NextResponse.redirect(new URL(signInPath(here), request.url));
    return NextResponse.redirect(new URL(`/account/billing?error=${encodeURIComponent((e as Error).message)}`, request.url));
  }
}
