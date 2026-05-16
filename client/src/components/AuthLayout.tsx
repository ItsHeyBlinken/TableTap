import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { APP_DISPLAY_NAME } from "../lib/brand";

const features = [
  "Record a sale in under 10 seconds with instant profit",
  "Track profit by card show or sales event",
  "See today's revenue and net profit on one dashboard",
];

interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-50">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-brand-700 hover:text-brand-800">
            {APP_DISPLAY_NAME}
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-6 lg:py-16">
        <div className="hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Vendor POS + profit tracker
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">
            Know what you sold. Know what you made.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            For card show vendors, flippers, and table sellers — not hobby collectors tracking
            portfolio value.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((text) => (
              <li key={text} className="flex gap-3 text-slate-700">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm text-brand-700">
                  ✓
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:justify-self-end lg:w-full lg:max-w-md">
          <div className="mb-6 lg:hidden">
            <p className="text-sm font-semibold text-brand-600">{APP_DISPLAY_NAME}</p>
            <p className="mt-1 text-sm text-slate-600">POS and profit tracking for card show vendors.</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
