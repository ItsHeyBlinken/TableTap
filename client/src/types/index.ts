export interface User {
  id: string;
  email: string;
}

export interface SalesEvent {
  id: string;
  user_id: string;
  name: string;
  event_date: string;
  description: string | null;
  created_at: string;
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
  trade_group_id?: string | null;
  sale_type?: "cash" | "trade";
  cash_adjustment?: string | null;
  created_at: string;
  profit?: number | null;
  cost_basis?: number | null;
}

export interface TradeResult {
  trade_group_id: string;
  outgoing: Card;
  incoming: Card;
  outgoing_profit: number;
  cash_adjustment: number;
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

export interface CardFormData {
  player_name: string;
  year: string;
  brand: string;
  card_number: string;
  sport: string;
  team: string;
  condition: string;
  graded: boolean;
  grading_company: string;
  grade: string;
  purchase_price: string;
  quantity: string;
  notes: string;
  image_url: string;
}
