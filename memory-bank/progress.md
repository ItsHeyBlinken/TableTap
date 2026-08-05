# Progress Log

## 2026-08-04

- **Onboarding:** public `/guide` (features, show-day workflow, key concepts)
- Post-register `/welcome` (4 quick steps); register → welcome → dashboard
- Dashboard **Getting started** checklist (auto-complete from API; dismiss via localStorage)
- Settings: links to guide, quick start, reset checklist
- Spec: `docs/superpowers/specs/2026-08-04-onboarding-design.md`

## 2026-07-27

- **CSV stock import (Phase 1):** `POST /api/cards/import`, `cardImportService`, `/cards/import` UI, template CSV
- `image_url` validated as optional http(s) URL; stored as-is (S3 ingest deferred)
- **`estimated_value` (asking price):** CSV column, stock form, list/detail/sell UI; sell form pre-fill
- **Vendor FAQ:** `docs/FAQ.md` + homepage `#faq` accordion (`content/faq.ts`)
- **Single-app Coolify deploy:** `nixpacks.toml`; root `build`/`start`; Express serves `client/dist` in production
- **Testing live:** https://tabletap.bytesbyblinken.com (GitHub → Coolify, one app)
- **Pricing feedback page:** `/pricing` — draft Options A/B/C for vendor input; no billing yet
- Optional `VITE_FEEDBACK_EMAIL` for pricing mailto CTA

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

### CSV stock import (Phase 1)
- Template + `POST /api/cards/import`; optional `image_url` stored as-is (S3 ingest deferred)
- Columns include `purchase_price` (cost) and `estimated_value` (asking price)

### Asking price (`estimated_value`)
- Stock form field **Asking price**; shown on stock list/detail and sell picker
- Sell form pre-fills sale price from asking price when set (editable)
- CSV import accepts `estimated_value` column

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
