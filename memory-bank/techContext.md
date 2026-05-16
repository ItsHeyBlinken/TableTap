# Tech Context

- Monorepo: `client/` (Vite React) + `server/` (Express)
- TypeScript throughout
- Auth: JWT in httpOnly cookie, `credentials: 'include'`
- DB: PostgreSQL via `pg`; migrations applied manually in pgAdmin
- Storage: `StorageProvider` — local disk or S3 via env
- User commits all git changes
