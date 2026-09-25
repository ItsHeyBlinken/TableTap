import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import {
  type CartLine,
  cartTotal,
  clearCart,
  loadCart,
  mergeLine,
  saveCart,
} from "../lib/cartStorage";
import { cardLabel, formatCurrency, cardAskingPrice } from "../lib/format";
import { getLastEventId } from "../lib/posStorage";
import type { Card, CheckoutResult } from "../types";
import { CartPanel } from "../components/CartPanel";
import { QuickSaleForm } from "../components/QuickSaleForm";
import { StockSellPanel } from "../components/StockSellPanel";
import { TradeTab } from "../components/TradeTab";

type Tab = "stock" | "quick" | "trade";

function clampCartToStock(lines: CartLine[], cards: Card[]): CartLine[] {
  const byId = new Map(cards.map((c) => [c.id, c]));
  return lines
    .map((line) => {
      const card = byId.get(line.cardId);
      if (!card || card.quantity < 1) return null;
      const maxQuantity = card.quantity;
      const quantity = Math.min(line.quantity, maxQuantity);
      return {
        ...line,
        label: cardLabel(card),
        quantity,
        maxQuantity,
        purchasePrice: Number(card.purchase_price ?? 0),
      };
    })
    .filter((line): line is CartLine => line != null);
}

export function SellPage() {
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get("card") ?? "";
  const searchRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>(preselectId ? "stock" : "stock");
  const [stock, setStock] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartLine[]>(() => loadCart());
  const [eventId, setEventId] = useState(() => getLastEventId());
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [toast, setToast] = useState<{ profit: number; total: number; label: string } | null>(
    null
  );

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const loadStock = useCallback(() => {
    return apiGet<{ cards: Card[] }>("/api/cards?status=active&limit=200").then((data) => {
      setStock(data.cards);
      setCart((prev) => clampCartToStock(prev, data.cards));
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
    setToast({ profit, total: 0, label });
    setTimeout(() => setToast(null), 2500);
    loadStock().then((cards) => {
      if (selectedId && !cards.find((c) => c.id === selectedId)) {
        setSelectedId(cards[0]?.id ?? "");
      }
    });
  };

  const checkoutLines = async (lines: CartLine[], successLabel: string) => {
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const result = await apiPost<CheckoutResult>("/api/sales/checkout", {
        event_id: eventId || null,
        sold_date: new Date().toISOString().slice(0, 10),
        lines: lines.map((l) => ({
          card_id: l.cardId,
          quantity: l.quantity,
          unit_price: l.unitPrice,
        })),
      });
      clearCart();
      setCart([]);
      setToast({ profit: result.profit, total: result.total, label: successLabel });
      setTimeout(() => setToast(null), 2500);
      searchRef.current?.focus();
      try {
        const cards = await loadStock();
        if (selectedId && !cards.find((c) => c.id === selectedId)) {
          setSelectedId(cards[0]?.id ?? "");
        }
      } catch {
        // Sale already succeeded — stock list refresh is best-effort
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const addToCart = (line: CartLine) => {
    setCart((prev) => mergeLine(prev, line));
    searchRef.current?.focus();
  };

  const sellNow = (line: CartLine) => {
    void checkoutLines([line], line.label);
  };

  const completeSale = () => {
    if (cart.length === 0) return;
    const label =
      cart.length === 1 ? cart[0].label : `${cart.length} items · ${formatCurrency(cartTotal(cart))}`;
    void checkoutLines(cart, label);
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Record sale</h1>
        <p className="text-sm text-slate-600">
          Add lines, then complete — or Sell now for one card.
        </p>
      </div>

      {toast && (
        <div className="mb-4 rounded-xl border border-green-300 bg-green-100 px-4 py-3 text-center">
          <p className="font-semibold text-green-900">Sale recorded</p>
          <p className="text-sm text-green-800">
            {toast.label}
            {toast.total > 0 && <> · Total {formatCurrency(toast.total)}</>}
            {" · "}
            Profit {formatCurrency(toast.profit)}
          </p>
        </div>
      )}

      <div className="mb-4 flex rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("stock")}
          className={`touch-target flex-1 rounded-md py-3 text-xs font-semibold sm:text-sm ${
            tab === "stock" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          From stock
        </button>
        <button
          type="button"
          onClick={() => setTab("quick")}
          className={`touch-target flex-1 rounded-md py-3 text-xs font-semibold sm:text-sm ${
            tab === "quick" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
          }`}
        >
          Quick sale
        </button>
        <button
          type="button"
          onClick={() => setTab("trade")}
          className={`touch-target flex-1 rounded-md py-3 text-xs font-semibold sm:text-sm ${
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
        <div className="space-y-4 pb-4">
          <input
            ref={searchRef}
            type="search"
            placeholder="Search player, brand, team…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-mobile w-full"
            autoComplete="off"
          />

          <ul className="max-h-[min(40vh,280px)] overflow-y-auto rounded-lg border border-slate-200 bg-white">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">No matches</li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={`touch-target w-full px-4 py-3.5 text-left text-sm transition active:bg-slate-100 ${
                      c.id === selectedId
                        ? "bg-brand-50 font-semibold text-brand-800"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="block truncate">{cardLabel(c)}</span>
                    <span className="text-xs text-slate-500">
                      Cost {formatCurrency(c.cost_basis)}
                      {cardAskingPrice(c) != null && (
                        <> · Ask {formatCurrency(cardAskingPrice(c))}</>
                      )}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {checkoutError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {checkoutError}
            </p>
          )}

          {selected && (
            <div className="rounded-2xl border-2 border-green-200 bg-white p-4 shadow-sm">
              <StockSellPanel
                key={selected.id}
                card={selected}
                canSellNow={cart.length === 0}
                disabled={checkoutLoading}
                onAdd={addToCart}
                onSellNow={sellNow}
              />
            </div>
          )}

          <CartPanel
            lines={cart}
            onChangeLines={setCart}
            eventId={eventId}
            onEventChange={setEventId}
            onCheckout={completeSale}
            loading={checkoutLoading}
            total={cartTotal(cart)}
          />
        </div>
      )}
    </div>
  );
}
