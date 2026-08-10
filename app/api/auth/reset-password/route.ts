import { NextRequest } from "next/server";
import { guard, kgBackendFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/reset-password { token, newPassword } → 204, barcha qurilmalardan chiqaradi.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { token?: string; newPassword?: string } | null;
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    if (!token || !newPassword) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Havola yoki yangi parol yetishmayapti" });
    }
    return passthrough(await kgBackendFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }));
  });
}
