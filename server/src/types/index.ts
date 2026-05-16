export interface User {
  id: string;
  email: string;
  created_at: Date;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface SalesEvent {
  id: string;
  user_id: string;
  name: string;
  event_date: string;
  description: string | null;
  created_at: Date;
}

export interface Card {
  id: string;
  user_id: string;
  player_name: string;
  year: number;
  brand: string;
  card_number: string | null;
  sport: string | null;
  team: string | null;
  condition: string | null;
  graded: boolean;
  grading_company: string | null;
  grade: string | null;
  purchase_price: string | null;
  estimated_value: string;
  sold_price: string | null;
  sold_date: string | null;
  status: "active" | "sold";
  quantity: number;
  notes: string | null;
  image_url: string | null;
  event_id: string | null;
  event_name?: string | null;
  trade_group_id: string | null;
  sale_type: "cash" | "trade";
  cash_adjustment: string | null;
  created_at: Date;
  profit?: number | null;
  cost_basis?: number | null;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfitByEvent {
  event_id: string | null;
  event_name: string;
  profit: number;
  revenue: number;
  sales_count: number;
}

export interface TradeResult {
  trade_group_id: string;
  outgoing: Card;
  incoming: Card;
  outgoing_profit: number;
  cash_adjustment: number;
}

export interface VendorDashboard {
  totalProfit: number;
  totalRevenue: number;
  totalCostBasis: number;
  todayProfit: number;
  todayRevenue: number;
  todaySalesCount: number;
  unsoldStockCount: number;
  profitByEvent: ProfitByEvent[];
  topSoldByProfit: Card[];
  recentSales: Card[];
}
