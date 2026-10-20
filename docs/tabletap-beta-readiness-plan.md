# TableTap free beta: readiness plan

- **Beta opens:** Sunday, Nov 1, 2026 (go/no-go that day)
- **Written:** Tue Oct 20, 2026 (CT), from a read-only review of `ItsHeyBlinken/TableTap` @ `fba4225` (no newer commits on `main` as of Oct 20) and anonymous `curl` of the testing site https://tabletap.bytesbyblinken.com
- **Status:** TableTap is still **in testing**. Nothing in this plan has been built yet, and no repo changes were made during the review.
- **How to use this in Cursor:** work one task at a time, top to bottom. Each task lists its files, approach, acceptance criteria, and test steps. Check the boxes as you go.

---

## 0. Timeline (Oct 21 → Nov 1)

This assumes weeknights (~2–3 h) and longer weekend sessions. Oct 30–31 are **QA and fixes only**. No new features those days.

| Day | Code (Cursor) | Chris, manual |
|---|---|---|
| **Wed 10/21** (night) | 1.1 JWT_SECRET + prod config guard | M1 Coolify env review: set a strong `JWT_SECRET`, check `NODE_ENV`, `CLIENT_URL`. M2 turn on Postgres backups and take one manual backup now |
| **Thu 10/22** (night) | 1.2 Login/register rate limit (+ `trust proxy`) | M3 decide on photos: S3 bucket now, or hide upload for beta (see 1.5) | UPDATE:  NO PHOTOS for BETA
| **Fri 10/23** (night) | 1.3 Support contact + 1.4 Not-found page + FAQ link scroll | M6 confirm the info@bytesbyblinken.com inbox is monitored |
| **Sat 10/24** | 1.5 Card photos (CSP + storage) · 1.6 Terms + Privacy pages (drafts) | M3 create the bucket if you chose S3, then set env vars |
| **Sun 10/25** | 1.7 Trade from a stack fix · 1.8 Interim password reset (admin-assisted) | M5 start reviewing the Terms/Privacy drafts |
| **Mon 10/26** (night) | 2.1 Upload error messages · 2.2 Login/Register 16px inputs | M4 Postgres **restore test** |
| **Tue 10/27** (night) | 2.3 README + migration 004 note · 2.4 Sell-whole-stack label | M5 finish legal text edits |
| **Wed 10/28** (night) | Buffer for anything that slipped. Optional: 3.1 CI | Set up the feedback loop (§6), draft the tester invite |
| **Thu 10/29** (night) | **Code freeze at end of night.** Deploy the release candidate to the testing site | Fresh manual DB backup after deploy |
| **Fri 10/30** | **QA only:** run the full §5 checklist on a phone, with two accounts | Log bugs; fix only blockers |
| **Sat 10/31** | **QA only:** re-test the fixes, run the checklist again on a second phone/browser | Final backup |
| **Sun 11/1** | **Go/no-go** (criteria below), then open the beta to invited testers | Send invites |

**Go/no-go on Nov 1:** every Phase 1 task checked, §5 checklist passes on at least one iPhone and one Android (or two browsers), backups on with one successful restore test, `JWT_SECRET` set, and Terms/Privacy reviewed by Chris. If something fails, slip a few days rather than open with a known blocker.

---

## 1. Goal and scope

**Goal:** a small, invite-only **free beta** (suggest 5–10 card-show vendors) that's safe to use at a real show. Testers should be able to sign up, add stock, sell, trade, and export a profit-and-loss CSV, without losing data or locking themselves out.

**In scope this week:** security basics (secret, rate limit), legal pages, a support contact, a way to recover a forgotten password, fixes for anything that could corrupt a vendor's numbers, and a QA pass.

**Out of scope:** see §8. This includes payments, market pricing, and sales tax. The vendor report is profit and loss only.

---

## 2. Verification summary

Statuses: **CONFIRMED** (the claim is true today), **PARTLY** (true with caveats), **WRONG/DONE** (already handled), **UNVERIFIED** (needs Coolify or a login).

