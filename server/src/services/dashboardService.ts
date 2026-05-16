import { pool } from "../db/pool.js";
import type { Card, ProfitByEvent, VendorDashboard } from "../types/index.js";
import { mapCard } from "../utils/cardMapper.js";

const CARD_JOIN = `c.*, e.name AS event_name`;

export async function getDashboard(userId: string): Promise<VendorDashboard> {
  const totals = await pool.query<{
    total_profit: string;
    total_revenue: string;
    total_cost_basis: string;
    unsold_stock: string;
  }>(
    `SELECT
      COALESCE(SUM(
        CASE WHEN c.status = 'sold' AND c.sold_price IS NOT NULL
        THEN c.sold_price - COALESCE(c.purchase_price, 0) * COALESCE(c.quantity, 1)
        ELSE 0 END
      ), 0)::text AS total_profit,
      COALESCE(SUM(
        CASE WHEN c.status = 'sold'
        THEN c.sold_price + COALESCE(c.cash_adjustment, 0)
        ELSE 0 END
      ), 0)::text AS total_revenue,
      COALESCE(SUM(
        CASE WHEN c.status = 'sold'
        THEN COALESCE(c.purchase_price, 0) * COALESCE(c.quantity, 1)
        ELSE 0 END
      ), 0)::text AS total_cost_basis,
      COUNT(*) FILTER (WHERE c.status = 'active')::text AS unsold_stock
    FROM cards c WHERE c.user_id = $1`,
    [userId]
  );

  const today = await pool.query<{
    today_profit: string;
    today_revenue: string;
    today_sales: string;
  }>(
    `SELECT
      COALESCE(SUM(
        c.sold_price - COALESCE(c.purchase_price, 0) * COALESCE(c.quantity, 1)
      ), 0)::text AS today_profit,
      COALESCE(SUM(c.sold_price + COALESCE(c.cash_adjustment, 0)), 0)::text AS today_revenue,
      COUNT(*)::text AS today_sales
    FROM cards c
    WHERE c.user_id = $1 AND c.status = 'sold' AND c.sold_date = CURRENT_DATE`,
    [userId]
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
      COALESCE(e.name, 'No event') AS event_name,
      COALESCE(SUM(
        c.sold_price - COALESCE(c.purchase_price, 0) * COALESCE(c.quantity, 1)
      ), 0)::text AS profit,
      COALESCE(SUM(c.sold_price + COALESCE(c.cash_adjustment, 0)), 0)::text AS revenue,
      COUNT(*)::text AS sales_count
    FROM cards c
    LEFT JOIN sales_events e ON c.event_id = e.id
    WHERE c.user_id = $1 AND c.status = 'sold'
    GROUP BY c.event_id, e.name
    ORDER BY profit DESC`,
    [userId]
  );

  const topSold = await pool.query<Card>(
    `SELECT ${CARD_JOIN}
     FROM cards c
     LEFT JOIN sales_events e ON c.event_id = e.id
     WHERE c.user_id = $1 AND c.status = 'sold' AND c.sold_price IS NOT NULL
     ORDER BY (c.sold_price - COALESCE(c.purchase_price, 0) * COALESCE(c.quantity, 1)) DESC
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
  const d = today.rows[0];

  return {
    totalProfit: Number(t?.total_profit ?? 0),
    totalRevenue: Number(t?.total_revenue ?? 0),
    totalCostBasis: Number(t?.total_cost_basis ?? 0),
    todayProfit: Number(d?.today_profit ?? 0),
    todayRevenue: Number(d?.today_revenue ?? 0),
    todaySalesCount: Number(d?.today_sales ?? 0),
    unsoldStockCount: Number(t?.unsold_stock ?? 0),
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
