"use client";

// Checkout'ning yakuniy qadami: SMS kod (API.md §4.1).
// Bu yerda faqat kod tekshiriladi — buyurtmani ota-komponent joylashtiradi,
// chunki buyurtma ma'lumotlari o'sha yerda turadi.
//
// Kod so'rovi bu ekranga kirishdan OLDIN yuborilgan bo'ladi: forma to'liq
// tekshirilgandan keyingina SMS ketadi, aks holda soatiga 5 ta cheklov behuda sarflanadi.
import { ArrowLeft, LoaderCircle, MessageSquare, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { describeOtpError, type CodeSent } from "@/lib/otp";
import { formatSeconds, useCountdown } from "@/lib/use-countdown";

export function CheckoutCodeStep({
  phone,
  meta,
  total,
  placing,
  onVerified,
  onBack,
}: {
  phone: string;
  meta: CodeSent;
  total: string;
  placing: boolean;
  onVerified: (info: { newAccount: boolean }) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(() => Date.now() + meta.expiresInSeconds * 1000);
  const [resendAt, setResendAt] = useState<number | null>(() => Date.now() + meta.resendAfterSeconds * 1000);
  const inputRef = useRef<HTMLInputElement>(null);
  const verifyingRef = useRef(false);

  const expiresIn = useCountdown(expiresAt);
  const resendIn = useCountdown(resendAt);
  const locked = busy || placing;

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function verify(value: string) {
    if (verifyingRef.current || placing) return;
    verifyingRef.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await apiFetch<{ authenticated: boolean; newAccount: boolean }>("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code: value }),
      });
      onVerified({ newAccount: result.newAccount === true });
    } catch (err) {
      // Xato tili SMS va email oqimlari uchun bitta joyda: lib/otp.ts.
      const view = describeOtpError(err);
      setError(view.message);
      if (view.clearCode) setCode("");
      if (view.dead) setExpiresAt(null);
      else inputRef.current?.focus();
    } finally {
      verifyingRef.current = false;
      setBusy(false);
    }
  }

  async function resend() {
    if (locked || resendIn > 0) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const sent = await apiFetch<CodeSent>("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setCode("");
      setExpiresAt(Date.now() + sent.expiresInSeconds * 1000);
      setResendAt(Date.now() + sent.resendAfterSeconds * 1000);
      setNotice("Yangi kod yuborildi.");
      inputRef.current?.focus();
    } catch (err) {
      if (err instanceof ClientApiError) {
        const retryAfter = typeof err.problem.retryAfterSeconds === "number" ? err.problem.retryAfterSeconds : null;
        if (err.code === "OTP_RESEND_TOO_SOON" && retryAfter) setResendAt(Date.now() + retryAfter * 1000);
        setError(err.message);
      } else {
        setError("Kod yuborilmadi. Qayta urinib ko‘ring.");
      }
    } finally {
      setBusy(false);
    }
  }

  function onCodeChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, meta.codeLength);
    setCode(digits);
    if (digits.length === meta.codeLength && !locked) void verify(digits);
  }

  return (
    <section className="container-page py-8 sm:py-14">
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-cream p-6 shadow-soft sm:p-9">
        <button
          type="button"
          onClick={onBack}
          disabled={locked}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-cocoa transition hover:text-cocoaDark disabled:cursor-not-allowed disabled:text-muted"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Buyurtma ma’lumotlariga qaytish
        </button>

        <span className="mt-6 grid size-14 place-items-center rounded-2xl bg-sand text-cocoa">
          <MessageSquare size={26} aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold text-ink sm:text-3xl">Buyurtmani tasdiqlang</h2>
        <p className="mt-2 text-sm leading-6 text-bodyText">
          <strong className="text-ink">{phone}</strong> raqamiga {meta.codeLength} xonali kod yubordik.
          Kodni kiriting — buyurtma shu zahoti rasmiylashtiriladi.
        </p>
        <p className="mt-4 flex items-center justify-between rounded-xl border border-line bg-page px-4 py-3 text-sm">
          <span className="text-bodyText">To‘lanadigan summa</span>
          <strong className="font-serif text-lg font-semibold text-cocoa">{total}</strong>
        </p>

        <form
          className="mt-6"
          onSubmit={(event) => { event.preventDefault(); if (code.length === meta.codeLength) void verify(code); }}
        >
          <label htmlFor="checkout-code" className="block text-sm font-bold text-ink">SMS kod</label>
          <input
            id="checkout-code"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            disabled={locked}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder={"•".repeat(meta.codeLength)}
            className="mt-2 h-[56px] w-full rounded-xl border border-field bg-page px-4 text-center text-2xl font-extrabold tracking-[.5em] text-ink outline-none transition focus:border-cocoa focus:ring-4 focus:ring-cocoa/10 disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-bodyText">
            {expiresIn > 0 ? `Kod amal qilish muddati: ${formatSeconds(expiresIn)}` : "Kod muddati tugadi — yangisini so‘rang."}
          </p>

          {error && <p className="mt-3 rounded-xl bg-dangerSoft p-3 text-sm font-medium text-danger" role="alert">{error}</p>}
          {notice && !error && <p className="mt-3 text-sm font-medium text-cocoa" role="status">{notice}</p>}

          <button
            type="submit"
            disabled={locked || code.length !== meta.codeLength}
            className="button-primary mt-5 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placing
              ? <><LoaderCircle size={18} className="animate-spin" /> Buyurtma rasmiylashtirilmoqda…</>
              : busy
                ? <><LoaderCircle size={18} className="animate-spin" /> Tekshirilmoqda…</>
                : "Tasdiqlash va buyurtma berish"}
          </button>

          <button
            type="button"
            onClick={() => void resend()}
            disabled={locked || resendIn > 0}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-bold text-cocoa transition hover:text-cocoaDark disabled:cursor-not-allowed disabled:text-muted"
          >
            <RotateCw size={15} aria-hidden="true" />
            {resendIn > 0 ? `Qayta yuborish (${formatSeconds(resendIn)})` : "Kodni qayta yuborish"}
          </button>
        </form>
      </div>
    </section>
  );
}
