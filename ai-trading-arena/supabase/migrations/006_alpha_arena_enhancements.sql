-- ============================================
-- Alpha Arena Enhancements Migration
-- v3.1: Confidence-based Position + Exit Plan + Trade Frequency
-- ============================================

-- 1. Add invalidation condition columns to virtual_positions
ALTER TABLE public.virtual_positions ADD COLUMN IF NOT EXISTS invalidation_type VARCHAR(30);
ALTER TABLE public.virtual_positions ADD COLUMN IF NOT EXISTS invalidation_value DECIMAL(12,2);
ALTER TABLE public.virtual_positions ADD COLUMN IF NOT EXISTS invalidation_description TEXT;
ALTER TABLE public.virtual_positions ADD COLUMN IF NOT EXISTS confidence_at_entry DECIMAL(5,2);
ALTER TABLE public.virtual_positions ADD COLUMN IF NOT EXISTS confidence_position_multiplier DECIMAL(5,2);
ALTER TABLE public.virtual_positions ADD COLUMN IF NOT EXISTS close_reason VARCHAR(30);

-- 2. Create view for model trading statistics (trade frequency, exit accuracy)
CREATE OR REPLACE VIEW public.model_trading_stats AS
SELECT
  model_id,
  COUNT(*) FILTER(WHERE status = 'CLOSED') as total_closed_trades,
  COUNT(*) FILTER(WHERE status = 'CLOSED' AND close_reason = 'TP_HIT') as tp_hits,
  COUNT(*) FILTER(WHERE status = 'CLOSED' AND close_reason = 'SL_HIT') as sl_hits,
  COUNT(*) FILTER(WHERE status = 'CLOSED' AND close_reason = 'AI_DECISION') as ai_closes,
  COUNT(*) FILTER(WHERE status = 'CLOSED' AND close_reason = 'INVALIDATION') as invalidation_closes,
  ROUND(AVG(realized_pnl) FILTER(WHERE status = 'CLOSED')::NUMERIC, 2) as avg_pnl_per_trade,
  CASE
    WHEN EXTRACT(EPOCH FROM (MAX(closed_at) FILTER(WHERE status = 'CLOSED') - MIN(opened_at) FILTER(WHERE status = 'CLOSED'))) / 86400.0 > 1
    THEN ROUND((COUNT(*) FILTER(WHERE status = 'CLOSED'))::NUMERIC / (EXTRACT(EPOCH FROM (MAX(closed_at) FILTER(WHERE status = 'CLOSED') - MIN(opened_at) FILTER(WHERE status = 'CLOSED'))) / 86400.0), 2)
    ELSE COUNT(*) FILTER(WHERE status = 'CLOSED')::NUMERIC
  END as trades_per_day,
  ROUND(AVG(confidence_at_entry) FILTER(WHERE status = 'CLOSED')::NUMERIC, 2) as avg_confidence,
  CASE
    WHEN COUNT(*) FILTER(WHERE status = 'CLOSED') > 0
    THEN ROUND(COUNT(*) FILTER(WHERE status = 'CLOSED' AND close_reason = 'TP_HIT')::NUMERIC * 100.0 / COUNT(*) FILTER(WHERE status = 'CLOSED'), 1)
    ELSE 0
  END as tp_hit_rate,
  CASE
    WHEN COUNT(*) FILTER(WHERE status = 'CLOSED') > 0
    THEN ROUND(COUNT(*) FILTER(WHERE status = 'CLOSED' AND close_reason = 'SL_HIT')::NUMERIC * 100.0 / COUNT(*) FILTER(WHERE status = 'CLOSED'), 1)
    ELSE 0
  END as sl_hit_rate
FROM public.virtual_positions
GROUP BY model_id;

-- Grant access
GRANT SELECT ON public.model_trading_stats TO anon, authenticated;
