
TableTap — Tax Reporting Implementation Plan
Repo: ItsHeyBlinken/TableTap · Live: tabletap.bytesbyblinken.com Status: Plan only — nothing is built until Chris approves each phase. Last updated: 2026-10-16

1. Overview
Give TableTap vendors a tax-ready view of their sales: pick a date range, see totals, and export a CSV their accountant can use. Then (Phase 2) track sales tax per show, since rates depend on where each show happens.

Two existing bugs would make tax numbers wrong, so they get fixed first (Phase 0).

Current system (verified in code, read-only):

Postgres, plain SQL migrations in server/migrations/001–004, run by hand in pgAdmin.
Sold line items are rows in cards (sold_price, sold_date DATE, purchase_price, quantity, created_at TIMESTAMPTZ, sale_type, trade_group_id, cash_adjustment). Profit is calculated, never stored.
Receipts are in sales_transactions. Shows/events are in sales_events (name, event_date, description). There's no location, time zone, or tax rate field.
No CSV export exists yet. Only csv-parse (import) is installed.
2. Chris's decisions
#	Question	Decision
D1	Who handles sales tax?	It depends on the vendor and the show's location. The vendor enters the sales tax rate for each show.
D2	Which time zone are sale dates in?	The vendor's local time at the sale, not Central. Users can be anywhere.
D3	Can shows be in different time zones?	Yes. Each show stores its own time zone.
D4	Include trades with no cash in the export?	Yes. Include them, each clearly marked as a trade. (The IRS generally treats barter as a sale at fair market value. The accountant confirms how to treat them.)
D5	Sale date or entry date?	Sale date (sold_date), recorded in local time per D2. created_at is not used for reporting.
3. Phase 0 — Bug fixes (must ship before Phase 1)
0.1 Trade cash missing from profit
Bug: server/src/services/dashboardService.ts adds cash_adjustment to revenue (lines ~24, 46, 66) but leaves it out of profit (lines ~19, 44, 64, 81). computeProfit in server/src/utils/validation.ts also leaves it out.
Fix: include cash_adjustment in every profit calculation, using the same sign convention as revenue.
Before coding: confirm the sign convention in TradeTab.tsx (positive = vendor received cash?). Write it down in a code comment and in the CSV column guide.
0.2 Sale dates saved in UTC
Bug: todayDateString() in server/src/utils/validation.ts uses toISOString(), which gives a UTC date. Evening sales get tomorrow's date, so a late Dec 31 sale lands in the next tax year. The dashboard's "today" uses Postgres CURRENT_DATE, which is the server's time zone.
Fix:
The client sends the sale date as the vendor's device shows it (YYYY-MM-DD, local). The server stops defaulting to the server/UTC date.
If no date is sent, the server falls back to the show's time zone (after Phase 2), and to the client-supplied IANA time zone before that.
Dashboard "today" uses the date the client sends, or a time zone the client passes, never CURRENT_DATE.
Existing data: rows saved before the fix can't be reliably corrected, because created_at is when the card was added to inventory, not when it sold. No back-fill. The UI and the CSV guide show a warning instead (see Phase 1).
0.3 Verifications (must pass before Phase 1 sign-off)
Quantity: confirm whether sold_price is per unit or the line total. If it's per unit, multiply revenue and cost by quantity everywhere.
Trade cash: confirm whether cash_adjustment is stored once per trade or repeated on every card in a trade_group_id. If it's repeated, count it once per trade group in all totals.
4. Phase 1 — Tax view and CSV export (no database changes)
4.1 Sales page: tax view
Date presets: Last year (default), This year, Last quarter, This quarter, Custom range.
Optional filter by show.
Totals strip: Gross sales, Trade cash, Trade value (no-cash trades), Cost of goods, Profit, Item count.
Breakdown by show name.
Warning line under the totals, shown only if the range includes dates before the Phase 0 ship date:
"Sales entered before [fix date] may show one day late if they happened in the evening."

4.2 CSV export
One query/service feeds both the totals strip and the CSV, so they always match.
One row per sold line item. Columns: sold_date (local), show_name, item_description, sale_type (sale / trade), quantity, unit_price, line_revenue, trade_cash (once per trade group), cost_basis, profit, transaction_id, trade_group_id.
No-cash trades are included and labeled trade (D4).
File name: tabletap-sales-YYYY-MM-DD_to_YYYY-MM-DD.csv.
CSV injection guard: escape any cell that starts with =, +, -, or @.
Scoped to the logged-in user's data only (same auth check as the existing sales endpoints).
4.3 Column guide
A short doc (in-app help link and/or docs/tax-export.md) explaining what each column means, the cash_adjustment sign convention, how trades are valued, the pre-fix date warning, and that this is not tax advice.

5. Phase 2 — Sales tax per show (database change, needs separate approval)
5.1 Data model change: migration 005
Add nullable columns to sales_events:

