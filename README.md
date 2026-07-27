# ShowPOS

Sports card **vendor POS + profit tracker** for show vendors, flippers, and table sellers.

**Vendor FAQ:** [docs/FAQ.md](docs/FAQ.md) — what TableTap is (and isn’t), payments, profit, trades, and common show-floor questions.

## Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Storage:** Local uploads (dev) or S3-compatible (production)

## Prerequisites

- Node.js 20+
- PostgreSQL (local Docker or remote)
- pgAdmin (for manual migrations)

## Database setup (pgAdmin)

1. Create database `card_inventory` (or use Docker Compose below).
2. Open **Query Tool** in pgAdmin.
3. Paste and run [`server/migrations/001_init.sql`](server/migrations/001_init.sql).
4. Paste and run [`server/migrations/002_sales_events.sql`](server/migrations/002_sales_events.sql).
5. Paste and run [`server/migrations/003_trades.sql`](server/migrations/003_trades.sql).
6. For future schema changes, add new SQL files and run them the same way.

## Resuming after a break

- Checklist: [`memory-bank/resume.md`](memory-bank/resume.md)
- Your test login and local secrets: copy [`dev.local.md.example`](dev.local.md.example) → `dev.local.md` (gitignored) and fill it in

### Optional: local Postgres via Docker

```bash
docker compose up -d
```

Uses `cardinv` / `cardinv` on port `5432`.

## Environment

Copy examples and adjust:

```bash
cp server/.env.example server/.env
```

Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for auth cookies |
| `CLIENT_URL` | Frontend origin (e.g. `http://localhost:5173`) |
| `STORAGE_DRIVER` | `local` or `s3` |
| S3 vars | Required when using S3 storage |

## Run locally

**One command (API + frontend):**

```bash
npm run install:all   # first time only (installs root, server, client)
npm run dev
```

From the project root. Stops both processes with `Ctrl+C`.

**Or run separately:**

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:3001  

## CSV stock import

- UI: **Stock** → **Import CSV** (`/cards/import`)
- Template: [`client/public/stock-import-template.csv`](client/public/stock-import-template.csv)
- Required columns: `player_name`, `year`, `brand`
- Optional `image_url`: public `http://` or `https://` link (stored as-is; S3 ingest planned later)
- Limits: 500 rows, 2MB per file; partial success (valid rows import even if some fail)

## Production notes

**Single-app deploy (Coolify / Nixpacks):** one service at the **repo root**. API + built UI on the same domain.

| Coolify setting | Value |
|-----------------|--------|
| Base directory | `/` (repository root) |
| Build pack | Nixpacks |
| Install command | `npm ci --prefix server && npm ci --prefix client && npm ci` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Port | `3001` (or leave empty and set `PORT` env) |

`nixpacks.toml` in the repo root defines the same install/build/start if Coolify auto-detects it.

**Environment (runtime):**

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | long random hex string |
| `CLIENT_URL` | `https://your-domain.com` (same as public URL) |
| `PORT` | `3001` (Coolify may inject this) |
| `STORAGE_DRIVER` | `s3` recommended (local uploads don’t persist across redeploys) |

Run migrations `001` → `003` on production Postgres before first use.

Local production smoke test:

```bash
npm run install:all
npm run build
NODE_ENV=production CLIENT_URL=http://localhost:3001 npm start
```

Then open http://localhost:3001

- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure real `DATABASE_URL` and S3 credentials
- Cookies use `Secure` in production

## Git

You manage commits locally. The agent does not commit on your behalf unless you ask.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/cards` | List (search, filter, pagination) |
| GET | `/api/cards/:id` | Get one |
| POST | `/api/cards` | Create |
| POST | `/api/cards/import` | Bulk import stock from CSV (multipart `file`) |
| PUT | `/api/cards/:id` | Update |
| DELETE | `/api/cards/:id` | Delete |
| PATCH | `/api/cards/:id/sell` | Mark sold (defaults to today) |
| POST | `/api/sales/quick` | Walk-up sale (create + sold in one step) |
| GET | `/api/dashboard` | Vendor profit stats |
| GET/POST/PUT/DELETE | `/api/events` | Sales events |
| POST | `/api/upload` | Image upload |
