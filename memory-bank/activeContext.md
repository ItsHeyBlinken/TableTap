# Active Context

**Last updated:** 2026-07-27

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

**Prod env (API process):** `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL=https://tabletap.bytesbyblinken.com`, `PORT`. Optional build-time: `VITE_FEEDBACK_EMAIL` for pricing mailto.

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

Schema errors like `column c.cash_adjustment does not exist` → run `003`.

## App routes

**Public:** `/` (landing + FAQ), `/pricing` (draft pricing feedback), `/login`, `/register`

**Logged in:**

- `/dashboard` — today’s profit, vendor KPIs, profit by event
- `/sell` — **From stock** | **Quick sale** | **Trade**
- `/sales` — sold history (cards on mobile)
- `/cards` — stock on hand
- `/cards/import` — bulk CSV stock import
- `/events` — sales events
- `/settings` — email + logout

Mobile: bottom nav + compact header; desktop: top navbar unchanged.

## Key files (recent)

| Area | Path |
|------|------|
| Single-app deploy | `nixpacks.toml`, root `package.json` (`build`/`start`), `server/src/index.ts` serves SPA in production |
| Pricing feedback page | `/pricing` — `PricingPage.tsx`, `content/pricingOptions.ts` |
| Vendor FAQ (UI) | Landing `#faq` — `FaqSection.tsx`, `content/faq.ts`; docs: `docs/FAQ.md` |
| CSV import API | `server/src/services/cardImportService.ts`, `POST /api/cards/import` |
| CSV import UI | `client/src/pages/StockImportPage.tsx`, template in `client/public/stock-import-template.csv` |
| Asking price (`estimated_value`) | `CardForm.tsx`, `format.ts` (`cardAskingPrice`), stock list/detail/sell pre-fill |
| Trades API | `server/src/services/tradeService.ts`, `server/src/routes/trades.ts` |
| Trade UI | `client/src/components/TradeTab.tsx` |
| Mobile nav | `client/src/components/MobileNav.tsx`, `AppLayout.tsx` |
| Stock options | `client/src/lib/stockOptions.ts`, `FormSelect.tsx` |
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
