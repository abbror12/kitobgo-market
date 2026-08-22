import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";
import { ProfileContent } from "@/components/profile/ProfileContent";

export const metadata: Metadata = { title: "Shaxsiy kabinet — Kitob.go", robots: { index: false } };

export default function ProfilePage() {
  return (
    <StoreShell>
      <PageIntro eyebrow="Shaxsiy kabinet" title="Buyurtmalarim" description="Buyurtmalaringizni kuzating va boshqaring." breadcrumbs={[{ label: "Profil" }]} />
      <section className="container-page py-8 sm:py-12">
        <ProfileContent />
      </section>
    </StoreShell>
  );
}
