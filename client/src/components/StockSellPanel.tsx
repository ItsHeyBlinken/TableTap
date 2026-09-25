import { useEffect, useMemo, useState } from "react";
import { cardAskingPrice, cardLabel, formatCurrency } from "../lib/format";
import type { CartLine } from "../lib/cartStorage";
import type { Card } from "../types";

interface StockSellPanelProps {
  card: Card;
  canSellNow: boolean;
  disabled?: boolean;
  onAdd: (line: CartLine) => void;
  onSellNow: (line: CartLine) => void;
}

function unitPurchasePrice(card: Card): number {
  return Number(card.purchase_price ?? 0);
}

function buildLine(card: Card, quantity: number, unitPrice: number): CartLine {
  return {
    cardId: card.id,
    label: cardLabel(card),
    quantity,
    unitPrice,
    maxQuantity: card.quantity,
    purchasePrice: unitPurchasePrice(card),
  };
}

export function StockSellPanel({
  card,
  canSellNow,
  disabled = false,
  onAdd,
  onSellNow,
}: StockSellPanelProps) {
  const asking = cardAskingPrice(card);
  const [qtyStr, setQtyStr] = useState("1");
  const [unitStr, setUnitStr] = useState(asking != null ? String(asking) : "");

  useEffect(() => {
    const nextAsk = cardAskingPrice(card);
    setQtyStr("1");
    setUnitStr(nextAsk != null ? String(nextAsk) : "");
  }, [card.id, card.estimated_value, card.quantity]);

  const costBasis = card.cost_basis ?? unitPurchasePrice(card) * card.quantity;

  const parsed = useMemo(() => {
    const quantity = Math.floor(Number(qtyStr));
    const unitPrice = Number(unitStr);
    const qtyValid = qtyStr !== "" && !Number.isNaN(quantity) && quantity >= 1 && quantity <= card.quantity;
    const priceValid = unitStr !== "" && !Number.isNaN(unitPrice) && unitPrice >= 0;
    const lineTotal = qtyValid && priceValid ? quantity * unitPrice : null;
    return { quantity, unitPrice, qtyValid, priceValid, lineTotal, canSubmit: qtyValid && priceValid };
  }, [qtyStr, unitStr, card.quantity]);

  const submitLine = () => {
    if (!parsed.canSubmit) return;
    return buildLine(card, parsed.quantity, parsed.unitPrice);
  };

  const handleAdd = () => {
    const line = submitLine();
    if (line) onAdd(line);
  };

  const handleSellNow = () => {
    const line = submitLine();
    if (line) onSellNow(line);
  };

  const busy = disabled || !parsed.canSubmit;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="truncate font-semibold text-slate-900">{cardLabel(card)}</p>
        <p className="text-sm text-slate-600">
          On hand: {card.quantity}
          {" · "}
          Cost: {formatCurrency(costBasis)}
          {asking != null && (
            <span className="text-slate-500"> · Ask {formatCurrency(asking)}</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Qty</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={card.quantity}
            step={1}
            value={qtyStr}
            disabled={disabled}
            onChange={(e) => setQtyStr(e.target.value)}
            className="touch-target w-full rounded-xl border-2 border-slate-300 px-4 py-4 text-2xl font-bold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Unit price</label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={unitStr}
            disabled={disabled}
            onChange={(e) => setUnitStr(e.target.value)}
            className="touch-target w-full rounded-xl border-2 border-slate-300 px-4 py-4 text-2xl font-bold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 disabled:opacity-50"
            placeholder="0.00"
          />
        </div>
      </div>

      {parsed.lineTotal != null && (
        <div className="rounded-xl bg-slate-100 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Line total</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(parsed.lineTotal)}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={busy}
          className="touch-target flex-1 rounded-xl border-2 border-slate-300 bg-white py-4 text-lg font-bold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          Add to cart
        </button>
        {canSellNow ? (
          <button
            type="button"
            onClick={handleSellNow}
            disabled={busy}
            className="touch-target flex-1 rounded-xl bg-green-600 py-4 text-lg font-bold text-white shadow-md hover:bg-green-700 disabled:opacity-50"
          >
            Sell now
          </button>
        ) : (
          <button
            type="button"
            disabled
            title="Clear cart or use Complete sale"
            className="touch-target flex-1 rounded-xl bg-green-600 py-4 text-lg font-bold text-white opacity-50"
          >
            Sell now
          </button>
        )}
      </div>
    </div>
  );
}
