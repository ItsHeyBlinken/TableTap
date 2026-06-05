import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { cardLabel, formatCurrency, formatDate } from "../lib/format";
import type { Card, PaginationMeta, SalesEvent } from "../types";
import { Pagination } from "../components/Pagination";

export function SalesPage() {
  const [sales, setSales] = useState<Card[]>([]);
  const [events, setEvents] = useState<SalesEvent[]>([]);
  const [eventFilter, setEventFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ events: SalesEvent[] }>("/api/events").then((d) => setEvents(d.events));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: "sold", page: String(page), limit: "20" });
    if (eventFilter) params.set("event_id", eventFilter);
    const data = await apiGet<{ cards: Card[]; pagination: PaginationMeta }>(`/api/cards?${params}`);
    setSales(data.cards);
    setPagination(data.pagination);
    setLoading(false);
  }, [page, eventFilter]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
          <p className="text-sm text-slate-600">Every completed sale with profit.</p>
        </div>
        <Link
          to="/sell"
          className="touch-target inline-flex items-center rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          + Record sale
        </Link>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Filter by event</label>
        <select
          value={eventFilter}
          onChange={(e) => {
            setEventFilter(e.target.value);
            setPage(1);
          }}
          className="input-mobile w-full max-w-md"
        >
          <option value="">All events</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : sales.length === 0 ? (
        <p className="text-slate-600">No sales yet. Record your first sale from the POS screen.</p>
      ) : (
        <>
        <ul className="space-y-3 md:hidden">
          {sales.map((card) => (
            <li key={card.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <Link to={`/cards/${card.id}`} className="font-medium text-brand-600">
                {cardLabel(card)}
              </Link>
              {card.sale_type === "trade" && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                  Trade
                </span>
              )}
              <p className="mt-1 text-sm text-slate-500">
                {formatDate(card.sold_date)}
                {card.event_name ? ` · ${card.event_name}` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>
                  Revenue{" "}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(
                      Number(card.sold_price ?? 0) + Number(card.cash_adjustment ?? 0)
                    )}
                  </span>
                </span>
                <span
                  className={`font-bold ${
                    (card.profit ?? 0) >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {card.profit != null ? formatCurrency(card.profit) : "—"} profit
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Card</th>
                <th className="px-4 py-3 font-medium">Sold</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((card) => (
                <tr key={card.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <Link to={`/cards/${card.id}`} className="font-medium text-brand-600 hover:underline">
                      {cardLabel(card)}
                    </Link>
                    {card.sale_type === "trade" && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        Trade
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(card.sold_date)}</td>
                  <td className="px-4 py-3">{card.event_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(
                      Number(card.sold_price ?? 0) + Number(card.cash_adjustment ?? 0)
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      (card.profit ?? 0) >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {card.profit != null ? formatCurrency(card.profit) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
}
