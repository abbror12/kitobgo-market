import { NextRequest } from "next/server";
import { guard, kgBackendFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/forgot-password { email } → 202 (ro'yxatdan o'tgan-o'tmaganidan qat'i nazar).
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { email?: string } | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Email manzilini kiriting" });
    }
    return passthrough(await kgBackendFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }));
  });
}
