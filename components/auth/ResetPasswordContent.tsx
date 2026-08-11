"use client";

// Backend xatidagi havola: https://kitobgo.com/reset-password?token=…
// Token bilan: yangi parol formasi → POST /auth/reset-password (204 — barcha qurilmalardan chiqaradi).
// Tokensiz: parolni tiklash so'rovi → POST /auth/forgot-password (202 doim).
import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";

export function ResetPasswordContent({ token }: { token: string | null }) {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-[28px] border border-line bg-cream p-7 shadow-soft sm:p-12">
        {token ? <ResetForm token={token} /> : <ForgotForm />}
      </div>
    </section>
  );
}

// API.md §4.2: parol 8–72 belgi, kamida bitta harf va bitta raqam.
function passwordIssue(password: string): string | null {
  if (password.length < 8 || password.length > 72) return "Parol 8–72 belgidan iborat bo‘lishi kerak.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return "Parolda kamida bitta harf va bitta raqam bo‘lishi kerak.";
  return null;
}

function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [expired, setExpired] = useState(false);

  async function submit() {
    if (busy) return;
    const issue = passwordIssue(password);
    if (issue) { setError(issue); return; }
    if (password !== confirm) { setError("Parollar bir-biriga mos kelmadi."); return; }
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      setDone(true);
    } catch (err) {
      if (err instanceof ClientApiError && err.problem.detail) {
        setError(err.problem.detail);
        if (err.status === 401 || err.status === 400 || err.status === 404) setExpired(true);
      } else {
        setError("Parolni yangilab bo‘lmadi. Qayta urinib ko‘ring.");
        setExpired(true);
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-cocoa text-cream"><CheckCircle2 size={36} /></span>
        <h1 className="font-serif mt-6 text-2xl font-semibold sm:text-3xl">Parol yangilandi!</h1>
        <p className="mt-3 leading-7 text-bodyText">Xavfsizlik uchun barcha qurilmalardan chiqarildingiz. Yangi parol bilan qaytadan kiring.</p>
        <Link href="/login" className="button-primary mx-auto mt-7 h-12 px-6">Kirish</Link>
      </div>
    );
  }

  return (
    <div>
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-sand text-cocoa"><KeyRound size={28} /></span>
      <h1 className="font-serif mt-5 text-center text-2xl font-semibold sm:text-3xl">Yangi parol o‘rnatish</h1>
      <p className="mt-2 text-center text-sm leading-6 text-bodyText">Kamida 8 belgi, ichida harf va raqam bo‘lsin.</p>
      <form className="mt-6" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <label htmlFor="new-password" className="block text-sm font-bold">Yangi parol</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-cocoa focus:ring-4 focus:ring-cocoa/10"
        />
        <label htmlFor="confirm-password" className="mt-4 block text-sm font-bold">Yangi parolni takrorlang</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-cocoa focus:ring-4 focus:ring-cocoa/10"
        />
        {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
        {expired && <p className="mt-2 text-sm text-bodyText">Havola eskirgan bo‘lsa, <Link href="/reset-password" className="font-bold text-cocoa">yangi havola so‘rang</Link>.</p>}
        <button type="submit" disabled={busy} className="button-primary mt-5 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? <><LoaderCircle size={18} className="animate-spin" /> Saqlanmoqda…</> : "Parolni yangilash"}
        </button>
      </form>
    </div>
  );
}

function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (busy || !email.trim()) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "So‘rov yuborilmadi. Qayta urining.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-sand text-cocoa"><KeyRound size={28} /></span>
      <h1 className="font-serif mt-5 text-center text-2xl font-semibold sm:text-3xl">Parolni tiklash</h1>
      <p className="mt-2 text-center text-sm leading-6 text-bodyText">Email manzilingizni kiriting — parolni yangilash havolasini yuboramiz.</p>
      {sent ? (
        <p className="mt-6 rounded-xl bg-sand/50 p-4 text-center text-sm font-medium text-cocoa" role="status">
          Agar bu email ro‘yxatdan o‘tgan bo‘lsa, havola yuborildi. Pochtangizni (spam papkasini ham) tekshiring.
        </p>
      ) : (
        <form className="mt-6" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <label htmlFor="forgot-email" className="block text-sm font-bold">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="siz@example.com"
            className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-cocoa focus:ring-4 focus:ring-cocoa/10"
          />
          {error && <p className="mt-3 text-sm font-medium text-danger" role="alert">{error}</p>}
          <button type="submit" disabled={busy} className="button-primary mt-5 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda…</> : "Havola yuborish"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-bodyText">Telefon orqali kirasizmi? <Link href="/login" className="font-bold text-cocoa">Kirish sahifasi</Link></p>
    </div>
  );
}
