/** Raw (ungraded) card condition options for stock entry. */
export const CARD_CONDITIONS = [
  "Mint",
  "Near Mint",
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
] as const;

export type CardCondition = (typeof CARD_CONDITIONS)[number];

export function isKnownCondition(value: string): value is CardCondition {
  return (CARD_CONDITIONS as readonly string[]).includes(value);
}
