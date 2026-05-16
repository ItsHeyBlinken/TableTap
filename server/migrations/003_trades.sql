-- Trade tracking: link cards traded in/out, mark trade sales vs cash
-- Apply manually in pgAdmin after 002_sales_events.sql

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS trade_group_id UUID,
  ADD COLUMN IF NOT EXISTS sale_type TEXT NOT NULL DEFAULT 'cash'
    CHECK (sale_type IN ('cash', 'trade')),
  ADD COLUMN IF NOT EXISTS cash_adjustment NUMERIC(12, 2);

CREATE INDEX IF NOT EXISTS idx_cards_trade_group_id ON cards(trade_group_id);
