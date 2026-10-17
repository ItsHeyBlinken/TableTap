import { pool } from "../db/pool.js";
import type { Card, ProfitByEvent, VendorDashboard } from "../types/index.js";
import { mapCard } from "../utils/cardMapper.js";

const CARD_JOIN = `c.*, e.name AS event_name`;

/**
 * Sold rows with cash_rank = 1 for one row per trade group.
 * sold_price is the sale amount. purchase_price is the per-item cost.
 * cash_adjustment: positive = cash the vendor received, negative = cash paid.
 * Totals add that cash once per trade_group_id (or once per row when there is no group).
 */
const SOLD_ROWS = `
  SELECT
    c.*,
    e.name AS event_name,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(c.trade_group_id::text, c.id::text)
      ORDER BY ABS(COALESCE(c.cash_adjustment, 0)) DESC, c.id
    ) AS cash_rank
  FROM cards c
  LEFT JOIN sales_events e ON c.event_id = e.id
  WHERE c.user_id = $1 AND c.status = 'sold'`;

const LINE_COST = `COALESCE(c.purchase_price, 0) * COALESCE(c.quantity, 1)`;
const CASH_ONCE = `CASE WHEN c.cash_rank = 1 THEN COALESCE(c.cash_adjustment, 0) ELSE 0 END`;
const LINE_PROFIT = `CASE WHEN c.sold_price IS NOT NULL THEN c.sold_price - ${LINE_COST} + ${CASH_ONCE} ELSE 0 END`;
const LINE_REVENUE = `c.sold_price + ${CASH_ONCE}`;

export async function getDashboard(userId: string, today: string): Promise<VendorDashboard> {
  const totals = await pool.query<{
    total_profit: string;
    total_revenue: string;
    total_cost_basis: string;
  }>(
    `SELECT
      COALESCE(SUM(${LINE_PROFIT}), 0)::text AS total_profit,
      COALESCE(SUM(${LINE_REVENUE}), 0)::text AS total_revenue,
      COALESCE(SUM(
        CASE WHEN c.sold_price IS NOT NULL THEN ${LINE_COST} ELSE 0 END
      ), 0)::text AS total_cost_basis
    FROM (${SOLD_ROWS}) c`,
    [userId]
  );

  const unsold = await pool.query<{ unsold_stock: string }>(
    `SELECT COUNT(*)::text AS unsold_stock
     FROM cards
     WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  const todayStats = await pool.query<{
    today_profit: string;
    today_revenue: string;
    today_sales: string;
  }>(
    `SELECT
      COALESCE(SUM(${LINE_PROFIT}), 0)::text AS today_profit,
      COALESCE(SUM(${LINE_REVENUE}), 0)::text AS today_revenue,
      COUNT(*)::text AS today_sales
    FROM (${SOLD_ROWS} AND c.sold_date = $2::date) c`,
    [userId, today]
  );

  const byEvent = await pool.query<{
    event_id: string | null;
    event_name: string;
    profit: string;
    revenue: string;
    sales_count: string;
  }>(
    `SELECT
      c.event_id,
      COALESCE(c.event_name, 'No event') AS event_name,
      COALESCE(SUM(${LINE_PROFIT}), 0)::text AS profit,
      COALESCE(SUM(${LINE_REVENUE}), 0)::text AS revenue,
      COUNT(*)::text AS sales_count
    FROM (${SOLD_ROWS}) c
    GROUP BY c.event_id, c.event_name
    ORDER BY SUM(${LINE_PROFIT}) DESC`,
    [userId]
  );

  const topSold = await pool.query<Card>(
    `SELECT ${CARD_JOIN}
     FROM cards c
     LEFT JOIN sales_events e ON c.event_id = e.id
     WHERE c.user_id = $1 AND c.status = 'sold' AND c.sold_price IS NOT NULL
     ORDER BY (
       c.sold_price - COALESCE(c.purchase_price, 0) * COALESCE(c.quantity, 1)
       + COALESCE(c.cash_adjustment, 0)
     ) DESC
     LIMIT 5`,
    [userId]
  );

  const recentSales = await pool.query<Card>(
    `SELECT ${CARD_JOIN}
     FROM cards c
     LEFT JOIN sales_events e ON c.event_id = e.id
     WHERE c.user_id = $1 AND c.status = 'sold'
     ORDER BY c.sold_date DESC NULLS LAST, c.created_at DESC
     LIMIT 8`,
    [userId]
  );

  const t = totals.rows[0];
  const d = todayStats.rows[0];

  return {
    totalProfit: Number(t?.total_profit ?? 0),
    totalRevenue: Number(t?.total_revenue ?? 0),
    totalCostBasis: Number(t?.total_cost_basis ?? 0),
    todayProfit: Number(d?.today_profit ?? 0),
    todayRevenue: Number(d?.today_revenue ?? 0),
    todaySalesCount: Number(d?.today_sales ?? 0),
    unsoldStockCount: Number(unsold.rows[0]?.unsold_stock ?? 0),
    profitByEvent: byEvent.rows.map(
      (r): ProfitByEvent => ({
        event_id: r.event_id,
        event_name: r.event_name,
        profit: Number(r.profit),
        revenue: Number(r.revenue),
        sales_count: Number(r.sales_count),
      })
    ),
    topSoldByProfit: topSold.rows.map(mapCard),
    recentSales: recentSales.rows.map(mapCard),
  };
}
