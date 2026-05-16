-- Card Inventory SaaS - initial schema
-- Apply manually in pgAdmin Query Tool against your card_inventory database.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  year INT NOT NULL,
  brand TEXT NOT NULL,
  card_number TEXT,
  sport TEXT,
  team TEXT,
  condition TEXT,
  graded BOOLEAN NOT NULL DEFAULT false,
  grading_company TEXT,
  grade TEXT,
  purchase_price NUMERIC(12, 2),
  estimated_value NUMERIC(12, 2) NOT NULL,
  sold_price NUMERIC(12, 2),
  sold_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_status ON cards(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cards_player_name ON cards(player_name);
