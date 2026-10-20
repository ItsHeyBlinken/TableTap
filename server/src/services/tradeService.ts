import { randomUUID } from "crypto";
import { pool } from "../db/pool.js";
import type { Card, TradeResult } from "../types/index.js";
import { getEventById } from "./eventService.js";
import { getCardById } from "./cardService.js";
import { resolveSaleDate } from "../utils/validation.js";
import type { z } from "zod";
import type { recordTradeSchema } from "../utils/validation.js";

type RecordTradeInput = z.infer<typeof recordTradeSchema>;

/** Cost for one card traded out of a stack (always quantity 1 on the sold line). */
export function tradeUnitCost(card: { purchase_price: string | null }): number {
  return Number(card.purchase_price ?? 0);
}

export async function recordTrade(userId: string, input: RecordTradeInput): Promise<TradeResult> {
  if (input.event_id) {
    const event = await getEventById(userId, input.event_id);
    if (!event) throw new Error("Event not found");
  }

  const tradeGroupId = randomUUID();
  const tradeDate = resolveSaleDate({
    sold_date: input.trade_date,
    time_zone: input.time_zone,
  });
  const cashAdjustment = input.cash_adjustment ?? 0;
  const incomingYear = input.incoming.year ?? new Date().getFullYear();

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lock = await client.query<Card>(
      `SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND status = 'active' FOR UPDATE`,
      [input.outgoing_card_id, userId]
    );
    const outgoing = lock.rows[0];
    if (!outgoing) {
      throw new Error("Outgoing card not found or already sold");
    }

    const unitCost = tradeUnitCost(outgoing);
    const outgoingProfit = input.outgoing_trade_value - unitCost + cashAdjustment;
    const tradeNote = ` | Traded out (group ${tradeGroupId.slice(0, 8)})`;
    let soldOutgoingId: string;

    if (outgoing.quantity <= 1) {
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
          tradeNote,
        ]
      );
      if (!outResult.rows[0]) {
        throw new Error("Could not complete trade — outgoing card unavailable");
      }
      soldOutgoingId = outResult.rows[0].id;
    } else {
      const rem = await client.query<{ id: string }>(
        `UPDATE cards SET quantity = quantity - 1
         WHERE id = $1 AND user_id = $2 AND status = 'active' AND quantity >= 1
         RETURNING id`,
        [outgoing.id, userId]
      );
      if (!rem.rows[0]) {
        throw new Error("Could not reduce quantity for outgoing card");
      }

      const ins = await client.query<{ id: string }>(
        `INSERT INTO cards (
           user_id, player_name, year, brand, card_number, sport, team, condition,
           graded, grading_company, grade, purchase_price, estimated_value, quantity,
           notes, image_url, status, sold_price, sold_date, event_id,
           sale_type, trade_group_id, cash_adjustment
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,1,
           COALESCE($14, '') || $15,$16,
           'sold',$17,$18,$19,'trade',$20,$21
         ) RETURNING id`,
        [
          userId,
          outgoing.player_name,
          outgoing.year,
          outgoing.brand,
          outgoing.card_number,
          outgoing.sport,
          outgoing.team,
          outgoing.condition,
          outgoing.graded,
          outgoing.grading_company,
          outgoing.grade,
          outgoing.purchase_price,
          outgoing.estimated_value,
          outgoing.notes,
          tradeNote,
          outgoing.image_url,
          input.outgoing_trade_value,
          tradeDate,
          input.event_id ?? null,
          tradeGroupId,
          cashAdjustment,
        ]
      );
      if (!ins.rows[0]) {
        throw new Error("Could not create sold trade line");
      }
      soldOutgoingId = ins.rows[0].id;
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

    const outgoingCard = await getCardById(userId, soldOutgoingId);
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
