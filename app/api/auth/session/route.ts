import { NextResponse } from "next/server";
import { readProblem, type ProfileDto } from "@/lib/store-api";
import { kgAuthedFetch, problemResponse, UnauthenticatedError } from "@/lib/server/session";

// Mijoz UI uchun sessiya holati: profil bilan birga qaytadi.
// Sessiya yo'qligi xato emas — { authenticated: false } bilan 200 qaytariladi.
export async function GET() {
  try {
    const response = await kgAuthedFetch("/account");
    if (!response.ok) {
      const problem = await readProblem(response);
      if (problem.status === 401) return NextResponse.json({ authenticated: false });
      return problemResponse(problem);
    }
    const profile = await response.json() as ProfileDto;
    return NextResponse.json({ authenticated: true, profile });
  } catch (error) {
    if (error instanceof UnauthenticatedError) return NextResponse.json({ authenticated: false });
    return NextResponse.json({ authenticated: false, degraded: true });
  }
}
