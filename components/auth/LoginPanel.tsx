"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifyAuthChanged } from "@/lib/client-store";
import { EmailSignIn } from "./EmailSignIn";
import { GoogleSignIn } from "./GoogleSignIn";
import { OtpSignIn } from "./OtpSignIn";

// Asosiy usul — telefon + SMS (saytdagi mijozlar telefon hisobli);
// email tab ilovada email bilan ro'yxatdan o'tganlar uchun.
// Google tablardan tashqarida: u har ikki holatda ham bir xil ishlaydi.
export function LoginPanel({ next, googleClientId = "" }: { next: string; googleClientId?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"phone" | "email">("phone");

  function finish() {
    notifyAuthChanged();
    router.push(next);
    router.refresh();
  }

  return (
    <div>
      <div className="flex rounded-xl border border-line bg-navSurface p-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => setTab("phone")}
          className={`h-10 flex-1 rounded-lg transition ${tab === "phone" ? "bg-cream text-cocoa shadow-sm" : "text-bodyText"}`}
        >
          Telefon
        </button>
        <button
          type="button"
          onClick={() => setTab("email")}
          className={`h-10 flex-1 rounded-lg transition ${tab === "email" ? "bg-cream text-cocoa shadow-sm" : "text-bodyText"}`}
        >
          Email
        </button>
      </div>
      <div className="mt-6">
        {tab === "phone"
          ? <OtpSignIn compact onSuccess={finish} />
          : <EmailSignIn onSuccess={finish} />}
      </div>
      {/* Client id berilmagan bo'lsa Google butunlay ko'rsatilmaydi — ishlamaydigan
          tugma turgandan ko'ra yo'qligi yaxshi. */}
      {googleClientId && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs font-medium text-bodyText">
            <span className="h-px flex-1 bg-line" />
            yoki
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleSignIn clientId={googleClientId} onSuccess={finish} />
        </>
      )}
    </div>
  );
}
