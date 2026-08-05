import { Link, useNavigate } from "react-router-dom";
import { APP_DISPLAY_NAME } from "../lib/brand";
import { setWelcomeSeen } from "../lib/onboardingStorage";
import { QUICK_START_STEPS } from "../content/onboarding";

export function WelcomePage() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    setWelcomeSeen();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/dashboard" className="text-xl font-bold text-brand-700 hover:text-brand-800">
            {APP_DISPLAY_NAME}
          </Link>
          <button
            type="button"
            onClick={goToDashboard}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Skip →
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Welcome</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Your first show in 4 steps</h1>
          <p className="mt-3 text-slate-600">
            TableTap tracks profit — not payments. Here&apos;s the fastest path from empty account to
            knowing what you made.
          </p>
        </div>

        <ol className="mt-10 space-y-4">
          {QUICK_START_STEPS.map((step, index) => (
            <li
              key={step.id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-800">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-900">{step.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                <Link
                  to={step.href}
                  onClick={() => setWelcomeSeen()}
                  className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
                >
                  {step.cta} →
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={goToDashboard}
            className="flex-1 rounded-xl bg-green-600 py-3.5 text-center text-base font-bold text-white hover:bg-green-700"
          >
            Go to dashboard
          </button>
          <Link
            to="/guide"
            onClick={() => setWelcomeSeen()}
            className="flex-1 rounded-xl border border-slate-300 bg-white py-3.5 text-center text-base font-semibold text-slate-700 hover:bg-slate-50"
          >
            Read full guide
          </Link>
        </div>
      </main>
    </div>
  );
}
