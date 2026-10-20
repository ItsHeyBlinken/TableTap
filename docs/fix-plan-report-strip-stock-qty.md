# TableTap fix plan: report strip math + stock quantity/cost display

Read-only review of `ItsHeyBlinken/TableTap` main @ `c7bb7be` ("Prepare TableTap free beta…", committed Oct 20 1:54 PM CT). Nothing in the repo was changed. Ignore the rate-limit work, which is separate.

**Bottom line:** both fixes are small. **No DB migration** and **no CSV or profit-math change**. Issue 1 adds one server summary field and one strip tile. Issue 2 is client-only, because `quantity` and `purchase_price` are already in every card API response.

---

## Issue 1: Report summary strip doesn't add up when a trade includes cash

### Root cause
- `server/src/utils/taxReport.ts:204` in `summarize()`:
  `if (line.isTrade && line.groupCashCents === 0) tradeValueNoCash += line.lineRevenueCents;`
  The card value of trades **with** cash is left out of every total. Profit (line 206, `profit += line.profitCents`) still includes it, so the visible tiles are short by exactly that amount.
- `client/src/components/TaxReportPanel.tsx:206-213` renders Gross sales, Trade cash, Trade value (no cash), Cost of goods, and Profit, with no tile for the trade value that came with cash.
- QA example: 49 gross + 5 trade cash + 30 no-cash trade value − 48 cost = **36**, but profit is **46**. The missing **$10** is the line_revenue of the $10 trade with $5 cash.

### Files to change
1. `server/src/utils/taxReport.ts`
   - `TaxTotals` type (lines 36-43): add `tradeValueWithCash: number;`, right after `tradeValueNoCash`.
   - `summarize()` (lines 195-216): add `let tradeValueWithCash = 0;`, and next to line 204 add
     `if (line.isTrade && line.groupCashCents !== 0) tradeValueWithCash += line.lineRevenueCents;`
     Return `tradeValueWithCash: fromCents(tradeValueWithCash)`.
   - `byShow` inherits it automatically through `summarize()` (line 226).
   - **Do not touch** `buildLines()`, `profitCents`, `cashCentsByRow`, `TAX_CSV_COLUMNS`, or `taxReportToCsv`.
2. `server/src/utils/taxReport.test.ts`
   - In "matches the CSV row sums…" (around line 104), add `assert.equal(report.totals.tradeValueWithCash, 105);` (trade-in 40 + trade-out 65).
   - Add an identity assertion: `grossSales + tradeCash + tradeValueNoCash + tradeValueWithCash − costOfGoods === profit`, which is 148 − 5 + 65 + 105 − 244 = 69.
   - In "counts copied trade cash once" (around line 159), add `assert.equal(report.totals.tradeValueWithCash, 30);`.
   - Add a QA-shaped test: a cash sale of $10 at cost $3, plus a trade row with sold_price 10.00, purchase_price 1.00, cash_adjustment 5.00, and trade_group_id "g1". Expect gross 10, tradeCash 5, tradeValueNoCash 0, tradeValueWithCash 10, cost 4, profit 21 (10+5+0+10−4), with the identity holding.
3. `client/src/components/TaxReportPanel.tsx`
   - `TaxTotals` type (lines 15-22): add `tradeValueWithCash: number;`.
   - Strip (lines 206-213): keep the existing **"Trade value (no cash)"** tile as is and add **"Trade value (with cash)"** → `formatCurrency(totals.tradeValueWithCash)`, right after it. Keep the order Gross sales, Trade cash, Trade value (no cash), Trade value (with cash), Cost of goods, Profit, Item count. Seven tiles is fine in the existing `sm:grid-cols-2 lg:grid-cols-3` grid.
   - Optional (recommended): add a one-line helper under the grid: `Gross + trade cash + trade values − cost = profit`.
   - By-show desktop table (lines 239-258): add a "Cash trades" column → `show.tradeValueWithCash`, after "No-cash trades". In the mobile list (lines 225-228), append `· {formatCurrency(show.tradeValueWithCash + show.tradeValueNoCash)} trade value`.
   - Column guide (lines 273-276): add the sentence "Trade value (with cash) is the agreed card value of trades where cash also changed hands; the cash itself is in Trade cash."
   - Use `?? 0` on the new field in the client, so an older server response can't render NaN.

### Acceptance criteria
- QA account A, "This quarter" (or today): Gross **$49**, Trade cash **$5**, Trade value (no cash) **$30**, Trade value (with cash) **$10**, Cost of goods **$48**, Profit **$46**. 49 + 5 + 30 + 10 − 48 = **46** ✔
- For the $10 trade with $5 cash alone (cost $1): Trade value (with cash) $10, Trade cash $5, Cost $1, Profit **$14**.
- Profit, Item count (7), and the downloaded CSV are byte-for-byte unchanged from before the fix (same 12 columns, same rows, profit column sums to $46).
- The By show table sums the same way for each show.
- `npm test` in server passes, including the new assertions.

