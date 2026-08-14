// Kod bilan tasdiqlash: SMS (API.md §4.1) va email (§4.2) oqimlari uchun umumiy tur va xato tili.
//
// 2026-08-14: backend email tasdiqlash va parol tiklashni havoladan 6 xonali kodga o'tkazdi
// (`MIGRATION_EMAIL_CODES.md`). Ikkala oqim endi AYNAN bir xil `CodeSent` obyektini va
// aynan bir xil xato kodlarini qaytaradi — shuning uchun ular shu yerda bir marta yoziladi.

import { ClientApiError } from "@/lib/client-api";

/** Server bergan kod ekrani parametrlari. SMS: 4 xona / 2 daqiqa, email: 6 xona / 10 daqiqa. */
export interface CodeSent {
  expiresInSeconds: number;
  codeLength: number;
  resendAfterSeconds: number;
}

export interface OtpErrorView {
  message: string;
  /** Katakchalarni tozalash kerakmi — noto'g'ri kod terilgan bo'lsa. */
  clearCode: boolean;
  /** Kodning o'zi o'lgan: yangisini so'ramasdan qayta urinishdan foyda yo'q. */
  dead: boolean;
}

export function describeOtpError(error: unknown): OtpErrorView {
  if (!(error instanceof ClientApiError)) {
    return { message: "Tekshirib bo‘lmadi. Qayta urinib ko‘ring.", clearCode: true, dead: false };
  }
  switch (error.code) {
    // Taxminlar tugashi kodning o'zini yo'q qiladi, ya'ni to'g'ri kod ham ishlamay qoladi —
    // ikkalasi ham bitta joyga olib boradi: yangi kod so'rash.
    case "OTP_EXPIRED":
    case "OTP_TOO_MANY_ATTEMPTS":
      return { message: "Kod eskirdi yoki bekor bo‘ldi. Yangi kod so‘rang.", clearCode: true, dead: true };
    case "OTP_INVALID":
      return { message: "Kod noto‘g‘ri. Qayta tering.", clearCode: true, dead: false };
    case "ACCOUNT_BLOCKED":
      return { message: "Akkauntingiz vaqtincha bloklangan. Qo‘llab-quvvatlash bilan bog‘laning.", clearCode: false, dead: false };
    // RATE_LIMIT_EXCEEDED va qolganlari — backend uz tilidagi `detail` ni beradi.
    default:
      return { message: error.message, clearCode: false, dead: false };
  }
}
