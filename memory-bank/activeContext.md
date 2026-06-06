# Active Context

**Last updated:** 2026-06-04 (end of session)

## Picking up again

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

Run in order if not already applied:

1. `server/migrations/001_init.sql`
2. `server/migrations/002_sales_events.sql`
3. `server/migrations/003_trades.sql` — required for trades, dashboard revenue, cash sells

Schema errors like `column c.cash_adjustment does not exist` → run `003`.

## App routes (logged in)

- `/dashboard` — today’s profit, vendor KPIs, profit by event
- `/sell` — **From stock** | **Quick sale** | **Trade**
- `/sales` — sold history (cards on mobile)
- `/cards` — stock on hand
- `/events` — sales events
- `/settings` — email + logout

Mobile: bottom nav + compact header; desktop: top navbar unchanged.

## Key files added/changed today

| Area | Path |
|------|------|
| Trades API | `server/src/services/tradeService.ts`, `server/src/routes/trades.ts` |
| Trade UI | `client/src/components/TradeTab.tsx` |
| Mobile nav | `client/src/components/MobileNav.tsx`, `AppLayout.tsx` |
| Stock options | `client/src/lib/stockOptions.ts`, `FormSelect.tsx` |
| Dev notes | `dev.local.md` (gitignored), `resume.md` |

## Revisit later — stock entry (year / brand)

**Current behavior:** Years dropdown is **1980 → current** only. Brand uses datalist (pick or type). Editing an old card shows its custom year/brand in the dropdown for **that edit only** — not added globally for new stock.

**Gap:** Cannot pick e.g. **1977** on **Add stock** without a future change.

**Deferred options:**

1. Extend year range (e.g. 1950 → current)
2. Year combobox (like brand)
3. Remember recent years/brands (localStorage)

User deferred implementation on 2026-06-04.

## Product pivot (2026-05-16)

Refocused from collector inventory to **ShowPOS** — vendor POS + profit tracker (UI: TableTap).
