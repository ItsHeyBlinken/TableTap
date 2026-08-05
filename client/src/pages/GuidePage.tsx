import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PublicMarketingShell } from "../components/PublicMarketingShell";
import { OnboardingBlocks } from "../components/OnboardingBlocks";
import { FEATURE_HIGHLIGHTS, GUIDE_INTRO, GUIDE_SECTIONS } from "../content/onboarding";

export function GuidePage() {
  const { user } = useAuth();

  return (
    <PublicMarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{GUIDE_INTRO.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{GUIDE_INTRO.subtitle}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_HIGHLIGHTS.map((f) => (
            <article key={f.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="text-2xl" aria-hidden>
                {f.icon}
              </span>
              <h2 className="mt-3 font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-3xl space-y-10">
          {GUIDE_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span aria-hidden>{section.icon}</span>
                {section.title}
              </h2>
              <div className="mt-4">
                <OnboardingBlocks blocks={section.blocks} />
              </div>
            </section>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-brand-200 bg-brand-50/60 p-6 text-center">
          <p className="font-semibold text-slate-900">Ready to try it at your next show?</p>
          <p className="mt-2 text-sm text-slate-600">
            {user
              ? "Head to the dashboard or walk through the quick start checklist."
              : "Create a free account and follow the getting-started steps."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Go to dashboard
                </Link>
                <Link
                  to="/welcome"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Quick start
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Create account
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </PublicMarketingShell>
  );
}
