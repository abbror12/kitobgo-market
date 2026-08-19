import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MainNavigation } from "./MainNavigation";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { MobileHeader } from "./MobileHeader";
import { TopBar } from "./TopBar";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar />
      {/* Sticky header — ilovadagi navSurface: page bilan cream orasidagi "javon" ohangi. */}
      <div className="sticky top-0 z-40 border-b border-line bg-navSurface/95 shadow-[0_5px_20px_rgba(21,26,51,.06)] backdrop-blur-lg">
        <Header />
        <MobileHeader />
        <MainNavigation />
      </div>
      <main>{children}</main>
      <Footer />
      <MobileBottomNavigation />
    </>
  );
}
