import type { Card } from "../types/index.js";
import { computeCostBasis, computeProfit } from "./validation.js";

export function mapCard(row: Card): Card {
  return {
    ...row,
    cost_basis: computeCostBasis(row),
    profit: computeProfit(row),
  };
}
