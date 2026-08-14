"use client";

import { useEffect, useState } from "react";

// SMS kod ekranlari uchun teskari sanoq. Maqsadli vaqt (epoch ms) berilgunicha
// hech narsa sanamaydi, shuning uchun kod so'ralmagan holatda taymer ishlamaydi.
export function useCountdown(target: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target) return 0;
  return Math.max(0, Math.ceil((target - now) / 1000));
}

export function formatSeconds(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
