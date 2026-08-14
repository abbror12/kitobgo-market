import { NextRequest } from "next/server";
import { guard, kgBackendFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/register { email, password, fullName } → 201 CodeSent.
//
// Bu yerda cookie o'rnatilmaydi — ro'yxatdan o'tish hisobni `PENDING_VERIFICATION` holatida
// yaratadi, tokenlar esa keyingi qadamda, /auth/verify-email dan keladi.
// Telefon maydoni yo'q: raqam faqat §4.1 (SMS) orqali o'rnatiladi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { email?: string; password?: string; fullName?: string } | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    if (!email || !password || !fullName) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Ism, email va parolni kiriting" });
    }
    // 409 EMAIL_ALREADY_REGISTERED va 400 VALIDATION_FAILED (`errors` massivi bilan)
    // o'zgartirilmasdan uzatiladi — forma ularni maydonlarga joylaydi.
    return passthrough(await kgBackendFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    }));
  });
}
