import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";
import { ResetPasswordContent } from "@/components/auth/ResetPasswordContent";

export const metadata: Metadata = { title: "Parolni tiklash — Kitob.go", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return (
    <StoreShell>
      <ResetPasswordContent token={params.token?.trim() || null} />
    </StoreShell>
  );
}
