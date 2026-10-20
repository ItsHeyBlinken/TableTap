import { PublicMarketingShell } from "../components/PublicMarketingShell";
import { LEGAL_LAST_UPDATED, PRIVACY_SECTIONS } from "../content/legal";

export function PrivacyPage() {
  return (
    <PublicMarketingShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {LEGAL_LAST_UPDATED}</p>
        <p className="mt-4 text-sm text-slate-600">
          Draft for the free TableTap beta. This is not legal advice.
        </p>
        <div className="mt-10 space-y-8">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold text-slate-900">{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 48)} className="mt-3 text-slate-700">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </PublicMarketingShell>
  );
}
