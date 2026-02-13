-- Migration 012: Add close_reason to bitget_trade_executions
-- Date: 2026-02-12
-- Session 13: WF04b Prepare Save Close outputs close_reason but column was missing

-- Add close_reason column
ALTER TABLE bitget_trade_executions
ADD COLUMN IF NOT EXISTS close_reason VARCHAR(30);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_bitget_executions_close_reason
ON bitget_trade_executions(close_reason)
WHERE close_reason IS NOT NULL;

-- Backfill existing CLOSE records
UPDATE bitget_trade_executions
SET close_reason = 'UNKNOWN'
WHERE action ILIKE '%CLOSE%' AND close_reason IS NULL;
