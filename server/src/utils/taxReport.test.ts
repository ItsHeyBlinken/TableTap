import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveTaxRange } from "./taxRange.js";
import {
  buildTaxReport,
  csvCell,
  taxReportToCsv,
  type SoldLineInput,
} from "./taxReport.js";

function line(overrides: Partial<SoldLineInput> & Pick<SoldLineInput, "id">): SoldLineInput {
  return {
    sold_date: "2026-10-16",
    event_name: null,
    player_name: "Card",
    year: 2026,
    brand: "Set",
    sale_type: "cash",
    quantity: 1,
    sold_price: "0",
    purchase_price: "0",
    cash_adjustment: null,
    transaction_id: null,
    trade_group_id: null,
    ...overrides,
  };
}

function cents(amount: string): number {
  return Math.round(Number(amount) * 100);
}

describe("tax date ranges", () => {
  const today = "2026-10-16";

  it("defaults the tax year to last calendar year", () => {
    assert.deepEqual(resolveTaxRange("last_year", today), {
      from: "2025-01-01",
      to: "2025-12-31",
    });
  });

  it("uses the vendor's local today for this year and this quarter", () => {
    assert.deepEqual(resolveTaxRange("this_year", today), {
      from: "2026-01-01",
      to: "2026-10-16",
    });
    assert.deepEqual(resolveTaxRange("this_quarter", today), {
      from: "2026-10-01",
      to: "2026-10-16",
    });
    assert.deepEqual(resolveTaxRange("last_quarter", today), {
      from: "2026-07-01",
      to: "2026-09-30",
    });
  });

  it("rolls last quarter into the previous year", () => {
    assert.deepEqual(resolveTaxRange("last_quarter", "2026-02-10"), {
      from: "2025-10-01",
      to: "2025-12-31",
    });
  });
});

describe("tax report totals", () => {
  const rows = [
    line({ id: "sale-1", player_name: "Test", brand: "Bowman", sold_price: "108.00", purchase_price: "54.00" }),
    line({ id: "sale-2", player_name: "Panini", sold_price: "40.00", purchase_price: "20.00" }),
    line({
      id: "trade-none",
      player_name: "Upper",
      brand: "Deck",
      sale_type: "trade",
      sold_price: "65.00",
      purchase_price: "50.00",
      cash_adjustment: "0.00",
      trade_group_id: "g-none",
    }),
    line({
      id: "trade-in",
      player_name: "Received",
      sale_type: "trade",
      sold_price: "40.00",
      purchase_price: "35.00",
      cash_adjustment: "20.00",
      trade_group_id: "g-in",
      event_name: "Spring Show",
    }),
    line({
      id: "trade-out",
      player_name: "Paid",
      sale_type: "trade",
      sold_price: "65.00",
      purchase_price: "85.00",
      cash_adjustment: "-25.00",
      trade_group_id: "g-out",
    }),
  ];

  it("matches the CSV row sums and separates no-cash trade value", () => {
    const report = buildTaxReport(rows, { from: "2026-10-16", to: "2026-10-16" });
    assert.equal(report.totals.grossSales, 148);
    assert.equal(report.totals.tradeCash, -5);
    assert.equal(report.totals.tradeValueNoCash, 65);
    assert.equal(report.totals.costOfGoods, 244);
    assert.equal(report.totals.profit, 69);
    assert.equal(report.totals.itemCount, 5);
    assert.equal(report.warning, null);

    const sum = (column: "line_revenue" | "trade_cash" | "cost_basis" | "profit") =>
      report.rows.reduce((total, row) => total + cents(row[column]), 0);
    assert.equal(sum("profit"), 6900);
    assert.equal(sum("trade_cash"), -500);
    assert.equal(sum("cost_basis"), 24400);
    assert.equal(
      report.rows.find((row) => row.trade_group_id === "g-none")?.sale_type,
      "trade"
    );
    assert.equal(report.rows.find((row) => row.trade_group_id === "g-none")?.trade_cash, "0.00");

    const spring = report.byShow.find((show) => show.showName === "Spring Show");
    assert.equal(spring?.profit, 25);
    assert.equal(spring?.tradeCash, 20);
  });

  it("counts copied trade cash once", () => {
    const report = buildTaxReport(
      [
        line({
          id: "a",
          sale_type: "trade",
          sold_price: "10.00",
          cash_adjustment: "20.00",
          trade_group_id: "group",
        }),
        line({
          id: "b",
          sale_type: "trade",
          sold_price: "10.00",
          cash_adjustment: "20.00",
          trade_group_id: "group",
        }),
        line({
          id: "c",
          sale_type: "trade",
          sold_price: "10.00",
          cash_adjustment: "20.00",
          trade_group_id: "group",
        }),
      ],
      { from: "2026-10-16", to: "2026-10-16" }
    );
    assert.equal(report.totals.tradeCash, 20);
    assert.equal(report.rows.filter((row) => row.trade_cash === "20.00").length, 1);
    assert.equal(report.totals.tradeValueNoCash, 0);
  });

  it("uses sold_price as the sale amount when quantity is greater than one", () => {
    const report = buildTaxReport(
      [line({ id: "qty", sold_price: "15.00", purchase_price: "2.00", quantity: 3 })],
      { from: "2026-10-16", to: "2026-10-16" }
    );
    assert.equal(report.rows[0]?.unit_price, "5.00");
    assert.equal(report.rows[0]?.line_revenue, "15.00");
    assert.equal(report.totals.costOfGoods, 6);
    assert.equal(report.totals.profit, 9);
  });

  it("warns only when the range includes a day before the fix", () => {
    const after = buildTaxReport([], { from: "2026-10-16", to: "2026-12-31" });
    const crossing = buildTaxReport([], { from: "2026-10-15", to: "2026-10-16" });
    assert.equal(after.warning, null);
    assert.match(crossing.warning ?? "", /before October 16, 2026/);
  });

  it("escapes spreadsheet formulas and keeps CSV totals aligned with the strip", () => {
    const report = buildTaxReport(
      [line({ id: "formula", player_name: "=SUM(A1)", sold_price: "10.00", purchase_price: "4.00" })],
      { from: "2026-10-16", to: "2026-10-16" }
    );
    const csv = taxReportToCsv(report.rows);
    assert.match(csv, /'=SUM\(A1\)/);
    assert.equal(csvCell("-25.00").startsWith("'-"), true);
    assert.equal(report.totals.profit, 6);
  });
});
