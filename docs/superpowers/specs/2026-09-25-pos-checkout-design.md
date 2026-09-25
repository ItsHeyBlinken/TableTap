# POS Checkout (multi-item transaction) — Design

**Date:** 2026-09-25  
**Product:** TableTap (ShowPOS)  
**Status:** Spec approved (2026-09-25) — includes speed/show-floor UX; ready for implementation plan

## Goal

Make **Sell → From stock** work like a POS checkout without payments: build a cart of stock lines, see a running total, then complete **one transaction** that records multiple line items.

### Example

- Card A @ $50  
- Value-box commons: **5** @ $3 each → $15  
- Card B @ $35  
- **Transaction total: $100**

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Partial quantity | **A** — Selling N of a stock line leaves remaining qty on the same active card |
| Sales history | **C** — List shows transactions; expand for line items |
| Cart contents v1 | **A** — Stock only; Quick sale and Trade stay separate tabs |
| Voids / refunds | **None** — all sales are final |
| Pricing on cart line | **Unit price × quantity** = line total |
| Speed | **Must stay POS-fast** — fewer taps than today’s single-sale flow for the common case |

## Speed / show-floor UX (non-negotiable)

Checkout is multi-line capable, but the **default path for one card must feel as fast as (or faster than) today’s Sell form**.

| Principle | Implementation |
|-----------|----------------|
| Big targets | Qty, unit price, Add, Complete — large touch targets (existing Sell patterns) |
| Sensible defaults | Qty defaults to **1**; unit price prefills from asking price; event remembers last used |
| Minimal typing | Datalist/presets for qty where useful; numeric keyboards (`inputMode`) |
| One-card buyer | Search → tap card → (defaults OK) → **Add** → **Complete** — target **≤ ~3 taps** after selecting the card if price/qty need no edit |
| Multi-card buyer | Add line → immediately back to search (cart stays visible/sticky); no modal maze |
| No extra confirm | Complete sale submits once; success flash then ready for next cart — no “are you sure?” |
| Sticky cart | Cart + running total + Complete always visible while browsing stock (mobile: bottom sheet or sticky footer) |

**Anti-patterns to avoid:** multi-step wizards, tiny inputs, forcing qty/price re-entry when defaults are fine, leaving the Sell page between lines.

## Non-goals (v1)

- Payment capture (cash/Venmo/Square, etc.)
- Void, refund, or edit completed sales
- Ad-hoc / quick-sale lines inside the cart
- Merging trades into the same checkout
- Stored payment method or tender type

## Current system (context)

- Stock lives on `cards` (`status = active`). Cost is **per unit** (`purchase_price`); cost basis = `purchase_price × quantity`.
- Selling today: `PATCH /api/cards/:id/sell` marks the **entire** card row sold. No cart; no partial qty.
- Profit (unchanged): `sold_price - purchase_price * quantity` on each sold card row.
- Trades use `trade_group_id` / `sale_type = trade` and stay out of this feature.

## Approach

**Transaction header + sold card rows as line items** (not a separate `sale_line_items` inventory rewrite).

1. Create `sales_transactions` for the receipt header.
2. On checkout, for each cart line write/update card rows and set `transaction_id`.
3. Dashboard / profit continue to sum sold cards; Sales UI groups by `transaction_id`.

## Data model

### New: `sales_transactions`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID NOT NULL | FK → users, CASCADE |
| `event_id` | UUID NULL | FK → sales_events, ON DELETE SET NULL |
| `sold_date` | DATE NOT NULL | Show day for the receipt |
| `created_at` | TIMESTAMPTZ | default now() |

No stored `total` — compute from linked sold cards.

Indexes: `(user_id, sold_date DESC)`, `(user_id, created_at DESC)`.

Migration file: `server/migrations/004_sales_transactions.sql` (user applies in pgAdmin).

### Cards

- Add `transaction_id UUID NULL REFERENCES sales_transactions(id) ON DELETE SET NULL`
- Index: `idx_cards_transaction_id`
- Existing sold rows without `transaction_id` remain valid (legacy / quick sale / old single sells)

### Checkout line semantics

For each cart line `{ card_id, quantity, unit_price }`:

- `line_total = unit_price * quantity` → stored as that sold row’s `sold_price`
- `sale_type = 'cash'`, `cash_adjustment = NULL`
- Link `event_id` / `sold_date` from the transaction (denormalized on card for existing queries)

**Full quantity** (`quantity === card.quantity`):

- `UPDATE` card → `status = sold`, set `sold_price`, `sold_date`, `event_id`, `transaction_id`

