// Brauzer → sayt ichki /api/* route'lariga so'rov yuboruvchi yordamchi.
// Route'lar backend xatolarini RFC 9457 ko'rinishida (code maydoni bilan) qaytaradi;
// mijoz faqat `code` bo'yicha shoxlanadi, `detail` esa foydalanuvchiga ko'rsatiladi.

export interface ClientProblem {
  status: number;
  code: string;
  detail?: string;
  errors?: Array<{ field: string; message: string }>;
  [extra: string]: unknown;
}

export class ClientApiError extends Error {
  readonly problem: ClientProblem;
  constructor(problem: ClientProblem) {
    super(problem.detail ?? messageForCode(problem.code));
    this.name = "ClientApiError";
    this.problem = problem;
  }
  get code() { return this.problem.code; }
  get status() { return this.problem.status; }
}

// detail har doim ham kelmaydi (masalan, tarmoq uzilganda) — shu holatlar uchun zaxira matnlar.
const CODE_MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Davom etish uchun tizimga kiring.",
  NETWORK_ERROR: "Internet bilan aloqa yo‘q. Qayta urinib ko‘ring.",
  RATE_LIMIT_EXCEEDED: "Juda ko‘p urinish bo‘ldi. Birozdan so‘ng qayta urining.",
  INTERNAL_ERROR: "Serverda xatolik yuz berdi. Birozdan so‘ng qayta urining.",
  SERVICE_UNAVAILABLE: "Xizmat vaqtincha ishlamayapti. Birozdan so‘ng qayta urining.",
};

export function messageForCode(code: string): string {
  return CODE_MESSAGES[code] ?? "Xatolik yuz berdi. Qayta urinib ko‘ring.";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ClientApiError({ status: 0, code: "NETWORK_ERROR" });
  }

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const code = typeof body?.code === "string" ? body.code : response.status >= 500 ? "INTERNAL_ERROR" : "MALFORMED_REQUEST";
    throw new ClientApiError({
      ...(body ?? {}),
      status: response.status,
      code,
      detail: typeof body?.detail === "string" ? body.detail : undefined,
    });
  }
  return body as T;
}
