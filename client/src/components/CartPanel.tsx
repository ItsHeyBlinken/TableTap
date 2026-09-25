import { setLastEventId } from "../lib/posStorage";
import { formatCurrency } from "../lib/format";
import type { CartLine } from "../lib/cartStorage";
import { EventSelect } from "./EventSelect";

interface CartPanelProps {
  lines: CartLine[];
  onChangeLines: (lines: CartLine[]) => void;
  eventId: string;
  onEventChange: (eventId: string) => void;
  onCheckout: () => void;
  loading: boolean;
  total: number;
}

function updateLine(lines: CartLine[], index: number, patch: Partial<CartLine>): CartLine[] {
  return lines.map((line, i) => (i === index ? { ...line, ...patch } : line));
}

export function CartPanel({
  lines,
  onChangeLines,
  eventId,
  onEventChange,
  onCheckout,
  loading,
  total,
}: CartPanelProps) {
  const handleEventChange = (id: string) => {
    onEventChange(id);
    setLastEventId(id);
  };

  const setQuantity = (index: number, raw: string) => {
    const line = lines[index];
    if (!line) return;
    const n = Math.floor(Number(raw));
    if (raw === "" || Number.isNaN(n)) {
      onChangeLines(updateLine(lines, index, { quantity: 1 }));
      return;
    }
    const quantity = Math.min(line.maxQuantity, Math.max(1, n));
    onChangeLines(updateLine(lines, index, { quantity }));
  };

  const bumpQty = (index: number, delta: number) => {
    const line = lines[index];
    if (!line) return;
    const quantity = Math.min(line.maxQuantity, Math.max(1, line.quantity + delta));
    onChangeLines(updateLine(lines, index, { quantity }));
  };

  const setUnitPrice = (index: number, raw: string) => {
    const price = Number(raw);
    if (raw === "" || Number.isNaN(price) || price < 0) return;
    onChangeLines(updateLine(lines, index, { unitPrice: price }));
  };

  const removeLine = (index: number) => {
    onChangeLines(lines.filter((_, i) => i !== index));
  };

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:shadow-md">
      <p className="mb-2 text-sm font-semibold text-slate-800">Cart ({lines.length})</p>

      <ul className="mb-3 max-h-[min(35vh,240px)] space-y-2 overflow-y-auto">
        {lines.map((line, index) => (
          <li
            key={line.cardId}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
          >
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 truncate font-medium text-slate-900">{line.label}</p>
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="touch-target shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                aria-label={`Remove ${line.label}`}
              >
                Remove
              </button>
            </div>

            <div className="mt-2 grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => bumpQty(index, -1)}
                  disabled={line.quantity <= 1}
                  className="touch-target flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-bold disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={line.maxQuantity}
                  value={line.quantity}
                  onChange={(e) => setQuantity(index, e.target.value)}
                  className="w-14 rounded-lg border border-slate-300 py-2 text-center text-base font-semibold"
                />
                <button
                  type="button"
                  onClick={() => bumpQty(index, 1)}
                  disabled={line.quantity >= line.maxQuantity}
                  className="touch-target flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-bold disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div>
                <label className="sr-only">Unit price</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) => setUnitPrice(index, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 text-base font-semibold"
                />
              </div>

              <p className="text-right text-xs text-slate-500">× {line.quantity}</p>

              <p className="text-right font-bold text-slate-900">
                {formatCurrency(line.unitPrice * line.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mb-3 flex items-baseline justify-between border-t border-slate-200 pt-2">
        <span className="text-sm font-medium text-slate-600">Total</span>
        <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
      </div>

      <EventSelect value={eventId} onChange={handleEventChange} posMode />

      <button
        type="button"
        onClick={onCheckout}
        disabled={loading || lines.length === 0}
        className="touch-target mt-3 w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white shadow-md hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Completing…" : "Complete sale"}
      </button>
    </div>
  );
}
