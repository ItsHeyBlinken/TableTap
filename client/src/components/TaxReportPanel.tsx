import { useCallback, useEffect, useState } from "react";
import { formatCurrency, formatDate, localDateString } from "../lib/format";
import type { SalesEvent } from "../types";

const PRESETS = [
  { id: "last_year", label: "Last year" },
  { id: "this_year", label: "This year" },
  { id: "last_quarter", label: "Last quarter" },
  { id: "this_quarter", label: "This quarter" },
  { id: "custom", label: "Custom" },
] as const;

type TaxPreset = (typeof PRESETS)[number]["id"];

type TaxTotals = {
  grossSales: number;
  tradeCash: number;
  tradeValueNoCash: number;
  tradeValueWithCash?: number;
  costOfGoods: number;
  profit: number;
  itemCount: number;
};

type TaxReport = {
  from: string;
  to: string;
  warning: string | null;
  totals: TaxTotals;
  byShow: Array<TaxTotals & { showName: string }>;
};

interface TaxReportPanelProps {
  events: SalesEvent[];
}

function profitClass(amount: number): string {
  return amount >= 0 ? "text-green-700" : "text-red-700";
}

export function TaxReportPanel({ events }: TaxReportPanelProps) {
  const [preset, setPreset] = useState<TaxPreset>("last_year");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [eventId, setEventId] = useState("");
  const [report, setReport] = useState<TaxReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (preset === "custom" && (!from || !to || from > to)) {
      setReport(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ preset, today: localDateString() });
    if (preset === "custom") {
      params.set("from", from);
      params.set("to", to);
    }
    if (eventId) params.set("event_id", eventId);
    try {
      const res = await fetch(`/api/reports/sales?${params}`, { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as TaxReport & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load the tax report");
      setReport(data);
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : "Could not load the tax report");
    } finally {
      setLoading(false);
    }
  }, [preset, from, to, eventId]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  const exportCsv = async () => {
    if (!report) return;
    setExporting(true);
    setError("");
    const params = new URLSearchParams({
      preset,
      today: localDateString(),
      from: report.from,
      to: report.to,
    });
    if (preset === "custom") {
      params.set("from", from);
      params.set("to", to);
    }
    if (eventId) params.set("event_id", eventId);
    try {
      const res = await fetch(`/api/reports/sales/export?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Could not download the CSV");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tabletap-sales-${formatDate(report.from)}_to_${formatDate(report.to)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download the CSV");
    } finally {
      setExporting(false);
    }
  };

  const totals = report?.totals;

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tax export</h2>
          <p className="text-sm text-slate-600">
            Totals and the CSV use the same sales. This is bookkeeping help, not tax advice.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            exportCsv().catch(() => setExporting(false));
          }}
          disabled={!report || loading || exporting}
          className="touch-target rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
        >
          {exporting ? "Preparing…" : "Download CSV"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPreset(item.id)}
            className={`rounded-full px-3 py-2 text-sm font-medium ${
              preset === item.id ? "bg-brand-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="input-mobile mt-1 w-full"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="input-mobile mt-1 w-full"
            />
          </label>
        </div>
      )}

      <label className="mb-4 block text-sm font-medium text-slate-700">
        Show
        <select
          value={eventId}
          onChange={(event) => setEventId(event.target.value)}
          className="input-mobile mt-1 w-full max-w-md"
        >
          <option value="">All shows</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </label>

      {report && (
        <p className="mb-3 text-sm text-slate-600">
          {formatDate(report.from)} to {formatDate(report.to)}
        </p>
      )}
      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
      {report?.warning && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {report.warning}
        </p>
      )}

      {loading && <p className="text-sm text-slate-600">Loading totals…</p>}

      {totals && !loading && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Total label="Gross sales" value={formatCurrency(totals.grossSales)} />
            <Total label="Trade cash" value={formatCurrency(totals.tradeCash)} />
            <Total label="Trade value (no cash)" value={formatCurrency(totals.tradeValueNoCash)} />
            <Total
              label="Trade value (with cash)"
              value={formatCurrency(totals.tradeValueWithCash ?? 0)}
            />
            <Total label="Cost of goods" value={formatCurrency(totals.costOfGoods)} />
            <Total label="Profit" value={formatCurrency(totals.profit)} className={profitClass(totals.profit)} />
            <Total label="Item count" value={String(totals.itemCount)} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Gross + trade cash + trade values − cost = profit
          </p>

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">By show</h3>
            {report.byShow.length === 0 ? (
              <p className="text-sm text-slate-600">No sales in this range.</p>
            ) : (
              <>
                <ul className="space-y-2 md:hidden">
                  {report.byShow.map((show) => (
                    <li key={show.showName} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                      <p className="font-semibold text-slate-900">{show.showName}</p>
                      <p className="mt-1 text-slate-600">
                        {show.itemCount} item{show.itemCount === 1 ? "" : "s"} · {formatCurrency(show.grossSales)}{" "}
                        gross · {formatCurrency(show.tradeCash)} trade cash ·{" "}
                        {formatCurrency((show.tradeValueWithCash ?? 0) + show.tradeValueNoCash)} trade
                        value
                      </p>
                      <p className={`mt-1 font-bold ${profitClass(show.profit)}`}>
                        {formatCurrency(show.profit)} profit
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-white">
                      <tr>
                        <th className="px-3 py-2 font-medium">Show</th>
                        <th className="px-3 py-2 font-medium">Items</th>
                        <th className="px-3 py-2 font-medium">Gross</th>
                        <th className="px-3 py-2 font-medium">Trade cash</th>
                        <th className="px-3 py-2 font-medium">No-cash trades</th>
                        <th className="px-3 py-2 font-medium">Cash trades</th>
                        <th className="px-3 py-2 font-medium">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.byShow.map((show) => (
                        <tr key={show.showName} className="border-b border-slate-100">
                          <td className="px-3 py-2">{show.showName}</td>
                          <td className="px-3 py-2">{show.itemCount}</td>
                          <td className="px-3 py-2">{formatCurrency(show.grossSales)}</td>
                          <td className="px-3 py-2">{formatCurrency(show.tradeCash)}</td>
                          <td className="px-3 py-2">{formatCurrency(show.tradeValueNoCash)}</td>
                          <td className="px-3 py-2">{formatCurrency(show.tradeValueWithCash ?? 0)}</td>
                          <td className={`px-3 py-2 font-semibold ${profitClass(show.profit)}`}>
                            {formatCurrency(show.profit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <details className="mt-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-800">Column guide</summary>
        <div className="mt-2 space-y-2">
          <p>
            Gross sales are cash sales only. Trade value (no cash) is the agreed value of trades where no cash
            changed hands. Trade value (with cash) is the agreed card value of trades where cash also changed
            hands; the cash itself is in Trade cash. Trades that include cash still appear in the CSV; their
            card value is <span className="font-medium">line_revenue</span>, and the cash is{" "}
            <span className="font-medium">trade_cash</span>.
          </p>
          <p>
            Positive trade cash is cash you received. Negative trade cash is cash you paid. Each trade group’s cash
            is listed on one row.
          </p>
          <p>
            Profit is line revenue minus cost, plus that row’s trade cash. Cost is what you paid per item times
            quantity. The sale amount is not multiplied by quantity again.
          </p>
          <p>Your accountant decides how to treat trades. TableTap does not give tax advice.</p>
        </div>
      </details>
    </section>
  );
}

function Total({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold text-slate-900 ${className ?? ""}`}>{value}</p>
    </div>
  );
}
