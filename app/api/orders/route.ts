import { NextRequest } from "next/server";
import { guard, kgAuthedFetch, passthrough } from "@/lib/server/session";

// API.md §6.4: GET /orders?page=&size= → PageResponse<OrderSummary>, eng yangisi birinchi.
export function GET(request: NextRequest) {
  return guard(async () => {
    const page = Math.max(0, Number.parseInt(request.nextUrl.searchParams.get("page") ?? "0", 10) || 0);
    const size = Math.min(50, Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("size") ?? "20", 10) || 20));
    return passthrough(await kgAuthedFetch(`/orders?page=${page}&size=${size}`));
  });
}
