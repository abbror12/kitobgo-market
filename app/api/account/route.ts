import { NextRequest } from "next/server";
import { guard, kgAuthedFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §5: GET /account → Profile; PUT /account { fullName } → Profile.
export function GET() {
  return guard(async () => passthrough(await kgAuthedFetch("/account")));
}

export function PUT(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as { fullName?: string } | null;
    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    if (!fullName) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Ism-familiyani kiriting" });
    }
    return passthrough(await kgAuthedFetch("/account", {
      method: "PUT",
      body: JSON.stringify({ fullName }),
    }));
  });
}
