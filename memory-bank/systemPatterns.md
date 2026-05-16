# System Patterns

- All card queries scoped by `user_id` from JWT cookie
- Profit: `sold_price - purchase_price * quantity` (computed, not stored)
- Pagination on `GET /api/cards` (default limit 20)
- No automated DB migrations — SQL files in `server/migrations/`
