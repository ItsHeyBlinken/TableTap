# System Patterns

- All card queries scoped by `user_id` from JWT cookie
- Profit: `sold_price - purchase_price * quantity` (computed in `mapCard`, not stored)
- Revenue (dashboard/sales display): `sold_price + COALESCE(cash_adjustment, 0)` for sold cards
- Pagination on `GET /api/cards` (default limit 20)
- No automated DB migrations — SQL files in `server/migrations/`, run in pgAdmin
- `sold_date` returned as `YYYY-MM-DD` string from `mapCard()` for consistent client formatting
- **Trades:** shared `trade_group_id`; outgoing `status=sold`, `sale_type=trade`; incoming `status=active` with `purchase_price` = assigned trade value
- **Cash sales:** `sale_type=cash` on sell/quick sale paths
- **POS checkout:** one `sales_transactions` row per cart checkout; each sold line is a `cards` row with shared `transaction_id`. Partial qty from stock splits: sold portion on the sold row; remainder stays active (new stock row). Profit still computed per sold card row (`mapCard`); Sales UI groups lines by `transaction_id` for receipt-style expand/collapse (pagination remains per card row, not per receipt)
