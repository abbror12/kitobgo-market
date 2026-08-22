import { NextRequest } from "next/server";
import { guard, kgAuthedFetch, passthrough, problemResponse } from "@/lib/server/session";

// API.md §5: GET /account → Profile; PUT /account { firstName, lastName? } → Profile.
export function GET() {
  return guard(async () => passthrough(await kgAuthedFetch("/account")));
}

// Ikki shakl qabul qilinadi:
//  - { firstName, lastName? } — profil tahriri (yangi shakl). lastName bo'sh bo'lsa
//    "familiya yo'q" — katak qanday bo'lsa shunday uzatiladi, backend shunday kutadi.
//    Validatsiya xatolari (errors[].field = firstName | lastName) o'zgartirilmasdan
//    qaytadi — forma ularni kataklarga joylaydi; "ism umuman yo'q" ham firstName ostida.
//  - { fullName } — eski shakl, checkout'dagi bitta katakdan kelgan ism uchun
//    (CheckoutForm, newAccount). Backend qabul qiladi va qismlarni tozalaydi — bitta
//    satrdan kelgan ism uchun bu to'g'ri yo'l (tartib noma'lum, bo'lib bo'lmaydi).
export function PUT(request: NextRequest) {
  return guard(async () => {
    const body = await request.json().catch(() => null) as
      { firstName?: string; lastName?: string; fullName?: string } | null;

    if (typeof body?.firstName === "string" || typeof body?.lastName === "string") {
      const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
      const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
      return passthrough(await kgAuthedFetch("/account", {
        method: "PUT",
        body: JSON.stringify({ firstName, lastName }),
      }));
    }

    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    if (!fullName) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Ismni kiriting" });
    }
    return passthrough(await kgAuthedFetch("/account", {
      method: "PUT",
      body: JSON.stringify({ fullName }),
    }));
  });
}
