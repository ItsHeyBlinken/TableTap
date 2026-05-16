-- Sales events for vendor POS tracking
-- Apply manually in pgAdmin after 001_init.sql

CREATE TABLE IF NOT EXISTS sales_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_events_user_id ON sales_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_events_user_date ON sales_events(user_id, event_date DESC);

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES sales_events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cards_event_id ON cards(event_id);
