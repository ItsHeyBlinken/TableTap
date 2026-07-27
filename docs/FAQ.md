# TableTap — Vendor FAQ

Quick answers for show vendors, flippers, and table sellers evaluating **TableTap** (inventory + profit tracking at the card table).

> **In-app copy:** `client/src/content/faq.ts` (keep in sync when editing this file).

---

## What is TableTap?

TableTap helps you answer one question: **“What did I sell today, and how much did I actually make?”**

You track stock on hand, record sales and trades quickly on your phone, and see profit by day and by event (card show, weekend table, stream, etc.).

---

## Is this a payment system? Does it replace Square / Venmo / cash?

**No.** TableTap does **not** process payments, swipe cards, or move money.

- You still take payment however you already do (cash, Venmo, Zelle, PayPal, etc.).
- TableTap only **records** what happened: what sold, for how much, and what profit you made on your cost.

Think of it as a **ledger for your table**, not a checkout terminal.

---

## You call it “POS” — what does that mean here?

“POS” here means **point-of-sale workflow**, not payment processing.

It’s built for speed at a show:

- Pick a card from stock (or quick-sale a card you didn’t pre-load)
- Enter the **actual sale price** (after haggling)
- See profit immediately
- Move to the next customer

---

## Is this for collectors or portfolio tracking?

**No.** TableTap is for **vendors** — people selling at shows, from a table, or flipping inventory.

It is **not**:

- A collector catalog or “my personal collection” app
- Market comps or live pricing (no Card Ladder / eBay price feeds)
- AI card scanning or grading tools

---

## What’s the difference between cost basis and asking price?

| Field | What it is | Used for |
|-------|------------|----------|
| **Cost basis** (`purchase_price`) | What **you paid** for the card (or the value you assigned on a trade-in) | Profit when you sell |
| **Asking price** (`estimated_value`) | What you’re **listing or starting negotiations** at | Reference at the table; can pre-fill the sale price |

**Profit is only real when you sell.** Asking price is your sticker / starting point before haggling. The sale screen uses the **actual sold price** you enter.

---

## How is profit calculated?

**Profit = sold price − cost basis** (for that card or quantity).

- **Sell from stock:** cost comes from what you entered when you added the card (or imported it).
- **Quick sale:** you enter cost at sale time if the card wasn’t in stock.
- **Trades:** the card going out is sold at the trade value you agree on; profit uses your original cost on that card.

Optional **cash adjustment** on trades (e.g. they add $20 cash) is tracked for revenue reporting on the dashboard.

---

## Do I have to load every card before I sell?

**No.** You have two paths:

1. **From stock** — best when you’ve already added inventory (search, tap, sell).
2. **Quick sale** — for cards you didn’t pre-load; enter details and cost at sale time.

Most vendors pre-load hot inventory or import a CSV; quick sale covers walk-up singles.

---

## Can I import inventory from a spreadsheet?

**Yes.** Use **Stock → Import CSV** with the provided template.

Required columns: player name, year, brand. Optional: cost, asking price, sport, condition, notes, image URL, and more.

Import adds **active stock** only — it does not import past sales history (that may come later if vendors need it).

---

## How do trades work?

On **Sell → Trade**:

1. Pick the card **going out** (from your stock).
2. Enter the **trade value** for that card (what the deal values it at).
3. Enter the card **coming in** (player, set, etc.) and the **cost basis** you assign to it.
4. Optional: **cash adjustment** if one side adds or receives cash.

**What happens automatically:**

- The outgoing card is marked **sold** (shows in Sales as a trade).
- The incoming card is added to **active stock** with the cost you assigned.

You can edit the trade-in later (e.g. add an asking price) like any other stock item.

---

## Does TableTap handle tax, receipts, or 1099s?

**No.** It’s inventory and profit tracking for **your** visibility at the table and after the show.

For taxes, accounting, and official records, use your normal process or talk to a tax professional. TableTap doesn’t generate customer receipts or file anything with the IRS.

---

## Do I need a laptop at the show?

**No.** TableTap is **mobile-first** — phone at the table, large tap targets, bottom navigation.

A laptop works fine for bulk CSV import or reviewing the dashboard after the show.

---

## What are “events”?

An **event** is a bucket for a show, weekend, or stream — e.g. “Dallas Card Show — March 2026.”

Assign sales (and trades) to an event to see **profit per show** on the dashboard instead of only a single daily total.

---

## Is my data shared with other vendors or buyers?

Your inventory and sales are **your account only**. TableTap doesn’t publish your stock or prices to a marketplace.

---

## What’s not in TableTap (today)?

- Payment processing (Square, Stripe, etc.)
- Live market pricing / comps APIs
- AI scan-to-identify cards
- Buyer-facing storefront or online checkout
- Full accounting / QuickBooks integration

We’re focused on **fast recording and honest profit math** at the table. Features may expand based on vendor feedback.

---

## Who is TableTap for?

**Good fit:**

- Card show vendors with a table
- Weekend sellers and flippers tracking margin
- Anyone who wants to know show profit without a spreadsheet

**Probably not a fit:**

- Collectors who only want a personal collection catalog
- Shops that need full retail POS, inventory sync, and payment terminals in one system

---

## Questions or feature ideas?

If you’re a vendor trying TableTap, note what you do today (spreadsheet, notebook, other app) and what would make show day easier. Trade workflows, asking price on trade-in, and import formats are areas we’re validating with real vendors before building more.
