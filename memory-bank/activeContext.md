# Active Context

**Last updated:** 2026-10-20

## Current focus

**Free beta readiness (Phase 1 code done, not yet committed/deployed).** Plan: [`docs/tabletap-beta-readiness-plan.md`](../docs/tabletap-beta-readiness-plan.md). Target go/no-go **Sun Nov 1, 2026**.

**Sales tax is out of scope (2026-10-16).** Each vendor handles it differently. Do not add tax rates until Chris asks.

**Photos:** hidden for beta (no upload, paste URL, or image display). Re-enable after launch with S3.

**Before deploy:** Coolify `JWT_SECRET` ≥ 32 chars (M1) — prod refuses to start otherwise. Backups (M2), legal review of Terms/Privacy drafts (M5). Re-deploy rate-limit harden so QA can re-test login 429.

**QA (2026-10-20):** Phase 1 mostly green. Blocker was rate-limit counter not decrementing for QA (fixed/hardened). Non-blockers: P&L strip with trade cash; stock list qty/cost clarity; no business name on register.

## Recently shipped

- **Beta Phase 1 blockers + phone fixes (2026-10-20, code in working tree)** — JWT prod guard; login/register rate limits + `trust proxy`; support mailto; NotFound + FAQ hash scroll; photos hidden; Terms/Privacy + Register consent; trade-from-stack split; admin password-reset runbook; Login/Register 16px inputs; sell-whole-stack label. No migration. Deferred: README, upload errors, CI, email reset.
- **Profit and loss export (2026-10-16)** — committed and live at https://tabletap.bytesbyblinken.com. Sales → **Tax export**. Presets default to last year. Totals and the CSV match. Checked **This year** for `testuser1@test.com`: profit **$69.00** on 5 items. Dates display as `MM-DD-YYYY`. Column guide: `docs/tax-export.md`. No database migration.
- **Sale dates and trade cash (2026-10-16)** — profit includes trade cash once per trade group (positive = cash received). Sale dates use the vendor’s local day. Evening-date warning starts **2026-10-16**.
- **POS multi-item checkout (2026-09-25)** — stock tab cart, **Sell now** (single line), **Complete sale** (multi-line), `POST /api/sales/checkout`; Sales groups by receipt (`transaction_id`). Spec: [`docs/superpowers/specs/2026-09-25-pos-checkout-design.md`](../docs/superpowers/specs/2026-09-25-pos-checkout-design.md). **Requires migration `004`** in pgAdmin (local + Coolify) before checkout works in that environment.

## Where Chris is testing (2026-10-16)

Use the live site: https://tabletap.bytesbyblinken.com. The local Docker Postgres volume created that day is empty (no migrations). Leave it unused.

## Live testing (Coolify)

| | |
|--|--|
| **Status** | **Deployed and live** (testing) |
| **URL** | https://tabletap.bytesbyblinken.com |
| **Pricing feedback** | https://tabletap.bytesbyblinken.com/pricing |
| **Health** | https://tabletap.bytesbyblinken.com/api/health |
| **Host** | Coolify · GitHub `ItsHeyBlinken/TableTap` · **one app** (Nixpacks) |
| **Deploy** | Root `nixpacks.toml`; Express serves API + `client/dist` |

**Coolify commands (repo root):** Install `npm ci --prefix server && npm ci --prefix client && npm ci` · Build `npm run build` · Start `npm start`

**Prod env (API process):** `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (required ≥ 32 chars; not the dev fallback), `CLIENT_URL=https://tabletap.bytesbyblinken.com` (must not contain `localhost`), `PORT`. Optional build-time: `VITE_FEEDBACK_EMAIL` for pricing mailto. Photo/S3 vars unused while photos are hidden.

**Billing:** Not connected yet. `/pricing` is draft options for vendor feedback only.

## Picking up again (local)

See [`resume.md`](resume.md) and private `dev.local.md` (copy from `dev.local.md.example`) for test logins, URLs, migrations.

