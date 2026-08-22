"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import { notifyAuthChanged } from "@/lib/client-store";
import type { ProfileDto } from "@/lib/store-api";

// Shaxsiy kabinet sahifalari (/profile, /profile/details) uchun umumiy sessiya:
// /api/auth/session → profil; kirmagan bo'lsa login'ga, `next` bilan shu sahifaga qaytadi.
// Chiqish ham shu yerda — yon panel ikkala sahifada bir xil ishlasin.
export function useProfileSession(nextPath: string) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const toLogin = () => router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    apiFetch<{ authenticated: boolean; profile?: ProfileDto }>("/api/auth/session")
      .then((session) => {
        if (!active) return;
        if (!session.authenticated || !session.profile) { toLogin(); return; }
        setProfile(session.profile);
        setChecking(false);
      })
      .catch(() => { if (active) toLogin(); });
    return () => { active = false; };
  }, [router, nextPath]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      notifyAuthChanged();
      router.push("/");
      router.refresh();
    }
  }, [router]);

  return { profile, setProfile, checking, logout };
}

// Avatar initsiallari — har doim fullName dan (API.md §5: ko'rsatish uchun fullName).
export function initialsOf(name: string): string {
  return name.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "K";
}
