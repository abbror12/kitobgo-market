import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/store-api";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path?.startsWith("/uploads/") || path.includes("..")) {
    return NextResponse.json({ error: "Noto‘g‘ri rasm manzili" }, { status: 400 });
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate: 86400 } });
  if (!response.ok) return NextResponse.json({ error: "Rasm topilmadi" }, { status: response.status });

  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
