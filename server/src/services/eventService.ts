import { pool } from "../db/pool.js";
import type { SalesEvent } from "../types/index.js";
import type { z } from "zod";
import type { eventSchema } from "../utils/validation.js";

type EventInput = z.infer<typeof eventSchema>;

export async function listEvents(userId: string): Promise<SalesEvent[]> {
  const result = await pool.query<SalesEvent>(
    `SELECT * FROM sales_events WHERE user_id = $1 ORDER BY event_date DESC, created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getEventById(userId: string, eventId: string): Promise<SalesEvent | null> {
  const result = await pool.query<SalesEvent>(
    `SELECT * FROM sales_events WHERE id = $1 AND user_id = $2`,
    [eventId, userId]
  );
  return result.rows[0] ?? null;
}

export async function createEvent(userId: string, input: EventInput): Promise<SalesEvent> {
  const result = await pool.query<SalesEvent>(
    `INSERT INTO sales_events (user_id, name, event_date, description)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, input.name, input.event_date, input.description ?? null]
  );
  return result.rows[0];
}

export async function updateEvent(
  userId: string,
  eventId: string,
  input: EventInput
): Promise<SalesEvent | null> {
  const result = await pool.query<SalesEvent>(
    `UPDATE sales_events SET name = $3, event_date = $4, description = $5
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [eventId, userId, input.name, input.event_date, input.description ?? null]
  );
  return result.rows[0] ?? null;
}

export async function deleteEvent(userId: string, eventId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM sales_events WHERE id = $1 AND user_id = $2`,
    [eventId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
