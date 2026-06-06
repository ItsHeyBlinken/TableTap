# Tech Context

- Monorepo: `client/` (Vite React) + `server/` (Express)
- TypeScript throughout
- Auth: JWT in httpOnly cookie, `credentials: 'include'`
- DB: PostgreSQL via `pg`; migrations applied manually in pgAdmin (`server/migrations/*.sql`)
- Storage: `StorageProvider` — local disk or S3 via env
- User commits all git changes

## After a break

- [`resume.md`](resume.md) — start commands, migration order, file map
- Root `dev.local.md` (gitignored) — test accounts, passwords, local env notes

## Client conventions (2026-06-04)

- Display name: `APP_DISPLAY_NAME` in `client/src/lib/brand.ts` (TableTap)
- Stock picklists: `client/src/lib/stockOptions.ts`
- Reusable fields: `FormSelect`, `FormDatalistInput` in `components/FormSelect.tsx`
- Mobile layout: `MobileHeader` + `MobileBottomNav`; `main-with-mobile-nav` padding in `index.css`
- POS helpers: `client/src/lib/posStorage.ts` (`showpos_last_event_id`)

## API highlights

| Endpoint | Purpose |
|----------|---------|
| `POST /api/trades` | Trade out + stock in (one transaction) |
| `POST /api/sales/quick` | Walk-up sale |
| `PATCH /api/cards/:id/sell` | Sell from stock |
| `GET /api/dashboard` | Vendor metrics (revenue includes `cash_adjustment`) |
