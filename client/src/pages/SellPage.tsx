import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { cardLabel, formatCurrency } from "../lib/format";
import type { Card } from "../types";
import { SellForm } from "../components/SellForm";
import { QuickSaleForm } from "../components/QuickSaleForm";
import { TradeTab } from "../components/TradeTab";

type Tab = "stock" | "quick" | "trade";

export function SellPage() {
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get("card") ?? "";

  const [tab, setTab] = useState<Tab>(preselectId ? "stock" : "stock");
  const [stock, setStock] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ profit: number; label: string } | null>(null);

  const loadStock = useCallback(() => {
    return apiGet<{ cards: Card[] }>("/api/cards?status=active&limit=200").then((data) => {
      setStock(data.cards);
      return data.cards;
    });
  }, []);

  useEffect(() => {
    loadStock()
      .then((cards) => {
        if (preselectId && cards.some((c) => c.id === preselectId)) {
          setSelectedId(preselectId);
        } else if (cards[0]) {
          setSelectedId(cards[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [loadStock, preselectId]);

  const filtered = stock.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.player_name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      (c.team?.toLowerCase().includes(q) ?? false)
    );
  });

  const selected = stock.find((c) => c.id === selectedId);

  const handleSaleSuccess = (profit: number, label: string) => {
    setToast({ profit, label });
    setTimeout(() => setToast(null), 2500);
    loadStock().then((cards) => {
      setStock(cards);
      if (selectedId && !cards.find((c) => c.id === selectedId)) {
        setSelectedId(cards[0]?.id ?? "");
      }
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Record sale</h1>
        <p className="text-sm text-slate-600">Built for busy tables — search, price, done.</p>
      </div>

      {toast && (
        <div className="mb-4 rounded-xl border border-green-300 bg-green-100 px-4 py-3 text-center">
          <p className="font-semibold text-green-900">Sale recorded</p>
          <p className="text-sm text-green-800">
            {toast.label} · Profit {formatCurrency(toast.profit)}
          </p>
        </div>
      )}

      <div className="mb-4 flex rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("stock")}
          className={`flex-1 rounded-md py-2.5 text-sm font-semibold ${
            tab === "stock" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          From stock
        </button>
        <button
          type="button"
          onClick={() => setTab("quick")}
          className={`flex-1 rounded-md py-2.5 text-sm font-semibold ${
            tab === "quick" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Quick sale
        </button>
        <button
          type="button"
          onClick={() => setTab("trade")}
          className={`flex-1 rounded-md py-2.5 text-sm font-semibold ${
            tab === "trade" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Trade
        </button>
      </div>

      {tab === "quick" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <QuickSaleForm
            onSuccess={(card, profit) =>
              handleSaleSuccess(profit, `${card.player_name} (walk-up)`)
            }
          />
        </div>
      ) : tab === "trade" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading ? (
            <p className="text-slate-600">Loading stock…</p>
          ) : (
            <TradeTab
              stock={stock}
              selectedId={selectedId}
              onSelectId={setSelectedId}
              search={search}
              onSearchChange={setSearch}
              onSuccess={(result) => {
                const cash = result.cash_adjustment;
                const cashNote =
                  cash !== 0 ? ` · Cash ${cash > 0 ? "+" : ""}${formatCurrency(cash)}` : "";
                handleSaleSuccess(
                  result.outgoing_profit,
                  `Trade: ${cardLabel(result.outgoing)} → ${result.incoming.player_name}${cashNote}`
                );
              }}
            />
          )}
        </div>
      ) : loading ? (
        <p className="text-slate-600">Loading stock…</p>
      ) : stock.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-600">No stock on hand.</p>
          <p className="mt-2 text-sm text-slate-500">Use Quick sale or add stock first.</p>
          <button
            type="button"
            onClick={() => setTab("quick")}
            className="mt-4 text-green-700 font-medium hover:underline"
          >
            Quick sale →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="search"
            placeholder="Search player, brand, team…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base"
            autoComplete="off"
          />

          <ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">No matches</li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full px-4 py-3 text-left text-sm transition ${
                      c.id === selectedId
                        ? "bg-brand-50 font-semibold text-brand-800"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="block truncate">{cardLabel(c)}</span>
                    <span className="text-xs text-slate-500">
                      Cost {formatCurrency(c.cost_basis)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {selected && (
            <div className="rounded-2xl border-2 border-green-200 bg-white p-4 shadow-sm">
              <SellForm
                key={selected.id}
                card={selected}
                onSuccess={(_card, profit) =>
                  handleSaleSuccess(profit, cardLabel(selected))
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
