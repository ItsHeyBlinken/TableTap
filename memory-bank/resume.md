# Resuming work on ShowPOS / TableTap

Use this file after a long break. **Secrets and test login** go in [`dev.local.md`](../dev.local.md) at the project root (gitignored).

If `dev.local.md` does not exist yet:

```bash
cp dev.local.md.example dev.local.md
```

Then fill in your test email, password, and `DATABASE_URL` notes.

## Start the app

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |

## Migrations (manual in pgAdmin)

Run in order if schema errors mention missing columns (`cash_adjustment`, `sale_type`, etc.):

1. `server/migrations/001_init.sql`
2. `server/migrations/002_sales_events.sql`
3. `server/migrations/003_trades.sql`

## Auth

- Dev test accounts in DB: `test1@test.com`, `test2@test.com` (passwords in `dev.local.md`)
- Login requires email + password (8+ chars)
- Session: httpOnly cookie; see `server/.env` for `JWT_SECRET`

## Where things live

| Topic | Location |
|-------|----------|
| Private dev notes | `dev.local.md` |
| Env vars | `server/.env` |
| Display name (UI) | `client/src/lib/brand.ts` → TableTap |
| Active tasks / context | `memory-bank/activeContext.md` |
| Progress log | `memory-bank/progress.md` |