### Chief of Staff's claimed blockers

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Terms + Privacy pages linked at signup | **CONFIRMED** missing | `client/src/App.tsx:32-52` has no `/terms` or `/privacy` route, and `*` redirects to `/`. `client/src/pages/RegisterPage.tsx` has no consent text or links. Live: `/terms` and `/privacy` return the same 674-byte SPA shell as `/`. The live bundle has 0 matches for "Terms of" / "Privacy Policy". |
| 2 | Password reset by email (no email sending; needs token table + migration) | **CONFIRMED** missing. The token table is only needed for the email-link approach. | `server/src/routes/auth.ts` has only `/register` (L11), `/login` (L22), `/me` (L37), `/logout` (L62). `server/package.json:12-25` has no mail library. The live bundle has no "forgot"/"reset" text. An interim admin-assisted reset needs **no migration** (task 1.8). |
| 3 | Login/register rate limiting | **CONFIRMED** missing | `server/src/index.ts:19-46` has no limiter, and `server/package.json` has no rate-limit package. Not probed live (that would need POSTs). There's also no `app.set("trust proxy")`, which a limiter behind Coolify's proxy needs. |
| 4 | Prod must refuse to start without a real `JWT_SECRET` | **CONFIRMED** (code). Prod value **UNVERIFIED**. | `server/src/config.ts:5-11,18`: `requireEnv("JWT_SECRET", "dev-secret-change-me")`. The fallback means it never throws. If unset in Coolify, anyone could forge a session cookie. |
| 5 | Confirm `STORAGE_DRIVER=s3` + Postgres backups in Coolify | **PARTLY / UNVERIFIED**, and worse than claimed | No Coolify access. The prod env list in `memory-bank/activeContext.md:34` doesn't include `STORAGE_DRIVER`, `S3_*`, or `LOCAL_PUBLIC_BASE_URL`, so uploads probably go to local disk (lost on redeploy). `server/src/config.ts:23` defaults the image URL to `http://localhost:3001/uploads`, and `server/src/storage/index.ts:19-23` silently falls back to local if S3 is incomplete. **New:** the live CSP is `img-src 'self' data:`, so any photo on another domain (an S3 bucket or a CSV `image_url` link) is **blocked by the browser**. Backups can't be checked without Coolify. |
| 6 | In-app support contact (info@bytesbyblinken.com) | **CONFIRMED** missing | `client/src/pages/SettingsPage.tsx` has only logout + guide links. The only mailto is pricing feedback (`client/src/pages/PricingPage.tsx:10-22`), driven by the build-time `VITE_FEEDBACK_EMAIL` (`client/src/lib/brand.ts:5`). The live bundle contains info@bytesbyblinken.com once (pricing page). |

### Claimed nice-to-haves

| Claim | Status | Evidence |
|---|---|---|
| Meta / OG tags | **CONFIRMED** missing | `client/src/index.html` has `<title>` and mobile metas only. Live HTML is the same. |
| robots.txt / sitemap | **CONFIRMED** missing | Live `/robots.txt` and `/sitemap.xml` return `200 text/html` (the SPA shell). |
| HTTP→HTTPS redirect | **CONFIRMED** (no redirect) | `curl http://tabletap.bytesbyblinken.com/` timed out after 8 s (exit 28). HTTPS sends HSTS (`max-age=31536000`), but that only helps repeat visitors. This is a Coolify/proxy/firewall setting, not code. |
| CI for server tests + client build | **CONFIRMED** missing | No `.github/` folder in the repo tree. Server has 18 test cases in `server/src/utils/phase0.test.ts` and `taxReport.test.ts` (`npm test`). I didn't run them. |
| README rename from ShowPOS | **CONFIRMED**, and worse than claimed | `README.md:1` is `# ShowPOS`. Setup lists only migrations 001–003 (`README.md:24-26,116`), and `dev.local.md.example` does the same. Following the README on a fresh DB leaves **checkout broken** without `004_sales_transactions.sql`. |
| Scripted migrations | **CONFIRMED** (manual only) | `README.md:18-26` (pgAdmin by hand). `server/scripts/check-schema.mjs` only checks that `users` + `cards` exist. |
| Account deletion / data export | **PARTLY** | No self-service delete or full export. The sales CSV export exists (`server/src/routes/reports.ts:50-59`). All user tables use `ON DELETE CASCADE` (`001_init.sql:15`, `002_sales_events.sql:46`, `004_sales_transactions.sql:75`), so an admin delete is one SQL statement. That's enough for a beta if the Privacy page says "email us to delete". |

### Other beta risks checked

