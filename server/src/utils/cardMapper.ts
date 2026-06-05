import type { Card } from "../types/index.js";
import { computeCostBasis, computeProfit } from "./validation.js";

function toDateOnly(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  const dateOnly = s.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : null;
}

export function mapCard(row: Card): Card {
  return {
    ...row,
    sold_date: toDateOnly(row.sold_date),
    cost_basis: computeCostBasis(row),
    profit: computeProfit(row),
  };
}
