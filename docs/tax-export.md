# TableTap sales CSV

This file describes the sales export on the Sales page. It is bookkeeping help for you and your accountant. It is not tax advice. Your accountant decides how to treat trades and sales tax.

The totals on the Sales page and the CSV come from the same report. Summing the CSV columns below matches the totals strip to the cent.

Phase 0 sale-date fix: **October 16, 2026**. Sales entered before that date may show one day late if they happened in the evening. The warning appears when the chosen range includes any day before that date. Older rows are not rewritten.

## Columns

| Column | Meaning |
|---|---|
| `sold_date` | Sale date in the vendor’s local calendar, `MM-DD-YYYY` (for example `10-16-2026`). Not the time the card was added to stock. |
| `show_name` | Show name, or `No event`. |
| `item_description` | Player, year, and set. |
| `sale_type` | `sale` for a cash sale, `trade` for a trade. No-cash trades are included and labeled `trade`. |
| `quantity` | Units on that sold row. |
| `unit_price` | `line_revenue` divided by quantity, rounded to the cent. |
| `line_revenue` | The amount that row sells for. Checkout already stored unit price times quantity here, so do not multiply this by quantity again. |
| `trade_cash` | Cash on the trade. Positive means cash you received. Negative means cash you paid. Listed once per trade group; other rows in the group are `0.00`. Cash sales are `0.00`. |
| `cost_basis` | What you paid per item times quantity. |
| `profit` | `line_revenue` minus `cost_basis` plus `trade_cash`. |
| `transaction_id` | Checkout receipt id, when there is one. |
| `trade_group_id` | Shared id for the cards in one trade. |

## Totals strip

| Total | What it adds |
|---|---|
| Gross sales | `line_revenue` of rows labeled `sale` |
| Trade cash | `trade_cash` |
| Trade value (no cash) | `line_revenue` of trades whose group cash is zero |
| Cost of goods | `cost_basis` |
| Profit | `profit` |
| Item count | Number of rows |

A trade that includes cash is not folded into “Trade value (no cash).” Its card value stays in `line_revenue`, and the cash stays in `trade_cash`. Profit includes both.

## Spreadsheet safety

A cell that starts with `=`, `+`, `-`, or `@` is prefixed with a single quote so the spreadsheet does not treat it as a formula. Negative amounts such as trade cash you paid are prefixed that way. Remove the quote if you need them as numbers.

File name: `tabletap-sales-MM-DD-YYYY_to_MM-DD-YYYY.csv`. The file contains only the signed-in vendor’s sales.
