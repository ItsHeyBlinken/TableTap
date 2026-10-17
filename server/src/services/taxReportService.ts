import { pool } from "../db/pool.js";
import { buildTaxReport, type SoldLineInput, type TaxReport } from "../utils/taxReport.js";

export async function getTaxReport(
  userId: string,
  range: { from: string; to: string },
  eventId?: string
): Promise<TaxReport> {
  const result = await pool.query<SoldLineInput>(
    `SELECT
       c.id,
       c.sold_date::text AS sold_date,
       e.name AS event_name,
       c.player_name,
       c.year,
       c.brand,
       c.sale_type,
       c.quantity,
       c.sold_price,
       c.purchase_price,
       c.cash_adjustment,
       c.transaction_id,
       c.trade_group_id
     FROM cards c
     LEFT JOIN sales_events e ON c.event_id = e.id AND e.user_id = c.user_id
     WHERE c.user_id = $1
       AND c.status = 'sold'
       AND c.sold_price IS NOT NULL
       AND c.sold_date >= $2::date
       AND c.sold_date <= $3::date
       AND ($4::uuid IS NULL OR c.event_id = $4)
     ORDER BY c.sold_date, c.player_name, c.id`,
    [userId, range.from, range.to, eventId ?? null]
  );

  return buildTaxReport(result.rows, range);
}
