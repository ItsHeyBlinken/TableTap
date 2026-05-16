import { Link } from "react-router-dom";
import { APP_DISPLAY_NAME } from "../lib/brand";

const features = [
  {
    title: "Record sales in seconds",
    description: "Pick stock, enter sale price, see profit instantly — built for busy show floors.",
    icon: "⚡",
  },
  {
    title: "Profit-first dashboard",
    description: "Today's profit, revenue, and cost basis. Know what you made before you pack up.",
    icon: "💵",
  },
  {
    title: "Sales events",
    description: "Group sales by card show, weekend table, or stream. See profit per event.",
    icon: "📅",
  },
  {
    title: "Stock on hand",
    description: "Track unsold inventory with cost basis so every sale calculates real margin.",
    icon: "📦",
  },
  {
    title: "Sales history",
    description: "Full log of every sale with revenue, profit, and event — filter anytime.",
    icon: "📊",
  },
  {
    title: "No fluff",
    description: "No AI scanning, no market pricing, no collector portfolio tools. Just selling.",
    icon: "🎯",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-xl font-bold text-brand-700">{APP_DISPLAY_NAME}</span>
          <nav className="flex gap-2 sm:gap-3">
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

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Card show vendor POS
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            What did you sell today — and how much did you make?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            {APP_DISPLAY_NAME} is a lightweight point-of-sale and profit tracker for sports card vendors, flippers,
            and table sellers. Square-simple. Built for real-world shows.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-lg bg-green-600 px-8 py-3.5 font-semibold text-white hover:bg-green-700 sm:w-auto"
            >
              Start selling — free
            </Link>
            <Link
              to="/login"
              className="w-full rounded-lg border border-slate-300 bg-white px-8 py-3.5 font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section id="features" className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900">Built for vendors, not collectors</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
              Inventory supports selling. Profit is the product. Events tie it all together.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <article key={f.title} className="rounded-xl border border-slate-200 p-6">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-900 py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold">Run your table like a business</h2>
            <p className="mt-4 text-lg text-brand-100">
              Card shows, weekend tables, Whatnot streams — track profit per event and answer
              &quot;how much did I make today?&quot; before you drive home.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-block rounded-lg bg-white px-10 py-3 font-semibold text-brand-900 hover:bg-brand-50"
            >
              Create vendor account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-slate-500">
        {APP_DISPLAY_NAME} — sports card vendor POS + profit tracker
      </footer>
    </div>
  );
}
