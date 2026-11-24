import { apiUrl, sessionToken } from "@/lib/account/server";

export async function GET(request: Request) {
  const headers = new Headers({ "Cache-Control": "private, no-store", "Content-Type": "application/json" });
  const token = await sessionToken();
  if (!token) return Response.json({ error: "Sign in required" }, { status: 401, headers });
  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl()}/v1/me/export`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", redirect: "error", signal: request.signal });
  } catch {
    return Response.json({ error: "History export is temporarily unavailable." }, { status: 502, headers });
  }
  if (upstream.ok) headers.set("Content-Disposition", 'attachment; filename="morphic-history.json"');
  return new Response(upstream.body, { status: upstream.status, headers });
}
