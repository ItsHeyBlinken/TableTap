# POS Checkout (multi-item transaction) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sell → From stock a fast POS cart: multi-line checkout with partial qty, one transaction receipt, while one-card sales stay as quick as today’s single Complete sale via **Sell now**.

**Architecture:** New `sales_transactions` header; checkout creates/updates sold `cards` rows linked by `transaction_id`. Partial sells reduce active qty and insert a sold split row. Client cart on Sell page; Sales page groups by transaction (expand for lines). No payment, void, or ad-hoc cart lines in v1.

**Tech Stack:** Express + `pg` + Zod (server); React + Vite (client); PostgreSQL migration applied manually in pgAdmin.

**Spec:** [`docs/superpowers/specs/2026-09-25-pos-checkout-design.md`](../specs/2026-09-25-pos-checkout-design.md)

## Global Constraints

- User applies all SQL migrations in pgAdmin (do not run migrate commands).
- User handles all git commits (suggest messages only; do not `git commit` unless asked).
- No automated test runner in repo — verify with `npm run build` (server + client) and manual demo checklist.
- All sales final — no voids/refunds.
- Stock-only cart; Quick sale and Trade tabs unchanged.
- Speed: sticky cart, defaults (qty 1, ask → unit price, last event), **Sell now** for empty-cart one-liners, no confirm dialogs.
- Imports at top of files; exhaustive `switch` with `never` where unions are switched.
- Product UI name TableTap; internal ShowPOS naming in code/docs OK.

---

## File map

| File | Responsibility |
|------|----------------|
| `server/migrations/004_sales_transactions.sql` | Create `sales_transactions`; add `cards.transaction_id` |
| `server/src/types/index.ts` | `SalesTransaction`, `CheckoutResult`; `Card.transaction_id` |
| `server/src/utils/validation.ts` | `checkoutSchema` |
| `server/src/services/checkoutService.ts` | Atomic checkout + partial split |
| `server/src/routes/sales.ts` | `POST /api/sales/checkout` |
| `server/src/middleware/errorHandler.ts` | Map checkout domain errors → 400 |
| `server/src/utils/cardMapper.ts` / `cardService` SELECT lists | Include `transaction_id` in mapped cards if SELECTs are explicit |
| `client/src/types/index.ts` | Mirror types |
| `client/src/lib/cartStorage.ts` | Optional sessionStorage cart helpers |
| `client/src/components/CartPanel.tsx` | Sticky cart lines, total, Complete |
| `client/src/components/StockSellPanel.tsx` | Replace SellForm usage: qty, unit price, Add / Sell now |
| `client/src/pages/SellPage.tsx` | Wire cart state + stock tab |
| `client/src/pages/SalesPage.tsx` | Group by `transaction_id`, expand lines |
| `client/src/lib/groupSales.ts` | Pure grouping helper |
| Memory Bank + FAQ snippet | Document behavior after ship |

---

### Task 1: Migration `004_sales_transactions.sql`

**Files:**
- Create: `server/migrations/004_sales_transactions.sql`

**Interfaces:**
- Produces: tables/columns used by all later tasks

- [ ] **Step 1: Write migration SQL**

```sql
-- Sales transactions (POS multi-line checkout receipts)
-- Apply manually in pgAdmin after 003_trades.sql

CREATE TABLE IF NOT EXISTS sales_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES sales_events(id) ON DELETE SET NULL,
  sold_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_transactions_user_date
  ON sales_transactions(user_id, sold_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_user_created
  ON sales_transactions(user_id, created_at DESC);

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES sales_transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cards_transaction_id ON cards(transaction_id);
```

- [ ] **Step 2: Document apply steps for the user**

Tell the user (do not run against DB yourself):

1. Open pgAdmin → local `card_inventory` (and Coolify Postgres when deploying).
2. Query Tool → paste/run `004_sales_transactions.sql`.
3. Confirm `\d sales_transactions` and `cards.transaction_id` exist.

- [ ] **Step 3: Suggest commit** (user commits)

Suggested message: `Add sales_transactions migration for POS checkout`

---

### Task 2: Types + Zod checkout schema

**Files:**
- Modify: `server/src/types/index.ts`
- Modify: `client/src/types/index.ts`
- Modify: `server/src/utils/validation.ts`

**Interfaces:**
- Produces:
  - `SalesTransaction { id, user_id, event_id, sold_date, created_at }`
  - `CheckoutResult { transaction, lines: Card[], total: number, profit: number }`
  - `checkoutSchema` → `{ event_id?: string | null, sold_date?: string, lines: { card_id, quantity, unit_price }[] }`
  - `Card.transaction_id: string | null` (server + client)

