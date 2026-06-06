# Progress Log

## 2026-06-04 (session wrap)

### Trades (Option B) — completed
- Migration `server/migrations/003_trades.sql` (`trade_group_id`, `sale_type`, `cash_adjustment`)
- `POST /api/trades` + `tradeService.recordTrade()` (atomic outgoing sold + incoming stock)
- Cash sells set `sale_type = 'cash'`; dashboard revenue includes `cash_adjustment`
- **Sell** page third tab: **Trade** (`TradeTab.tsx`)
- Sales list: **Trade** badge; revenue = sold price + cash adjustment

### Branding
- User-facing name: **TableTap** (`client/src/lib/brand.ts` → `APP_DISPLAY_NAME`)
- Repo/docs/internal code remain **ShowPOS** (package names, memory bank, `showpos_last_event_id`)

### Dev workflow
- `memory-bank/resume.md` — non-secret “back after a break” checklist
- `dev.local.md.example` + gitignored `dev.local.md` — test logins, env reminders
- Test users documented: `test1@test.com`, `test2@test.com` (shared dev password in `dev.local.md`)

### Mobile / show-floor UX
- Bottom tab nav: Home, Sell, Stock, Sales, Events (`MobileNav.tsx`)
- Sticky mobile header + safe-area padding
- Sales, stock list, dashboard “profit by event”: **card layout** on phone; tables on `md+`
- Larger touch targets; `input-mobile` (16px) to avoid iOS zoom

### Stock entry speed
- Dropdowns/datalist via `stockOptions.ts` + `FormSelect.tsx` / `FormDatalistInput`
- **CardForm:** year (1980–current), sport, condition, quantity, grading company/grade; brand datalist
- **Quick sale** + **Trade (incoming):** brand datalist; trade adds year/sport/condition selects
- **Stock filters:** sport dropdown

### Bug fixes
- **Invalid Date** on sales/dashboard: Postgres ISO dates → `formatDate()` + `mapCard()` normalize `sold_date` to `YYYY-MM-DD`
- **Dashboard 500** if `003` not applied: missing `cash_adjustment` column (run migration in pgAdmin)

### Deferred (see `activeContext.md`)
- Vintage years before 1980 / persisting custom years & brands into dropdown lists

---

## 2026-06-04 (earlier entries)

- Added `memory-bank/resume.md` + gitignored `dev.local.md` template for returning to the project

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
