"use client";

// Yagona kod ekrani — SMS ham, email ham shu komponent orqali tasdiqlanadi.
// Hech qanday raqam qattiq yozilmaydi: katakchalar soni, amal qilish muddati va qayta
// yuborish taymeri serverdan kelgan `CodeSent` dan o'qiladi (API.md §4.1 va §4.2).
import { LoaderCircle, RotateCw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { describeOtpError, type CodeSent } from "@/lib/otp";
import { formatSeconds, useCountdown } from "@/lib/use-countdown";

export function CodeEntry({
  meta,
  inputId,
  description,
  submitLabel,
  busyLabel = "Tekshirilmoqda…",
  externalBusy = false,
  onSubmit,
  onResend,
  children,
}: {
  meta: CodeSent;
  inputId: string;
  description: ReactNode;
  submitLabel: string;
  busyLabel?: string;
  /** Ota-komponent kodni tekshirgandan keyin ham band bo'lsa (masalan buyurtma joylayotgan bo'lsa). */
  externalBusy?: boolean;
  /** Xato matnini QAYTARSA — terilgan kod saqlanadi, faqat xabar chiqadi (masalan parol tekshiruvi). */
  onSubmit: (code: string) => Promise<string | void>;
  onResend: () => Promise<CodeSent>;
  /** Kod maydonidan keyin, tugmadan oldin qo'shiladigan maydonlar (parol tiklashda yangi parol). */
  children?: ReactNode;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(() => Date.now() + meta.expiresInSeconds * 1000);
  const [resendAt, setResendAt] = useState<number | null>(() => Date.now() + meta.resendAfterSeconds * 1000);
  const inputRef = useRef<HTMLInputElement>(null);
  const runningRef = useRef(false);

  const expiresIn = useCountdown(expiresAt);
  const resendIn = useCountdown(resendAt);
  const locked = busy || externalBusy;

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function submit(value: string) {
    if (runningRef.current || externalBusy) return;
    runningRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const problem = await onSubmit(value);
      if (problem) setError(problem);
    } catch (err) {
      const view = describeOtpError(err);
      setError(view.message);
      if (view.clearCode) setCode("");
      if (view.dead) setExpiresAt(null);
      if (!view.dead) inputRef.current?.focus();
    } finally {
      runningRef.current = false;
      setBusy(false);
    }
  }

  async function resend() {
    if (locked || resendIn > 0) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const sent = await onResend();
      setCode("");
      setExpiresAt(Date.now() + sent.expiresInSeconds * 1000);
      setResendAt(Date.now() + sent.resendAfterSeconds * 1000);
      setNotice("Yangi kod yuborildi.");
      inputRef.current?.focus();
    } catch (err) {
      setError(describeOtpError(err).message);
    } finally {
      setBusy(false);
    }
  }

  function onCodeChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, meta.codeLength);
    setCode(digits);
    // Qo'shimcha maydonlar bo'lsa (parol tiklash) o'z-o'zidan yubormaymiz — ular ham to'ldirilishi kerak.
    if (!children && digits.length === meta.codeLength && !locked) void submit(digits);
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); if (code.length === meta.codeLength) void submit(code); }}>
      <p className="text-sm leading-6 text-bodyText">{description}</p>

      <label htmlFor={inputId} className="mt-4 block text-sm font-bold text-ink">Kod</label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        disabled={locked}
        onChange={(event) => onCodeChange(event.target.value)}
        placeholder={"•".repeat(meta.codeLength)}
        className="mt-2 h-[52px] w-full rounded-xl border border-line bg-page px-4 text-center text-xl font-extrabold tracking-[.5em] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:opacity-60"
      />
      <p className="mt-2 text-xs text-bodyText">
        {expiresIn > 0 ? `Kod amal qilish muddati: ${formatSeconds(expiresIn)}` : "Kod muddati tugadi — yangisini so‘rang."}
      </p>

      {children}

      {error && <p className="mt-3 rounded-xl bg-dangerSoft p-3 text-sm font-medium text-danger" role="alert">{error}</p>}
      {notice && !error && <p className="mt-3 text-sm font-medium text-brand" role="status">{notice}</p>}

      <button
        type="submit"
        disabled={locked || code.length !== meta.codeLength}
        className="button-primary mt-4 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locked ? <><LoaderCircle size={18} className="animate-spin" /> {busyLabel}</> : submitLabel}
      </button>

      <button
        type="button"
        onClick={() => void resend()}
        disabled={locked || resendIn > 0}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-bold text-brand transition hover:text-brandDark disabled:cursor-not-allowed disabled:text-bodyText"
      >
        <RotateCw size={15} aria-hidden="true" />
        {resendIn > 0 ? `Qayta yuborish (${formatSeconds(resendIn)})` : "Kodni qayta yuborish"}
      </button>
    </form>
  );
}
