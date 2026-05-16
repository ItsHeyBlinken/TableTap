# ShowPOS

Sports card **vendor POS + profit tracker** for show vendors, flippers, and table sellers.

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
5. For future schema changes, add new SQL files and run them the same way.

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

## Production notes

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
| PUT | `/api/cards/:id` | Update |
| DELETE | `/api/cards/:id` | Delete |
| PATCH | `/api/cards/:id/sell` | Mark sold (defaults to today) |
| POST | `/api/sales/quick` | Walk-up sale (create + sold in one step) |
| GET | `/api/dashboard` | Vendor profit stats |
| GET/POST/PUT/DELETE | `/api/events` | Sales events |
| POST | `/api/upload` | Image upload |
