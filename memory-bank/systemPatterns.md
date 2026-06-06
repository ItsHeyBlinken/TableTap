# System Patterns

- All card queries scoped by `user_id` from JWT cookie
- Profit: `sold_price - purchase_price * quantity` (computed in `mapCard`, not stored)
- Revenue (dashboard/sales display): `sold_price + COALESCE(cash_adjustment, 0)` for sold cards
- Pagination on `GET /api/cards` (default limit 20)
- No automated DB migrations — SQL files in `server/migrations/`, run in pgAdmin
- `sold_date` returned as `YYYY-MM-DD` string from `mapCard()` for consistent client formatting
- **Trades:** shared `trade_group_id`; outgoing `status=sold`, `sale_type=trade`; incoming `status=active` with `purchase_price` = assigned trade value
- **Cash sales:** `sale_type=cash` on sell/quick sale paths
