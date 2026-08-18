"use client";

// "Google bilan kirish" (API.md §4.1a).
//
// Oqim: Google Identity Services brauzerda ID token beradi → u sayt ichki
// /api/auth/oauth/google route'iga yuboriladi → route backendga uzatib, qaytgan
// tokenlarni httpOnly cookie'ga yozadi. Token brauzer xotirasida saqlanmaydi.
//
// Tugmani Google o'zi chizadi (`renderButton`): brend qoidalari, tillar va
// qurilmaga moslashish o'sha yerda hal qilingan. One Tap ataylab yoqilmagan —
// u FedCM sozlamalarini talab qiladi va kirish sahifasida keraksiz.
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; ux_mode?: string }): void;
          renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
        };
      };
    };
  }
}

export function GoogleSignIn({ clientId, onSuccess }: { clientId: string; onSuccess: () => void }) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // GIS callback'i React'dan tashqarida chaqiriladi — eng oxirgi handler'ga ref orqali yetamiz.
  const handlerRef = useRef<(response: GoogleCredentialResponse) => void>(() => {});

  handlerRef.current = async (response: GoogleCredentialResponse) => {
    if (!response.credential || busy) return;
    setBusy(true);
    setError("");
    try {
      await apiFetch("/api/auth/oauth/google", {
        method: "POST",
        body: JSON.stringify({ idToken: response.credential }),
      });
      onSuccess();
    } catch (err) {
      if (err instanceof ClientApiError) {
        if (err.code === "OAUTH_PROVIDER_DISABLED") setError("Google orqali kirish hozircha yoqilmagan.");
        else if (err.code === "OAUTH_TOKEN_INVALID") setError("Google tasdiqlashdan o‘tmadi. Qayta urinib ko‘ring.");
        else if (err.code === "ACCOUNT_BLOCKED") setError("Akkauntingiz vaqtincha bloklangan. Qo‘llab-quvvatlash bilan bog‘laning.");
        else setError(err.message);
      } else {
        setError("Kirib bo‘lmadi. Qayta urinib ko‘ring.");
      }
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!ready || !holderRef.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => handlerRef.current(response),
    });
    // Tugma kengligi piksellarda beriladi (GIS foizni qabul qilmaydi), shuning uchun
    // panel kengligidan o'lchab olamiz; Google chegarasi — 400px.
    const width = Math.min(400, Math.max(200, Math.round(holderRef.current.getBoundingClientRect().width)));
    window.google.accounts.id.renderButton(holderRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "center",
      locale: "uz",
      width,
    });
  }, [ready, clientId]);

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setError("Google xizmatiga ulanib bo‘lmadi. Telefon yoki email orqali kiring.")}
      />
      <div ref={holderRef} className={`flex min-h-11 justify-center ${busy ? "pointer-events-none opacity-60" : ""}`} />
      {busy && <p className="mt-2 text-center text-sm text-bodyText" role="status">Kirilmoqda…</p>}
      {error && <p className="mt-2 text-center text-sm font-medium text-danger" role="alert">{error}</p>}
    </div>
  );
}