| Area | Finding | Evidence |
|---|---|---|
| Data isolation (user_id) | **OK.** Every query filters by the JWT `userId`, and event/card ownership is checked before linking. | `cardService.ts:27,87,133,162,186`, `checkoutService.ts:59,85`, `tradeService.ts:18,47`, `eventService.ts:10-49`, `dashboardService.ts:23,49`, `taxReportService.ts:25-26`. To be proven live with two accounts (§5). |
| Trade cash once per `trade_group_id` | **OK.** Only the outgoing row stores `cash_adjustment`, and totals count it once per group. | `tradeService.ts:38-58` (cash on the outgoing row) and `:65-85` (incoming row has none). `dashboardService.ts:13-27` (`cash_rank`), `utils/taxReport.ts:108-134`. |
| Quantity multiplied correctly | **OK** for checkout/quick sale. `sold_price` is the line total and cost is `purchase_price × quantity`. | `checkoutService.ts:72`, `validation.ts:183-210`, `dashboardService.ts:25`, `taxReport.ts:160-165`. |
| **Trade out of a stack** | **BUG.** Trading one card from a row with quantity > 1 marks the **whole stack** sold, and cost uses the full stack. | `tradeService.ts:18-47` (no quantity split, unlike `checkoutService.ts:91-139`). `TradeTab.tsx` has no quantity field. Task 1.7. |
| Sell-whole-row form | **Confusing.** The card-detail "Sale price" sells the whole row at one price, with cost for all N. | `client/src/components/SellForm.tsx:27,83`, `cardService.ts:182-188`. Task 2.4. |
| Report summary lines | **Check in QA.** Trade rows *with* cash aren't in `grossSales` or `tradeValueNoCash`, only in `profit`, so the summary lines may not add up to profit. | `server/src/utils/taxReport.ts:195-205`. Not a blocker. Confirm what `TaxReportPanel` shows. |
| CORS | **OK.** Fixed origin. A foreign `Origin` still gets `access-control-allow-origin: https://tabletap.bytesbyblinken.com`. | `server/src/index.ts:23-28`, curl. |
| Helmet / headers | **OK.** CSP, HSTS, nosniff, X-Frame-Options are live. The `img-src` problem is noted above. | `index.ts:21`, curl `-I`. |
| Error leakage | **Mostly OK.** Unknown errors return a generic 500 with no stack. Two wrong mappings: a non-image upload → 500, and a >5 MB image → "CSV file exceeds 2MB limit". | `middleware/errorHandler.ts:9-11,46-47`, `routes/upload.ts:9-13`. Task 2.1. |
| Upload limits | Images 5 MB, `image/*` (includes SVG). CSV 2 MB / 500 rows. JSON uses the Express default (100 kb). | `routes/upload.ts:9-16`, `services/cardImportService.ts:6-7`, `routes/cards.ts:21-38`. |
| Input validation | zod on every route. No max length on text fields and no upper bound on prices (values over `NUMERIC(12,2)` → 500). Low risk. | `server/src/utils/validation.ts:25-41`. Post-beta. |
| Sessions | 7-day JWT. Logout only clears the cookie (the token stays valid until expiry), and `requireAuth` doesn't re-check that the user exists. Acceptable for beta. | `middleware/auth.ts:10-36`. |
| Signup enumeration | Register returns 409 "Email already registered". Accepted for beta. | `errorHandler.ts:42-44`. |
| Secrets in repo | **None found** by pattern scan. `.env` is gitignored. `docker-compose.yml` has local-only dev DB creds (`cardinv`). | `.gitignore`, `docker-compose.yml:7-9`. |
| Soft 404 (QA open item) | **CONFIRMED.** Unknown paths redirect to `/` with 200. | `client/src/App.tsx:52`, `server/src/index.ts:52-60`. Live `/nonexistent-xyz` → 200. |
| FAQ nav link (QA open item) | **CONFIRMED.** Links go to `/#faq`, but nothing scrolls to the hash. | `components/PublicMarketingShell.tsx:231,257,287`. `#faq` exists at `FaqSection.tsx:105`. |
| Mobile basics | **Mostly good:** viewport + safe-area, bottom `MobileNav`, and sell/trade inputs use 16px `.input-mobile`. Login/Register inputs are 14px (`text-sm`), which makes iPhones zoom on focus. | `index.html:5`, `index.css:31-35`, `LoginPage.tsx:7-8`, `RegisterPage.tsx` `inputClass`. |

---

## 3. Tasks

