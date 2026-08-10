import { NextRequest, NextResponse } from "next/server";
import { ApiError, getDeliveryOptions } from "@/lib/store-api";
import { problemResponse } from "@/lib/server/session";

// API.md §3.3 (ochiq): GET /regions/{id}/delivery-options?itemsTotal=…
// itemsTotal majburiy — bepul yetkazish chegarasi savat summasiga bog'liq.
export async function GET(request: NextRequest) {
  const regionId = Number(request.nextUrl.searchParams.get("regionId"));
  const itemsTotal = Number(request.nextUrl.searchParams.get("itemsTotal"));
  if (!Number.isFinite(regionId) || regionId <= 0 || !Number.isFinite(itemsTotal) || itemsTotal < 0) {
    return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Hudud va savat summasi noto‘g‘ri" });
  }
  try {
    return NextResponse.json(await getDeliveryOptions(regionId, itemsTotal));
  } catch (error) {
    if (error instanceof ApiError) return problemResponse(error.problem);
    return problemResponse({ status: 503, code: "SERVICE_UNAVAILABLE", detail: "Yetkazish narxini olib bo‘lmadi" });
  }
}
