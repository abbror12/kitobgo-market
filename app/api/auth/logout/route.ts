import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSessionCookies, getRefreshToken, kgAuthedFetch } from "@/lib/server/session";

// API.md §4.3: POST /auth/logout (token + { refreshToken }) → 204.
// Backend chaqiruvi muvaffaqiyatsiz bo'lsa ham lokal cookie'lar tozalanadi.
export async function POST() {
  const store = await cookies();
  const refreshToken = getRefreshToken(store);
  if (refreshToken) {
    try {
      await kgAuthedFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Sessiya allaqachon o'lgan bo'lishi mumkin — baribir chiqib ketamiz.
    }
  }
  clearSessionCookies(store);
  return new NextResponse(null, { status: 204 });
}
