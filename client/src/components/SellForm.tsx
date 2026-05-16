import { useMemo, useRef, useState } from "react";
import { apiPatch } from "../lib/api";
import { cardLabel, formatCurrency, previewProfit } from "../lib/format";
import { setLastEventId } from "../lib/posStorage";
import type { Card } from "../types";
import { EventSelect } from "./EventSelect";

interface SellFormProps {
  card: Card;
  onSuccess?: (card: Card, profit: number) => void;
}

export function SellForm({ card, onSuccess }: SellFormProps) {
  const priceRef = useRef<HTMLInputElement>(null);
  const [soldPrice, setSoldPrice] = useState("");
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const costBasis = card.cost_basis ?? Number(card.purchase_price ?? 0) * card.quantity;
  const profitPreview = useMemo(() => {
    const price = Number(soldPrice);
    if (!soldPrice || Number.isNaN(price)) return null;
    return previewProfit(price, costBasis);
  }, [soldPrice, costBasis]);

  const handleEventChange = (id: string) => {
    setEventId(id);
    setLastEventId(id);
  };

  const resetForNext = () => {
    setSoldPrice("");
    setError("");
    priceRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    try {
      const data = await apiPatch<{ card: Card }>(`/api/cards/${card.id}/sell`, {
        sold_price: Number(soldPrice),
        sold_date: today,
        event_id: eventId || null,
      });
      const profit = data.card.profit ?? previewProfit(Number(soldPrice), costBasis) ?? 0;
      onSuccess?.(data.card, profit);
      resetForNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sale failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="truncate font-semibold text-slate-900">{cardLabel(card)}</p>
        <p className="text-sm text-slate-600">Cost: {formatCurrency(costBasis)}</p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Sale price</label>
        <input
          ref={priceRef}
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          autoFocus
          value={soldPrice}
          onChange={(e) => setSoldPrice(e.target.value)}
          className="w-full rounded-xl border-2 border-slate-300 px-4 py-4 text-2xl font-bold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
          placeholder="0.00"
        />
      </div>

      {profitPreview != null && (
        <div
          className={`rounded-xl px-4 py-4 text-center ${
            profitPreview >= 0 ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide">Profit</p>
          <p className="text-3xl font-bold">{formatCurrency(profitPreview)}</p>
        </div>
      )}

      <EventSelect value={eventId} onChange={handleEventChange} posMode />

      <button
        type="submit"
        disabled={loading || !soldPrice}
        className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white shadow-md hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Complete sale"}
      </button>
    </form>
  );
}