> **DB migrations:** nothing in Phase 1 or 2 needs one. The only migration in this plan is in **After beta launch** (email password reset). Any migration needs **Chris's approval** and is **run by Chris in pgAdmin** (testing DB, then prod), like 001–004.
> **Stack:** stay with Express + zod + React/Vite/Tailwind. The only new dependency in this plan is `express-rate-limit` (small middleware, not a framework).

### Phase 1: beta blockers (must be done by Thu 10/29)

#### 1.1 Prod refuses to start with a weak or missing secret
- [ ] Done
- **Files:** `server/src/config.ts`
- **Approach:** after building `config`, when `isProduction`:
  - throw if `JWT_SECRET` is missing, equals `dev-secret-change-me` or `change-me-in-production`, or is shorter than 32 characters;
  - throw if `CLIENT_URL` contains `localhost`;
  - if `STORAGE_DRIVER` is `local`, throw when `LOCAL_PUBLIC_BASE_URL` contains `localhost` (otherwise photo URLs point at localhost). Skip this check if you choose "hide photo upload" in 1.5.
  Keep the dev fallbacks for development.
- **Acceptance:** with `NODE_ENV=production` and no `JWT_SECRET`, `npm start` exits with a clear message. With a 32+ character secret, it starts. Dev (`npm run dev`) still works with no `.env` secret.
- **Test:** locally run `NODE_ENV=production JWT_SECRET= node server/dist/index.js` → exits with an error. Then with `JWT_SECRET=$(openssl rand -hex 32)` → starts. **Set the Coolify value (M1) before deploying this**, or the app won't start.

