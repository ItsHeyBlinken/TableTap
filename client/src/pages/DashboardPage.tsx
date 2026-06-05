import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { cardLabel, formatCurrency, formatDate } from "../lib/format";
import type { VendorDashboard } from "../types";
import { StatCard } from "../components/StatCard";

export function DashboardPage() {
  const [stats, setStats] = useState<VendorDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<VendorDashboard>("/api/dashboard")
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <p className="text-slate-600">Loading...</p>;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor dashboard</h1>
          <p className="text-slate-600">How much did you make?</p>
        </div>
        <Link
          to="/sell"
          className="touch-target inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3.5 text-base font-bold text-white hover:bg-green-700 sm:w-auto"
        >
          Record sale
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-800">Today&apos;s profit</p>
        <p className="mt-1 text-4xl font-bold text-green-900">{formatCurrency(stats.todayProfit)}</p>
        <p className="mt-2 text-sm text-green-700">
          {stats.todaySalesCount} sale{stats.todaySalesCount !== 1 ? "s" : ""} ·{" "}
          {formatCurrency(stats.todayRevenue)} revenue
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="All-time profit" value={formatCurrency(stats.totalProfit)} />
        <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} />
        <StatCard label="Total cost basis" value={formatCurrency(stats.totalCostBasis)} />
        <StatCard label="Unsold stock" value={String(stats.unsoldStockCount)} sub="items on hand" />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Profit by event</h2>
        {stats.profitByEvent.length === 0 ? (
          <p className="text-slate-600">No sales yet. Record a sale and assign an event to track show profit.</p>
        ) : (
          <>
          <ul className="space-y-3 md:hidden">
            {stats.profitByEvent.map((row) => (
              <li
                key={row.event_id ?? "none"}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="font-semibold text-slate-900">{row.event_name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {row.sales_count} sale{row.sales_count !== 1 ? "s" : ""} ·{" "}
                  {formatCurrency(row.revenue)} revenue
                </p>
                <p
                  className={`mt-2 text-lg font-bold ${
                    row.profit >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {formatCurrency(row.profit)} profit
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Event</th>
                  <th className="px-4 py-3 text-left font-medium">Sales</th>
                  <th className="px-4 py-3 text-left font-medium">Revenue</th>
                  <th className="px-4 py-3 text-left font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {stats.profitByEvent.map((row) => (
                  <tr key={row.event_id ?? "none"} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">{row.event_name}</td>
                    <td className="px-4 py-3">{row.sales_count}</td>
                    <td className="px-4 py-3">{formatCurrency(row.revenue)}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        row.profit >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {formatCurrency(row.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Top sales by profit</h2>
          {stats.topSoldByProfit.length === 0 ? (
            <p className="text-sm text-slate-600">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {stats.topSoldByProfit.map((card) => (
                <li key={card.id} className="flex justify-between gap-4 px-4 py-3">
                  <Link to={`/cards/${card.id}`} className="font-medium text-brand-600 hover:underline">
                    {cardLabel(card)}
                  </Link>
                  <span className="font-semibold text-green-700">{formatCurrency(card.profit)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent sales</h2>
          {stats.recentSales.length === 0 ? (
            <p className="text-sm text-slate-600">No recent activity.</p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {stats.recentSales.map((card) => (
                <li key={card.id} className="px-4 py-3">
                  <div className="flex justify-between gap-2">
                    <Link to={`/cards/${card.id}`} className="font-medium text-brand-600 hover:underline">
                      {cardLabel(card)}
                    </Link>
                    <span className="font-semibold text-green-700">{formatCurrency(card.profit)}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDate(card.sold_date)}
                    {card.event_name ? ` · ${card.event_name}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
