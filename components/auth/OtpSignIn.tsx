"use client";

// Telefon + SMS kod orqali kirish (API.md §4.1).
// Kod ekrani — umumiy [CodeEntry](./CodeEntry.tsx): katakchalar soni ham, taymerlar ham
// serverdan kelgan CodeSent dan boshqariladi, bu yerda hech qanday raqam yozilmagan.
import { LoaderCircle, Phone } from "lucide-react";
import { useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import type { CodeSent } from "@/lib/otp";
import { CodeEntry } from "./CodeEntry";

export interface OtpSuccess {
  newAccount: boolean;
}

export function OtpSignIn({ onSuccess, compact = false }: { onSuccess: (info: OtpSuccess) => void; compact?: boolean }) {
  const [phone, setPhone] = useState("+998 ");
  const [meta, setMeta] = useState<CodeSent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(): Promise<CodeSent> {
    return apiFetch<CodeSent>("/api/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone: phone.trim() }),
    });
  }

  async function sendFirstCode() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      setMeta(await requestCode());
    } catch (err) {
      if (err instanceof ClientApiError && err.code === "SMS_DELIVERY_FAILED") {
        // Bu holatda cooldown qo'yilmaydi — darhol qayta urinishga ruxsat beramiz.
        setError("SMS yuborilmadi — aloqada uzilish. Qayta urinib ko‘ring.");
      } else if (err instanceof ClientApiError) {
        // OTP_RESEND_TOO_SOON ham shu yerga tushadi: kod allaqachon yo'lda, lekin `codeLength`
        // bizda yo'q — kod ekranini taxmin bilan chizmaymiz, backend detail'ini ko'rsatamiz.
        setError(err.message);
      } else {
        setError("Kod yuborilmadi. Qayta urinib ko‘ring.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function verify(code: string) {
    const result = await apiFetch<{ authenticated: boolean; newAccount: boolean }>("/api/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone: phone.trim(), code }),
    });
    onSuccess({ newAccount: result.newAccount === true });
  }

  const heading = compact ? "" : "Telefon raqam orqali kirish";

  return (
    <div>
      {heading && <h2 className="font-serif text-2xl font-semibold sm:text-3xl">{heading}</h2>}
      {meta ? (
        <div className={compact ? "" : "mt-5"}>
          <CodeEntry
            meta={meta}
            inputId="otp-code"
            submitLabel="Kirish"
            description={
              <>
                <strong className="text-ink">{phone.trim()}</strong> raqamiga {meta.codeLength} xonali kod yubordik.
                <button
                  type="button"
                  className="ml-2 font-bold text-cocoa"
                  onClick={() => { setMeta(null); setError(""); }}
                >
                  O‘zgartirish
                </button>
              </>
            }
            onSubmit={verify}
            onResend={requestCode}
          />
        </div>
      ) : (
        <form
          className={compact ? "" : "mt-5"}
          onSubmit={(event) => { event.preventDefault(); void sendFirstCode(); }}
        >
          <p className="text-sm leading-6 text-bodyText">Tasdiqlash kodi SMS orqali yuboriladi.</p>
          <label htmlFor="otp-phone" className="mt-4 block text-sm font-bold">Telefon raqam</label>
          <div className="relative mt-2">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bodyText" aria-hidden="true" />
            <input
              id="otp-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+998 90 123 45 67"
              className="h-[52px] w-full rounded-xl border border-line py-3.5 pl-11 pr-4 outline-none transition focus:border-cocoa focus:ring-4 focus:ring-cocoa/10"
            />
          </div>
          {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="button-primary mt-4 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda…</> : "Kod olish"}
          </button>
        </form>
      )}
    </div>
  );
}
