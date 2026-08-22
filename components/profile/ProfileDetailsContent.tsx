"use client";

// "Mening ma'lumotlarim": profil kartasi (ism, ID, email, telefon, holat, asosiy manzil),
// ism tahriri (ikkita katak — API.md §5) va qisqa hisoblagichlar (buyurtma, sevimli, manzil).
import {
  BadgeCheck, Check, Heart, LoaderCircle, Mail, MapPin, Package, Pencil, Phone, X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { readFavorites } from "@/lib/client-store";
import { formatDate } from "@/lib/format";
import type { AddressDto, OrderSummaryDto, PageResponse, ProfileDto } from "@/lib/store-api";
import { ProfileSidebar } from "./ProfileSidebar";
import { initialsOf, useProfileSession } from "./useProfileSession";

const STATUS_LABELS: Record<ProfileDto["status"], string> = {
  ACTIVE: "Faol",
  PENDING_VERIFICATION: "Tasdiqlanmagan",
  BLOCKED: "Bloklangan",
};

function addressLine(address: AddressDto): string {
  return [address.regionName, address.district, address.addressLine].filter(Boolean).join(", ");
}

function VerifiedChip({ verified }: { verified: boolean }) {
  return verified
    ? <span className="inline-flex items-center gap-1 rounded-full bg-successSoft px-2 py-0.5 text-[11px] font-bold text-success"><BadgeCheck size={12} aria-hidden="true" /> Tasdiqlangan</span>
    : <span className="rounded-full bg-warningSoft px-2 py-0.5 text-[11px] font-bold text-warning">Tasdiqlanmagan</span>;
}

export function ProfileDetailsContent() {
  const { profile, setProfile, checking, logout } = useProfileSession("/profile/details");
  const [addresses, setAddresses] = useState<AddressDto[] | null>(null);
  const [ordersTotal, setOrdersTotal] = useState<number | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Ism tahriri — ikkita katak. Bo'linishdan oldingi hisoblarda firstName yo'q: kataklar
  // BO'SH qoladi, tepada joriy fullName ko'rsatiladi; fullName "Ism" katagiga solinmaydi.
  const [editing, setEditing] = useState(false);
  const [firstDraft, setFirstDraft] = useState("");
  const [lastDraft, setLastDraft] = useState("");
  const [nameErrors, setNameErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [nameBusy, setNameBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (checking) return;
    setFavoritesCount(readFavorites().length);
    apiFetch<AddressDto[]>("/api/account/addresses").then(setAddresses).catch(() => setAddresses([]));
    apiFetch<PageResponse<OrderSummaryDto>>("/api/orders?page=0&size=1").then((page) => setOrdersTotal(page.totalElements)).catch(() => setOrdersTotal(0));
  }, [checking]);

  function startEditing() {
    setFirstDraft(profile?.firstName ?? "");
    setLastDraft(profile?.lastName ?? "");
    setNameErrors({});
    setError("");
    setEditing(true);
  }

  async function saveName() {
    if (nameBusy) return;
    // API.md §5 "Validation": firstName 2–100 majburiy; lastName 100 gacha, bo'sh = yo'q.
    const firstName = firstDraft.trim();
    const lastName = lastDraft.trim();
    const issues: { firstName?: string; lastName?: string } = {};
    if (firstName.length < 2 || firstName.length > 100) issues.firstName = "Ismni kiriting (2–100 belgi).";
    if (lastName.length > 100) issues.lastName = "Familiya 100 belgidan oshmasin.";
    if (issues.firstName || issues.lastName) { setNameErrors(issues); return; }
    setNameBusy(true);
    setNameErrors({});
    setError("");
    try {
      const updated = await apiFetch<ProfileDto>("/api/account", { method: "PUT", body: JSON.stringify({ firstName, lastName }) });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      // VALIDATION_FAILED errors[] — field nomlari katak nomlari bilan bir xil; "ism umuman
      // yo'q" ham firstName ostida keladi.
      const fields: { firstName?: string; lastName?: string } = {};
      if (err instanceof ClientApiError && Array.isArray(err.problem.errors)) {
        for (const item of err.problem.errors) {
          if (item?.field === "firstName" || item?.field === "lastName") fields[item.field] ??= item.message;
        }
      }
      setNameErrors(fields);
      if (!fields.firstName && !fields.lastName) setError(err instanceof ClientApiError ? err.message : "Ismni saqlab bo‘lmadi.");
    } finally {
      setNameBusy(false);
    }
  }

  if (checking || !profile) {
    return <div className="grid gap-3"><div className="h-24 animate-pulse rounded-2xl bg-sand/60" /><div className="h-64 animate-pulse rounded-2xl bg-sand/60" /></div>;
  }

  const displayName = profile.fullName ?? "Mijoz";
  const primaryAddress = addresses?.[0];
  const inputClass = (bad: boolean) => `h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-brand ${bad ? "border-danger" : "border-line"}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <ProfileSidebar profile={profile} onLogout={() => void logout()} />

      <div>
        <div className="rounded-2xl border border-line bg-cream p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-semibold">Profil</h2>
              <p className="mt-1 text-sm text-bodyText">Ism va aloqa ma’lumotlaringiz</p>
            </div>
            {!editing && (
              <button type="button" onClick={startEditing} className="button-primary h-10 px-4 text-sm"><Pencil size={15} aria-hidden="true" /> Profilni tahrirlash</button>
            )}
          </div>
          {error && <p className="mt-4 rounded-xl bg-dangerSoft p-3 text-sm font-medium text-danger" role="alert">{error}</p>}

          <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr] md:gap-8">
            <div className="flex items-start gap-4">
              <span className="grid size-20 shrink-0 place-items-center rounded-full bg-brand text-2xl font-extrabold text-cream">{initialsOf(displayName)}</span>
              <div className="min-w-0">
                {editing ? (
                  <form onSubmit={(event) => { event.preventDefault(); void saveName(); }} className="w-full sm:w-80">
                    {!profile.firstName && profile.fullName && (
                      <p className="mb-2 text-sm text-bodyText">Hozirgi: <strong className="text-ink">{profile.fullName}</strong> — ism va familiyani alohida kiriting.</p>
                    )}
                    <label htmlFor="details-first-name" className="block text-xs font-bold text-bodyText">Ism</label>
                    <input id="details-first-name" value={firstDraft} onChange={(event) => setFirstDraft(event.target.value)} autoComplete="given-name" maxLength={100} placeholder="Ism" className={`mt-1 ${inputClass(!!nameErrors.firstName)}`} />
                    {nameErrors.firstName && <p className="mt-1 text-xs font-medium text-danger">{nameErrors.firstName}</p>}
                    <label htmlFor="details-last-name" className="mt-3 block text-xs font-bold text-bodyText">Familiya <span className="font-medium">(ixtiyoriy)</span></label>
                    <input id="details-last-name" value={lastDraft} onChange={(event) => setLastDraft(event.target.value)} autoComplete="family-name" maxLength={100} placeholder="Familiya" className={`mt-1 ${inputClass(!!nameErrors.lastName)}`} />
                    {nameErrors.lastName && <p className="mt-1 text-xs font-medium text-danger">{nameErrors.lastName}</p>}
                    <div className="mt-4 flex gap-2">
                      <button type="submit" disabled={nameBusy} className="button-primary h-10 px-4 text-sm disabled:opacity-60">{nameBusy ? <LoaderCircle size={15} className="animate-spin" /> : <><Check size={15} aria-hidden="true" /> Saqlash</>}</button>
                      <button type="button" onClick={() => setEditing(false)} className="button-secondary inline-flex h-10 px-3 text-sm"><X size={15} aria-hidden="true" /> Bekor</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="truncate text-xl font-extrabold text-ink">{displayName}</h3>
                    <p className="mt-0.5 text-sm text-bodyText">ID: {profile.id}</p>
                    <p className="mt-4 flex flex-wrap items-center gap-2 text-sm"><Mail size={16} className="text-bodyText" aria-hidden="true" /> {profile.email ?? <span className="text-bodyText">—</span>}{profile.email && <VerifiedChip verified={profile.emailVerified} />}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm"><Phone size={16} className="text-bodyText" aria-hidden="true" /> {profile.phone ?? <span className="text-bodyText">—</span>}{profile.phone && <VerifiedChip verified={profile.phoneVerified} />}</p>
                  </>
                )}
              </div>
            </div>

            <dl className="grid gap-5 sm:grid-cols-2">
              <div><dt className="text-xs text-bodyText">Ro‘yxatdan o‘tgan</dt><dd className="mt-1 font-bold text-ink">{formatDate(profile.createdAt)}</dd></div>
              <div><dt className="text-xs text-bodyText">Hisob holati</dt><dd className="mt-1 font-bold text-ink">{STATUS_LABELS[profile.status] ?? profile.status}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-bodyText">Manzil</dt>
                <dd className="mt-1 font-bold text-ink">
                  {addresses === null ? <span className="text-bodyText">Yuklanmoqda…</span> : primaryAddress ? addressLine(primaryAddress) : <span className="font-medium text-bodyText">Hali saqlanmagan — birinchi buyurtmada so‘raladi</span>}
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 text-xs text-bodyText">Telefon raqami kirish identifikatori bo‘lgani uchun bu yerda o‘zgartirilmaydi.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link href="/profile" className="group rounded-2xl border border-line bg-cream p-5 transition hover:border-brand/30 hover:shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-sand text-brand"><Package size={19} aria-hidden="true" /></span>
            <span className="mt-4 block text-sm text-bodyText">Buyurtmalarim</span>
            <strong className="block text-2xl">{ordersTotal ?? "…"}</strong>
            <span className="mt-3 inline-block text-sm font-bold text-brand group-hover:underline">Barchasini ko‘rish →</span>
          </Link>
          <Link href="/favorites" className="group rounded-2xl border border-line bg-cream p-5 transition hover:border-brand/30 hover:shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-sand text-brand"><Heart size={19} aria-hidden="true" /></span>
            <span className="mt-4 block text-sm text-bodyText">Sevimlilar</span>
            <strong className="block text-2xl">{favoritesCount}</strong>
            <span className="mt-3 inline-block text-sm font-bold text-brand group-hover:underline">Barchasini ko‘rish →</span>
          </Link>
          <div className="rounded-2xl border border-line bg-cream p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-sand text-brand"><MapPin size={19} aria-hidden="true" /></span>
            <span className="mt-4 block text-sm text-bodyText">Manzillarim</span>
            <strong className="block text-2xl">{addresses === null ? "…" : `${addresses.length} ta`}</strong>
            <span className="mt-3 block text-xs text-bodyText">Buyurtma berishda tanlanadi va saqlanadi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
