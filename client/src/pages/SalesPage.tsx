import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { cardLabel, formatCurrency, formatDate } from "../lib/format";
import { groupSoldCards, type SaleReceipt } from "../lib/groupSales";
import type { Card, PaginationMeta, SalesEvent } from "../types";
import { Pagination } from "../components/Pagination";

function lineRevenue(card: Card): number {
  return Number(card.sold_price ?? 0) + Number(card.cash_adjustment ?? 0);
}

function profitClass(profit: number): string {
  return profit >= 0 ? "text-green-700" : "text-red-700";
}

function TradeBadge() {
  return (
    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
      Trade
    </span>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CardLineLink({ card }: { card: Card }) {
  return (
    <>
      <Link to={`/cards/${card.id}`} className="font-medium text-brand-600 hover:underline">
        {cardLabel(card)}
      </Link>
      {card.sale_type === "trade" && <TradeBadge />}
    </>
  );
}

function receiptSummaryTitle(receipt: SaleReceipt): string {
  if (receipt.lines.length === 1) {
    return cardLabel(receipt.lines[0]!);
  }
  return `${receipt.lines.length} items`;
}

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
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  const receipts = useMemo(() => groupSoldCards(sales), [sales]);

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
    setExpandedKeys(new Set());
    setLoading(false);
  }, [page, eventFilter]);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

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
            {receipts.map((receipt) => {
              const multi = receipt.lines.length > 1;
              const expanded = expandedKeys.has(receipt.key);
              return (
                <li key={receipt.key} className="rounded-xl border border-slate-200 bg-white p-4">
                  {multi ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-start gap-2 text-left"
                        onClick={() => toggleExpanded(receipt.key)}
                        aria-expanded={expanded}
                      >
                        <ChevronIcon expanded={expanded} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">{receiptSummaryTitle(receipt)}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(receipt.soldDate)}
                            {receipt.eventName ? ` · ${receipt.eventName}` : ""}
                            {` · ${receipt.lines.length} items`}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <span>
                              Revenue{" "}
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(receipt.total)}
                              </span>
                            </span>
                            <span className={`font-bold ${profitClass(receipt.profit)}`}>
                              {formatCurrency(receipt.profit)} profit
                            </span>
                          </div>
                        </div>
                      </button>
                      {expanded && (
                        <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3 pl-7">
                          {receipt.lines.map((card) => (
                            <li key={card.id} className="text-sm">
                              <CardLineLink card={card} />
                              <p className="mt-0.5 text-xs text-slate-500">Qty {card.quantity}</p>
                              <div className="mt-1 flex justify-between text-slate-600">
                                <span>{formatCurrency(lineRevenue(card))}</span>
                                <span className={profitClass(card.profit ?? 0)}>
                                  {card.profit != null ? formatCurrency(card.profit) : "—"}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <>
                      <CardLineLink card={receipt.lines[0]!} />
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(receipt.soldDate)}
                        {receipt.eventName ? ` · ${receipt.eventName}` : ""}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span>
                          Revenue{" "}
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(receipt.total)}
                          </span>
                        </span>
                        <span className={`font-bold ${profitClass(receipt.profit)}`}>
                          {formatCurrency(receipt.profit)} profit
                        </span>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
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
                {receipts.map((receipt) => {
                  const multi = receipt.lines.length > 1;
                  const expanded = expandedKeys.has(receipt.key);
                  return (
                    <Fragment key={receipt.key}>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-3">
                          {multi ? (
                            <button
                              type="button"
                              className="flex items-center gap-2 text-left font-medium text-slate-900 hover:text-brand-600"
                              onClick={() => toggleExpanded(receipt.key)}
                              aria-expanded={expanded}
                            >
                              <ChevronIcon expanded={expanded} />
                              {receipt.lines.length} items
                            </button>
                          ) : (
                            <CardLineLink card={receipt.lines[0]!} />
                          )}
                        </td>
                        <td className="px-4 py-3">{formatDate(receipt.soldDate)}</td>
                        <td className="px-4 py-3">{receipt.eventName ?? "—"}</td>
                        <td className="px-4 py-3">{formatCurrency(receipt.total)}</td>
                        <td className={`px-4 py-3 font-semibold ${profitClass(receipt.profit)}`}>
                          {formatCurrency(receipt.profit)}
                        </td>
                      </tr>
                      {multi &&
                        expanded &&
                        receipt.lines.map((card) => (
                          <tr key={`${receipt.key}-${card.id}`} className="border-b border-slate-50 bg-slate-50/50">
                            <td className="px-4 py-2 pl-12">
                              <CardLineLink card={card} />
                              <span className="mt-0.5 block text-xs text-slate-500">Qty {card.quantity}</span>
                            </td>
                            <td className="px-4 py-2" colSpan={2} />
                            <td className="px-4 py-2">{formatCurrency(lineRevenue(card))}</td>
                            <td className={`px-4 py-2 font-medium ${profitClass(card.profit ?? 0)}`}>
                              {card.profit != null ? formatCurrency(card.profit) : "—"}
                            </td>
                          </tr>
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
}
