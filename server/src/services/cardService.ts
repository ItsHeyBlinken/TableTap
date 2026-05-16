import { pool } from "../db/pool.js";
import type { Card, PaginationMeta } from "../types/index.js";
import { mapCard } from "../utils/cardMapper.js";
import { getEventById } from "./eventService.js";
import type { z } from "zod";
import type { cardBaseSchema, cardsQuerySchema, quickSaleSchema } from "../utils/validation.js";
import { todayDateString } from "../utils/validation.js";

type CardInput = z.infer<typeof cardBaseSchema>;
type CardsQuery = z.infer<typeof cardsQuerySchema>;
type QuickSaleInput = z.infer<typeof quickSaleSchema>;

const CARD_FROM = `FROM cards c LEFT JOIN sales_events e ON c.event_id = e.id`;
const CARD_SELECT = `SELECT c.*, e.name AS event_name ${CARD_FROM}`;

function normalizeImageUrl(url?: string | null): string | null {
  if (!url || url.trim() === "") return null;
  return url.trim();
}

export async function listCards(
  userId: string,
  query: CardsQuery
): Promise<{ cards: Card[]; pagination: PaginationMeta }> {
  const { page, limit, search, sport, status, graded, event_id } = query;
  const offset = (page - 1) * limit;
  const conditions: string[] = ["c.user_id = $1"];
  const params: unknown[] = [userId];
  let paramIndex = 2;

  if (search) {
    conditions.push(
      `(c.player_name ILIKE $${paramIndex} OR c.brand ILIKE $${paramIndex} OR c.team ILIKE $${paramIndex})`
    );
    params.push(`%${search}%`);
    paramIndex++;
  }
  if (sport) {
    conditions.push(`c.sport ILIKE $${paramIndex}`);
    params.push(sport);
    paramIndex++;
  }
  if (status) {
    conditions.push(`c.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }
  if (event_id) {
    conditions.push(`c.event_id = $${paramIndex}`);
    params.push(event_id);
    paramIndex++;
  }
  if (graded !== undefined) {
    conditions.push(`c.graded = $${paramIndex}`);
    params.push(graded);
    paramIndex++;
  }

  const where = conditions.join(" AND ");
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count ${CARD_FROM} WHERE ${where}`,
    params
  );
  const total = Number(countResult.rows[0]?.count ?? 0);

  const listParams = [...params, limit, offset];
  const result = await pool.query<Card>(
    `${CARD_SELECT} WHERE ${where}
     ORDER BY c.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    listParams
  );

  return {
    cards: result.rows.map(mapCard),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getCardById(userId: string, cardId: string): Promise<Card | null> {
  const result = await pool.query<Card>(
    `${CARD_SELECT} WHERE c.id = $1 AND c.user_id = $2`,
    [cardId, userId]
  );
  const row = result.rows[0];
  return row ? mapCard(row) : null;
}

export async function createCard(userId: string, input: CardInput): Promise<Card> {
  const result = await pool.query<Card>(
    `INSERT INTO cards (
      user_id, player_name, year, brand, card_number, sport, team, condition,
      graded, grading_company, grade, purchase_price, estimated_value, quantity, notes, image_url
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING *`,
    [
      userId,
      input.player_name,
      input.year,
      input.brand,
      input.card_number ?? null,
      input.sport ?? null,
      input.team ?? null,
      input.condition ?? null,
      input.graded ?? false,
      input.grading_company ?? null,
      input.grade ?? null,
      input.purchase_price ?? null,
      input.estimated_value ?? 0,
      input.quantity ?? 1,
      input.notes ?? null,
      normalizeImageUrl(input.image_url),
    ]
  );
  return mapCard(result.rows[0]);
}

export async function updateCard(
  userId: string,
  cardId: string,
  input: CardInput
): Promise<Card | null> {
  const result = await pool.query<Card>(
    `UPDATE cards SET
      player_name = $3, year = $4, brand = $5, card_number = $6, sport = $7,
      team = $8, condition = $9, graded = $10, grading_company = $11, grade = $12,
      purchase_price = $13, estimated_value = $14, quantity = $15, notes = $16, image_url = $17
    WHERE id = $1 AND user_id = $2
    RETURNING *`,
    [
      cardId,
      userId,
      input.player_name,
      input.year,
      input.brand,
      input.card_number ?? null,
      input.sport ?? null,
      input.team ?? null,
      input.condition ?? null,
      input.graded ?? false,
      input.grading_company ?? null,
      input.grade ?? null,
      input.purchase_price ?? null,
      input.estimated_value ?? 0,
      input.quantity ?? 1,
      input.notes ?? null,
      normalizeImageUrl(input.image_url),
    ]
  );
  const row = result.rows[0];
  if (!row) return null;
  return getCardById(userId, cardId);
}

export async function deleteCard(userId: string, cardId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM cards WHERE id = $1 AND user_id = $2`,
    [cardId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function sellCard(
  userId: string,
  cardId: string,
  soldPrice: number,
  soldDate: string,
  eventId?: string | null
): Promise<Card | null> {
  if (eventId) {
    const event = await getEventById(userId, eventId);
    if (!event) {
      throw new Error("Event not found");
    }
  }

  const result = await pool.query<Card>(
    `UPDATE cards SET
      status = 'sold', sold_price = $3, sold_date = $4, event_id = $5,
      sale_type = 'cash', cash_adjustment = NULL, trade_group_id = NULL
    WHERE id = $1 AND user_id = $2 AND status = 'active'
    RETURNING *`,
    [cardId, userId, soldPrice, soldDate, eventId ?? null]
  );
  const row = result.rows[0];
  if (!row) return null;
  return getCardById(userId, cardId);
}

export async function quickSale(userId: string, input: QuickSaleInput): Promise<Card> {
  if (input.event_id) {
    const event = await getEventById(userId, input.event_id);
    if (!event) throw new Error("Event not found");
  }

  const soldDate = input.sold_date ?? todayDateString();
  const year = input.year ?? new Date().getFullYear();

  const result = await pool.query<Card>(
    `INSERT INTO cards (
      user_id, player_name, year, brand, purchase_price, estimated_value, quantity,
      status, sold_price, sold_date, event_id, sale_type
    ) VALUES ($1,$2,$3,$4,$5,0,$6,'sold',$7,$8,$9,'cash')
    RETURNING *`,
    [
      userId,
      input.player_name,
      year,
      input.brand,
      input.purchase_price,
      input.quantity ?? 1,
      input.sold_price,
      soldDate,
      input.event_id ?? null,
    ]
  );
  const created = result.rows[0];
  const mapped = await getCardById(userId, created.id);
  if (!mapped) throw new Error("Failed to load sale");
  return mapped;
}
