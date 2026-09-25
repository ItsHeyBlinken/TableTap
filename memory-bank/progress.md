# Progress Log

## 2026-09-25

- **Cart overlay fix:** Removed sticky cart; sits below sell form so Qty/unit price stay visible — user confirmed working
- **POS checkout Task 8 (SDD):** Memory bank + FAQ — checkout patterns, `POST /api/sales/checkout` in techContext, multi-item / partial qty vendor Q; report `.superpowers/sdd/task-8-report.md`
- **POS checkout feature (SDD complete):** Tasks 1–7 — migration `004`, checkout API/service, Sell cart + sticky session, Sales receipt grouping; user applies `004` in pgAdmin; Quick sale + Trade tabs unchanged; no payment processing
- **POS checkout Task 7 (SDD):** Sales page groups sold cards by `transaction_id` (`groupSales.ts`, expandable receipts on mobile/desktop); pagination remains per card row; client build PASS; report `.superpowers/sdd/task-7-report.md`
- **POS checkout Task 6 (SDD):** Wired `SellPage` stock tab — cart persistence, clamp on reload, `StockSellPanel` + `CartPanel`, checkout API; client build PASS; report `.superpowers/sdd/task-6-report.md`
- **POS checkout Task 5 (SDD):** `cartStorage.ts`, `StockSellPanel.tsx`, `CartPanel.tsx` (session cart + speed UX); client build PASS; report `.superpowers/sdd/task-5-report.md`; SellPage wiring deferred to Task 6
- **POS checkout Task 4 (SDD):** `POST /api/sales/checkout` + checkout domain errors → 400 in `errorHandler`; report `.superpowers/sdd/task-4-report.md`
- **POS checkout Task 3 (SDD):** `checkoutService.checkout()` — atomic multi-line checkout, partial qty split; report `.superpowers/sdd/task-3-report.md`
- **POS checkout Task 2 (SDD):** Server/client `SalesTransaction`, `CheckoutResult`, `Card.transaction_id`; `checkoutSchema` in `server/src/utils/validation.ts`; report `.superpowers/sdd/task-2-report.md`
- **Sales events (clarified for demos):** Events are per-user; same name/date across users is allowed — no cross-user uniqueness
- **Stock quantity:** Expanded `STOCK_QUANTITIES` presets (1–10, 15, 20, 25, 50, 75, 100); Quantity field is now a datalist (pick preset or type any count, e.g. 72)
- **POS checkout design (approved):** Multi-item cart + **Sell now** for one-card speed; partial qty; sales group+expand — spec `docs/superpowers/specs/2026-09-25-pos-checkout-design.md`, plan `docs/superpowers/plans/2026-09-25-pos-checkout.md` (awaiting execution choice)

## 2026-08-04

- **Onboarding:** public `/guide` (features, show-day workflow, key concepts)
- Post-register `/welcome` (4 quick steps); register → welcome → dashboard
- Dashboard **Getting started** checklist (auto-complete from API; dismiss via localStorage)
- Settings: links to guide, quick start, reset checklist
- **Mobile hamburger menu:** public pages (`PublicMarketingShell`) + logged-in header (`MobileMenu.tsx`)
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

## 2026-08-24

- Posted market-validation question in a Facebook card-shows group (inventory + profit tracking at shows; mentioned building a phone-first tool; no product link in post)

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
