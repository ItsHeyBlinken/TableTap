import { useMemo, useRef, useState } from "react";
import { apiPost } from "../lib/api";
import { formatCurrency, previewProfit } from "../lib/format";
import { setLastEventId } from "../lib/posStorage";
import type { Card } from "../types";
import { EventSelect } from "./EventSelect";

interface QuickSaleFormProps {
  onSuccess?: (card: Card, profit: number) => void;
}

export function QuickSaleForm({ onSuccess }: QuickSaleFormProps) {
  const priceRef = useRef<HTMLInputElement>(null);
  const [playerName, setPlayerName] = useState("");
  const [brand, setBrand] = useState("");
  const [cost, setCost] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const costNum = Number(cost) || 0;
  const profitPreview = useMemo(() => {
    const price = Number(soldPrice);
    if (!soldPrice || Number.isNaN(price)) return null;
    return previewProfit(price, costNum);
  }, [soldPrice, costNum]);

  const handleEventChange = (id: string) => {
    setEventId(id);
    setLastEventId(id);
  };

  const reset = () => {
    setPlayerName("");
    setBrand("");
    setCost("");
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
      const data = await apiPost<{ card: Card }>("/api/sales/quick", {
        player_name: playerName.trim(),
        brand: brand.trim(),
        purchase_price: costNum,
        sold_price: Number(soldPrice),
        sold_date: today,
        event_id: eventId || null,
      });
      const profit = data.card.profit ?? profitPreview ?? 0;
      onSuccess?.(data.card, profit);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sale failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-slate-600">
        Sold something not in stock? Enter details once — we log the sale and profit.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <input
        required
        placeholder="Player name *"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className={inputClass}
        autoFocus
      />
      <input
        required
        placeholder="Brand / set *"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          inputMode="decimal"
          required
          placeholder="Your cost *"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className={inputClass}
        />
        <input
          ref={priceRef}
          type="number"
          inputMode="decimal"
          required
          placeholder="Sale price *"
          value={soldPrice}
          onChange={(e) => setSoldPrice(e.target.value)}
          className={`${inputClass} text-lg font-bold`}
        />
      </div>

      {profitPreview != null && (
        <div
          className={`rounded-xl px-4 py-3 text-center ${
            profitPreview >= 0 ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
          }`}
        >
          <p className="text-xs font-semibold uppercase">Profit</p>
          <p className="text-2xl font-bold">{formatCurrency(profitPreview)}</p>
        </div>
      )}

      <EventSelect value={eventId} onChange={handleEventChange} posMode />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Complete quick sale"}
      </button>
    </form>
  );
}
