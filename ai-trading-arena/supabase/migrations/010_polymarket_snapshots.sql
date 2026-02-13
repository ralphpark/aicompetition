-- Polymarket 15min BTC Up/Down prediction market snapshots
-- Stores crowd sentiment data for historical analysis

CREATE TABLE IF NOT EXISTS polymarket_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  slot_timestamp BIGINT NOT NULL,
  question TEXT,
  up_probability NUMERIC,
  down_probability NUMERIC,
  volume NUMERIC,
  liquidity NUMERIC,
  spread NUMERIC,
  last_trade_price NUMERIC,
  best_bid NUMERIC,
  best_ask NUMERIC,
  crowd_sentiment TEXT,
  raw_response JSONB
);

-- Index for time-based queries
CREATE INDEX idx_polymarket_created_at ON polymarket_snapshots(created_at DESC);
CREATE INDEX idx_polymarket_slot ON polymarket_snapshots(slot_timestamp DESC);

-- Enable RLS
ALTER TABLE polymarket_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow read access for anon (frontend dashboard)
CREATE POLICY "polymarket_snapshots_read" ON polymarket_snapshots
  FOR SELECT TO anon USING (true);

-- Allow insert for service role (n8n)
CREATE POLICY "polymarket_snapshots_insert" ON polymarket_snapshots
  FOR INSERT TO service_role WITH CHECK (true);
