import { api, ApiError, clearSessionCookie, setSessionCookie, sessionToken } from "@/lib/account/server";
import type { SessionInfo } from "@/lib/account/types";

/** Exchanges a Google ID token (or, on local servers, a developer sign-in) for a Morphic session cookie. */
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { idToken?: unknown; nonce?: unknown; dev?: unknown };
  try {
    const session =
      body.dev === true
        ? await api<SessionInfo>("/v1/auth/dev", { method: "POST", body: {} })
        : await api<SessionInfo>("/v1/auth/google", { method: "POST", body: { idToken: typeof body.idToken === "string" ? body.idToken : "", nonce: typeof body.nonce === "string" ? body.nonce : "" } });
    await setSessionCookie(session);
    return Response.json({ ok: true, email: session.user.email });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: e instanceof ApiError ? e.status : 500 });
  }
}

export async function DELETE(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const token = await sessionToken();
  if (token) await api("/v1/auth/logout", { method: "POST", token }).catch(() => {});
  await clearSessionCookie();
  return Response.json({ ok: true });
}
