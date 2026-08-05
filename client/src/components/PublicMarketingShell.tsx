import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { APP_DISPLAY_NAME } from "../lib/brand";

interface PublicMarketingShellProps {
  children: ReactNode;
}

export function PublicMarketingShell({ children }: PublicMarketingShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-brand-700 hover:text-brand-800">
            {APP_DISPLAY_NAME}
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/guide"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Guide
            </Link>
            <Link
              to="/pricing"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Pricing
            </Link>
            <Link to="/#faq" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              FAQ
            </Link>
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t py-8 text-center text-sm text-slate-500">
        {APP_DISPLAY_NAME} — sports card vendor POS + profit tracker ·{" "}
        <Link to="/guide" className="text-brand-600 hover:underline">
          Guide
        </Link>
        {" · "}
        <Link to="/pricing" className="text-brand-600 hover:underline">
          Pricing
        </Link>
        {" · "}
        <Link to="/#faq" className="text-brand-600 hover:underline">
          FAQ
        </Link>
      </footer>
    </div>
  );
}
