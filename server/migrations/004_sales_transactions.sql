-- Sales transactions (POS multi-line checkout receipts)
-- Apply manually in pgAdmin after 003_trades.sql
-- Local card_inventory DB and Coolify Postgres when deploying.

CREATE TABLE IF NOT EXISTS sales_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES sales_events(id) ON DELETE SET NULL,
  sold_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_transactions_user_date
  ON sales_transactions(user_id, sold_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_user_created
  ON sales_transactions(user_id, created_at DESC);

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES sales_transactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cards_transaction_id ON cards(transaction_id);