```bash
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:3001  

## Product naming

| Where | Name |
|-------|------|
| UI (users see) | **TableTap** — `client/src/lib/brand.ts` |
| Code, README, memory bank | **ShowPOS** |

## Database (pgAdmin — manual)

Run in order if not already applied (local **and** Coolify Postgres):

1. `server/migrations/001_init.sql`
2. `server/migrations/002_sales_events.sql`
3. `server/migrations/003_trades.sql` — required for trades, dashboard revenue, cash sells
4. `server/migrations/004_sales_transactions.sql` — POS checkout (`sales_transactions`, `cards.transaction_id`)

Schema errors like `column c.cash_adjustment does not exist` → run `003`. Checkout API errors / missing `transaction_id` → run `004`.

## App routes

**Public:** `/` (landing + FAQ), `/guide`, `/pricing`, `/terms`, `/privacy`, `/login`, `/register`; unknown paths → NotFound

**Post-register:** `/welcome` (4-step quick start; then dashboard)

**Logged in:**

- `/dashboard` — today’s profit, vendor KPIs, profit by event
- `/sell` — **From stock** (cart + Sell now / Complete sale) | **Quick sale** | **Trade**
- `/sales` — profit and loss export (presets, show filter, CSV) plus sold history; multi-line checkouts grouped as expandable receipts (pagination still per card row)
- `/cards` — stock on hand
- `/cards/import` — bulk CSV stock import
- `/events` — sales events
- `/settings` — email, logout, support mailto, Terms/Privacy links

Mobile: bottom nav + compact header; desktop: top navbar unchanged.

## Key files (recent)

| Area | Path |
|------|------|
| Onboarding guide | `/guide` — `GuidePage.tsx`, `content/onboarding.ts` |
| Welcome + checklist | `/welcome`, dashboard `GettingStartedChecklist.tsx`, `lib/onboardingStorage.ts` |
| Single-app deploy | `nixpacks.toml`, root `package.json` (`build`/`start`), `server/src/index.ts` serves SPA in production |
| Pricing feedback page | `/pricing` — `PricingPage.tsx`, `content/pricingOptions.ts` |
| Vendor FAQ (UI) | Landing `#faq` — `FaqSection.tsx`, `content/faq.ts`; docs: `docs/FAQ.md` |
| CSV import API | `server/src/services/cardImportService.ts`, `POST /api/cards/import` |
| CSV import UI | `client/src/pages/StockImportPage.tsx`, template in `client/public/stock-import-template.csv` |
| Asking price (`estimated_value`) | `CardForm.tsx`, `format.ts` (`cardAskingPrice`), stock list/detail/sell pre-fill |
| Trades API | `server/src/services/tradeService.ts`, `server/src/routes/trades.ts` |
| POS checkout | `server/migrations/004_sales_transactions.sql`, `checkoutService.ts`, `POST /api/sales/checkout` |
| Sell cart UI | `cartStorage.ts`, `StockSellPanel.tsx`, `CartPanel.tsx`, `SellPage.tsx` |
| Sales receipts UI | `client/src/lib/groupSales.ts` (group by `transaction_id`) |
| Profit and loss report | `client/src/components/TaxReportPanel.tsx`, `server/src/services/taxReportService.ts`, `GET /api/reports/sales` and `/export`, `docs/tax-export.md` |
| Displayed dates | `client/src/lib/format.ts` (`formatDate` → `MM-DD-YYYY`) |
| Trade UI | `client/src/components/TradeTab.tsx` |
| Mobile nav | `client/src/components/MobileNav.tsx`, `AppLayout.tsx` |
| Stock options | `client/src/lib/stockOptions.ts`, `FormSelect.tsx` / `FormDatalistInput` (quantity = datalist presets + free type) |
| Dev notes | `dev.local.md` (gitignored), `resume.md` |

## Revisit later — CSV image ingest (S3)

Phase 1 stores `image_url` from CSV as-is. **Deferred:** fetch URL → upload to S3 via `StorageProvider` + `ingest_images` flag on import.

## Revisit later — stock entry (year / brand)

**Current behavior:** Years dropdown is **1980 → current** only. Brand uses datalist (pick or type). Editing an old card shows its custom year/brand in the dropdown for **that edit only** — not added globally for new stock.

**Gap:** Cannot pick e.g. **1977** on **Add stock** without a future change.

**Deferred options:**

1. Extend year range (e.g. 1950 → current)
2. Year combobox (like brand)
3. Remember recent years/brands (localStorage)

User deferred implementation on 2026-06-04.

## Revisit later — trade incoming asking price

**Current behavior:** Trade tab adds incoming card to stock with **cost basis** only (`incoming_trade_value` → `purchase_price`). `estimated_value` is 0 until edited on the card.

**Deferred:** Optional asking price on trade-in form — wait for vendor feedback on how they handle trades and whether they want ask price at trade time.

User deferred on 2026-07-27.

## Product pivot (2026-05-16)

Refocused from collector inventory to **ShowPOS** — vendor POS + profit tracker (UI: TableTap).
