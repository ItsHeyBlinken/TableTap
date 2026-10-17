import { PHASE0_SALE_DATE_FIX, rangeIncludesPreFixDates } from "./taxRange.js";

export const TAX_CSV_COLUMNS = [
  "sold_date",
  "show_name",
  "item_description",
  "sale_type",
  "quantity",
  "unit_price",
  "line_revenue",
  "trade_cash",
  "cost_basis",
  "profit",
  "transaction_id",
  "trade_group_id",
] as const;

export type TaxCsvColumn = (typeof TAX_CSV_COLUMNS)[number];

export type SoldLineInput = {
  id: string;
  sold_date: string | null;
  event_name: string | null;
  player_name: string;
  year: number;
  brand: string;
  sale_type: string;
  quantity: number;
  sold_price: string | number | null;
  purchase_price: string | number | null;
  cash_adjustment: string | number | null;
  transaction_id: string | null;
  trade_group_id: string | null;
};

export type TaxTotals = {
  grossSales: number;
  tradeCash: number;
  tradeValueNoCash: number;
  costOfGoods: number;
  profit: number;
  itemCount: number;
};

export type TaxReportRow = Record<TaxCsvColumn, string>;

export type TaxShowBreakdown = TaxTotals & { showName: string };

export type TaxReport = {
  from: string;
  to: string;
  fixDate: string;
  warning: string | null;
  totals: TaxTotals;
  byShow: TaxShowBreakdown[];
  rows: TaxReportRow[];
};

const DATE_WARNING =
  "Sales entered before October 16, 2026 may show one day late if they happened in the evening.";

function toCents(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

function fromCents(cents: number): number {
  return cents / 100;
}

/** MM-DD-YYYY for display and the CSV. Storage and queries stay YYYY-MM-DD. */
export function formatUsDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  return `${match[2]}-${match[3]}-${match[1]}`;
}

export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rem = String(abs % 100).padStart(2, "0");
  return `${sign}${dollars}.${rem}`;
}

/** Prefix formula-like cells so a spreadsheet does not evaluate them. */
export function csvCell(value: string): string {
  let text = value;
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function itemDescription(row: SoldLineInput): string {
  return `${row.player_name} — ${row.year} ${row.brand}`;
}

/**
 * Trade cash once per trade group. The row with the largest absolute cash keeps it.
 * A tie goes to the lowest id. Other rows in the group get 0.
 */
function cashCentsByRow(rows: SoldLineInput[]): Map<string, number> {
  const groups = new Map<string, SoldLineInput[]>();
  for (const row of rows) {
    const key = row.trade_group_id ?? row.id;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  const assigned = new Map<string, number>();
  for (const group of groups.values()) {
    const ranked = [...group].sort((a, b) => {
      const byAbs = Math.abs(toCents(b.cash_adjustment)) - Math.abs(toCents(a.cash_adjustment));
      if (byAbs !== 0) return byAbs;
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });
    const winner = ranked[0];
    if (!winner) continue;
    const cash = toCents(winner.cash_adjustment);
    for (const row of group) {
      assigned.set(row.id, row.id === winner.id ? cash : 0);
    }
  }
  return assigned;
}

type BuiltLine = {
  showName: string;
  isTrade: boolean;
  groupCashCents: number;
  lineRevenueCents: number;
  tradeCashCents: number;
  costCents: number;
  profitCents: number;
  row: TaxReportRow;
};

function groupCashCents(row: SoldLineInput, rows: SoldLineInput[], cashByRow: Map<string, number>): number {
  const key = row.trade_group_id ?? row.id;
  for (const candidate of rows) {
    if ((candidate.trade_group_id ?? candidate.id) !== key) continue;
    const cash = cashByRow.get(candidate.id) ?? 0;
    if (cash !== 0) return cash;
  }
  return 0;
}

function buildLines(rows: SoldLineInput[]): BuiltLine[] {
  const cashByRow = cashCentsByRow(rows);
  return rows.map((row) => {
    const quantity = row.quantity > 0 ? row.quantity : 1;
    const lineRevenueCents = toCents(row.sold_price);
    const costCents = toCents(row.purchase_price) * quantity;
    const tradeCashCents = cashByRow.get(row.id) ?? 0;
    const profitCents = lineRevenueCents - costCents + tradeCashCents;
    const unitCents = Math.round(lineRevenueCents / quantity);
    const isTrade = row.sale_type === "trade";
    const showName = row.event_name?.trim() ? row.event_name : "No event";

    return {
      showName,
      isTrade,
      groupCashCents: groupCashCents(row, rows, cashByRow),
      lineRevenueCents,
      tradeCashCents,
      costCents,
      profitCents,
      row: {
        sold_date: formatUsDate(row.sold_date ?? ""),
        show_name: showName,
        item_description: itemDescription(row),
        sale_type: isTrade ? "trade" : "sale",
        quantity: String(quantity),
        unit_price: formatMoney(unitCents),
        line_revenue: formatMoney(lineRevenueCents),
        trade_cash: formatMoney(tradeCashCents),
        cost_basis: formatMoney(costCents),
        profit: formatMoney(profitCents),
        transaction_id: row.transaction_id ?? "",
        trade_group_id: row.trade_group_id ?? "",
      },
    };
  });
}

function summarize(lines: BuiltLine[]): TaxTotals {
  let grossSales = 0;
  let tradeCash = 0;
  let tradeValueNoCash = 0;
  let costOfGoods = 0;
  let profit = 0;
  for (const line of lines) {
    if (!line.isTrade) grossSales += line.lineRevenueCents;
    tradeCash += line.tradeCashCents;
    if (line.isTrade && line.groupCashCents === 0) tradeValueNoCash += line.lineRevenueCents;
    costOfGoods += line.costCents;
    profit += line.profitCents;
  }
  return {
    grossSales: fromCents(grossSales),
    tradeCash: fromCents(tradeCash),
    tradeValueNoCash: fromCents(tradeValueNoCash),
    costOfGoods: fromCents(costOfGoods),
    profit: fromCents(profit),
    itemCount: lines.length,
  };
}

function breakdownByShow(lines: BuiltLine[]): TaxShowBreakdown[] {
  const groups = new Map<string, BuiltLine[]>();
  for (const line of lines) {
    const list = groups.get(line.showName) ?? [];
    list.push(line);
    groups.set(line.showName, list);
  }
  return [...groups.entries()]
    .map(([showName, showLines]) => ({ showName, ...summarize(showLines) }))
    .sort((a, b) => {
      if (a.showName === "No event") return 1;
      if (b.showName === "No event") return -1;
      return a.showName.localeCompare(b.showName);
    });
}

export function buildTaxReport(rows: SoldLineInput[], range: { from: string; to: string }): TaxReport {
  const lines = buildLines(rows);
  return {
    from: range.from,
    to: range.to,
    fixDate: PHASE0_SALE_DATE_FIX,
    warning: rangeIncludesPreFixDates(range.from) ? DATE_WARNING : null,
    totals: summarize(lines),
    byShow: breakdownByShow(lines),
    rows: lines.map((line) => line.row),
  };
}

export function taxReportToCsv(rows: TaxReportRow[]): string {
  const header = TAX_CSV_COLUMNS.join(",");
  const body = rows.map((row) => TAX_CSV_COLUMNS.map((column) => csvCell(row[column])).join(","));
  return [header, ...body].join("\r\n");
}

export function taxExportFilename(range: { from: string; to: string }): string {
  return `tabletap-sales-${formatUsDate(range.from)}_to_${formatUsDate(range.to)}.csv`;
}
