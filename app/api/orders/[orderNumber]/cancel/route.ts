import { NextRequest } from "next/server";
import { guard, kgAuthedFetch, passthrough } from "@/lib/server/session";

// API.md §6.4: POST /orders/{orderNumber}/cancel — faqat PENDING_PAYMENT holatida;
// UI tugmani statusdan emas, `cancellable` bayrog'idan yoqadi.
export function POST(request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  return guard(async () => {
    const { orderNumber } = await context.params;
    const body = await request.json().catch(() => null) as { reason?: string } | null;
    const reason = typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : undefined;
    return passthrough(await kgAuthedFetch(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    }));
  });
}