**Partial quantity** (`1 <= quantity < card.quantity`):

- `UPDATE` active card → `quantity = quantity - sold_qty` (stays `active`)
- `INSERT` new card row: copy stock fields from source, `quantity = sold_qty`, `status = sold`, `sold_price = line_total`, `transaction_id`, etc.

**Quick sale / Trade:** unchanged; do not set `transaction_id` unless we later opt in (v1: leave null).

## API

### `POST /api/sales/checkout`

Auth required. Body:

```json
{
  "event_id": "uuid | null",
  "sold_date": "YYYY-MM-DD",
  "lines": [
    { "card_id": "uuid", "quantity": 5, "unit_price": 3 }
  ]
}
```

Rules (single DB transaction — all or nothing):

1. `lines.length >= 1`
2. Each `card_id` unique in the payload (client should merge duplicates on add-to-cart)
3. Each card: `status = active`, `user_id` matches, `quantity_requested` between 1 and on-hand
4. `unit_price >= 0`
5. If `event_id` set, event must belong to user
6. On any failure → rollback; return 400 with clear message

Response:

```json
{
  "transaction": { "id", "sold_date", "event_id", "event_name?", "created_at" },
  "lines": [ /* sold Card DTOs */ ],
  "total": 100,
  "profit": 42.5
}
```

`total` / `profit` computed server-side from resulting sold rows.

### Existing endpoints

- Keep `PATCH /api/cards/:id/sell` for compatibility (or implement as one-line checkout). Prefer routing Sell UI through checkout only so new sales always get a `transaction_id`.
- Quick sale / trades unchanged.

### Optional list helper

- Extend sales/cards listing or add `GET /api/sales/transactions` that returns grouped receipts for the Sales page. Implementation may group client-side from existing sold cards + `transaction_id` if that stays simple.

## UI

### Sell → From stock

Layout stays search + list + form, with a **sticky cart bar** (total + Complete) so multi-line sales don’t scroll hunting.

1. Search / pick active stock card.
2. Enter **qty** (default 1, max = on hand) and **unit price** (pre-fill from asking price when set; editable).
3. Show line preview: `qty × unit = line total`; cost/profit preview optional but nice.
4. Actions (speed-first):
   - **Add to cart** — append/merge line; clear selection focus back to search for next card.
   - **Sell now** — when cart is empty: checkout **just this line** in one tap (no separate Add). When cart already has lines, hide Sell now or treat as “add then complete” only via Complete.
5. Cart panel / sticky bar: lines (edit qty/price, remove), **running total**, event select (existing `EventSelect` / last-event memory).
6. **Complete sale** → `POST /api/sales/checkout` → success toast with total → clear cart → focus search for next buyer.

One-card buyers use **Sell now** (same speed as today’s Complete sale). Multi-card buyers use Add → Add → Complete.

### Sales history

- Primary list: **transactions** (or synthetic single-line groups for null `transaction_id`).
- Row: date · total · N items · event · profit (optional).
- Expand: each line (card label, qty, sold price, profit).
- Mobile: card layout consistent with current Sales page patterns.

### Dashboard

- No schema change required for KPIs if they continue summing sold cards.
- Optional later: “sales count” by transaction vs by line — **not required for v1**.

## Error handling

| Case | Behavior |
|------|----------|
| Oversell / stale qty | 400; cart unchanged; user adjusts |
| Card already sold / missing | 400 for that line; full rollback |
| Empty cart submit | Client disabled + server 400 |
| Network failure | Client shows error; no partial commit |

## Testing (manual / demo)

1. Stock qty 50 @ $0.75 cost; cart 5 @ $3 → remaining stock 45; sold line qty 5, sold_price $15, profit $11.25.
2. Three different cards in one cart → one transaction, total sum of lines.
3. Complete sale → Sales shows one receipt expandable to three lines.
4. Quick sale still works alone (no transaction grouping required).
5. Legacy sold cards (null `transaction_id`) still appear as single-line receipts.

## Rollout

1. Add migration `004_sales_transactions.sql` (user runs in pgAdmin locally + Coolify).
2. Server: checkout service + route + validation.
3. Client: cart UX on Sell; Sales grouping UI.
4. Update FAQ / guide briefly if checkout is user-visible in demos.
5. Memory Bank: `activeContext.md`, `progress.md`, `systemPatterns.md`.

## Open points (resolved)

- Unit vs line price entry → **unit × qty**.
- Duplicate card in cart → **merge on add** (client).
- Voids → **out of scope**.
