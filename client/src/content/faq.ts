import { APP_DISPLAY_NAME } from "../lib/brand";

export type FaqBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: [string, string, string]; rows: [string, string, string][] };

export interface FaqItem {
  id: string;
  question: string;
  blocks: FaqBlock[];
}

/** Vendor FAQ — keep in sync with docs/FAQ.md */
export const VENDOR_FAQ: FaqItem[] = [
  {
    id: "what-is",
    question: `What is ${APP_DISPLAY_NAME}?`,
    blocks: [
      {
        type: "p",
        text: `${APP_DISPLAY_NAME} helps you answer one question: “What did I sell today, and how much did I actually make?”`,
      },
      {
        type: "p",
        text: "You track stock on hand, record sales and trades quickly on your phone, and see profit by day and by event (card show, weekend table, stream, etc.).",
      },
    ],
  },
  {
    id: "payments",
    question: "Is this a payment system? Does it replace Square / Venmo / cash?",
    blocks: [
      {
        type: "p",
        text: `No. ${APP_DISPLAY_NAME} does not process payments, swipe cards, or move money.`,
      },
      {
        type: "ul",
        items: [
          "You still take payment however you already do (cash, Venmo, Zelle, PayPal, etc.).",
          `${APP_DISPLAY_NAME} only records what happened: what sold, for how much, and what profit you made on your cost.`,
        ],
      },
      { type: "p", text: "Think of it as a ledger for your table, not a checkout terminal." },
    ],
  },
  {
    id: "pos-meaning",
    question: 'You call it “POS” — what does that mean here?',
    blocks: [
      { type: "p", text: "“POS” here means point-of-sale workflow, not payment processing." },
      { type: "p", text: "It’s built for speed at a show:" },
      {
        type: "ul",
        items: [
          "Pick a card from stock (or quick-sale a card you didn’t pre-load)",
          "Enter the actual sale price (after haggling)",
          "See profit immediately",
          "Move to the next customer",
        ],
      },
    ],
  },
  {
    id: "collectors",
    question: "Is this for collectors or portfolio tracking?",
    blocks: [
      {
        type: "p",
        text: `No. ${APP_DISPLAY_NAME} is for vendors — people selling at shows, from a table, or flipping inventory.`,
      },
      { type: "p", text: "It is not:" },
      {
        type: "ul",
        items: [
          "A collector catalog or “my personal collection” app",
          "Market comps or live pricing (no Card Ladder / eBay price feeds)",
          "AI card scanning or grading tools",
        ],
      },
    ],
  },
  {
    id: "cost-vs-ask",
    question: "What’s the difference between cost basis and asking price?",
    blocks: [
      {
        type: "table",
        headers: ["Field", "What it is", "Used for"],
        rows: [
          ["Cost basis", "What you paid (or value assigned on trade-in)", "Profit when you sell"],
          ["Asking price", "What you’re listing or starting negotiations at", "Reference at the table; can pre-fill sale price"],
        ],
      },
      {
        type: "p",
        text: "Profit is only real when you sell. Asking price is your sticker / starting point before haggling. The sale screen uses the actual sold price you enter.",
      },
    ],
  },
  {
    id: "profit",
    question: "How is profit calculated?",
    blocks: [
      { type: "p", text: "Profit = sold price − cost basis (for that card or quantity)." },
      {
        type: "ul",
        items: [
          "Sell from stock: cost comes from what you entered when you added the card (or imported it).",
          "Quick sale: you enter cost at sale time if the card wasn’t in stock.",
          "Trades: the card going out is sold at the trade value you agree on; profit uses your original cost on that card.",
        ],
      },
      {
        type: "p",
        text: "Optional cash adjustment on trades (e.g. they add $20 cash) is tracked for revenue reporting on the dashboard.",
      },
    ],
  },
  {
    id: "preload",
    question: "Do I have to load every card before I sell?",
    blocks: [
      { type: "p", text: "No. You have two paths:" },
      {
        type: "ol",
        items: [
          "From stock — best when you’ve already added inventory (search, tap, sell).",
          "Quick sale — for cards you didn’t pre-load; enter details and cost at sale time.",
        ],
      },
      {
        type: "p",
        text: "Most vendors pre-load hot inventory or import a CSV; quick sale covers walk-up singles.",
      },
    ],
  },
  {
    id: "csv",
    question: "Can I import inventory from a spreadsheet?",
    blocks: [
      { type: "p", text: "Yes. Use Stock → Import CSV with the provided template." },
      {
        type: "p",
        text: "Required columns: player name, year, brand. Optional: cost, asking price, sport, condition, notes, image URL, and more.",
      },
      {
        type: "p",
        text: "Import adds active stock only — it does not import past sales history (that may come later if vendors need it).",
      },
    ],
  },
  {
    id: "trades",
    question: "How do trades work?",
    blocks: [
      { type: "p", text: "On Sell → Trade:" },
      {
        type: "ol",
        items: [
          "Pick the card going out (from your stock).",
          "Enter the trade value for that card (what the deal values it at).",
          "Enter the card coming in (player, set, etc.) and the cost basis you assign to it.",
          "Optional: cash adjustment if one side adds or receives cash.",
        ],
      },
      { type: "p", text: "What happens automatically:" },
      {
        type: "ul",
        items: [
          "The outgoing card is marked sold (shows in Sales as a trade).",
          "The incoming card is added to active stock with the cost you assigned.",
        ],
      },
      {
        type: "p",
        text: "You can edit the trade-in later (e.g. add an asking price) like any other stock item.",
      },
    ],
  },
  {
    id: "tax",
    question: `Does ${APP_DISPLAY_NAME} handle tax, receipts, or 1099s?`,
    blocks: [
      {
        type: "p",
        text: "No. It’s inventory and profit tracking for your visibility at the table and after the show.",
      },
      {
        type: "p",
        text: `For taxes, accounting, and official records, use your normal process or talk to a tax professional. ${APP_DISPLAY_NAME} doesn’t generate customer receipts or file anything with the IRS.`,
      },
    ],
  },
  {
    id: "mobile",
    question: "Do I need a laptop at the show?",
    blocks: [
      {
        type: "p",
        text: `No. ${APP_DISPLAY_NAME} is mobile-first — phone at the table, large tap targets, bottom navigation.`,
      },
      {
        type: "p",
        text: "A laptop works fine for bulk CSV import or reviewing the dashboard after the show.",
      },
    ],
  },
  {
    id: "events",
    question: 'What are “events”?',
    blocks: [
      {
        type: "p",
        text: "An event is a bucket for a show, weekend, or stream — e.g. “Dallas Card Show — March 2026.”",
      },
      {
        type: "p",
        text: "Assign sales (and trades) to an event to see profit per show on the dashboard instead of only a single daily total.",
      },
    ],
  },
  {
    id: "privacy",
    question: "Is my data shared with other vendors or buyers?",
    blocks: [
      {
        type: "p",
        text: `Your inventory and sales are your account only. ${APP_DISPLAY_NAME} doesn’t publish your stock or prices to a marketplace.`,
      },
    ],
  },
  {
    id: "not-included",
    question: `What’s not in ${APP_DISPLAY_NAME} (today)?`,
    blocks: [
      {
        type: "ul",
        items: [
          "Payment processing (Square, Stripe, etc.)",
          "Live market pricing / comps APIs",
          "AI scan-to-identify cards",
          "Buyer-facing storefront or online checkout",
          "Full accounting / QuickBooks integration",
        ],
      },
      {
        type: "p",
        text: "We’re focused on fast recording and honest profit math at the table. Features may expand based on vendor feedback.",
      },
    ],
  },
  {
    id: "who-for",
    question: `Who is ${APP_DISPLAY_NAME} for?`,
    blocks: [
      { type: "p", text: "Good fit:" },
      {
        type: "ul",
        items: [
          "Card show vendors with a table",
          "Weekend sellers and flippers tracking margin",
          "Anyone who wants to know show profit without a spreadsheet",
        ],
      },
      { type: "p", text: "Probably not a fit:" },
      {
        type: "ul",
        items: [
          "Collectors who only want a personal collection catalog",
          "Shops that need full retail POS, inventory sync, and payment terminals in one system",
        ],
      },
    ],
  },
];
