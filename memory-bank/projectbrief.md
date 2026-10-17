# Project Brief — ShowPOS (Vendor POS)

**Public UI name:** TableTap (`client/src/lib/brand.ts`). Internal/repo name remains ShowPOS.

## Goal

Lightweight POS + profit tracking for sports card show vendors, flippers, and table sellers.

## Core question

"What did I sell today, and how much money did I actually make?"

## In scope

- Sales events (card shows, streams, weekends)
- Fast record-sale flow with instant profit
- Vendor dashboard (profit, revenue, cost basis, by event)
- Stock on hand (unsold inventory with cost basis)
- Trades (card out / card in / cash adjustment)
- Mobile-first POS at shows (2026-06-04)
- Profit and loss report for a date range, with CSV export (2026-10-16)

## Out of scope

Collectors, portfolio valuation, AI scanning, market pricing APIs.

Sales tax calculation. Each vendor handles it differently (some shows collect it, some expect the vendor to). Do not add tax rates until asked.

## Status (2026-10-16)

- **Testing live** on Coolify: https://tabletap.bytesbyblinken.com
- Profit and loss export is deployed (Sales → Tax export). Sale dates are the vendor’s local day, and trade cash is included in profit.
- Public FAQ + draft `/pricing` for vendor feedback; **no billing** yet
- Single-app deploy (API + SPA) via Nixpacks — see `memory-bank/techContext.md`
