import { NextRequest } from "next/server";
import { guard, kgBackendFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §4.1: POST /auth/otp/request { phone } → 202 CodeSent.
// Raqam erkin formatda qabul qilinadi — server o'zi normallashtiradi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { phone?: string } | null;
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    if (!phone) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Telefon raqamini kiriting" });
    }
    return passthrough(await kgBackendFetch("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }));
  });
}
