"use client";

// Email + parol orqali kirish (API.md §4.2) — ilovada email bilan ro'yxatdan o'tgan
// mijozlar uchun. Yangi hisoblar saytda telefon orqali ochiladi.
//
// 2026-08-14: emailni tasdiqlash va parolni tiklash HAVOLA emas, pochtaga kelgan KOD
// (MIGRATION_EMAIL_CODES.md). Alohida sahifa kerak emas — ikkala oqim ham shu panel ichida,
// telefon oqimidagi kod ekranining o'zi bilan yuriladi.
//
// Hujjatning §4 "ikkita jimligi": /resend-verification va /forgot-password har doim 202
// qaytaradi — manzil ro'yxatda bo'lmasa ham, cooldown hali tugamagan bo'lsa ham. Shuning
// uchun 202 hech qachon "manzil topilmadi" deb talqin qilinmaydi va bu yerdagi matnlar
// hisob bor-yo'qligini oshkor qilmaydi.
import { LoaderCircle, Mail } from "lucide-react";
import { useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import type { CodeSent } from "@/lib/otp";
import { CodeEntry } from "./CodeEntry";

type Step = "password" | "verify" | "forgot" | "reset";

// API.md §4.2: parol 8–72 belgi, kamida bitta harf va bitta raqam.
function passwordIssue(password: string): string | null {
  if (password.length < 8 || password.length > 72) return "Parol 8–72 belgidan iborat bo‘lishi kerak.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Parolda kamida bitta harf va bitta raqam bo‘lishi kerak.";
  return null;
}

const fieldClass = "mt-2 h-[52px] w-full rounded-xl border border-line px-4 outline-none transition focus:border-cocoa focus:ring-4 focus:ring-cocoa/10";

export function EmailSignIn({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [meta, setMeta] = useState<CodeSent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [unverified, setUnverified] = useState(false);

  function backToPassword(message = "") {
    setStep("password");
    setMeta(null);
    setUnverified(false);
    setError("");
    setNotice(message);
  }

  async function signIn() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    setUnverified(false);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      onSuccess();
    } catch (err) {
      if (err instanceof ClientApiError) {
        if (err.code === "INVALID_CREDENTIALS") setError("Email yoki parol noto‘g‘ri.");
        else if (err.code === "EMAIL_NOT_VERIFIED") {
          // Hujjat aniq aytadi: parol ekranida qoldirmang, kod ekraniga olib o'ting.
          setUnverified(true);
          setError("Bu email hali tasdiqlanmagan. Pochtangizga tasdiqlash kodini yuboramiz.");
        } else if (err.code === "ACCOUNT_BLOCKED") setError("Akkauntingiz vaqtincha bloklangan. Qo‘llab-quvvatlash bilan bog‘laning.");
        else setError(err.message);
      } else {
        setError("Kirib bo‘lmadi. Qayta urinib ko‘ring.");
      }
    } finally {
      setBusy(false);
    }
  }

  const requestVerificationCode = (): Promise<CodeSent> =>
    apiFetch<CodeSent>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });

  const requestResetCode = (): Promise<CodeSent> =>
    apiFetch<CodeSent>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });

  async function sendCode(request: () => Promise<CodeSent>, next: Step) {
    if (busy || !email.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      setMeta(await request());
      setStep(next);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Kod yuborilmadi. Qayta urinib ko‘ring.");
    } finally {
      setBusy(false);
    }
  }

  // Kodga javob berish pochtani isbotlaydi — bu parol isbotlaydigan narsaning o'zi,
  // shuning uchun route cookie'larni o'rnatadi va alohida login qadami yo'q (§3).
  async function verifyEmail(code: string) {
    await apiFetch("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), code }),
    });
    onSuccess();
  }

  // 204 — token BERILMAYDI (ataylab): barcha qurilmalardagi sessiya uziladi, foydalanuvchi
  // yangi parol bilan qaytadan kiradi.
  async function resetPassword(code: string): Promise<string | void> {
    const issue = passwordIssue(newPassword);
    if (issue) return issue;
    if (newPassword !== confirm) return "Parollar bir-biriga mos kelmadi.";
    await apiFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), code, newPassword }),
    });
    setPassword("");
    setNewPassword("");
    setConfirm("");
    backToPassword("Parol yangilandi. Yangi parol bilan kiring.");
  }

  if (step === "verify" && meta) {
    return (
      <CodeEntry
        meta={meta}
        inputId="verify-email-code"
        submitLabel="Tasdiqlash va kirish"
        description={
          <>
            <strong className="text-ink">{email.trim()}</strong> manziliga {meta.codeLength} xonali kod yubordik.
            Spam papkasini ham tekshiring.
            <button type="button" className="ml-2 font-bold text-cocoa" onClick={() => backToPassword()}>Boshqa manzil</button>
          </>
        }
        onSubmit={verifyEmail}
        onResend={requestVerificationCode}
      />
    );
  }

  if (step === "reset" && meta) {
    return (
      <CodeEntry
        meta={meta}
        inputId="reset-password-code"
        submitLabel="Parolni yangilash"
        busyLabel="Saqlanmoqda…"
        description={
          <>
            Agar <strong className="text-ink">{email.trim()}</strong> ro‘yxatdan o‘tgan bo‘lsa, unga {meta.codeLength} xonali
            kod yubordik. Spam papkasini ham tekshiring.
            <button type="button" className="ml-2 font-bold text-cocoa" onClick={() => backToPassword()}>Bekor qilish</button>
          </>
        }
        onSubmit={resetPassword}
        onResend={requestResetCode}
      >
        <label htmlFor="new-password" className="mt-4 block text-sm font-bold">Yangi parol</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Kamida 8 belgi, harf va raqam"
          className={fieldClass}
        />
        <label htmlFor="confirm-password" className="mt-4 block text-sm font-bold">Yangi parolni takrorlang</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={fieldClass}
        />
      </CodeEntry>
    );
  }

  if (step === "forgot") {
    return (
      <form onSubmit={(event) => { event.preventDefault(); void sendCode(requestResetCode, "reset"); }}>
        <p className="text-sm leading-6 text-bodyText">Email manzilingizni kiriting — parolni yangilash uchun kod yuboramiz.</p>
        <label htmlFor="forgot-email" className="mt-4 block text-sm font-bold">Email</label>
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bodyText" aria-hidden="true" />
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="siz@example.com"
            className={`${fieldClass} pl-11`}
          />
        </div>
        {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="button-primary mt-4 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda…</> : "Kod yuborish"}
        </button>
        <button type="button" onClick={() => backToPassword()} className="mt-3 w-full text-sm font-bold text-cocoa">
          Kirishga qaytish
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void signIn(); }}>
      <p className="text-sm leading-6 text-bodyText">Ilovada email bilan ro‘yxatdan o‘tgan bo‘lsangiz, shu yerdan kiring.</p>
      {notice && <p className="mt-3 rounded-xl bg-sand/60 p-3 text-sm font-medium text-cocoa" role="status">{notice}</p>}
      <label htmlFor="login-email" className="mt-4 block text-sm font-bold">Email</label>
      <div className="relative">
        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bodyText" aria-hidden="true" />
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="siz@example.com"
          className={`${fieldClass} pl-11`}
        />
      </div>
      <label htmlFor="login-password" className="mt-4 block text-sm font-bold">Parol</label>
      <input
        id="login-password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
        className={fieldClass}
      />
      {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
      {unverified && (
        <button
          type="button"
          onClick={() => void sendCode(requestVerificationCode, "verify")}
          disabled={busy}
          className="mt-2 text-sm font-bold text-cocoa disabled:text-bodyText"
        >
          Tasdiqlash kodini yuborish
        </button>
      )}
      <button type="submit" disabled={busy} className="button-primary mt-4 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? <><LoaderCircle size={18} className="animate-spin" /> Tekshirilmoqda…</> : "Kirish"}
      </button>
      <p className="mt-3 text-center text-sm text-bodyText">
        <button type="button" onClick={() => { setStep("forgot"); setError(""); setNotice(""); }} className="font-bold text-cocoa">
          Parolni unutdingizmi?
        </button>
      </p>
    </form>
  );
}