#### 1.2 Rate-limit login and register
- [ ] Done
- **Files:** `server/package.json` (add `express-rate-limit`), `server/src/index.ts`, `server/src/routes/auth.ts`
- **Approach:** in `index.ts`, add `app.set("trust proxy", 1)` before the other middleware (Coolify's proxy sits in front; without this, every user shares one IP). In `routes/auth.ts`, create two limiters and attach them per route:
  - login: 10 attempts / 15 min per IP
  - register: 5 / hour per IP
  Use `standardHeaders: "draft-7"`, `legacyHeaders: false`, and a JSON message `{ error: "Too many attempts. Try again in a few minutes." }` (the client already shows `error`). The in-memory store is fine for one instance.
- **Acceptance:** the 11th bad login within 15 min returns **429** with that message, and the Login page shows it. A normal login still works. Different IPs aren't blocked together.
- **Test:** locally, send 11 bad logins with `curl -X POST .../api/auth/login` → the 11th is 429. On the testing site (from your own account), check the `RateLimit` response headers. Then log in from phone data and Wi-Fi to confirm IPs are separate. If everyone gets blocked together, the `trust proxy` hop count is wrong (e.g. if Cloudflare is also in front).

#### 1.3 Support contact in the app
- [ ] Done
- **Files:** `client/src/lib/brand.ts`, `client/src/pages/SettingsPage.tsx`, `client/src/components/PublicMarketingShell.tsx`, `client/src/components/AuthLayout.tsx`
- **Approach:** add `export const SUPPORT_EMAIL = "info@bytesbyblinken.com"` (hardcoded so it doesn't depend on `VITE_FEEDBACK_EMAIL`). In Settings, add a "Help & support" line: "Questions or a bug? Email info@bytesbyblinken.com". Make it a mailto with subject `TableTap beta: ` and a body that pre-fills the account email. Add "Contact" to the public footer and under the Login/Register forms.
- **Acceptance:** support email is visible from Settings, the public footer, and Login/Register, and tapping it opens the phone's mail app.
- **Test:** on a phone, tap each link → the mail app opens with the subject filled in.

#### 1.4 Not-found page + FAQ link scroll (QA open items)
- [ ] Done
- **Files:** new `client/src/pages/NotFoundPage.tsx`, `client/src/App.tsx`, `client/src/pages/LandingPage.tsx`
- **Approach:** replace `<Route path="*" element={<Navigate to="/" replace />} />` (`App.tsx:52`) with a simple NotFound page that has links to Home and Dashboard. In `LandingPage`, add a `useEffect` on `location.hash` that calls `document.getElementById(hash.slice(1))?.scrollIntoView()`. The server still returns 200 for unknown paths, which is fine for the beta (see Phase 3).
- **Acceptance:** `/does-not-exist` shows "Page not found" with links, and FAQ in the top nav, mobile menu, and footer scrolls to the FAQ from any page.
- **Test:** open `/xyz` on a phone. Tap FAQ from `/guide` and from `/` itself.

#### 1.5 Card photos work, or are hidden, for beta
- [ ] Done
- **Files:** `server/src/index.ts` (helmet options), and only if hiding: `client/src/components/CardForm.tsx`
- **Approach:** two separate problems.
  1. **CSP blocks off-site images.** Change helmet to allow `img-src 'self' data: https:` (this allows any https image, which covers CSV `image_url` links and an S3/R2 public URL). Keep the other helmet defaults.
  2. **Where uploads go.** Pick one (Chris's decision, M3):
     - **A (recommended if you have 1 evening):** an S3-compatible bucket (e.g. Cloudflare R2 or Backblaze B2) with all six vars set: `STORAGE_DRIVER=s3`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`. No code change beyond the CSP.
     - **B (smallest):** hide the file input in `CardForm.tsx:223` for beta and keep the "paste image link" field. Note it in the tester invite.
- **Acceptance:** a photo added to a card shows on the card page after a **redeploy** (A), or there's no upload button and pasted https image links display (B). The browser console shows no CSP image errors.
- **Test:** add a card with a photo → redeploy in Coolify → photo still shows. Import a CSV row with an https `image_url` → image shows.

#### 1.6 Terms of Service + Privacy Policy pages
- [ ] Done
- **Files:** new `client/src/pages/TermsPage.tsx`, new `client/src/pages/PrivacyPage.tsx`, new `client/src/content/legal.ts` (text only), `client/src/App.tsx`, `client/src/pages/RegisterPage.tsx`, `client/src/components/PublicMarketingShell.tsx`, `client/src/pages/SettingsPage.tsx`
- **Approach:** two public routes `/terms` and `/privacy`, wrapped in `PublicMarketingShell`, with text kept in `content/legal.ts` so Chris can edit it without touching layout. Above the Register button, add: "By creating an account you agree to the [Terms] and [Privacy Policy]." Add footer and Settings links. The drafts must be **plain and factual** about what the code does:
  - TableTap stores email, a bcrypt-hashed password, stock, sales, trades, shows, and optional photos/links
  - session cookie only; no ads or trackers
  - free beta, may change, provided as-is
  - not tax or accounting advice
  - data deletion and export by emailing info@bytesbyblinken.com
  - include a "Last updated" date
  **Chris must review the text (M5). It's a draft, not legal advice.**
- **Acceptance:** `/terms` and `/privacy` load directly (no redirect), the Register page shows the agreement line with working links, and the footer and Settings link to both.
- **Test:** open `/terms` and `/privacy` on a phone, register a test account, and tap both links from Register.

#### 1.7 Trading one card out of a stack
- [ ] Done
- **Files:** `server/src/services/tradeService.ts`, `server/src/utils/validation.ts` (only if adding a field), `client/src/components/TradeTab.tsx` (copy only)
- **Approach:** do the trade inside the transaction with `SELECT ... FOR UPDATE` on the outgoing card. If `quantity > 1`, do the same thing checkout does (`checkoutService.ts:91-139`): reduce the stack by 1 and insert a new sold row with `quantity = 1`, `sale_type='trade'`, `trade_group_id`, and `cash_adjustment`. Compute `outgoing_profit` with cost for 1 card. In `TradeTab`, show "Trading 1 of N" when N > 1.
- **Acceptance:** trading from a stack of 5 leaves 4 in stock, adds one sold trade row (cost = 1 × purchase price), and cash appears once. The single-card trade behaves exactly as today.
- **Test:** add a test to `server/src/utils/phase0.test.ts` or a new `*.test.ts` covering the profit math. Manually: stack of 5 at $2 each → trade 1 out at $10 value with $5 cash received → stock shows 4, report shows profit $13 (10 − 2 + 5), and the CSV has one trade row.

#### 1.8 Forgotten password: interim admin-assisted reset (no email, no migration)
- [ ] Done
- **Why interim:** email reset needs an SMTP provider account, DNS records (SPF/DKIM) for bytesbyblinken.com, a **new token table (migration)**, and two new pages plus testing. That doesn't fit safely in this week alongside everything else. Moved to **After beta launch**.
- **Files:** new `server/scripts/hash-password.mjs`, `client/src/pages/LoginPage.tsx`, new `docs/admin-password-reset.md`
- **Approach:**
  - `hash-password.mjs` reads a new password from a prompt (not a CLI argument, so it isn't saved in shell history) and prints a bcrypt hash with 12 rounds (same as `authService.ts:5`). It does **not** connect to the database.
  - Under the Login form, add "Forgot password? Email info@bytesbyblinken.com from your account email and we'll reset it." with a mailto.
  - `docs/admin-password-reset.md` is the runbook:
    1. Only act on a request that comes **from the account's own email address**.
    2. Generate a random temporary password and hash it.
    3. In pgAdmin, run `UPDATE users SET password_hash = '<hash>' WHERE email = '<email>';`
    4. Reply with the temporary password and ask the tester to change it. (There's no change-password screen yet, so they keep using it until the email reset ships. Mention this in the runbook.)
- **Tradeoffs (Chris should accept these):**
  - It's manual and only as fast as Chris replies. A vendor locked out mid-show may wait.
  - Chris briefly knows the temporary password.
  - Identity is checked only by the sender's email address, which can be spoofed. Reply to the account address rather than "reply-all" so the temp password only reaches the real owner.
  - Old sessions stay valid until they expire (stateless JWT).
  - Considered and rejected: a magic link still needs email sending plus a token table, so it's as much work as the full reset.
- **Acceptance:** the Login page shows the forgot-password line. Chris can reset a test account in under 5 minutes using only the runbook, and the old password then fails.
- **Test:** on the testing site, reset `test2@test.com` with the runbook → log in with the new password → old password returns 401.

### Phase 2: should-do this week (if time allows before freeze)

#### 2.1 Correct upload error messages
- [ ] Done
- **Files:** `server/src/middleware/errorHandler.ts`, `server/src/routes/upload.ts`
- **Approach:** map "Only image files are allowed" to 400. Make "File too large" say the right limit per route (image 5 MB vs CSV 2 MB). One way is to throw a distinct message from each multer `limits` handler, or to check `req.path`. Limit images to `image/jpeg`, `image/png`, `image/webp`, `image/heic` (drop SVG).
- **Acceptance:** a PDF upload → 400 "Only image files are allowed". A 6 MB photo → 400 "Image exceeds 5MB limit". A 3 MB CSV → still "CSV file exceeds 2MB limit".
- **Test:** try each case from the card form and the import page.

#### 2.2 Stop iPhone zoom on Login/Register
- [ ] Done
- **Files:** `client/src/pages/LoginPage.tsx`, `client/src/pages/RegisterPage.tsx`
- **Approach:** use `text-base` (16px) in `inputClass`, or the existing `.input-mobile` class.
- **Acceptance:** tapping the email/password fields on iPhone Safari doesn't zoom the page.
- **Test:** iPhone, Safari, tap each field.

#### 2.3 README and dev notes match reality
- [ ] Done
- **Files:** `README.md`, `dev.local.md.example`
- **Approach:** rename to TableTap. List all four migrations, including `004_sales_transactions.sql`, and say checkout fails without it. Document the prod env vars, including the new 1.1 rules and the S3 vars. Link `docs/tax-export.md` and `docs/admin-password-reset.md`.
- **Acceptance:** a fresh setup that follows the README gets a working checkout.
- **Test:** read through it against `server/migrations/` and `server/.env.example`.

#### 2.4 Clear "sell whole stack" price label
- [ ] Done
- **Files:** `client/src/components/SellForm.tsx`
- **Approach:** when `card.quantity > 1`, label the field "Total sale price for all N cards" and pre-fill it with asking × N. For partial quantities, point users to the Sell page cart (`StockSellPanel`), which already handles quantity.
- **Acceptance:** for a stack of 3 the label says "all 3", and profit preview math is unchanged.
- **Test:** card with quantity 3 at $1 cost → sell for $9 total → profit $6.

### Phase 3: nice-to-have (only if everything above is done; otherwise after beta)

- [ ] **3.1 CI:** `.github/workflows/ci.yml` runs `npm ci && npm test` in `server` and `npm ci && npm run build` in `client` on push/PR. *Acceptance:* a green check on GitHub.
- [ ] **3.2 Meta/OG + robots.txt:** add a description and OG tags to `client/index.html`, and add `client/public/robots.txt` (allow `/`, `/guide`, `/pricing`; disallow app routes). No sitemap needed for a small invite-only beta.
- [ ] **3.3 Real 404 status from the server:** in `server/src/index.ts:52-60`, return 404 for paths that aren't known client routes. This needs a route list kept in sync with `App.tsx`, so it's optional.
- [ ] **3.4 Rename "Tax export" to "Profit & loss export":** `client/src/components/TaxReportPanel.tsx:119`, `docs/tax-export.md`. Sales tax was cancelled, so the name may confuse testers. Copy only; leave code names alone.

---

## 4. Chris must do manually

| # | Task | Notes |
|---|---|---|
| M1 | **Coolify env vars** | Set `JWT_SECRET` to 64 random hex characters (`openssl rand -hex 32`). Changing it logs everyone out, which is fine before the beta. Confirm `NODE_ENV=production` and `CLIENT_URL=https://tabletap.bytesbyblinken.com`. Do this **before** deploying task 1.1. |
| M2 | **Postgres backups** | In Coolify, turn on scheduled backups for the TableTap Postgres (daily, keep ≥ 7). Store them off the server (e.g. the same S3/R2 bucket, a separate prefix) if possible. Take a manual backup now and again before Nov 1. |
| M3 | **Photo storage decision + S3 creds** | Choose 1.5 option A or B. For A, create a bucket with free-tier storage (e.g. Cloudflare R2 or Backblaze B2; check current limits on their pricing pages), make objects publicly readable, create an access key limited to that bucket, and set `STORAGE_DRIVER=s3` plus all `S3_*` vars. |
| M4 | **Restore test** | Restore the latest backup into a **scratch** database (not prod), point a local `server/.env` `DATABASE_URL` at it, run `node server/scripts/check-schema.mjs`, and log in locally with a test account. Write down how long it took. |
| M5 | **Legal text review** | Read and edit the Terms/Privacy drafts from task 1.6. They're starting drafts, **not legal advice**. If you want certainty, have a lawyer or a reputable template service check them. |
| M6 | **Support inbox** | Make sure info@bytesbyblinken.com is checked daily during the beta, including show weekends. Set an auto-reply giving the expected response time. |
| M7 | **HTTP → HTTPS** | Port 80 currently times out. In Coolify/proxy settings or the server firewall, open 80 and redirect it to HTTPS. Nice-to-have, since HSTS covers repeat visits. |
| M8 | **SMTP provider (choose now, use after beta)** | Your choice. Free-tier options worth comparing (limits change, so verify on their sites): **Resend** (simple API, small free monthly quota), **Brevo** (free daily send limit, SMTP + API), **Amazon SES** (very cheap per email, more setup, starts in sandbox). Any of them needs SPF/DKIM DNS records on bytesbyblinken.com. |

---

## 5. Beta QA checklist (Fri 10/30 – Sat 10/31)

Run on a **phone** first (iPhone Safari and Android Chrome if possible), using two accounts: **A** = `test1@test.com`, **B** = `test2@test.com` (or two fresh ones).

**Signup and session**
- [ ] Register a new account on the phone. The Terms/Privacy links work, and you land on `/welcome`.
- [ ] Inputs don't zoom on iPhone (2.2).
- [ ] Log out from Settings → you're sent to `/login`, and `/dashboard` redirects to login.
- [ ] Log back in. The dashboard loads.

**Show day flow (account A)**
- [ ] Create a show (Events) for today.
- [ ] Add stock: one card by hand (with a photo if 1.5A), one stack of 5 at $2 each, and a CSV import of the template (`client/public/stock-import-template.csv`).
- [ ] Sell now: one card at $10 → shows in Sales with the right date (today, your local day).
- [ ] Cart checkout: 2 cards from the stack of 5 at $4 each + one other card → one receipt, stack shows 3 left, profit = revenue − cost.
- [ ] Quick sale (walk-up item) → appears in Sales.
- [ ] Trade: 1 card out of a stack (1.7) with $5 cash received → stock reduced by 1, incoming card in stock, profit includes $5 once.
- [ ] Trade with **no** cash → it's in the CSV as `sale_type = trade`.
- [ ] Dashboard: "today" totals match the sales above.
- [ ] Sales → report "This quarter": totals strip matches a hand sum. Export the CSV, open it on the phone/computer, and check that its row totals match the strip. Check how trades with cash appear in the summary (taxReport.ts note).
- [ ] Do a sale in the evening (after ~7 PM local), or set the phone's time zone to another zone → date is still the vendor's local day.

**Security and limits**
- [ ] 11 wrong passwords → "Too many attempts" (429). A correct login from another network still works.
- [ ] Forgot password: the Login page shows the support line, and Chris completes the runbook (1.8) for account B in under 5 minutes.
- [ ] Upload a PDF as a photo → friendly 400 message (2.1). Upload a CSV over 2 MB → friendly message.
- [ ] Open `/nonexistent` → Not-found page. FAQ link scrolls.
- [ ] Support mailto opens from Settings and the footer.

**Two-account data isolation**
- [ ] As A, copy the URL of one of A's cards (`/cards/<id>`). Log in as B on another browser, open that URL → "not found", not A's card.
- [ ] B's dashboard, Sales, Events, stock list, and CSV export show **none** of A's data.
- [ ] As B, try a checkout using A's card id (browser devtools or curl with B's cookie) → 400 "Card not found or already sold".

**After a redeploy**
- [ ] Redeploy in Coolify → photos still show (if 1.5A), data intact, still logged in.

---

## 6. Beta feedback loop

- **How testers report:** the in-app support mailto (Settings) → info@bytesbyblinken.com, with subject `TableTap beta:`. Ask for phone model, what they tapped, and a screenshot. Chris keeps one running list (a spreadsheet or GitHub issues he creates himself) tagged bug / confusing / idea.
- **Check-ins:** a short message to each tester after their first show: "What slowed you down at the table? Did the numbers match your cash?"
- **What to measure** (run weekly in pgAdmin; no analytics tool needed):
  - Signups: `SELECT date_trunc('week', created_at) wk, COUNT(*) FROM users GROUP BY 1 ORDER BY 1;`
  - Activated (≥ 1 sale): `SELECT COUNT(DISTINCT user_id) FROM cards WHERE status = 'sold';`
  - Sales per vendor per week: `SELECT user_id, date_trunc('week', sold_date) wk, COUNT(*) FROM cards WHERE status='sold' GROUP BY 1,2 ORDER BY 2;`
  - Used at a show: `SELECT COUNT(DISTINCT user_id) FROM cards WHERE status='sold' AND event_id IS NOT NULL;`
  - Plus from conversations: did they export the CSV, did profit match their own count, and what price they'd pay (the `/pricing` draft already asks).
- **Bar for "beta worked":** at least 3 vendors use it at a real show, with no data-loss bugs reported.

---

## 7. After beta launch (not before Nov 1)

- **Email password reset.** Needs: an SMTP provider (M8) + DNS; **new migration `server/migrations/005_password_resets.sql`** (table: `id`, `user_id` FK cascade, `token_hash`, `expires_at`, `used_at`). **Needs Chris's approval and is run by Chris in pgAdmin** on testing, then prod. Also needs `POST /api/auth/forgot` (always returns 200, rate-limited), `POST /api/auth/reset`, `ForgotPasswordPage.tsx` / `ResetPasswordPage.tsx`, single-use tokens that expire in 30–60 min, and a "change password" in Settings. Optionally add a `token_version` on users so a reset logs out old sessions (that would be part of the same approved migration).
- Self-service account deletion and full data export (stock + sales).
- Scripted migration runner (replacing pgAdmin by hand).
- Max lengths on text fields and upper bounds on prices (`validation.ts`).
- `requireAuth` re-checks that the user still exists. Server-side session revocation on logout.
- Server 404 status for unknown paths (3.3) and the sitemap, if marketing needs them.
- Own domain for TableTap.
- Pricing decision and payments (only after beta feedback).

## 8. Out of scope (entire beta)

- Payments, billing, and Stripe
- Market pricing / card value lookups
- **Sales tax** (cancelled by Chris; the report is profit and loss only)
- Native mobile apps, offline mode, multi-user/staff accounts
- Changes to already-saved sale dates (the pre-Oct 16 date note stays as-is)

---

### Review notes
- Read-only: GitHub API tree/commit listing at `fba4225` plus raw file reads; anonymous `curl` of the testing site. No login, no form submission, no POSTs.
- **UNVERIFIED** (needs Coolify or a login): prod env values, storage driver, backups, whether migration 004 is applied in prod, rate-limit behavior behind the proxy, and all logged-in flows. Server tests weren't run.
- Free-tier limits for SMTP/storage providers weren't re-checked for this doc. Confirm them on the providers' sites.
