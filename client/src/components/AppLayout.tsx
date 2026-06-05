import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { MobileBottomNav, MobileHeader } from "./MobileNav";

export function AppLayout() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <MobileHeader />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 md:py-8 main-with-mobile-nav">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
}
