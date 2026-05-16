import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

export const sellCardSchema = z.object({
  sold_price: z.coerce.number().nonnegative(),
  sold_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
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
  trade_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const quickSaleSchema = z.object({
  player_name: z.string().min(1, "Player name is required"),
  brand: z.string().min(1, "Brand/set is required"),
  year: z.coerce.number().int().min(1800).max(2100).optional(),
  purchase_price: z.coerce.number().nonnegative(),
  sold_price: z.coerce.number().nonnegative(),
  sold_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  event_id: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().int().positive().optional().default(1),
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

export function computeProfit(card: {
  status: string;
  sold_price: string | null;
  purchase_price: string | null;
  quantity: number;
}): number | null {
  if (card.status !== "sold" || card.sold_price == null) return null;
  const sold = Number(card.sold_price);
  return sold - computeCostBasis(card);
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
