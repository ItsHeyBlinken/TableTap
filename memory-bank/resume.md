# Resuming work on ShowPOS / TableTap

Use this file after a long break. **Secrets and test login** go in [`dev.local.md`](../dev.local.md) at the project root (gitignored).

If `dev.local.md` does not exist yet:

```bash
cp dev.local.md.example dev.local.md
```

Then fill in your test email, password, and `DATABASE_URL` notes.

## Live testing (Coolify)

| | |
|--|--|
| App | https://tabletap.bytesbyblinken.com |
| Pricing (draft) | https://tabletap.bytesbyblinken.com/pricing |
| Guide | https://tabletap.bytesbyblinken.com/guide |
| Health | https://tabletap.bytesbyblinken.com/api/health |

Single Coolify app from GitHub; see `nixpacks.toml` and `memory-bank/techContext.md`.

## Start the app (local)

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |

## Migrations (manual in pgAdmin)

Run in order if schema errors mention missing columns (`cash_adjustment`, `sale_type`, etc.) — **local and production DB**:

1. `server/migrations/001_init.sql`
2. `server/migrations/002_sales_events.sql`
3. `server/migrations/003_trades.sql`
4. `server/migrations/004_sales_transactions.sql` — POS checkout. No migration `005`; sales tax fields were not added.

## Auth

- Live test account: `testuser1@test.com` (password in `dev.local.md`). Older notes mentioned `test1@test.com` and `test2@test.com`; those passwords were never saved.
- Login requires email + password (8+ chars)
- Session: httpOnly cookie; see `server/.env` for `JWT_SECRET`
- Prefer the live site for testing. A local Docker volume created 2026-10-16 is empty and unused.

## Where things live

| Topic | Location |
|-------|----------|
| Private dev notes | `dev.local.md` |
| Env vars | `server/.env` |
| Display name (UI) | `client/src/lib/brand.ts` → TableTap |
| CSV import | `/cards/import`, template at `/stock-import-template.csv` |
| Vendor FAQ | homepage `#faq`, `docs/FAQ.md` |
| Guide / onboarding | `/guide`, `/welcome`, dashboard checklist |
| Pricing (draft) | `/pricing` |
| Profit and loss | `/sales` → Tax export; guide `docs/tax-export.md` |
| Deploy | `nixpacks.toml`, root `npm run build` / `npm start` |
| Active tasks / context | `memory-bank/activeContext.md` |
| Progress log | `memory-bank/progress.md` |
