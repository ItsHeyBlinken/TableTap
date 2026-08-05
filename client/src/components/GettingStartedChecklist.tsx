import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { CHECKLIST_STEP_LABELS } from "../content/onboarding";
import { dismissChecklist, isChecklistDismissed } from "../lib/onboardingStorage";
import type { SalesEvent, VendorDashboard } from "../types";

interface GettingStartedChecklistProps {
  stats: VendorDashboard;
}

type StepId = "event" | "stock" | "sale" | "profit";

const STEP_ORDER: StepId[] = ["event", "stock", "sale", "profit"];

const STEP_LINKS: Record<StepId, string> = {
  event: "/events",
  stock: "/cards/new",
  sale: "/sell",
  profit: "/dashboard",
};

function hasRecordedSale(stats: VendorDashboard): boolean {
  if (stats.recentSales.length > 0) return true;
  return stats.profitByEvent.some((row) => row.sales_count > 0);
}

export function GettingStartedChecklist({ stats }: GettingStartedChecklistProps) {
  const [dismissed, setDismissed] = useState(() => isChecklistDismissed());
  const [hasEvent, setHasEvent] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    apiGet<{ events: SalesEvent[] }>("/api/events")
      .then((data) => setHasEvent(data.events.length > 0))
      .catch(() => setHasEvent(false))
      .finally(() => setLoadingEvents(false));
  }, []);

  const completion: Record<StepId, boolean> = {
    event: hasEvent,
    stock: stats.unsoldStockCount > 0,
    sale: hasRecordedSale(stats),
    profit: true,
  };

  const allComplete = STEP_ORDER.every((id) => completion[id]);

  if (dismissed || loadingEvents || allComplete) {
    return null;
  }

  const handleDismiss = () => {
    dismissChecklist();
    setDismissed(true);
  };

  return (
    <section className="mb-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Getting started</h2>
          <p className="mt-1 text-sm text-slate-600">Complete these steps for your first show.</p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {STEP_ORDER.map((id) => {
          const done = completion[id];
          return (
            <li key={id}>
              <Link
                to={STEP_LINKS[id]}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  done
                    ? "bg-green-50 text-green-900"
                    : "bg-white text-slate-800 hover:bg-brand-100/50"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-green-600 text-white" : "border border-slate-300 bg-white text-slate-500"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : "○"}
                </span>
                <span className={done ? "line-through opacity-80" : "font-medium"}>
                  {CHECKLIST_STEP_LABELS[id]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        <Link to="/guide" className="font-medium text-brand-600 hover:underline">
          Full how-to guide
        </Link>
      </p>
    </section>
  );
}
