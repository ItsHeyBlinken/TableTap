# System Patterns

- All card queries scoped by `user_id` from JWT cookie
- `sold_price` is the amount that sold row sells for. Checkout stores unit price × quantity in `sold_price`. Do not multiply `sold_price` by quantity again.
- `purchase_price` is what the vendor paid per item. Cost is `purchase_price × quantity`.
- Profit: `sold_price − purchase_price × quantity + cash_adjustment` (computed, not stored). Positive `cash_adjustment` = cash the vendor received. Negative = cash the vendor paid.
- Dashboard totals add trade cash once per `trade_group_id`. A single card’s profit includes the cash stored on that row.
- Sale dates: the client sends the vendor’s local `YYYY-MM-DD`. If that is missing, the server uses the client’s IANA time zone. It does not use UTC or `CURRENT_DATE`. Dashboard “today” is `GET /api/dashboard?date=YYYY-MM-DD`.
- Pagination on `GET /api/cards` (default limit 20)
- No automated DB migrations — SQL files in `server/migrations/`, run in pgAdmin
- `sold_date` returned as `YYYY-MM-DD` string from `mapCard()` for consistent client formatting
- **Trades:** shared `trade_group_id`; outgoing `status=sold`, `sale_type=trade`; incoming `status=active` with `purchase_price` = assigned trade value
- **Cash sales:** `sale_type=cash` on sell/quick sale paths
- **POS checkout:** one `sales_transactions` row per cart checkout; each sold line is a `cards` row with shared `transaction_id`. Partial qty from stock splits: sold portion on the sold row; remainder stays active (new stock row). Profit still computed per sold card row (`mapCard`); Sales UI groups lines by `transaction_id` for receipt-style expand/collapse (pagination remains per card row, not per receipt)
