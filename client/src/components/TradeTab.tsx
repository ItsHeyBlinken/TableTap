import { useMemo, useState } from "react";
import { apiPost } from "../lib/api";
import { cardLabel, formatCurrency, previewProfit } from "../lib/format";
import { setLastEventId } from "../lib/posStorage";
import type { Card, TradeResult } from "../types";
import { EventSelect } from "./EventSelect";
import { FormDatalistInput, FormSelect } from "./FormSelect";
import {
  CARD_BRANDS,
  CARD_CONDITIONS,
  CARD_SPORTS,
  getCardYearOptions,
} from "../lib/stockOptions";

interface TradeTabProps {
  stock: Card[];
  selectedId: string;
  onSelectId: (id: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
  onSuccess: (result: TradeResult) => void;
}

export function TradeTab({
  stock,
  selectedId,
  onSelectId,
  search,
  onSearchChange,
  onSuccess,
}: TradeTabProps) {
  const selected = stock.find((c) => c.id === selectedId);

  const [outgoingValue, setOutgoingValue] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [sport, setSport] = useState("");
  const [condition, setCondition] = useState("");
  const [incomingValue, setIncomingValue] = useState("");
  const [cashAdjustment, setCashAdjustment] = useState("");
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = stock.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.player_name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      (c.team?.toLowerCase().includes(q) ?? false)
    );
  });

  const outCost = selected?.cost_basis ?? 0;
  const outVal = Number(outgoingValue) || 0;
  const profitPreview = useMemo(() => {
    if (!outgoingValue || Number.isNaN(outVal)) return null;
    return previewProfit(outVal, outCost);
  }, [outgoingValue, outVal, outCost]);

  const handleEventChange = (id: string) => {
    setEventId(id);
    setLastEventId(id);
  };

  const resetIncoming = () => {
    setPlayerName("");
    setBrand("");
    setYear(String(new Date().getFullYear()));
    setSport("");
    setCondition("");
    setIncomingValue("");
    setOutgoingValue("");
    setCashAdjustment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setError("");
    setLoading(true);
    try {
      const result = await apiPost<TradeResult>("/api/trades", {
        outgoing_card_id: selected.id,
        outgoing_trade_value: outVal,
        incoming: {
          player_name: playerName.trim(),
          brand: brand.trim(),
          year: year ? Number(year) : undefined,
          sport: sport || null,
          condition: condition || null,
          incoming_trade_value: Number(incomingValue),
        },
        cash_adjustment: cashAdjustment ? Number(cashAdjustment) : 0,
        event_id: eventId || null,
      });
      onSuccess(result);
      resetIncoming();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "input-mobile w-full";

  if (stock.length === 0) {
    return <p className="text-slate-600">Add stock before recording a trade.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Card going out is marked sold at trade value. Card coming in is added to stock at the value you assign.
      </p>

      <input
        type="search"
        placeholder="Search stock going out…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className={inputClass}
      />

      <ul className="max-h-[min(40vh,280px)] overflow-y-auto rounded-lg border border-slate-200 bg-white">
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                onSelectId(c.id);
                setOutgoingValue("");
              }}
              className={`touch-target w-full px-4 py-3.5 text-left text-sm active:bg-slate-50 ${
                c.id === selectedId ? "bg-brand-50 font-semibold text-brand-800" : "hover:bg-slate-50"
              }`}
            >
              {cardLabel(c)} · cost {formatCurrency(c.cost_basis)}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4">
          <p className="text-sm font-medium text-amber-900">Giving: {cardLabel(selected)}</p>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Trade value (card going out)</label>
            <input
              type="number"
              inputMode="decimal"
              required
              min="0"
              step="0.01"
              value={outgoingValue}
              onChange={(e) => setOutgoingValue(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-xl font-bold"
              placeholder="Agreed value"
            />
            <p className="mt-1 text-xs text-slate-500">Your cost was {formatCurrency(outCost)}</p>
          </div>

          {profitPreview != null && (
            <div className="rounded-xl bg-green-100 px-4 py-3 text-center text-green-900">
              <p className="text-xs font-semibold uppercase">Profit on card you gave</p>
              <p className="text-2xl font-bold">{formatCurrency(profitPreview)}</p>
            </div>
          )}

          <hr className="border-amber-200" />

          <p className="text-sm font-medium text-slate-800">Receiving (adds to stock)</p>
          <input
            required
            placeholder="Player name *"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className={inputClass}
          />
          <FormDatalistInput
            label="Brand / set *"
            value={brand}
            onChange={setBrand}
            options={CARD_BRANDS}
            placeholder="Pick or type set"
            listId="trade-brands"
            required
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Year"
              value={year}
              onChange={setYear}
              options={getCardYearOptions()}
              placeholder="Year"
            />
            <FormSelect
              label="Sport"
              value={sport}
              onChange={setSport}
              options={CARD_SPORTS}
              placeholder="Sport"
            />
          </div>
          <FormSelect
            label="Condition"
            value={condition}
            onChange={setCondition}
            options={CARD_CONDITIONS}
            placeholder="Condition"
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Value you assign (cost basis) *</label>
            <input
              type="number"
              inputMode="decimal"
              required
              min="0"
              step="0.01"
              value={incomingValue}
              onChange={(e) => setIncomingValue(e.target.value)}
              className={inputClass}
              placeholder="What this card is worth to you in the deal"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Cash adjustment (optional)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={cashAdjustment}
              onChange={(e) => setCashAdjustment(e.target.value)}
              className={inputClass}
              placeholder="e.g. 20 if they add $20 cash"
            />
            <p className="mt-1 text-xs text-slate-500">Positive = cash you received. Negative = cash you paid.</p>
          </div>

          <EventSelect value={eventId} onChange={handleEventChange} posMode />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 py-4 text-lg font-bold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "Recording…" : "Complete trade"}
          </button>
        </form>
      )}
    </div>
  );
}
