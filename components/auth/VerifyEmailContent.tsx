"use client";

// Backend yuborgan xatdagi havola: https://kitobgo.com/verify-email?token=…
// Sahifa ochilishi bilan POST /auth/verify-email {token} chaqiriladi (API.md §4.2, 204).
import { CheckCircle2, LoaderCircle, MailWarning } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";

type State = "verifying" | "success" | "error";

export function VerifyEmailContent({ token }: { token: string | null }) {
  const [state, setState] = useState<State>(token ? "verifying" : "error");
  const [error, setError] = useState(token ? "" : "Tasdiqlash havolasi to‘liq emas. Xatdagi havolani to‘g‘ridan-to‘g‘ri oching.");
  const [email, setEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "busy" | "sent">("idle");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    apiFetch("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) })
      .then(() => setState("success"))
      .catch((err) => {
        setState("error");
        setError(err instanceof ClientApiError && err.problem.detail
          ? err.problem.detail
          : "Havola eskirgan yoki allaqachon ishlatilgan. Yangi havola so‘rang.");
      });
  }, [token]);

  async function resend() {
    if (resendState !== "idle" || !email.trim()) return;
    setResendState("busy");
    try {
      // 202 doim qaytadi — email ro'yxatda bor-yo'qligini oshkor qilmaydi.
      await apiFetch("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email: email.trim() }) });
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  }

  return (
    <section className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-[28px] border border-line bg-cream p-7 text-center shadow-soft sm:p-12">
        {state === "verifying" && (
          <>
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-sand text-cocoa"><LoaderCircle size={34} className="animate-spin" /></span>
            <h1 className="font-serif mt-6 text-2xl font-semibold sm:text-3xl">Email tasdiqlanmoqda…</h1>
            <p className="mt-3 leading-7 text-bodyText">Bir necha soniya kuting.</p>
          </>
        )}
        {state === "success" && (
          <>
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-cocoa text-cream"><CheckCircle2 size={36} /></span>
            <h1 className="font-serif mt-6 text-2xl font-semibold sm:text-3xl">Email tasdiqlandi!</h1>
            <p className="mt-3 leading-7 text-bodyText">Endi hisobingizga email va parol bilan kirishingiz mumkin.</p>
            <Link href="/login" className="button-primary mx-auto mt-7 h-12 px-6">Kirish</Link>
          </>
        )}
        {state === "error" && (
          <>
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-warningSoft text-warning"><MailWarning size={34} /></span>
            <h1 className="font-serif mt-6 text-2xl font-semibold sm:text-3xl">Tasdiqlab bo‘lmadi</h1>
            <p className="mt-3 leading-7 text-bodyText">{error}</p>
            <form className="mx-auto mt-6 max-w-sm" onSubmit={(event) => { event.preventDefault(); void resend(); }}>
              {resendState === "sent" ? (
                <p className="rounded-xl bg-sand/50 p-4 text-sm font-medium text-cocoa" role="status">Agar bu email ro‘yxatdan o‘tgan bo‘lsa, yangi havola yuborildi. Pochtangizni tekshiring.</p>
              ) : (
                <>
                  <label htmlFor="verify-email-input" className="block text-left text-sm font-bold">Email manzilingiz</label>
                  <input
                    id="verify-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="siz@example.com"
                    className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-cocoa focus:ring-4 focus:ring-cocoa/10"
                  />
                  <button type="submit" disabled={resendState === "busy"} className="button-primary mt-3 h-12 w-full px-5 disabled:opacity-60">
                    {resendState === "busy" ? <LoaderCircle size={17} className="animate-spin" /> : "Yangi havola yuborish"}
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </section>
  );
}
