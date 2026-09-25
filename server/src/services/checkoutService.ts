import { pool } from "../db/pool.js";
import type { Card, CheckoutResult, SalesTransaction } from "../types/index.js";
import { getEventById } from "./eventService.js";
import { mapCard } from "../utils/cardMapper.js";
import { todayDateString, computeProfit } from "../utils/validation.js";
import type { z } from "zod";
import type { checkoutSchema } from "../utils/validation.js";

type CheckoutInput = z.infer<typeof checkoutSchema>;

const SOLD_LINE_SELECT = `SELECT c.*, e.name AS event_name
  FROM cards c
  LEFT JOIN sales_events e ON c.event_id = e.id
  WHERE c.id = $1 AND c.user_id = $2`;

function transactionSoldDate(value: unknown, fallback: string): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") {
    const dateOnly = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateOnly;
  }
  return fallback;
}

export async function checkout(userId: string, input: CheckoutInput): Promise<CheckoutResult> {
  const soldDate = input.sold_date ?? todayDateString();
  const eventId = input.event_id ?? null;

  const ids = input.lines.map((l) => l.card_id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate card_id in checkout lines");
  }

  if (eventId) {
    const event = await getEventById(userId, eventId);
    if (!event) throw new Error("Event not found");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const txResult = await client.query<SalesTransaction>(
      `INSERT INTO sales_transactions (user_id, event_id, sold_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, eventId, soldDate]
    );
    const transaction = txResult.rows[0];
    if (!transaction) {
      throw new Error("Failed to create sales transaction");
    }
    const soldIds: string[] = [];

    for (const line of input.lines) {
      const lock = await client.query<Card>(
        `SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND status = 'active' FOR UPDATE`,
        [line.card_id, userId]
      );
      const card = lock.rows[0];
      if (!card) {
        throw new Error(`Card not found or already sold: ${line.card_id}`);
      }
      if (line.quantity > card.quantity) {
        throw new Error(
          `Insufficient quantity for ${card.player_name}: have ${card.quantity}, need ${line.quantity}`
        );
      }

      const lineTotal = Number(line.unit_price) * line.quantity;

      if (line.quantity === card.quantity) {
        const upd = await client.query<{ id: string }>(
          `UPDATE cards SET
             status = 'sold',
             sold_price = $3,
             sold_date = $4,
             event_id = $5,
             transaction_id = $6,
             sale_type = 'cash',
             cash_adjustment = NULL,
             trade_group_id = NULL
           WHERE id = $1 AND user_id = $2 AND status = 'active'
           RETURNING id`,
          [card.id, userId, lineTotal, soldDate, eventId, transaction.id]
        );
        if (!upd.rows[0]) throw new Error(`Could not sell card: ${card.player_name}`);
        soldIds.push(card.id);
      } else {
        const rem = await client.query<{ id: string }>(
          `UPDATE cards SET quantity = quantity - $3
           WHERE id = $1 AND user_id = $2 AND status = 'active' AND quantity >= $3
           RETURNING id`,
          [card.id, userId, line.quantity]
        );
        if (!rem.rows[0]) {
          throw new Error(`Could not reduce quantity for ${card.player_name}`);
        }

        const ins = await client.query<{ id: string }>(
          `INSERT INTO cards (
             user_id, player_name, year, brand, card_number, sport, team, condition,
             graded, grading_company, grade, purchase_price, estimated_value, quantity,
             notes, image_url, status, sold_price, sold_date, event_id, transaction_id,
             sale_type
           ) VALUES (
             $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
             'sold',$17,$18,$19,$20,'cash'
           ) RETURNING id`,
          [
            userId,
            card.player_name,
            card.year,
            card.brand,
            card.card_number,
            card.sport,
            card.team,
            card.condition,
            card.graded,
            card.grading_company,
            card.grade,
            card.purchase_price,
            card.estimated_value,
            line.quantity,
            card.notes,
            card.image_url,
            lineTotal,
            soldDate,
            eventId,
            transaction.id,
          ]
        );
        if (!ins.rows[0]) {
          throw new Error(`Could not create sold line for ${card.player_name}`);
        }
        soldIds.push(ins.rows[0].id);
      }
    }

    const lines: Card[] = [];
    for (const id of soldIds) {
      const loaded = await client.query<Card>(SOLD_LINE_SELECT, [id, userId]);
      const row = loaded.rows[0];
      if (!row) throw new Error("Failed to load sold line");
      lines.push(mapCard(row));
    }

    const total = lines.reduce((s, c) => s + Number(c.sold_price ?? 0), 0);
    const profit = lines.reduce((s, c) => s + (c.profit ?? computeProfit(c) ?? 0), 0);
    const eventName = lines[0]?.event_name ?? null;

    await client.query("COMMIT");

    return {
      transaction: {
        ...transaction,
        sold_date: transactionSoldDate(transaction.sold_date, soldDate),
        event_name: eventName,
      },
      lines,
      total,
      profit,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
