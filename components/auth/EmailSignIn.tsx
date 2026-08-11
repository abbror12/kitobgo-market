"use client";

// Email + parol orqali kirish (API.md §4.2) — Android ilovada email bilan ro'yxatdan
// o'tgan mijozlar uchun. Yangi hisoblar saytda telefon orqali ochiladi.
import { LoaderCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function EmailSignIn({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNeedsVerification(false);
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
          setNeedsVerification(true);
          setError("Email hali tasdiqlanmagan. Pochtangizga yuborilgan havolani oching.");
        } else if (err.code === "ACCOUNT_BLOCKED") setError("Akkauntingiz vaqtincha bloklangan. Qo‘llab-quvvatlash bilan bog‘laning.");
        else setError(err.message);
      } else {
        setError("Kirib bo‘lmadi. Qayta urinib ko‘ring.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (busy || resent) return;
    setBusy(true);
    try {
      await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setResent(true);
    } catch {
      // 202 doim qaytadi; bu yerga tushish — tarmoq muammosi.
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <p className="text-sm leading-6 text-bodyText">Ilovada email bilan ro‘yxatdan o‘tgan bo‘lsangiz, shu yerdan kiring.</p>
      <label htmlFor="login-email" className="mt-4 block text-sm font-bold">Email</label>
      <div className="relative mt-2">
        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bodyText" aria-hidden="true" />
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="siz@example.com"
          className="h-[52px] w-full rounded-xl border border-line py-3.5 pl-11 pr-4 outline-none transition focus:border-cocoa focus:ring-4 focus:ring-cocoa/10"
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
        className="mt-2 h-[52px] w-full rounded-xl border border-line px-4 outline-none transition focus:border-cocoa focus:ring-4 focus:ring-cocoa/10"
      />
      {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
      {needsVerification && (
        <button type="button" onClick={() => void resendVerification()} disabled={busy || resent} className="mt-2 text-sm font-bold text-cocoa disabled:text-bodyText">
          {resent ? "Havola yuborildi — pochtangizni tekshiring." : "Tasdiqlash havolasini qayta yuborish"}
        </button>
      )}
      <button type="submit" disabled={busy} className="button-primary mt-4 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? <><LoaderCircle size={18} className="animate-spin" /> Tekshirilmoqda…</> : "Kirish"}
      </button>
      <p className="mt-3 text-center text-sm text-bodyText">
        <Link href="/reset-password" className="font-bold text-cocoa">Parolni unutdingizmi?</Link>
      </p>
    </form>
  );
}
