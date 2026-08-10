"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmailSignIn } from "./EmailSignIn";
import { OtpSignIn } from "./OtpSignIn";

// Asosiy usul — telefon + SMS (saytdagi mijozlar telefon hisobli);
// email tab ilovada email bilan ro'yxatdan o'tganlar uchun.
export function LoginPanel({ next }: { next: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"phone" | "email">("phone");

  function finish() {
    router.push(next);
    router.refresh();
  }

  return (
    <div>
      <div className="flex rounded-xl border border-line bg-canvas p-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => setTab("phone")}
          className={`h-10 flex-1 rounded-lg transition ${tab === "phone" ? "bg-white text-brand shadow-sm" : "text-muted"}`}
        >
          Telefon
        </button>
        <button
          type="button"
          onClick={() => setTab("email")}
          className={`h-10 flex-1 rounded-lg transition ${tab === "email" ? "bg-white text-brand shadow-sm" : "text-muted"}`}
        >
          Email
        </button>
      </div>
      <div className="mt-6">
        {tab === "phone"
          ? <OtpSignIn compact onSuccess={finish} />
          : <EmailSignIn onSuccess={finish} />}
      </div>
    </div>
  );
}
