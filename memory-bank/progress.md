# Progress Log

## 2026-05-16

- Pivoted to ShowPOS vendor POS: events, sell flow, vendor dashboard, rebranded UI
- Added migration `002_sales_events.sql` (run in pgAdmin)
- Trades (Option B): `003_trades.sql`, `POST /api/trades`, Trade tab on `/sell`, Trade badge on Sales

## 2026-05-16 (initial)

- Scaffolded Card Inventory MVP (server + client + docker-compose)
- Auth API with httpOnly cookie JWT
- Cards CRUD, sell, search/filter/pagination, dashboard
- Image upload with local + S3 storage abstraction
- React frontend with all planned routes
- Migrations: `server/migrations/001_init.sql` (pgAdmin manual apply)
