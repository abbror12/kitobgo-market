"use client";

// Telefon + SMS kod orqali kirish (API.md §4.1).
// Kod ekrani serverdan kelgan CodeSent qiymatlaridan boshqariladi:
// codeLength, expiresInSeconds, resendAfterSeconds — hech biri hard-code qilinmaydi.
import { LoaderCircle, Phone, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";

interface CodeSent {
  expiresInSeconds: number;
  codeLength: number;
  resendAfterSeconds: number;
}

export interface OtpSuccess {
  newAccount: boolean;
}

function useCountdown(target: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (!target) return 0;
  return Math.max(0, Math.ceil((target - now) / 1000));
}

function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function OtpSignIn({ onSuccess, compact = false }: { onSuccess: (info: OtpSuccess) => void; compact?: boolean }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+998 ");
  const [code, setCode] = useState("");
  const [meta, setMeta] = useState<CodeSent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const verifyingRef = useRef(false);

  const expiresIn = useCountdown(expiresAt);
  const resendIn = useCountdown(resendAt);

  useEffect(() => {
    if (step === "code") codeInputRef.current?.focus();
  }, [step]);

  async function requestCode(asResend = false) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const sent = await apiFetch<CodeSent>("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone: phone.trim() }),
      });
      setMeta(sent);
      setCode("");
      setStep("code");
      setExpiresAt(Date.now() + sent.expiresInSeconds * 1000);
      setResendAt(Date.now() + sent.resendAfterSeconds * 1000);
      if (asResend) setNotice("Yangi kod yuborildi.");
    } catch (err) {
      if (err instanceof ClientApiError) {
        const retryAfter = typeof err.problem.retryAfterSeconds === "number" ? err.problem.retryAfterSeconds : null;
        if (err.code === "OTP_RESEND_TOO_SOON" && retryAfter) {
          setResendAt(Date.now() + retryAfter * 1000);
          setStep("code");
          setError(err.message);
        } else if (err.code === "SMS_DELIVERY_FAILED") {
          setError("SMS yuborilmadi — aloqada uzilish. Qayta urinib ko‘ring.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Kod yuborilmadi. Qayta urinib ko‘ring.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function verify(value: string) {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await apiFetch<{ authenticated: boolean; newAccount: boolean }>("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone: phone.trim(), code: value }),
      });
      onSuccess({ newAccount: result.newAccount });
    } catch (err) {
      setCode("");
      if (err instanceof ClientApiError) {
        // OTP_EXPIRED / OTP_TOO_MANY_ATTEMPTS — kod o'lgan; yangisini so'rashga qaytamiz.
        if (err.code === "OTP_EXPIRED" || err.code === "OTP_TOO_MANY_ATTEMPTS") {
          setStep("phone");
          setError("Kod eskirdi yoki bekor bo‘ldi. Yangi kod so‘rang.");
        } else if (err.code === "OTP_INVALID") {
          setError("Kod noto‘g‘ri. Qayta tering.");
          codeInputRef.current?.focus();
        } else if (err.code === "ACCOUNT_BLOCKED") {
          setError("Akkauntingiz vaqtincha bloklangan. Qo‘llab-quvvatlash bilan bog‘laning.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Tekshirib bo‘lmadi. Qayta urinib ko‘ring.");
      }
    } finally {
      verifyingRef.current = false;
      setBusy(false);
    }
  }

  function onCodeChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, meta?.codeLength ?? 6);
    setCode(digits);
    if (meta && digits.length === meta.codeLength && !busy) void verify(digits);
  }

  const heading = compact ? "" : "Telefon raqam orqali kirish";

  return (
    <div>
      {heading && <h2 className="text-2xl font-extrabold sm:text-3xl">{heading}</h2>}
      {step === "phone" ? (
        <form
          className={compact ? "" : "mt-5"}
          onSubmit={(event) => { event.preventDefault(); void requestCode(); }}
        >
          <p className="text-sm leading-6 text-muted">Tasdiqlash kodi SMS orqali yuboriladi.</p>
          <label htmlFor="otp-phone" className="mt-4 block text-sm font-bold">Telefon raqam</label>
          <div className="relative mt-2">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="otp-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+998 90 123 45 67"
              className="h-[52px] w-full rounded-xl border border-line py-3.5 pl-11 pr-4 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </div>
          {error && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="button-primary mt-4 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda…</> : "Kod olish"}
          </button>
        </form>
      ) : (
        <form
          className={compact ? "" : "mt-5"}
          onSubmit={(event) => { event.preventDefault(); if (meta && code.length === meta.codeLength) void verify(code); }}
        >
          <p className="text-sm leading-6 text-muted">
            <strong className="text-ink">{phone.trim()}</strong> raqamiga {meta?.codeLength ?? 4} xonali kod yubordik.
            <button type="button" className="ml-2 font-bold text-brand" onClick={() => { setStep("phone"); setError(""); setNotice(""); }}>O‘zgartirish</button>
          </p>
          <label htmlFor="otp-code" className="mt-4 block text-sm font-bold">SMS kod</label>
          <input
            id="otp-code"
            ref={codeInputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder={"•".repeat(meta?.codeLength ?? 4)}
            className="mt-2 h-[52px] w-full rounded-xl border border-line px-4 text-center text-xl font-extrabold tracking-[.5em] outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>{expiresIn > 0 ? `Kod amal qilish muddati: ${formatSeconds(expiresIn)}` : "Kod muddati tugadi — yangisini so‘rang."}</span>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-red-600" role="alert">{error}</p>}
          {notice && <p className="mt-3 text-sm font-medium text-brand" role="status">{notice}</p>}
          <button
            type="submit"
            disabled={busy || !meta || code.length !== meta.codeLength}
            className="button-primary mt-4 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <><LoaderCircle size={18} className="animate-spin" /> Tekshirilmoqda…</> : "Kirish"}
          </button>
          <button
            type="button"
            onClick={() => void requestCode(true)}
            disabled={busy || resendIn > 0}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-bold text-brand disabled:cursor-not-allowed disabled:text-muted"
          >
            <RotateCw size={15} aria-hidden="true" />
            {resendIn > 0 ? `Qayta yuborish (${formatSeconds(resendIn)})` : "Kodni qayta yuborish"}
          </button>
        </form>
      )}
    </div>
  );
}
