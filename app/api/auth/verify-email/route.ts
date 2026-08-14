import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProblem } from "@/lib/store-api";
import { guard, kgBackendFetch, problemResponse, setSessionCookies, type TokenResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/verify-email { email, code } → 200 TokenResponse.
//
// Diqqat: bu endi 204 EMAS. Kodga javob berish pochtani isbotlaydi — bu parol
// isbotlaydigan narsaning o'zi — shuning uchun backend darhol tokenlar beradi va bu route
// ularni login route'i kabi httpOnly cookie'larga yozadi (MIGRATION_EMAIL_CODES.md §7).
// Mijozga tokenlar berilmaydi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { email?: string; code?: string } | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    if (!email || !code) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Email va tasdiqlash kodini kiriting" });
    }

    const response = await kgBackendFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    // 401 OTP_INVALID / OTP_EXPIRED, 429 OTP_TOO_MANY_ATTEMPTS, 403 ACCOUNT_BLOCKED —
    // o'zgartirmasdan uzatiladi, mijoz `code` bo'yicha shoxlanadi.
    if (!response.ok) return problemResponse(await readProblem(response));

    const tokens = await response.json() as TokenResponse;
    setSessionCookies(await cookies(), tokens);
    return NextResponse.json({ authenticated: true });
  });
}
