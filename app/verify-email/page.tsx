import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";
import { VerifyEmailContent } from "@/components/auth/VerifyEmailContent";

export const metadata: Metadata = { title: "Emailni tasdiqlash — Kitob.go", robots: { index: false } };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return (
    <StoreShell>
      <VerifyEmailContent token={params.token?.trim() || null} />
    </StoreShell>
  );
}
