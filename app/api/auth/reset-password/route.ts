import { NextRequest } from "next/server";
import { guard, kgBackendFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/reset-password { email, code, newPassword } → 204.
//
// Token emas, pochtaga kelgan kod (MIGRATION_EMAIL_CODES.md). Javob 204 va cookie
// O'RNATILMAYDI — ataylab: tiklash barcha qurilmalardagi sessiyani uzadi, foydalanuvchi
// yangi parol bilan qaytadan kiradi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { email?: string; code?: string; newPassword?: string } | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    if (!email || !code || !newPassword) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Email, kod va yangi parolni kiriting" });
    }
    return passthrough(await kgBackendFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    }));
  });
}
