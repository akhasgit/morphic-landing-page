import { api } from "@/lib/account/server";
import type { PlanCatalog } from "@/lib/catalog";
export async function GET() {
  try { return Response.json(await api<PlanCatalog>("/v1/catalog"), { headers: { "Cache-Control": "public, max-age=60" } }); }
  catch { return Response.json({ error: "Pricing is temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
