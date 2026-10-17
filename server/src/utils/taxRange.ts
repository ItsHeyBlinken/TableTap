/** First sale date saved with the vendor's local calendar day. */
export const PHASE0_SALE_DATE_FIX = "2026-10-16";

export const TAX_PRESETS = ["last_year", "this_year", "last_quarter", "this_quarter", "custom"] as const;

export type TaxPreset = (typeof TAX_PRESETS)[number];

export type TaxDateRange = { from: string; to: string };

function parseIsoDate(iso: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new Error("Date must be YYYY-MM-DD");
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function isoDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** True when the range includes any calendar day before the Phase 0 date fix. */
export function rangeIncludesPreFixDates(from: string): boolean {
  return from < PHASE0_SALE_DATE_FIX;
}

/**
 * Calendar ranges from the vendor's local "today".
 * Last year is the default tax range.
 */
export function resolveTaxRange(preset: Exclude<TaxPreset, "custom">, today: string): TaxDateRange {
  const { year, month } = parseIsoDate(today);
  if (preset === "last_year") {
    return { from: isoDate(year - 1, 1, 1), to: isoDate(year - 1, 12, 31) };
  }
  if (preset === "this_year") {
    return { from: isoDate(year, 1, 1), to: today };
  }

  const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
  if (preset === "this_quarter") {
    return { from: isoDate(year, quarterStartMonth, 1), to: today };
  }

  let lastYear = year;
  let lastStart = quarterStartMonth - 3;
  if (lastStart < 1) {
    lastStart += 12;
    lastYear -= 1;
  }
  const lastEndMonth = lastStart + 2;
  return {
    from: isoDate(lastYear, lastStart, 1),
    to: isoDate(lastYear, lastEndMonth, lastDayOfMonth(lastYear, lastEndMonth)),
  };
}