- [ ] **Step 1: Add server types**

On `Card`, add:

```ts
transaction_id: string | null;
```

Add:

```ts
export interface SalesTransaction {
  id: string;
  user_id: string;
  event_id: string | null;
  sold_date: string;
  created_at: Date;
}

export interface CheckoutResult {
  transaction: SalesTransaction & { event_name?: string | null };
  lines: Card[];
  total: number;
  profit: number;
}
```

- [ ] **Step 2: Mirror on client types**

Add `transaction_id?: string | null` on `Card`, plus `SalesTransaction` and `CheckoutResult` (use `created_at: string` on client).

- [ ] **Step 3: Add `checkoutSchema` in `validation.ts`**

```ts
export const checkoutSchema = z.object({
  event_id: z.string().uuid().optional().nullable(),
  sold_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
  lines: z
    .array(
      z.object({
        card_id: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
        unit_price: z.coerce.number().nonnegative(),
      })
    )
    .min(1, "At least one line required"),
});
```

Also export a refine helper or validate unique `card_id`s in the service (prefer service check with clear error: `"Duplicate card_id in checkout lines"`).

- [ ] **Step 4: Typecheck**

Run: `npm run build --prefix server`  
Expected: PASS (or only unrelated existing errors).

- [ ] **Step 5: Suggest commit**

Suggested message: `Add checkout types and Zod schema`

---

### Task 3: `checkoutService.checkout()`

**Files:**
- Create: `server/src/services/checkoutService.ts`
- Modify: `server/src/utils/cardMapper.ts` only if needed (no change if `mapCard` spreads row)
- Modify: `server/src/services/cardService.ts` — ensure any `SELECT`/`RETURNING *` paths still map; `getCardById` already uses `*` + join

**Interfaces:**
- Consumes: `checkoutSchema` inferred type; `pool`; `getEventById`; `mapCard`; `computeProfit` / sold_price math
- Produces: `export async function checkout(userId: string, input: CheckoutInput): Promise<CheckoutResult>`

- [ ] **Step 1: Implement service**

