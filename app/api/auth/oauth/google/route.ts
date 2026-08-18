import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProblem } from "@/lib/store-api";
import { guard, kgBackendFetch, problemResponse, setSessionCookies, type TokenResponse } from "@/lib/server/session";

// API.md §4.1a: POST /auth/oauth/google { idToken } → 200 TokenResponse.
//
// idToken brauzerda Google Identity Services'dan olinadi va faqat shu route orqali
// backendga boradi; qaytgan tokenlar httpOnly cookie'ga yoziladi — mijozga berilmaydi.
//
// Hisob qanday topilishi (API.md §4.1a): avval bog'langan identifikator; bo'lmasa Google
// tasdiqlagan email bilan mavjud hisob topiladi va unga bog'lanadi; u ham bo'lmasa yangi
// hisob ochiladi (`newAccount: true`, parolsiz).
//
// Xatolar o'zgartirilmasdan uzatiladi: 503 OAUTH_PROVIDER_DISABLED (serverda Google
// client id sozlanmagan), 401 OAUTH_TOKEN_INVALID (token tekshiruvdan o'tmadi).
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { idToken?: string } | null;
    const idToken = typeof body?.idToken === "string" ? body.idToken.trim() : "";
    if (!idToken) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Google tasdiqlash tokeni yetishmayapti" });
    }

    const response = await kgBackendFetch("/auth/oauth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) return problemResponse(await readProblem(response));

    const tokens = await response.json() as TokenResponse;
    setSessionCookies(await cookies(), tokens);
    return NextResponse.json({ authenticated: true, newAccount: tokens.newAccount === true });
  });
}
