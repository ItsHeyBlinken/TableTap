/** Draft pricing models for vendor feedback — not live billing yet. */

export interface PricingOption {
  id: string;
  label: string;
  tagline: string;
  priceLine: string;
  priceDetail: string;
  bestFor: string;
  highlights: string[];
  tradeoffs: string[];
}

export const PRICING_INCLUDED_EVERYWHERE = [
  "Sell from stock, quick sale, and trades",
  "Profit dashboard and sales history",
  "Sales events (per show / weekend / stream)",
  "Mobile-first at the table",
  "No per-sale fees — we don't process payments",
];

export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: "single",
    label: "Option A",
    tagline: "One simple plan",
    priceLine: "$15 / month",
    priceDetail: "14-day free trial · cancel anytime",
    bestFor: "Vendors who want one price and full access",
    highlights: [
      "Everything included — no tier guesswork",
      "Easiest to explain at a show",
      "Optional annual discount later (~2 months free)",
    ],
    tradeoffs: ["No free tier for casual weekend sellers"],
  },
  {
    id: "freemium",
    label: "Option B",
    tagline: "Free + Pro",
    priceLine: "Free · Pro $19 / month",
    priceDetail: "Pro unlocks unlimited use",
    bestFor: "Growing from hobby flipper to regular vendor",
    highlights: [
      "Free: 1 event/month, up to 50 active cards",
      "Pro: unlimited events, stock, CSV import, full history",
      "Try at one show before paying",
    ],
    tradeoffs: ["More to build and support (limits, upgrades)"],
  },
  {
    id: "seasonal",
    label: "Option C",
    tagline: "Show-season pass",
    priceLine: "$39 / 3 months",
    priceDetail: "or ~$12 / month off-season",
    bestFor: "Vendors who only table during peak season",
    highlights: [
      "Pay when you're actually doing shows",
      "Full access during the pass",
      "Feels fair for seasonal side hustles",
    ],
    tradeoffs: ["Billing logic is more complex than flat monthly"],
  },
];

export const PRICING_FEEDBACK_QUESTIONS = [
  "Which option (A, B, or C) fits how you sell today?",
  "Is the price about right, too high, or too low?",
  "Would you pay monthly year-round, or only during show season?",
  "What would make you choose this over a spreadsheet or notebook?",
];
