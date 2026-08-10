// Sessiya boshqaruvi: tokenlar httpOnly cookie'larda, backend chaqiruvlar route handler'larda.
//
// API.md §1: refresh token BIR MARTALIK — ishlatilgan zahoti eskisi bekor bo'ladi, eskisini
// qayta ko'rsatish butun sessiyani bekor qiladi. Shu sabab refresh almashinuvi bitta
// jarayon ichida refresh-token bo'yicha deduplikatsiya qilinadi va natija qisqa muddat
// keshda turadi: eski cookie bilan kechikib kelgan parallel so'rovlar backendga qayta
// murojaat qilmay, yangi tokenlarni oladi.
//
// Diqqat: bu mutex bitta Node jarayoni doirasida ishlaydi (next start / standalone).
// Bir nechta instansiyaga scale qilinsa, umumiy qulf (Redis) yoki sticky session kerak.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL, readProblem, type ApiProblem } from "@/lib/store-api";

const ACCESS_COOKIE = "kg_at";
const REFRESH_COOKIE = "kg_rt";
const REFRESH_REUSE_TTL_MS = 60_000;

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresAt: string;
  newAccount?: boolean;
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

const secureCookies = process.env.NODE_ENV === "production";

export const UNAUTHENTICATED_PROBLEM: ApiProblem = {
  status: 401,
  code: "UNAUTHENTICATED",
  detail: "Davom etish uchun tizimga kiring",
};

export class UnauthenticatedError extends Error {
  constructor() {
    super("UNAUTHENTICATED");
    this.name = "UnauthenticatedError";
  }
}

export function setSessionCookies(store: CookieStore, tokens: TokenResponse): void {
  // expiresIn dan 30s oldin cookie o'ladi — muddati o'tgan token bilan so'rov ketmasin.
  const accessMaxAge = Math.max(30, tokens.expiresIn - 30);
  const refreshMaxAge = Math.max(60, Math.floor((Date.parse(tokens.refreshExpiresAt) - Date.now()) / 1000));
  const common = { httpOnly: true, secure: secureCookies, sameSite: "lax" as const, path: "/" };
  store.set(ACCESS_COOKIE, tokens.accessToken, { ...common, maxAge: accessMaxAge });
  store.set(REFRESH_COOKIE, tokens.refreshToken, { ...common, maxAge: refreshMaxAge });
}

export function clearSessionCookies(store: CookieStore): void {
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export function getRefreshToken(store: CookieStore): string | undefined {
  return store.get(REFRESH_COOKIE)?.value;
}

// Backendga xom so'rov (tokensiz yoki berilgan token bilan).
export function kgBackendFetch(path: string, init?: RequestInit, accessToken?: string): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      "Accept-Language": "uz",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });
}

// --- Refresh almashinuvi (jarayon ichida yagona) ---

const refreshCache = new Map<string, { promise: Promise<TokenResponse | null>; at: number }>();

async function doRefresh(refreshToken: string): Promise<TokenResponse | null> {
  const response = await kgBackendFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  if (response.ok) return response.json() as Promise<TokenResponse>;
  if (response.status === 401 || response.status === 403) return null;
  // 5xx/tarmoq — sessiyani o'chirmaymiz, xatoni yuqoriga uzatamiz.
  const problem = await readProblem(response);
  throw new Error(`Refresh failed: ${problem.code}`);
}

function refreshExchange(refreshToken: string): Promise<TokenResponse | null> {
  const now = Date.now();
  for (const [key, entry] of refreshCache) {
    if (now - entry.at > REFRESH_REUSE_TTL_MS) refreshCache.delete(key);
  }
  let entry = refreshCache.get(refreshToken);
  if (!entry) {
    const promise = doRefresh(refreshToken);
    entry = { promise, at: now };
    refreshCache.set(refreshToken, entry);
    promise.catch(() => refreshCache.delete(refreshToken));
  }
  return entry.promise;
}

async function refreshSession(store: CookieStore): Promise<string | null> {
  const refreshToken = getRefreshToken(store);
  if (!refreshToken) return null;
  const tokens = await refreshExchange(refreshToken);
  if (!tokens) {
    clearSessionCookies(store);
    return null;
  }
  setSessionCookies(store, tokens);
  return tokens.accessToken;
}

// Token talab qiladigan backend chaqiruv: kerak bo'lsa refresh qilib bir marta qaytadan uradi.
// Sessiya yo'q bo'lsa UnauthenticatedError tashlaydi.
export async function kgAuthedFetch(path: string, init?: RequestInit): Promise<Response> {
  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    accessToken = (await refreshSession(store)) ?? undefined;
    if (!accessToken) throw new UnauthenticatedError();
  }

  let response = await kgBackendFetch(path, init, accessToken);
  if (response.status === 401) {
    const problem = await readProblem(response.clone());
    if (problem.code === "TOKEN_EXPIRED" || problem.code === "TOKEN_INVALID" || problem.code === "TOKEN_REVOKED" || problem.code === "UNAUTHENTICATED") {
      const freshToken = await refreshSession(store);
      if (!freshToken) throw new UnauthenticatedError();
      response = await kgBackendFetch(path, init, freshToken);
    }
  }
  return response;
}

// --- Route handler javob yordamchilari ---

export function problemResponse(problem: ApiProblem): NextResponse {
  return NextResponse.json(problem, { status: problem.status });
}

// Backend javobini (muvaffaqiyat yoki problem+json) mijozga o'zgartirmasdan uzatadi.
export async function passthrough(response: Response): Promise<NextResponse> {
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  if (!response.ok) return problemResponse(await readProblem(response));
  const body = await response.json().catch(() => null);
  return NextResponse.json(body, { status: response.status });
}

// Umumiy try/catch: UnauthenticatedError → 401 problem, qolgan xatolar → 503 problem.
export async function guard(run: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof UnauthenticatedError) return problemResponse(UNAUTHENTICATED_PROBLEM);
    console.error("KitobGo backend so'rovi muvaffaqiyatsiz:", error);
    return problemResponse({
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      detail: "Server bilan bog‘lanib bo‘lmadi. Birozdan so‘ng qayta urining.",
    });
  }
}
