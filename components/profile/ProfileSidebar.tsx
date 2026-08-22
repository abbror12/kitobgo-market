"use client";

import { ChevronRight, Heart, LogOut, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ProfileDto } from "@/lib/store-api";
import { initialsOf } from "./useProfileSession";

// "Ma'lumotlarim" bu ro'yxatda ataylab YO'Q: unga yuqoridagi ism/aloqa bloki olib boradi
// (bitta sahifa — bitta havola, PROGRESS.md "Navigatsiya qoidasi").
const NAV = [
  { href: "/profile", label: "Buyurtmalarim", icon: Package },
  { href: "/favorites", label: "Sevimlilar", icon: Heart },
];

// Shaxsiy kabinetning yon paneli — /profile va /profile/details da bir xil.
// Tepadagi ism/aloqa bloki "Mening ma'lumotlarim" sahifasiga havola.
export function ProfileSidebar({ profile, onLogout }: { profile: ProfileDto | null; onLogout: () => void }) {
  const pathname = usePathname();
  const displayName = profile?.fullName ?? "Mijoz";
  const detailsActive = pathname === "/profile/details";

  return (
    <aside className="h-fit rounded-2xl border border-line bg-cream p-3">
      <div className="border-b border-line pb-2">
        <Link href="/profile/details" aria-current={detailsActive ? "page" : undefined} className={`flex items-center gap-3 rounded-xl p-3 transition ${detailsActive ? "bg-sand" : "hover:bg-sand"}`} aria-label="Mening ma’lumotlarim">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-cream">{initialsOf(displayName)}</span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm">{displayName}</strong>
            <small className="block truncate text-bodyText">{profile?.phone ?? profile?.email ?? ""}</small>
          </span>
          <ChevronRight size={16} className={`shrink-0 ${detailsActive ? "text-brand" : "text-bodyText"}`} aria-hidden="true" />
        </Link>
      </div>
      <nav className="mt-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-sand text-brand" : "text-ink hover:bg-sand"}`}
            >
              <Icon size={18} aria-hidden="true" /> {label}
              <ChevronRight size={15} className="ml-auto" aria-hidden="true" />
            </Link>
          );
        })}
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-danger transition hover:bg-dangerSoft">
          <LogOut size={18} aria-hidden="true" /> Chiqish
        </button>
      </nav>
    </aside>
  );
}
