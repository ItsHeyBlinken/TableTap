export { CARD_CONDITIONS, isKnownCondition } from "./cardConditions";

export const CARD_SPORTS = [
  "Baseball",
  "Basketball",
  "Football",
  "Hockey",
  "Soccer",
  "Racing",
  "Wrestling",
  "Pokemon",
  "Multi-Sport",
] as const;

/** Common brands / sets — datalist allows typing anything else. */
export const CARD_BRANDS = [
  "Topps",
  "Bowman",
  "Panini",
  "Donruss",
  "Upper Deck",
  "Leaf",
  "Fleer",
  "Prizm",
  "Mosaic",
  "Select",
  "Optic",
  "Chronicles",
  "Score",
  "Playoff",
  "Stadium Club",
  "Heritage",
  "Chrome",
  "Finest",
  "National Treasures",
  "Flawless",
] as const;

export const GRADING_COMPANIES = ["PSA", "BGS", "SGC", "CGC", "CSG", "HGA", "GMA"] as const;

export const CARD_GRADES = [
  "10",
  "9.5",
  "9",
  "8.5",
  "8",
  "7.5",
  "7",
  "6.5",
  "6",
  "5",
  "4",
  "3",
  "2",
  "1",
  "AUTH",
] as const;

export const STOCK_QUANTITIES = ["1", "2", "3", "4", "5", "10"] as const;

const YEAR_START = 1980;

export function getCardYearOptions(): string[] {
  const current = new Date().getFullYear();
  const years: string[] = [];
  for (let y = current; y >= YEAR_START; y--) {
    years.push(String(y));
  }
  return years;
}

export function isInList(value: string, list: readonly string[]): boolean {
  return list.includes(value);
}
