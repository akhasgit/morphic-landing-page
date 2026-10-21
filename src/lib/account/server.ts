// Server-side helpers for the account pages: the Morphic API, and the session cookie.
// The cookie holds the Morphic session (HTTP-only); the browser never sees the API token in scripts.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AccountInfo, ServerConfig, SessionInfo } from "./types";

export const SESSION_COOKIE = "morphic_session";
export const ACCOUNT_PATH = "/account";

/** The Morphic API server (MORPHIC_API_URL, e.g. https://api.example.com). */
export function apiUrl(): string {
  return (process.env.MORPHIC_API_URL ?? "http://localhost:8787").replace(/\/+$/, "");
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown; token?: string | null } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl()}${path}`, {
      method: init.method ?? "GET",
      headers: { "Content-Type": "application/json", ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}) },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(502, "Morphic's server can't be reached right now. Try again in a moment.");
  }
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new ApiError(response.status, body.error ?? `Morphic's server answered ${response.status}.`);
  return body as T;
}

export async function getServerConfig(): Promise<ServerConfig | null> {
  try {
    return await api<ServerConfig>("/v1/config");
  } catch {
    return null;
  }
}

export async function sessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export function sessionCookieOptions(expiresAt: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: new Date(expiresAt) };
}

/** Route Handlers and Server Functions only (cookies can't be set while rendering). */
export async function setSessionCookie(session: SessionInfo): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Only account paths after sign-in (no open redirects). */
export function safeNext(value: string | string[] | null | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith(ACCOUNT_PATH) && !next.startsWith("//") ? next : ACCOUNT_PATH;
}

export function signInPath(next: string): string {
  return `${ACCOUNT_PATH}/signin?next=${encodeURIComponent(next)}`;
}

/** The signed-in user's account, or a redirect to sign-in. */
export async function requireAccount(next: string): Promise<{ token: string; account: AccountInfo }> {
  const token = await sessionToken();
  if (!token) redirect(signInPath(next));
  let account: AccountInfo;
  try {
    account = await api<AccountInfo>("/v1/me", { token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect(signInPath(next));
    throw e;
  }
  return { token, account };
}

export function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
