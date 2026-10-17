import { z } from "zod";
import { TAX_PRESETS } from "./taxRange.js";

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Optional http(s) image link for cards and CSV import. */
export const imageUrlSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null || String(v).trim() === "") return null;
    return String(v).trim();
  })
  .refine((v) => v === null || /^https?:\/\//i.test(v), {
    message: "image_url must start with http:// or https://",
  });

export const cardBaseSchema = z.object({
  player_name: z.string().min(1, "Player name is required"),
  year: z.coerce.number().int().min(1800).max(2100),
  brand: z.string().min(1, "Brand/set is required"),
  estimated_value: z.coerce.number().nonnegative().optional().default(0),
  card_number: z.string().optional().nullable(),
  sport: z.string().optional().nullable(),
  team: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  graded: z.coerce.boolean().optional().default(false),
  grading_company: z.string().optional().nullable(),
  grade: z.string().optional().nullable(),
  purchase_price: z.coerce.number().nonnegative().optional().nullable(),
  quantity: z.coerce.number().int().positive().optional().default(1),
  notes: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
});

export const createCardSchema = cardBaseSchema;
export const updateCardSchema = cardBaseSchema;

/** One CSV row mapped to card create input (image_url validated on import). */
export const importCardRowSchema = cardBaseSchema.extend({
  image_url: imageUrlSchema,
});

const saleDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .optional();

/** IANA name such as America/Chicago. Used only when the client omits the sale date. */
const timeZoneSchema = z
  .string()
  .min(1)
  .refine((timeZone) => {
    try {
      Intl.DateTimeFormat("en-US", { timeZone });
      return true;
    } catch {
      return false;
    }
  }, "Invalid IANA time zone")
  .optional();

export const checkoutSchema = z.object({
  event_id: z.string().uuid().optional().nullable(),
  sold_date: saleDateSchema,
  time_zone: timeZoneSchema,
  lines: z
    .array(
      z.object({
        card_id: z.string().uuid(),
        quantity: z.coerce.number().int().positive(),
        unit_price: z.coerce.number().nonnegative(),
      })
    )
    .min(1, "At least one line required"),
});

export const sellCardSchema = z.object({
  sold_price: z.coerce.number().nonnegative(),
  sold_date: saleDateSchema,
  time_zone: timeZoneSchema,
  event_id: z.string().uuid().optional().nullable(),
});

export const recordTradeSchema = z.object({
  outgoing_card_id: z.string().uuid(),
  outgoing_trade_value: z.coerce.number().nonnegative(),
  incoming: z.object({
    player_name: z.string().min(1, "Player name is required"),
    brand: z.string().min(1, "Brand/set is required"),
    year: z.coerce.number().int().min(1800).max(2100).optional(),
    incoming_trade_value: z.coerce.number().nonnegative(),
    quantity: z.coerce.number().int().positive().optional().default(1),
    sport: z.string().optional().nullable(),
    team: z.string().optional().nullable(),
    condition: z.string().optional().nullable(),
  }),
  cash_adjustment: z.coerce.number().optional().default(0),
  event_id: z.string().uuid().optional().nullable(),
  trade_date: saleDateSchema,
  time_zone: timeZoneSchema,
});

export const quickSaleSchema = z.object({
  player_name: z.string().min(1, "Player name is required"),
  brand: z.string().min(1, "Brand/set is required"),
  year: z.coerce.number().int().min(1800).max(2100).optional(),
  purchase_price: z.coerce.number().nonnegative(),
  sold_price: z.coerce.number().nonnegative(),
  sold_date: saleDateSchema,
  time_zone: timeZoneSchema,
  event_id: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().positive().optional().default(1),
});

export const taxReportQuerySchema = z
  .object({
    preset: z.enum(TAX_PRESETS).optional().default("last_year"),
    today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
      .optional(),
    event_id: z
      .union([z.string().uuid(), z.literal("")])
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .refine(
    (value) => value.preset !== "custom" || Boolean(value.from && value.to && value.from <= value.to),
    { message: "Custom range needs a start date on or before the end date" }
  );

export const dashboardQuerySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
    time_zone: timeZoneSchema,
  })
  .refine((value) => Boolean(value.date || value.time_zone), {
    message: "date or time_zone is required",
  });

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  description: z.string().optional().nullable(),
});

export const cardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(20),
  search: z.string().optional(),
  sport: z.string().optional(),
  status: z.enum(["active", "sold"]).optional(),
  event_id: z.string().uuid().optional(),
  graded: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      return v === "true";
    }),
});

export function computeCostBasis(card: {
  purchase_price: string | null;
  quantity: number;
}): number {
  return Number(card.purchase_price ?? 0) * (card.quantity ?? 1);
}

/**
 * Profit for one sold row.
 *
 * sold_price is the amount that row sells for. Checkout stores unit price × quantity
 * there, so reports must not multiply sold_price by quantity again.
 * purchase_price is what the vendor paid per item. Cost is purchase_price × quantity.
 *
 * cash_adjustment: positive = cash the vendor received, negative = cash the vendor paid
 * (same sign as revenue). This adds the cash stored on this row. Totals that sum many
 * rows must use cashCountedOnce so a trade group is not counted more than once.
 */
export function computeProfit(card: {
  status: string;
  sold_price: string | null;
  purchase_price: string | null;
  quantity: number;
  cash_adjustment?: string | number | null;
}): number | null {
  if (card.status !== "sold" || card.sold_price == null) return null;
  const sold = Number(card.sold_price);
  const cash = Number(card.cash_adjustment ?? 0);
  return sold - computeCostBasis(card) + cash;
}

/** Checkout sale amount stored in sold_price: unit price × quantity. */
export function saleAmountFromUnit(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

/**
 * Trade cash for a set of sold rows, counted once per trade_group_id.
 * Rows with no group count on their own. When copies disagree, the value
 * with the largest absolute amount wins.
 */
export function cashCountedOnce(
  rows: Array<{
    id: string;
    trade_group_id: string | null;
    cash_adjustment: string | number | null;
  }>
): number {
  const chosen = new Map<string, number>();
  for (const row of rows) {
    const key = row.trade_group_id ?? row.id;
    const cash = Number(row.cash_adjustment ?? 0);
    const previous = chosen.get(key);
    if (previous === undefined || Math.abs(cash) > Math.abs(previous)) {
      chosen.set(key, cash);
    }
  }
  let total = 0;
  for (const cash of chosen.values()) total += cash;
  return total;
}

/** Calendar date in an IANA time zone, YYYY-MM-DD. */
export function dateInTimeZone(timeZone: string, now = new Date()): string {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
  } catch {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error(`Invalid time zone: ${timeZone}`);
  }
  return `${year}-${month}-${day}`;
}

/**
 * Sale date the vendor meant. Prefer the client calendar date.
 * If that is missing, use the client IANA time zone. Never the server's UTC date.
 */
export function resolveSaleDate(
  input: { sold_date?: string | null; time_zone?: string | null },
  now = new Date()
): string {
  if (input.sold_date) return input.sold_date;
  if (input.time_zone) return dateInTimeZone(input.time_zone, now);
  throw new Error("Sale date or time zone is required");
}
