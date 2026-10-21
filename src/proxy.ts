import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "morphic_session";
/** Sessions last 30 days; renew them in their last week so returning visitors stay signed in. */
const REFRESH_WITHIN_MS = 7 * 24 * 3600 * 1000;

/**
 * Account pages only (marketing pages never pass through here):
 * - with ACCOUNT_HOST set (a custom account domain), /account/* moves to that host;
 * - sessions close to expiring are renewed with the Morphic API.
 */
export async function proxy(request: NextRequest) {
  const accountHost = process.env.ACCOUNT_HOST?.trim();
  if (accountHost && request.nextUrl.host !== accountHost) {
    return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, `https://${accountHost}`), 308);
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expiresAt = token ? expiryOf(token) : null;
  if (!token || !expiresAt || expiresAt - Date.now() > REFRESH_WITHIN_MS) return NextResponse.next();
  try {
    const api = (process.env.MORPHIC_API_URL ?? "http://localhost:8787").replace(/\/+$/, "");
    const response = await fetch(`${api}/v1/auth/refresh`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return NextResponse.next();
    const session = (await response.json()) as { token: string; expiresAt: number };
    const next = NextResponse.next();
    next.cookies.set(SESSION_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(session.expiresAt) });
    return next;
  } catch {
    return NextResponse.next();
  }
}

/** The JWT's expiry (not verified here; the API verifies every request). */
function expiryOf(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? "")) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/account/:path*"],
};
