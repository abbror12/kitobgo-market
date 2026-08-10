import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProblem } from "@/lib/store-api";
import { guard, kgBackendFetch, problemResponse, setSessionCookies, type TokenResponse } from "@/lib/server/session";

// API.md §4.1: POST /auth/otp/verify { phone, code } → TokenResponse.
// Tokenlar mijozga qaytarilmaydi — httpOnly cookie'larga yoziladi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { phone?: string; code?: string } | null;
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    if (!phone || !code) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Telefon raqam va kodni kiriting" });
    }

    const response = await kgBackendFetch("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
    if (!response.ok) return problemResponse(await readProblem(response));

    const tokens = await response.json() as TokenResponse;
    setSessionCookies(await cookies(), tokens);
    return NextResponse.json({ authenticated: true, newAccount: tokens.newAccount === true });
  });
}