```ts
// server/src/services/checkoutService.ts
import { pool } from "../db/pool.js";
import type { Card, CheckoutResult, SalesTransaction } from "../types/index.js";
import { getEventById } from "./eventService.js";
import { getCardById } from "./cardService.js";
import { mapCard } from "../utils/cardMapper.js";
import { todayDateString, computeProfit } from "../utils/validation.js";
import type { z } from "zod";
import type { checkoutSchema } from "../utils/validation.js";

type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function checkout(userId: string, input: CheckoutInput): Promise<CheckoutResult> {
  const soldDate = input.sold_date ?? todayDateString();
  const eventId = input.event_id ?? null;

  const ids = input.lines.map((l) => l.card_id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate card_id in checkout lines");
  }

  if (eventId) {
    const event = await getEventById(userId, eventId);
    if (!event) throw new Error("Event not found");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const txResult = await client.query<SalesTransaction>(
      `INSERT INTO sales_transactions (user_id, event_id, sold_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, eventId, soldDate]
    );
    const transaction = txResult.rows[0];
    const soldIds: string[] = [];

    for (const line of input.lines) {
      const lock = await client.query<Card>(
        `SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND status = 'active' FOR UPDATE`,
        [line.card_id, userId]
      );
      const card = lock.rows[0];
      if (!card) {
        throw new Error(`Card not found or already sold: ${line.card_id}`);
      }
      if (line.quantity > card.quantity) {
        throw new Error(
          `Insufficient quantity for ${card.player_name}: have ${card.quantity}, need ${line.quantity}`
        );
      }

      const lineTotal = Number(line.unit_price) * line.quantity;

      if (line.quantity === card.quantity) {
        const upd = await client.query<{ id: string }>(
          `UPDATE cards SET
             status = 'sold',
             sold_price = $3,
             sold_date = $4,
             event_id = $5,
             transaction_id = $6,
             sale_type = 'cash',
             cash_adjustment = NULL,
             trade_group_id = NULL
           WHERE id = $1 AND user_id = $2 AND status = 'active'
           RETURNING id`,
          [card.id, userId, lineTotal, soldDate, eventId, transaction.id]
        );
        if (!upd.rows[0]) throw new Error(`Could not sell card: ${card.player_name}`);
        soldIds.push(card.id);
      } else {
        const rem = await client.query(
          `UPDATE cards SET quantity = quantity - $3
           WHERE id = $1 AND user_id = $2 AND status = 'active' AND quantity >= $3
           RETURNING id`,
          [card.id, userId, line.quantity]
        );
        if (!rem.rows[0]) {
          throw new Error(`Could not reduce quantity for ${card.player_name}`);
        }

        const ins = await client.query<{ id: string }>(
          `INSERT INTO cards (
             user_id, player_name, year, brand, card_number, sport, team, condition,
             graded, grading_company, grade, purchase_price, estimated_value, quantity,
             notes, image_url, status, sold_price, sold_date, event_id, transaction_id,
             sale_type
           ) VALUES (
             $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
             'sold',$17,$18,$19,$20,'cash'
           ) RETURNING id`,
          [
            userId,
            card.player_name,
            card.year,
            card.brand,
            card.card_number,
            card.sport,
            card.team,
            card.condition,
            card.graded,
            card.grading_company,
            card.grade,
            card.purchase_price,
            card.estimated_value,
            line.quantity,
            card.notes,
            card.image_url,
            lineTotal,
            soldDate,
            eventId,
            transaction.id,
          ]
        );
        soldIds.push(ins.rows[0].id);
      }
    }

    await client.query("COMMIT");

    const lines: Card[] = [];
    for (const id of soldIds) {
      const mapped = await getCardById(userId, id);
      if (!mapped) throw new Error("Failed to load sold line");
      lines.push(mapped);
    }

    const total = lines.reduce((s, c) => s + Number(c.sold_price ?? 0), 0);
    const profit = lines.reduce((s, c) => s + (c.profit ?? computeProfit(c) ?? 0), 0);
    const eventName = lines[0]?.event_name ?? null;

    return {
      transaction: { ...transaction, sold_date: soldDate, event_name: eventName },
      lines,
      total,
      profit,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
```

Adjust `sold_date` on transaction row with the same `toDateOnly` pattern if Postgres returns a Date object (map in return).

Remove unused `mapCard` import if unused.

- [ ] **Step 2: Build server**

Run: `npm run build --prefix server`  
Expected: PASS.

- [ ] **Step 3: Manual SQL smoke (user)** — after migration applied, hit checkout via curl once Task 4 lands, or use temporary script. Defer live smoke to Task 4.

- [ ] **Step 4: Suggest commit**

Suggested message: `Implement atomic POS checkout service with partial quantity`

---

### Task 4: Route `POST /api/sales/checkout` + errors

**Files:**
- Modify: `server/src/routes/sales.ts`
- Modify: `server/src/middleware/errorHandler.ts`

**Interfaces:**
- Consumes: `checkout`, `checkoutSchema`
- Produces: `201 { transaction, lines, total, profit }`

- [ ] **Step 1: Add route**

In `sales.ts`:

```ts
import { checkoutSchema, todayDateString } from "../utils/validation.js";
import * as checkoutService from "../services/checkoutService.js";

router.post("/checkout", async (req: AuthRequest, res, next) => {
  try {
    const body = checkoutSchema.parse(req.body);
    const result = await checkoutService.checkout(req.user!.userId, {
      ...body,
      sold_date: body.sold_date ?? todayDateString(),
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
```

Keep existing `/quick` route.

- [ ] **Step 2: Map domain errors in `errorHandler.ts`**

Extend the 400/404 branch to include messages:

- `"Duplicate card_id in checkout lines"`
- messages starting with `"Insufficient quantity"`
- messages starting with `"Card not found or already sold"`
- messages starting with `"Could not sell card"`
- messages starting with `"Could not reduce quantity"`

Use `res.status(400).json({ error: err.message })` for checkout qty/duplicate/not-found-sold cases (404 for Event not found already covered).

- [ ] **Step 3: Build**

Run: `npm run build --prefix server`  
Expected: PASS.

- [ ] **Step 4: Suggest commit**

Suggested message: `Expose POST /api/sales/checkout`

---

### Task 5: Cart helpers + StockSellPanel + CartPanel

**Files:**
- Create: `client/src/lib/cartStorage.ts`
- Create: `client/src/components/StockSellPanel.tsx`
- Create: `client/src/components/CartPanel.tsx`
- Keep: `SellForm.tsx` unused by Sell page (can leave for now or delete in Task 6 — prefer leave file until SellPage migrated)

**Interfaces:**
- Produces:
  - `CartLine { cardId, label, quantity, unitPrice, maxQuantity, purchasePrice }`
  - `loadCart() / saveCart(lines) / clearCart()` via `sessionStorage` key `tabletap_pos_cart`
  - `StockSellPanel` props: `{ card, onAdd(line), onSellNow(line), eventId, onEventChange }`
  - `CartPanel` props: `{ lines, onChangeLines, eventId, onEventChange, onCheckout, loading, total }`

- [ ] **Step 1: `cartStorage.ts`**

```ts
export interface CartLine {
  cardId: string;
  label: string;
  quantity: number;
  unitPrice: number;
  maxQuantity: number;
  purchasePrice: number;
}

const KEY = "tabletap_pos_cart";

export function loadCart(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]): void {
  sessionStorage.setItem(KEY, JSON.stringify(lines));
}

export function clearCart(): void {
  sessionStorage.removeItem(KEY);
}

export function mergeLine(lines: CartLine[], next: CartLine): CartLine[] {
  const i = lines.findIndex((l) => l.cardId === next.cardId);
  if (i < 0) return [...lines, next];
  const existing = lines[i];
  const quantity = Math.min(existing.maxQuantity, existing.quantity + next.quantity);
  const unitPrice = next.unitPrice;
  const copy = [...lines];
  copy[i] = { ...existing, quantity, unitPrice, maxQuantity: next.maxQuantity };
  return copy;
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
}
```

- [ ] **Step 2: `StockSellPanel.tsx`**

UI requirements (speed):

- Show card label, on-hand qty, cost, ask.
- Qty input (`inputMode="numeric"`, default `1`, max = `card.quantity`).
- Unit price (`inputMode="decimal"`, default `cardAskingPrice(card) ?? ""`).
- Live line total = qty × unit.
- EventSelect when used standalone for Sell now (or rely on parent cart event — **parent owns event**; panel does not need EventSelect if parent passes event for Sell now).
- Buttons:
  - **Add to cart** (secondary) → `onAdd`
  - **Sell now** (primary green, large) → `onSellNow` — only enabled when parent says `canSellNow` (cart empty). When cart has items, hide Sell now or disable with title “Clear cart or use Complete sale”.

Props:

```ts
interface StockSellPanelProps {
  card: Card;
  canSellNow: boolean;
  onAdd: (line: CartLine) => void;
  onSellNow: (line: CartLine) => void;
}
```

Build `CartLine` from card + form values using `cardLabel`.

- [ ] **Step 3: `CartPanel.tsx`**

- List lines: label, qty stepper/input, unit price, line total, remove.
- Sticky/footer feel: `sticky bottom-0` or fixed above mobile nav with running **Total**.
- EventSelect + Complete sale (disabled if `lines.length === 0` or loading).
- Large Complete button matching current green POS style.

- [ ] **Step 4: Client build**

Run: `npm run build --prefix client`  
Expected: PASS once wired or build components only if imported — import from SellPage in Task 6; until then export components and temporarily import in SellPage or accept unused file OK for tsc if no unused checks.

- [ ] **Step 5: Suggest commit**

Suggested message: `Add POS cart UI components and session cart helpers`

---

### Task 6: Wire `SellPage` cart + checkout

**Files:**
- Modify: `client/src/pages/SellPage.tsx`
- Optionally stop using `SellForm` on stock tab

**Interfaces:**
- Consumes: `apiPost("/api/sales/checkout", …)`, cart helpers, panels

- [ ] **Step 1: State**

```ts
const [cart, setCart] = useState<CartLine[]>(() => loadCart());
const [eventId, setEventId] = useState("");
const [checkoutLoading, setCheckoutLoading] = useState(false);

useEffect(() => {
  saveCart(cart);
}, [cart]);
```

- [ ] **Step 2: Handlers**

`addToCart(line)` → `setCart(mergeLine(...))`; clear search focus; toast optional “Added”.

`sellNow(line)` → `apiPost` checkout with single line + eventId; on success `clearCart`, reload stock, toast with total/profit.

`completeSale()` → checkout with all cart lines; same success path.

Payload:

```ts
{
  event_id: eventId || null,
  sold_date: new Date().toISOString().slice(0, 10),
  lines: cart.map((l) => ({
    card_id: l.cardId,
    quantity: l.quantity,
    unit_price: l.unitPrice,
  })),
}
```

After success: `clearCart(); setCart([]); loadStock();` focus search input via ref.

- [ ] **Step 3: Layout**

Replace `<SellForm />` with `<StockSellPanel canSellNow={cart.length === 0} … />`.  
Render `<CartPanel />` below list (or sticky) whenever `cart.length > 0` **or always** with empty state hidden — prefer always show compact bar when cart non-empty so multi-add stays fast.

Update subtitle copy: e.g. “Add lines, then complete — or Sell now for one card.”

- [ ] **Step 4: Manual demo checklist**

1. One card, defaults → **Sell now** → sale recorded, stock gone, toast.
2. Qty 50 stock → sell 5 @ $3 → stock 45; sales line qty 5.
3. Card A + value box + Card B → Complete → one transaction total correct.
4. Refresh mid-cart → sessionStorage restores lines.

- [ ] **Step 5: Suggest commit**

Suggested message: `Wire Sell page POS cart and checkout`

---

### Task 7: Sales page grouping UI

**Files:**
- Create: `client/src/lib/groupSales.ts`
- Modify: `client/src/pages/SalesPage.tsx`

**Interfaces:**
- Produces: `SaleReceipt { key, transactionId, soldDate, eventName, lines: Card[], total, profit }`
- `groupSoldCards(cards: Card[]): SaleReceipt[]`

- [ ] **Step 1: Grouping helper**

```ts
export interface SaleReceipt {
  key: string;
  transactionId: string | null;
  soldDate: string | null;
  eventName: string | null;
  lines: Card[];
  total: number;
  profit: number;
}

export function groupSoldCards(cards: Card[]): SaleReceipt[] {
  const map = new Map<string, SaleReceipt>();
  const order: string[] = [];

  for (const card of cards) {
    const key = card.transaction_id ?? `single:${card.id}`;
    let receipt = map.get(key);
    if (!receipt) {
      receipt = {
        key,
        transactionId: card.transaction_id ?? null,
        soldDate: card.sold_date,
        eventName: card.event_name ?? null,
        lines: [],
        total: 0,
        profit: 0,
      };
      map.set(key, receipt);
      order.push(key);
    }
    receipt.lines.push(card);
    receipt.total += Number(card.sold_price ?? 0) + Number(card.cash_adjustment ?? 0);
    receipt.profit += card.profit ?? 0;
  }

  return order.map((k) => map.get(k)!);
}
```

Note: pagination remains per **card row** from API; multi-line transactions may split across pages if large. Acceptable for v1; document in Memory Bank. Optional follow-up: `GET /api/sales/transactions`.

- [ ] **Step 2: Update SalesPage**

- `const receipts = groupSoldCards(sales)`
- Mobile cards: tap/expand chevron to show lines; collapsed shows date · N items · total · profit.
- Desktop table: receipt row + expandable detail rows.
- Legacy/quick/trade (null `transaction_id`): one line each, still works.

- [ ] **Step 3: Build + manual check**

Run: `npm run build --prefix client`  
Manual: complete multi-line sale → Sales shows one expandable receipt.

- [ ] **Step 4: Suggest commit**

Suggested message: `Group Sales history by POS transaction`

---

### Task 8: Docs + Memory Bank

**Files:**
- Modify: `memory-bank/activeContext.md`, `progress.md`, `systemPatterns.md`
- Modify: `docs/FAQ.md` and/or `client/src/content/faq.ts` — one short Q: multi-item checkout / partial qty
- Modify: `memory-bank/techContext.md` API table — add `POST /api/sales/checkout`

- [ ] **Step 1: Pattern note**

Add to `systemPatterns.md`:

- POS checkout: `sales_transactions` + sold cards with `transaction_id`; partial sell splits qty onto new sold row.
- Profit still per sold card row; receipts group in UI.

- [ ] **Step 2: Progress log entry** for completed POS checkout feature.

- [ ] **Step 3: FAQ blurb** — TableTap records a cart as one transaction; remaining value-box qty stays in stock; no payment processing.

- [ ] **Step 4: Suggest commit**

Suggested message: `Document POS checkout in FAQ and memory bank`

---

## Spec coverage check

| Spec requirement | Task |
|------------------|------|
| `sales_transactions` + `transaction_id` | 1 |
| Partial qty leave remainder | 3 |
| `POST /api/sales/checkout` atomic | 3–4 |
| Stock-only cart | 5–6 |
| Sell now / speed / sticky cart | 5–6 (+ spec Speed section) |
| Sales group + expand | 7 |
| No voids | — (omitted) |
| Quick/Trade unchanged | 6 (tabs untouched) |
| Migration manual | 1 |
| Memory Bank / FAQ | 8 |

## Placeholder scan

None intentional. Pagination caveat for multi-line receipts documented in Task 7.

---

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-09-25-pos-checkout.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — run tasks in this session with checkpoints  

Which approach? (Also confirm you’ve applied / will apply `004` in pgAdmin when we reach that step.)
