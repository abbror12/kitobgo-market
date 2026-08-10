import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProblem } from "@/lib/store-api";
import { guard, kgBackendFetch, problemResponse, setSessionCookies, type TokenResponse } from "@/lib/server/session";

// API.md §4.2: POST /auth/login { email, password } → TokenResponse (newAccount doim false).
export function POST(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email || !password) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Email va parolni kiriting" });
    }

    const response = await kgBackendFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) return problemResponse(await readProblem(response));

    const tokens = await response.json() as TokenResponse;
    setSessionCookies(await cookies(), tokens);
    return NextResponse.json({ authenticated: true });
  });
}
