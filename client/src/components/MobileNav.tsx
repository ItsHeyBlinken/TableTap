import { Link, NavLink } from "react-router-dom";
import { APP_DISPLAY_NAME } from "../lib/brand";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium leading-tight ${
    isActive ? "text-brand-700" : "text-slate-600"
  }`;

const sellClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-bold leading-tight ${
    isActive ? "text-green-800" : "text-green-700"
  }`;

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-lg font-bold text-brand-700">
          {APP_DISPLAY_NAME}
        </Link>
        <Link
          to="/settings"
          className="touch-target rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white md:hidden safe-bottom"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg">
        <NavLink to="/dashboard" end className={navClass}>
          <span className="text-lg" aria-hidden>
            📊
          </span>
          Home
        </NavLink>
        <NavLink to="/sell" className={sellClass}>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm text-white"
            aria-hidden
          >
            $
          </span>
          Sell
        </NavLink>
        <NavLink to="/cards" className={navClass}>
          <span className="text-lg" aria-hidden>
            📦
          </span>
          Stock
        </NavLink>
        <NavLink to="/sales" className={navClass}>
          <span className="text-lg" aria-hidden>
            📋
          </span>
          Sales
        </NavLink>
        <NavLink to="/events" className={navClass}>
          <span className="text-lg" aria-hidden>
            📅
          </span>
          Events
        </NavLink>
      </div>
    </nav>
  );
}
