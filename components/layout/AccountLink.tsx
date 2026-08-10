"use client";

// Header'dagi sessiyaga sezgir havola: kirilmagan → /login ("Kirish"),
// kirilgan → /profile ("Profil"). Sessiya bir sahifa yuklanishida bir marta
// so'raladi (modul darajasidagi kesh) va AUTH_EVENT kelganda yangilanadi.
import { UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AUTH_EVENT } from "@/lib/client-store";

let sessionPromise: Promise<boolean> | null = null;

function fetchAuthedOnce(): Promise<boolean> {
  if (!sessionPromise) {
    sessionPromise = fetch("/api/auth/session", { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((data: { authenticated?: boolean }) => data.authenticated === true)
      .catch(() => false);
  }
  return sessionPromise;
}

export function useAuthed(): boolean {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchAuthedOnce().then((value) => { if (active) setAuthed(value); });
    const refresh = () => {
      sessionPromise = null;
      void fetchAuthedOnce().then((value) => { if (active) setAuthed(value); });
    };
    window.addEventListener(AUTH_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(AUTH_EVENT, refresh);
    };
  }, []);

  return authed;
}

export function AccountLink() {
  const authed = useAuthed();
  const label = authed ? "Profil" : "Kirish";

  return (
    <Link href={authed ? "/profile" : "/login"} className="header-action" aria-label={label}>
      <UserRound size={22} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
