# Active Context

## Picking up again

See [`resume.md`](resume.md) and your private `dev.local.md` (from `dev.local.md.example`) for test login, URLs, and migration checklist.

## Product pivot (2026-05-16)

Refocused from collector inventory to **ShowPOS** — vendor POS + profit tracker.

## User action required

Run [`server/migrations/003_trades.sql`](server/migrations/003_trades.sql) in pgAdmin (after `002_sales_events.sql`) before using trades.

## App routes (logged in)

- `/dashboard` — vendor profit KPIs
- `/sell` — record sale (POS): From stock | Quick sale | **Trade**
- `/sales` — sold history
- `/stock` → `/cards` — unsold stock
- `/events` — sales events
