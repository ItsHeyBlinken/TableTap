import { Link } from "react-router-dom";
import { PublicMarketingShell } from "../components/PublicMarketingShell";
import { useAuth } from "../context/AuthContext";

export function NotFoundPage() {
  const { user } = useAuth();

  return (
    <PublicMarketingShell>
      <section className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">That link does not match a page in TableTap.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Home
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
            >
              Log in
            </Link>
          )}
        </div>
      </section>
    </PublicMarketingShell>
  );
}
