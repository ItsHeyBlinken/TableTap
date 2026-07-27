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

## Out of scope

Collectors, portfolio valuation, AI scanning, market pricing APIs.

## Status (2026-07-27)

- **Testing live** on Coolify: https://tabletap.bytesbyblinken.com
- Public FAQ + draft `/pricing` for vendor feedback; **no billing** yet
- Single-app deploy (API + SPA) via Nixpacks — see `memory-bank/techContext.md`
