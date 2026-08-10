import { NextRequest } from "next/server";
import { guard, kgAuthedFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §7.1: POST /payments { orderNumber, provider } → PaymentInitiation.
// Bir buyurtma uchun ikkinchi chaqiruv xuddi shu urinishni qaytaradi — retry xavfsiz.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { orderNumber?: string; provider?: string } | null;
    const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim() : "";
    const provider = body?.provider === "CLICK" || body?.provider === "PAYME" ? body.provider : null;
    if (!orderNumber || !provider) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Buyurtma raqami va to‘lov usulini tanlang" });
    }
    return passthrough(await kgAuthedFetch("/payments", {
      method: "POST",
      body: JSON.stringify({ orderNumber, provider }),
    }));
  });
}
