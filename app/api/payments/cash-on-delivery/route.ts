import { NextRequest } from "next/server";
import { guard, kgAuthedFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §7.1: POST /payments/cash-on-delivery { orderNumber } → OrderDetail (darhol PROCESSING).
// Buyurtma 30 daqiqalik to'lov oynasidan chiqadi; endi mijoz tomonidan bekor qilinmaydi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { orderNumber?: string } | null;
    const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim() : "";
    if (!orderNumber) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Buyurtma raqami ko‘rsatilmadi" });
    }
    return passthrough(await kgAuthedFetch("/payments/cash-on-delivery", {
      method: "POST",
      body: JSON.stringify({ orderNumber }),
    }));
  });
}
