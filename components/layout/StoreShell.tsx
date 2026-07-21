import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MainNavigation } from "./MainNavigation";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { MobileHeader } from "./MobileHeader";
import { TopBar } from "./TopBar";
import { PendingOrderProcessor } from "../orders/PendingOrderProcessor";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBar />
      <div className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-[0_5px_20px_rgba(29,29,31,.04)] backdrop-blur-lg">
        <Header />
        <MobileHeader />
        <MainNavigation />
      </div>
      <main>{children}</main>
      <PendingOrderProcessor />
      <Footer />
      <MobileBottomNavigation />
    </>
  );
}
