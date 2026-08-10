import { NextRequest } from "next/server";
import { guard, kgAuthedFetch, passthrough } from "@/lib/server/session";

// API.md §6.4: GET /orders/{orderNumber} → OrderDetail. Buyurtma faqat orderNumber bilan olinadi.
export function GET(_request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  return guard(async () => {
    const { orderNumber } = await context.params;
    return passthrough(await kgAuthedFetch(`/orders/${encodeURIComponent(orderNumber)}`));
  });
}
