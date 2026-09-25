import type { Card } from "../types";

export interface SaleReceipt {
  key: string;
  transactionId: string | null;
  soldDate: string | null;
  eventName: string | null;
  lines: Card[];
  total: number;
  profit: number;
}

export function groupSoldCards(cards: Card[]): SaleReceipt[] {
  const map = new Map<string, SaleReceipt>();
  const order: string[] = [];

  for (const card of cards) {
    const key = card.transaction_id ?? `single:${card.id}`;
    let receipt = map.get(key);
    if (!receipt) {
      receipt = {
        key,
        transactionId: card.transaction_id ?? null,
        soldDate: card.sold_date,
        eventName: card.event_name ?? null,
        lines: [],
        total: 0,
        profit: 0,
      };
      map.set(key, receipt);
      order.push(key);
    }
    receipt.lines.push(card);
    receipt.total += Number(card.sold_price ?? 0) + Number(card.cash_adjustment ?? 0);
    receipt.profit += card.profit ?? 0;
  }

  return order.map((k) => map.get(k)!);
}
