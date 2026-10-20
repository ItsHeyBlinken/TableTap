/** Draft legal copy for the free beta. Not legal advice — Chris must review (M5). */

export const LEGAL_LAST_UPDATED = "October 20, 2026";

export const TERMS_SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "What TableTap is",
    paragraphs: [
      "TableTap is a free beta product from Bytes by Blinken. It helps sports card vendors record stock, sales, trades, and shows, and export a profit-and-loss CSV.",
      "The beta is provided as-is, may change, and may include bugs. We may suspend or end the beta at any time.",
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      "You are responsible for keeping your login credentials secure and for activity under your account.",
      "If you forget your password during the beta, email info@bytesbyblinken.com from your account email and we will help reset it manually.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "Use TableTap only for lawful business record-keeping related to your own inventory and sales.",
      "Do not attempt to access another vendor's data, disrupt the service, or misuse the invite-only beta.",
    ],
  },
  {
    heading: "Not tax or accounting advice",
    paragraphs: [
      "Totals and CSV exports are tools to help you track profit and loss. They are not tax, legal, or accounting advice. You are responsible for your own books, tax filings, and any sales-tax rules that apply to you.",
    ],
  },
  {
    heading: "Photos",
    paragraphs: [
      "Card photos are not offered in this beta. Stock is text-only until photo support returns in a later release.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the fullest extent allowed by law, Bytes by Blinken is not liable for lost profits, lost data, or damages arising from your use of the beta. Use at your own risk at shows and for bookkeeping.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about these terms: info@bytesbyblinken.com.",
    ],
  },
];

export const PRIVACY_SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "TableTap is operated by Bytes by Blinken. Contact: info@bytesbyblinken.com.",
    ],
  },
  {
    heading: "What we store",
    paragraphs: [
      "We store your email address and a bcrypt-hashed password (we do not store your password in plain text).",
      "We store the inventory, sales, trades, and show (event) records you enter, including optional notes and cost/sale amounts.",
      "Card photos are not offered in this beta, so we do not collect card images through the app during the beta.",
    ],
  },
  {
    heading: "How we use data",
    paragraphs: [
      "We use your data only to run TableTap for you: authentication, stock and sales features, profit reports, and support when you email us.",
      "We do not sell your data. We do not run ads or third-party trackers in the app.",
    ],
  },
  {
    heading: "Sessions and cookies",
    paragraphs: [
      "We use a session cookie to keep you signed in (JWT, typically up to 7 days). Logging out clears the cookie on your device.",
    ],
  },
  {
    heading: "Deletion and export",
    paragraphs: [
      "You can export a profit-and-loss CSV from Sales while signed in.",
      "To delete your account or request a fuller data export, email info@bytesbyblinken.com from your account email. We will process deletion by removing your user record (related stock and sales cascade-delete).",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "We may update this policy as the product changes. The “Last updated” date at the top of this page will change when we do.",
    ],
  },
];
