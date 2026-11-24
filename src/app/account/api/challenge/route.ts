import { api } from "@/lib/account/server";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid origin" }, { status: 403 });
  try { return Response.json(await api("/v1/auth/challenge", { method: "POST" }), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Sign-in unavailable" }, { status: 503 }); }
}
