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
import { LoaderCircle, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import type { CodeSent } from "@/lib/otp";
import { CodeEntry } from "./CodeEntry";

type Step = "password" | "register" | "verify" | "forgot" | "reset";

// API.md §4.2: parol 8–72 belgi, kamida bitta harf va bitta raqam.
function passwordIssue(password: string): string | null {
  if (password.length < 8 || password.length > 72) return "Parol 8–72 belgidan iborat bo‘lishi kerak.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Parolda kamida bitta harf va bitta raqam bo‘lishi kerak.";
  return null;
}

// VALIDATION_FAILED `errors` massivini olib keladi (API.md §2) — uni to'g'ridan-to'g'ri
// maydonlarga joylaymiz, `field` nomlari backend DTO'si bilan bir xil.
function fieldErrorsOf(error: unknown): Record<string, string> {
  if (!(error instanceof ClientApiError) || !Array.isArray(error.problem.errors)) return {};
  const map: Record<string, string> = {};
  for (const item of error.problem.errors) {
    if (item && typeof item.field === "string" && !map[item.field]) map[item.field] = item.message;
  }
  return map;
}

const fieldClass = "mt-2 h-[52px] w-full rounded-xl border border-line px-4 outline-none transition focus:border-cocoa focus:ring-4 focus:ring-cocoa/10";

export function EmailSignIn({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [meta, setMeta] = useState<CodeSent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Kod ekranidagi "Boshqa manzil" o'zi kelgan joyga qaytarsin: email xato terilgan bo'lsa,
  // ro'yxatdan o'tuvchi kirish formasiga emas, o'z formasiga qaytishi kerak.
  const [verifyFrom, setVerifyFrom] = useState<"password" | "register">("password");

  function backToPassword(message = "") {
    setStep("password");
    setMeta(null);
    setUnverified(false);
    setError("");
    setFieldErrors({});
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

  // Hisob `PENDING_VERIFICATION` holatida yaratiladi va javob 201 CodeSent bo'ladi —
  // keyingi qadam o'sha kod ekrani, u yerdagi verify-email tokenlarni beradi. Ya'ni
  // ro'yxatdan o'tgandan keyin alohida "kirish" qadami yo'q.
  async function register() {
    if (busy) return;
    const name = fullName.trim();
    const localIssues: Record<string, string> = {};
    if (name.length < 2 || name.length > 150) localIssues.fullName = "Ismni to‘liq kiriting (2–150 belgi).";
    const pwdIssue = passwordIssue(password);
    if (pwdIssue) localIssues.password = pwdIssue;
    if (Object.keys(localIssues).length) {
      setFieldErrors(localIssues);
      setError("");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    setFieldErrors({});
    try {
      const sent = await apiFetch<CodeSent>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password, fullName: name }),
      });
      setMeta(sent);
      setVerifyFrom("register");
      setStep("verify");
    } catch (err) {
      const fields = fieldErrorsOf(err);
      setFieldErrors(fields);
      if (err instanceof ClientApiError) {
        if (err.code === "EMAIL_ALREADY_REGISTERED") setError("Bu email allaqachon ro‘yxatdan o‘tgan — pastdan kirishga o‘ting.");
        else if (err.code === "VALIDATION_FAILED" && Object.keys(fields).length) setError("");
        else setError(err.message);
      } else {
        setError("Ro‘yxatdan o‘tib bo‘lmadi. Qayta urinib ko‘ring.");
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
      setVerifyFrom("password");
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
            <button
              type="button"
              className="ml-2 font-bold text-cocoa"
              onClick={() => { setMeta(null); setError(""); setStep(verifyFrom); }}
            >
              Boshqa manzil
            </button>
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

  if (step === "register") {
    return (
      <form onSubmit={(event) => { event.preventDefault(); void register(); }}>
        <p className="text-sm leading-6 text-bodyText">
          Ism, email va parol — tasdiqlash kodi pochtangizga keladi. Telefon raqam so‘ralmaydi:
          uni SMS orqali kirishda o‘rnatasiz.
        </p>

        <label htmlFor="register-name" className="mt-4 block text-sm font-bold">Ism-familiya</label>
        <div className="relative">
          <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bodyText" aria-hidden="true" />
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ali Valiyev"
            className={`${fieldClass} pl-11`}
          />
        </div>
        {fieldErrors.fullName && <p className="mt-1.5 text-sm font-medium text-danger">{fieldErrors.fullName}</p>}

        <label htmlFor="register-email" className="mt-4 block text-sm font-bold">Email</label>
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bodyText" aria-hidden="true" />
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="siz@example.com"
            className={`${fieldClass} pl-11`}
          />
        </div>
        {fieldErrors.email && <p className="mt-1.5 text-sm font-medium text-danger">{fieldErrors.email}</p>}

        <label htmlFor="register-password" className="mt-4 block text-sm font-bold">Parol</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Kamida 8 belgi, harf va raqam"
          className={fieldClass}
        />
        {fieldErrors.password && <p className="mt-1.5 text-sm font-medium text-danger">{fieldErrors.password}</p>}

        {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="button-primary mt-5 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda…</> : "Ro‘yxatdan o‘tish"}
        </button>
        <p className="mt-3 text-center text-sm text-bodyText">
          Hisobingiz bormi? <button type="button" onClick={() => backToPassword()} className="font-bold text-cocoa">Kirish</button>
        </p>
      </form>
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
      <p className="text-sm leading-6 text-bodyText">Email va parolingiz bilan kiring — ilovadagi hisob ham shu yerda ishlaydi.</p>
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
      <p className="mt-4 border-t border-line pt-4 text-center text-sm text-bodyText">
        Hisobingiz yo‘qmi?{" "}
        <button
          type="button"
          onClick={() => { setStep("register"); setError(""); setNotice(""); setFieldErrors({}); setUnverified(false); }}
          className="font-bold text-cocoa"
        >
          Ro‘yxatdan o‘tish
        </button>
      </p>
    </form>
  );
}
