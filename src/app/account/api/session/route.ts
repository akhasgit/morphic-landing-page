import { api, ApiError, clearSessionCookie, setSessionCookie } from "@/lib/account/server";
import type { SessionInfo } from "@/lib/account/types";

/** Exchanges a Google ID token (or, on local servers, a developer sign-in) for a Morphic session cookie. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { idToken?: unknown; dev?: unknown };
  try {
    const session =
      body.dev === true
        ? await api<SessionInfo>("/v1/auth/dev", { method: "POST", body: {} })
        : await api<SessionInfo>("/v1/auth/google", { method: "POST", body: { idToken: typeof body.idToken === "string" ? body.idToken : "" } });
    await setSessionCookie(session);
    return Response.json({ ok: true, email: session.user.email });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: e instanceof ApiError ? e.status : 500 });
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return Response.json({ ok: true });
}