### Manual test
1. Log in as QA account A (`blinkensbots+tabletapqa1@mail.grokbot.com`; the password is on the bot box), or record in any account a $10 cash sale plus a trade with a $10 outgoing value and $5 cash received.
2. Dashboard → Tax export → "This quarter". Check the seven tiles and add them by hand.
3. Download the CSV and diff it against the pre-fix export (`A-this-quarter-export.csv`). It should be identical.
4. Switch the Show filter to "QA Test A Show 2026-10-20" and check that the strip still adds up.

---

## Issue 2: Stock list and card detail don't show quantity, and the cost reads like a stack total

### Root cause (corrected from the QA note)
- **Schema:** `cards.purchase_price` is **per card** (`server/migrations/001_init.sql:26`), and `quantity` is the **current remaining count** (`001_init.sql:31`). Sales and trades decrement it in place (`server/src/services/checkoutService.ts:93`, `tradeService.ts:79`) and insert a new sold row. **The original stack size is not stored anywhere**, and sold rows have no link back to their source row.
- `cost_basis` = `purchase_price × quantity` (`server/src/utils/validation.ts:176-181`, applied in `server/src/utils/cardMapper.ts:16`). So for an active row it is **already the remaining cost**, not the original stack total.
- QA's Stack5 was entered as **cost $2.00/card, qty 5**. After 2 sold, it shows `cost_basis` = 2 × 3 = **$6.00**. The math is right, but the UI shows only "Cost $6.00" with no quantity and no per-card figure, so it reads like the price of the whole stack (`client/src/pages/CardsListPage.tsx:101` mobile, `:143` desktop, `client/src/pages/CardDetailPage.tsx:217-218`).
- Contributing factor: the entry label `client/src/components/CardForm.tsx:122` says "Cost basis (what you paid)", which doesn't say per card. A vendor could type the stack total there, and the app would then multiply it by quantity.

### Data availability
`GET /api/cards` and `GET /api/cards/:id` already return `quantity`, `purchase_price` (per card), and `cost_basis` (`mapCard` spreads the whole row). The client `Card` type already has them (`client/src/types/index.ts:28,33,44`). **No server change, no migration.**

### "3 of 5" vs "3 left"
Show **"3 left"**. "3 of 5" needs an `original_quantity` column, which would be a migration, so it moves to after the beta. Don't try to rebuild the original count from sold rows, because there's no source-row link and it would be wrong for trades and edits.

### Files to change (client only)
1. `client/src/lib/format.ts`: add helpers.
   - `cardUnitCost(card) = Number(card.purchase_price ?? 0)`
   - `cardRemainingCost(card) = card.cost_basis ?? cardUnitCost(card) * card.quantity`
   - `unitPurchasePrice()` is private to `client/src/components/StockSellPanel.tsx:14`. You can move it into `format.ts` and import it in both places.
