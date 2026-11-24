import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Navigation/prefetch must never create a Stripe checkout. The billing page's POST does that.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/account/billing", request.url), 303);
}
