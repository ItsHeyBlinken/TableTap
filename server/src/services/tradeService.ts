import { randomUUID } from "crypto";
import { pool } from "../db/pool.js";
import type { Card, TradeResult } from "../types/index.js";
import { getEventById } from "./eventService.js";
import { getCardById } from "./cardService.js";
import { computeCostBasis } from "../utils/validation.js";
import type { z } from "zod";
import type { recordTradeSchema } from "../utils/validation.js";
import { todayDateString } from "../utils/validation.js";

type RecordTradeInput = z.infer<typeof recordTradeSchema>;

export async function recordTrade(userId: string, input: RecordTradeInput): Promise<TradeResult> {
  if (input.event_id) {
    const event = await getEventById(userId, input.event_id);
    if (!event) throw new Error("Event not found");
  }

  const outgoing = await getCardById(userId, input.outgoing_card_id);
  if (!outgoing || outgoing.status !== "active") {
    throw new Error("Outgoing card not found or already sold");
  }

  const tradeGroupId = randomUUID();
  const tradeDate = input.trade_date ?? todayDateString();
  const cashAdjustment = input.cash_adjustment ?? 0;
  const incomingYear = input.incoming.year ?? new Date().getFullYear();
  const outCost = computeCostBasis(outgoing);
  const outgoingProfit = input.outgoing_trade_value - outCost;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const outResult = await client.query<Card>(
      `UPDATE cards SET
        status = 'sold',
        sold_price = $3,
        sold_date = $4,
        event_id = $5,
        sale_type = 'trade',
        trade_group_id = $6,
        cash_adjustment = $7,
        notes = COALESCE(notes, '') || $8
      WHERE id = $1 AND user_id = $2 AND status = 'active'
      RETURNING *`,
      [
        input.outgoing_card_id,
        userId,
        input.outgoing_trade_value,
        tradeDate,
        input.event_id ?? null,
        tradeGroupId,
        cashAdjustment,
        ` | Traded out (group ${tradeGroupId.slice(0, 8)})`,
      ]
    );

    if (!outResult.rows[0]) {
      throw new Error("Could not complete trade — outgoing card unavailable");
    }

    const inResult = await client.query<Card>(
      `INSERT INTO cards (
        user_id, player_name, year, brand, sport, team, condition,
        purchase_price, estimated_value, quantity, status, trade_group_id,
        notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,$9,'active',$10,$11)
      RETURNING *`,
      [
        userId,
        input.incoming.player_name,
        incomingYear,
        input.incoming.brand,
        input.incoming.sport ?? null,
        input.incoming.team ?? null,
        input.incoming.condition ?? null,
        input.incoming.incoming_trade_value,
        input.incoming.quantity ?? 1,
        tradeGroupId,
        `Trade in for ${outgoing.player_name} (group ${tradeGroupId.slice(0, 8)})`,
      ]
    );

    await client.query("COMMIT");

    const outgoingCard = await getCardById(userId, outResult.rows[0].id);
    const incomingCard = await getCardById(userId, inResult.rows[0].id);

    if (!outgoingCard || !incomingCard) {
      throw new Error("Failed to load trade records");
    }

    return {
      trade_group_id: tradeGroupId,
      outgoing: outgoingCard,
      incoming: incomingCard,
      outgoing_profit: outgoingProfit,
      cash_adjustment: cashAdjustment,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
