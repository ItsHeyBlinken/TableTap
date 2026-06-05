# Tech Context

- Monorepo: `client/` (Vite React) + `server/` (Express)
- TypeScript throughout
- Auth: JWT in httpOnly cookie, `credentials: 'include'`
- DB: PostgreSQL via `pg`; migrations applied manually in pgAdmin
- Storage: `StorageProvider` — local disk or S3 via env
- User commits all git changes
- **After a break:** read [`resume.md`](resume.md); private login/DB notes in root `dev.local.md` (from `dev.local.md.example`, gitignored)
