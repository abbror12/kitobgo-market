import { NextRequest } from "next/server";
import { guard, kgBackendFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/resend-verification { email } → 202 CodeSent (havola emas, kod).
//
// forgot-password kabi, 202 doim keladi — cooldown ichida ham, manzil ro'yxatda bo'lmasa ham.
// Bu endpointlarda OTP_RESEND_TOO_SOON YO'Q; taymer javobdagi resendAfterSeconds dan yuriladi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { email?: string } | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Email manzilini kiriting" });
    }
    return passthrough(await kgBackendFetch("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }));
  });
}
