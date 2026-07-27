import { Link } from "react-router-dom";
import { PublicMarketingShell } from "../components/PublicMarketingShell";
import { FEEDBACK_EMAIL } from "../lib/brand";
import {
  PRICING_FEEDBACK_QUESTIONS,
  PRICING_INCLUDED_EVERYWHERE,
  PRICING_OPTIONS,
} from "../content/pricingOptions";

function feedbackMailto(): string {
  const subject = encodeURIComponent("TableTap pricing feedback");
  const body = encodeURIComponent(
    `Hi — I'm a vendor reviewing TableTap pricing.\n\n` +
      `Preferred option: A / B / C (circle one)\n\n` +
      PRICING_FEEDBACK_QUESTIONS.map((q, i) => `${i + 1}. ${q}\n   \n`).join("\n") +
      `\nThanks!`
  );
  return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
}

export function PricingPage() {
  const hasFeedbackEmail = Boolean(FEEDBACK_EMAIL);

  return (
    <PublicMarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Draft — not final</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Help us pick a fair price
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            TableTap is in testing. We&apos;re not charging yet — these are three directions we&apos;re
            considering. Tell us what would work at your table.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-brand-200 bg-brand-50/80 px-4 py-4 text-center text-sm text-brand-900 sm:px-6">
          <p className="font-medium">What you&apos;re paying for</p>
          <p className="mt-1 text-brand-800">
            Profit tracking and show-day speed — not payment processing. You still take Venmo, cash, and
            Zelle your way.
          </p>
        </div>

        <ul className="mx-auto mt-8 grid max-w-3xl gap-2 sm:grid-cols-2">
          {PRICING_INCLUDED_EVERYWHERE.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-700">
              <span className="text-brand-600" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_OPTIONS.map((option, index) => (
            <article
              key={option.id}
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                index === 0 ? "border-brand-300 ring-2 ring-brand-100" : "border-slate-200"
              }`}
            >
              {index === 0 && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Leaning here
                </p>
              )}
              <p className="text-sm font-medium text-slate-500">{option.label}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{option.tagline}</h2>
              <p className="mt-4 text-3xl font-bold text-slate-900">{option.priceLine}</p>
              <p className="mt-1 text-sm text-slate-500">{option.priceDetail}</p>
              <p className="mt-4 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Best for:</span> {option.bestFor}
              </p>
              <div className="mt-6 flex-1 space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-800">Pros</p>
                  <ul className="mt-2 space-y-1.5 text-slate-600">
                    {option.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="text-green-600">+</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Tradeoffs</p>
                  <ul className="mt-2 space-y-1.5 text-slate-600">
                    {option.tradeoffs.map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="text-slate-400">−</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mx-auto mt-16 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Share your take</h2>
          <p className="mt-2 text-slate-600">
            If you&apos;ve tried the testing site (or you&apos;re a show vendor), we&apos;d love a quick
            reply on which option feels fair.
          </p>
          <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-slate-700">
            {PRICING_FEEDBACK_QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {hasFeedbackEmail ? (
              <a
                href={feedbackMailto()}
                className="inline-flex justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Email pricing feedback
              </a>
            ) : (
              <p className="text-sm text-slate-600">
                Reply on your beta invite thread or tell us in person at a show — mention Option A, B, or C.
              </p>
            )}
            <Link
              to="/register"
              className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Try testing — free for now
            </Link>
          </div>
        </section>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-slate-500">
          Prices shown are placeholders for discussion only. No billing is connected yet.
        </p>
      </section>
    </PublicMarketingShell>
  );
}
