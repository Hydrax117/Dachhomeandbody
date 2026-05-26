import { NextRequest, NextResponse } from "next/server"
import { getShippingFeeForState } from "@/lib/shipping"

/**
 * GET /api/shipping-fee?state=Lagos
 * Returns the shipping fee for the given Nigerian state.
 * Returns { fee: number | null } — null means no rate configured.
 */
export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state")
  if (!state) {
    return NextResponse.json({ error: "state param required" }, { status: 400 })
  }

  const fee = await getShippingFeeForState(state)
  return NextResponse.json({ fee })
}
