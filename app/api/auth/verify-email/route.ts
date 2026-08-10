import { NextRequest } from "next/server";
import { guard, kgBackendFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/verify-email { token } → 204.
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { token?: string } | null;
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (!token) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Tasdiqlash havolasi yaroqsiz" });
    }
    return passthrough(await kgBackendFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }));
  });
}
