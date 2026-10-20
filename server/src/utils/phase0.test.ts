import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cashCountedOnce,
  computeProfit,
  dateInTimeZone,
  resolveSaleDate,
  saleAmountFromUnit,
} from "./validation.js";

const sold = {
  status: "sold" as const,
  purchase_price: "10",
  quantity: 1,
};

describe("profit and trade cash", () => {
  it("includes cash the vendor received in profit", () => {
    const profit = computeProfit({
      ...sold,
      sold_price: "10",
      cash_adjustment: "20",
    });
    assert.equal(profit, 20);
  });

  it("counts trade cash once when it is copied onto every card in the group", () => {
    const cash = cashCountedOnce([
      { id: "a", trade_group_id: "group-1", cash_adjustment: "20" },
      { id: "b", trade_group_id: "group-1", cash_adjustment: "20" },
      { id: "c", trade_group_id: "group-1", cash_adjustment: "20" },
    ]);
    assert.equal(cash, 20);
  });

  it("keeps sold_price as the sale amount and scales cost by quantity", () => {
    const soldPrice = saleAmountFromUnit(5, 3);
    assert.equal(soldPrice, 15);
    const profit = computeProfit({
      status: "sold",
      sold_price: String(soldPrice),
      purchase_price: "2",
      quantity: 3,
    });
    assert.equal(profit, 9);
  });

  it("trade from a stack: profit uses cost for 1 card plus cash once", () => {
    // Stack of 5 at $2 each → trade 1 at $10 value with $5 cash received → profit $13
    const profit = computeProfit({
      status: "sold",
      sold_price: "10",
      purchase_price: "2",
      quantity: 1,
      cash_adjustment: "5",
    });
    assert.equal(profit, 13);
  });
});

describe("sale dates", () => {
  it("keeps 11:30 PM Central on December 31", () => {
    const evening = new Date("2026-01-01T05:30:00.000Z");
    assert.equal(dateInTimeZone("America/Chicago", evening), "2025-12-31");
  });

  it("keeps 10 PM Pacific on that local day", () => {
    const evening = new Date("2026-01-01T06:00:00.000Z");
    assert.equal(dateInTimeZone("America/Los_Angeles", evening), "2025-12-31");
  });

  it("uses the client date for dashboard today instead of UTC", () => {
    const ninePmCentral = new Date("2026-01-01T03:00:00.000Z");
    assert.equal(dateInTimeZone("America/Chicago", ninePmCentral), "2025-12-31");
    assert.equal(
      resolveSaleDate({ sold_date: "2025-12-31" }, ninePmCentral),
      "2025-12-31"
    );
  });

  it("rejects a missing date and time zone", () => {
    assert.throws(
      () => resolveSaleDate({}),
      /Sale date or time zone is required/
    );
  });
});
