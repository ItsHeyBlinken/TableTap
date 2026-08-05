import { APP_DISPLAY_NAME } from "../lib/brand";

export type OnboardingBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export interface GuideSection {
  id: string;
  title: string;
  icon: string;
  blocks: OnboardingBlock[];
}

export interface QuickStartStep {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export interface FeatureHighlight {
  title: string;
  description: string;
  icon: string;
}

export const GUIDE_INTRO = {
  title: `How to use ${APP_DISPLAY_NAME}`,
  subtitle:
    "A quick guide for show vendors — track stock, record sales, and see real profit. Not a payment app: you still take Venmo, cash, and Zelle your way.",
};

export const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    icon: "⚡",
    title: "Sell fast",
    description: "From stock, quick sale, or trade — enter the real sold price and see profit instantly.",
  },
  {
    icon: "📦",
    title: "Stock on hand",
    description: "Cost basis and optional asking price. Import CSV or add cards one at a time.",
  },
  {
    icon: "📅",
    title: "Sales events",
    description: "Group a show, weekend table, or stream. Compare profit per event on the dashboard.",
  },
  {
    icon: "💵",
    title: "Profit dashboard",
    description: "Today's profit, revenue, and unsold stock — answer “how much did I make?” before you leave.",
  },
  {
    icon: "🔄",
    title: "Trades",
    description: "Card out is marked sold; card in lands in stock with the cost you assign.",
  },
  {
    icon: "📊",
    title: "Sales history",
    description: "Every sale logged with profit and event — filter and review anytime.",
  },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "workflow",
    title: "Show-day workflow",
    icon: "🏟️",
    blocks: [
      { type: "p", text: "A typical day at the table with TableTap:" },
      {
        type: "ol",
        items: [
          "Create a sales event for today’s show (e.g. “Dallas Card Show — March 2026”).",
          "Load stock — add cards or import a CSV with cost and asking price.",
          "At the table: Sell → pick the card → enter what they actually paid (after haggling).",
          "Optional: Quick sale for a card you didn’t pre-load, or Trade for card-for-card deals.",
          "Check the dashboard for today’s profit and profit by event before you pack up.",
        ],
      },
    ],
  },
  {
    id: "concepts",
    title: "Key concepts",
    icon: "📐",
    blocks: [
      {
        type: "ul",
        items: [
          "Cost basis — what you paid (used to calculate profit when you sell).",
          "Asking price — your sticker / starting negotiation point; sale screen can pre-fill from this.",
          "Sold price — what the buyer actually paid; profit = sold price − cost basis.",
          "Events — optional buckets so you can see profit per show, not just per day.",
        ],
      },
      {
        type: "p",
        text: `${APP_DISPLAY_NAME} records sales; it does not process payments or replace Square/Venmo.`,
      },
    ],
  },
  {
    id: "tips",
    title: "Tips at the table",
    icon: "📱",
    blocks: [
      {
        type: "ul",
        items: [
          "Use your phone — bottom nav: Home, Sell, Stock, Sales, Events.",
          "Pre-load hot inventory before the show; use Quick sale for walk-up singles.",
          "Assign an event on each sale so weekend totals stay accurate.",
          "Trades: outgoing card sells at trade value; incoming card adds to stock at the cost you set.",
        ],
      },
    ],
  },
];

export const QUICK_START_STEPS: QuickStartStep[] = [
  {
    id: "event",
    title: "Create a sales event",
    description: "Name today’s show or weekend so profit rolls up correctly.",
    href: "/events",
    cta: "Add event",
  },
  {
    id: "stock",
    title: "Add stock",
    description: "Enter cards with cost basis, or import a CSV before the show.",
    href: "/cards/new",
    cta: "Add card",
  },
  {
    id: "sale",
    title: "Record a sale",
    description: "Pick stock, enter the sold price, see profit — takes seconds.",
    href: "/sell",
    cta: "Go to Sell",
  },
  {
    id: "profit",
    title: "Check your profit",
    description: "Dashboard shows today’s profit and totals by event.",
    href: "/dashboard",
    cta: "View dashboard",
  },
];

export const CHECKLIST_STEP_LABELS: Record<string, string> = {
  event: "Create a sales event",
  stock: "Add stock to sell from",
  sale: "Record your first sale",
  profit: "Review profit on the dashboard",
};