Column	Type	Notes
location	TEXT NULL	City/state, free text
time_zone	TEXT NULL	IANA name, e.g. America/Chicago. Validate against a known list
tax_rate	NUMERIC(6,4) NULL	Percent entered by the vendor, e.g. 8.2500
All nullable, so existing shows keep working. The migration only adds columns.
Ship as server/migrations/005_event_tax_fields.sql, plus a rollback script that drops the three columns. Chris runs it in pgAdmin as usual.
5.2 Behavior
Show create/edit form gets Location, Time zone (defaults to device time zone), and Tax rate.
A sale tied to a show uses that show's time zone for its date.
Tax view adds Sales tax per show, computed from that show's tax_rate.
Shows with no rate say "No rate entered." Never counted as $0 tax.
CSV adds: show_location, show_time_zone, tax_rate, sales_tax.
5.3 Open questions for Chris before Phase 2
Is the price at the table tax-included, or is tax added on top?
Included: tax = price − price / (1 + rate)
Added: tax = price × rate
Should trades count toward taxable sales? Default: show them separately and let the accountant decide.
6. Files and areas touched
Area	File(s)	Phase
Profit calc	server/src/services/dashboardService.ts	0
Profit helper, date default	server/src/utils/validation.ts (computeProfit, todayDateString)	0
Trade entry (sign convention)	TradeTab.tsx (read and comment only, unless a bug turns up)	0
Sale creation (send local date)	Client sale/checkout flow and the server sale route	0
Report service and endpoint	New report service and route under server/src/	1
Sales page UI	Client Sales page: presets, totals, warning, export button	1
Docs	Column guide (docs/tax-export.md or in-app)	1
Migration	server/migrations/005_event_tax_fields.sql and rollback	2
Show form	Client show/event create/edit form	2
7. Tasks
Phase 0
 Confirm the cash_adjustment sign in TradeTab.tsx. Add a code comment.
 Confirm whether sold_price is per unit or the line total.
 Confirm whether cash_adjustment is stored once per trade group or on every card.
 Add cash_adjustment to all profit queries in dashboardService.ts.
 Update computeProfit in validation.ts to include trade cash.
 Apply the quantity and once-per-trade-group rules wherever needed.
 Replace todayDateString() UTC logic. The client sends the local date; the server only falls back.
 Replace CURRENT_DATE in the dashboard "today" with the client-provided date or time zone.
 Add tests (see §9). Open a PR. Review Channel reviews it. Chris approves and merges.
 Record the Phase 0 ship date (used by the warning line).
Phase 1
 Build one report service that returns rows and totals for a date range and optional show.
 Add an authenticated report endpoint (JSON) and an export endpoint (CSV).
 Add the CSV injection escaping.
 Sales page: presets (default Last year), show filter, totals strip, by-show breakdown.
 Sales page: warning line when the range is before the fix date.
 Export button that downloads the CSV.
 Write the column guide.
 Add tests. Open a PR. Review Channel and QA smoke it. Chris approves and merges.
Phase 2 (only after Chris approves the migration and answers §5.3)
 Write migration 005 and its rollback.
 Chris runs the migration in pgAdmin.
 Add Location, Time zone, and Tax rate to the show form, with validation.
 Use the show's time zone for sale dates on show-linked sales.
 Add sales tax per show to the tax view and CSV, plus the "No rate entered" state.
 Update the column guide.
 Add tests. Open a PR. Review Channel and QA smoke it. Chris approves and merges.
8. Acceptance criteria
Phase 0

Profit includes trade cash everywhere revenue does, with the same sign.
Trade cash is counted once per trade group in every total.
Quantity is applied correctly to revenue and cost.
A sale entered at 11:30 PM local time on Dec 31 is saved as Dec 31, in any US time zone.
The dashboard's "today" matches the vendor's local date, not the server's.
Phase 1

The default range is last calendar year.
The totals strip and the CSV totals match to the cent for the same range and filter.
The CSV includes no-cash trades, labeled trade.
The CSV contains only the logged-in user's data.
Cells starting with = + - @ are escaped.
The warning line appears only when the range includes dates before the fix.
The column guide documents every column and the trade-cash sign.
Phase 2

Existing shows still load and report correctly with empty new fields.
Tax per show = that show's rate applied by the agreed formula (§5.3).
Shows with no rate show "No rate entered" and are excluded from the tax total, not counted as $0.
A sale at a Pacific-time show at 10 PM local is dated that local day.
The rollback script cleanly removes the three columns.
9. Test cases
#	Case	Expected
T1	Trade, 1 card for 1 card, +$20 cash to vendor	Revenue and profit both include +$20
T2	Trade group of 3 cards, $20 cash	$20 counted once, not $60 (if stored per card)
T3	Sale with quantity 3 at $5 (per unit)	Revenue $15, cost × 3
T4	No-cash trade	Appears in the CSV as trade, $0 trade cash, trade value shown
T5	Sale at 11:30 PM CST on Dec 31	sold_date = Dec 31
T6	Sale at 10 PM PT, device in Pacific time	sold_date = that local day
T7	Dashboard "today" at 9 PM CT	Shows today's CT sales, not tomorrow's
T8	Range Jan 1 to Dec 31 last year	Totals strip = sum of CSV rows
T9	Range entirely after the fix date	No warning line
T10	Range crossing the fix date	Warning line shown
T11	Item name starting with =SUM(	Escaped in the CSV
T12	User A exports	No rows from user B
T13	(P2) Show with 8.25% rate, $100 sales	Tax matches the agreed formula
T14	(P2) Show with no rate	"No rate entered", excluded from the tax total
T15	(P2) Old show, no new fields	Loads and reports without errors
T16	(P2) Run migration then rollback	Schema returns to its pre-005 state
10. Guardrails
No database or production changes without Chris's explicit yes. Phase 2's migration needs its own approval.
Every PR stays unmerged until Chris approves it.
This is reporting help, not tax advice. The accountant confirms how trades and tax are treated.