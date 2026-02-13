-- Migration 013: Add missing FK index on trade_analyses.position_id
-- Date: 2026-02-12
-- Session 14: Audit found missing FK index for JOIN performance

CREATE INDEX IF NOT EXISTS idx_trade_analyses_position_id
ON trade_analyses(position_id)
WHERE position_id IS NOT NULL;