2. `client/src/pages/CardsListPage.tsx`
   - Mobile card (lines 99-108): under the title line, add a quantity badge `{card.quantity} left` when `card.quantity > 1`, or "1 left" / "Single" for 1. Replace `Cost {cost_basis}` with `Cost {unit}/card · {remaining} total` when quantity > 1, and keep `Cost {unit}` when quantity is 1.
   - Desktop table (lines 123-145): add a **"Qty"** column (`card.quantity`) after Sport, and rename "Cost basis" to **"Cost / card"** (`cardUnitCost`). Add a **"Remaining cost"** column (`cardRemainingCost`). Leave Ask as is (it's already per card).
3. `client/src/pages/CardDetailPage.tsx` (the `<dl>` at lines 215-252)
   - Active card: add **"Quantity left"** → `card.quantity`, **"Cost per card"** → `cardUnitCost`, and **"Remaining cost"** → `cardRemainingCost` (replacing the single "Cost basis" tile).
   - Sold card: show **"Quantity sold"** → `card.quantity`, and **"Cost basis"** → `card.cost_basis`, labeled `({quantity} × {unit})` when quantity > 1.
4. `client/src/components/CardForm.tsx:122`: change the label to **"Cost per card (what you paid each) *"**, and the placeholder/help to "For a stack, enter the cost of one card, not the whole stack." This is a label change only, with no data change.
5. (Optional, one line) `client/public/stock-import-template.csv` header stays the same. Just make the import page's help text say `purchase_price` is per card.

### Acceptance criteria
- QA Stack5 (entered at $2.00/card × 5, 2 sold):
  - Stock list, mobile: "**3 left**", "Cost **$2.00/card · $6.00 total**".
  - Stock list, desktop: Qty **3**, Cost / card **$2.00**, Remaining cost **$6.00**.
  - Card detail: Quantity left **3**, Cost per card **$2.00**, Remaining cost **$6.00**.
- If a stack really cost $6.00 total for 5 cards, the vendor enters **$1.20**/card, and after selling 2 the UI shows **3 left · $1.20/card · $3.60 remaining**.
- A single card (qty 1, $3.00) shows Cost $3.00 with no "/card" clutter, or "1 left" at most.
- A sold row from that stack (the 2-card sale) shows Quantity sold **2** and Cost basis **$4.00 (2 × $2.00)**, which matches the CSV `cost_basis` 4.00.
- Profit, the dashboard, and the tax CSV are unchanged. No server files touched, and no migration.

### Manual test
1. Add stock: "Test Stack", Cost per card **2.00**, Ask 4.00, Qty **5**. The list shows 5 left · $2.00/card · $10.00 total.
2. Sell 2 at $4 via cart checkout. The list shows **3 left · $2.00/card · $6.00 total**, and the detail page shows the same.
3. Trade 1 out of the stack. It shows **2 left · $4.00 remaining**.
4. Open the sold 2-card row (Sales or the Sold filter). It shows Quantity sold 2 and Cost basis $4.00.
5. Check at 390px width that the mobile list doesn't wrap badly.
6. Add a qty-1 card and confirm the simpler display.

---

## Cursor prompt (paste this)

```
Two small TableTap fixes. Do NOT change profit math, the tax CSV columns/rows, or the DB schema (no migrations).

FIX 1 – Report summary strip must add up.
Root cause: server/src/utils/taxReport.ts summarize() (~line 204) only totals trade card value when the trade had NO cash, so the card value of cash trades is missing from the strip while profit includes it.
- server/src/utils/taxReport.ts: add `tradeValueWithCash: number` to TaxTotals; in summarize() add `if (line.isTrade && line.groupCashCents !== 0) tradeValueWithCash += line.lineRevenueCents;` and return it via fromCents. byShow gets it automatically. Don't touch buildLines/profit/CSV.
- server/src/utils/taxReport.test.ts: assert tradeValueWithCash = 105 in the "matches the CSV row sums" test and 30 in "counts copied trade cash once"; assert grossSales + tradeCash + tradeValueNoCash + tradeValueWithCash − costOfGoods === profit (148 − 5 + 65 + 105 − 244 = 69); add a test: $10 cash sale cost $3 + trade sold_price 10 / purchase 1 / cash 5 / group g1 → gross 10, tradeCash 5, withCash 10, cost 4, profit 21.
- client/src/components/TaxReportPanel.tsx: add tradeValueWithCash to the TaxTotals type (use `?? 0` when reading); add a "Trade value (with cash)" tile right after "Trade value (no cash)"; add a "Cash trades" column to the By show table and include it in the mobile line; add one sentence to the Column guide explaining it; optional helper text "Gross + trade cash + trade values − cost = profit".
Acceptance: QA data shows Gross $49, Trade cash $5, Trade value (no cash) $30, Trade value (with cash) $10, Cost $48, Profit $46 (49+5+30+10−48=46). CSV identical to before.

FIX 2 – Show quantity left and per-card cost on stock.
Facts: cards.purchase_price is PER CARD; quantity is the CURRENT remaining count (decremented on sale/trade); original stack size is NOT stored; cost_basis from the API = purchase_price × quantity (already remaining cost). API already returns quantity/purchase_price/cost_basis — client-only change, no server change.
- client/src/lib/format.ts: add cardUnitCost(card) = Number(card.purchase_price ?? 0) and cardRemainingCost(card) = card.cost_basis ?? unit × quantity.
- client/src/pages/CardsListPage.tsx: mobile — show "{quantity} left" and "Cost $X.XX/card · $Y.YY total" when quantity > 1 (plain "Cost $X.XX" when 1). Desktop — add "Qty" column, rename "Cost basis" to "Cost / card", add "Remaining cost" column.
- client/src/pages/CardDetailPage.tsx: active — "Quantity left", "Cost per card", "Remaining cost" (replace single Cost basis). Sold — "Quantity sold" and "Cost basis ($T (N × $U))" when N > 1.
- client/src/components/CardForm.tsx line ~122: label "Cost per card (what you paid each) *", help "For a stack, enter the cost of one card, not the whole stack."
- Show "N left" (not "N of M" — original qty isn't stored; adding it needs a migration, post-beta).
Acceptance: stack entered $2.00/card × 5, sell 2 → list and detail show "3 left", "$2.00/card", "$6.00 remaining"; the sold 2-card row shows Quantity sold 2, Cost basis $4.00 (2 × $2.00). Qty-1 cards show a plain cost.

Run server tests and client + server builds. Don't commit secrets; no migrations.
```
