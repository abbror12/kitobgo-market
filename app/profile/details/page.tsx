import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";
import { ProfileDetailsContent } from "@/components/profile/ProfileDetailsContent";

export const metadata: Metadata = { title: "Mening ma’lumotlarim — Kitob.go", robots: { index: false } };

export default function ProfileDetailsPage() {
  return (
    <StoreShell>
      <PageIntro eyebrow="Shaxsiy kabinet" title="Mening ma’lumotlarim" description="Profilingiz va akkauntingizni boshqaring." breadcrumbs={[{ label: "Profil", href: "/profile" }, { label: "Ma’lumotlarim" }]} />
      <section className="container-page py-8 sm:py-12">
        <ProfileDetailsContent />
      </section>
    </StoreShell>
  );
}
