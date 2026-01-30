-- ============================================
-- Market Data Table Schema Update for v6.0
-- Add new columns for enhanced indicators
-- ============================================
-- Supabase SQL Editor용 (psql 메타 커맨드 제거)
-- ============================================

-- ========== Add v6.0 New Columns ==========

-- ADX Enhancements (Improvement #1)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS adx_percentile NUMERIC,
ADD COLUMN IF NOT EXISTS adx_regime TEXT;

COMMENT ON COLUMN public.market_data.adx_percentile IS 'ADX percentile vs last 20 values (0-100)';
COMMENT ON COLUMN public.market_data.adx_regime IS 'ADX regime: WEAK, NORMAL, STRONG';

-- Squeeze Enhancements (Improvement #2)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS squeeze_releasing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS squeeze_release_pct NUMERIC,
ADD COLUMN IF NOT EXISTS bb_width_trend NUMERIC,
ADD COLUMN IF NOT EXISTS bb_width NUMERIC;

COMMENT ON COLUMN public.market_data.squeeze_releasing IS 'BB width expanding during squeeze (breakout signal)';
COMMENT ON COLUMN public.market_data.squeeze_release_pct IS 'Squeeze release percentage (0-100%)';
COMMENT ON COLUMN public.market_data.bb_width_trend IS 'BB width trend % change';
COMMENT ON COLUMN public.market_data.bb_width IS 'Bollinger Band width (upper - lower)';

-- Volume Enhancements (Improvement #3)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS volume_acceleration NUMERIC,
ADD COLUMN IF NOT EXISTS bullish_divergence BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bearish_divergence BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.market_data.volume_acceleration IS 'Current volume / 20-period SMA volume';
COMMENT ON COLUMN public.market_data.bullish_divergence IS 'Price new low but volume declining (reversal signal)';
COMMENT ON COLUMN public.market_data.bearish_divergence IS 'Price new high but volume declining (reversal signal)';

-- ATR Scaling (Improvement #4)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS atr_ratio NUMERIC,
ADD COLUMN IF NOT EXISTS avg_atr NUMERIC;

COMMENT ON COLUMN public.market_data.atr_ratio IS 'Current ATR / 20-period average ATR';
COMMENT ON COLUMN public.market_data.avg_atr IS '20-period average ATR';

-- Volatility Regime (Improvement #7)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS volatility_regime TEXT,
ADD COLUMN IF NOT EXISTS volatility_position_multiplier NUMERIC;

COMMENT ON COLUMN public.market_data.volatility_regime IS 'Volatility regime: CALM, NORMAL, VOLATILE';
COMMENT ON COLUMN public.market_data.volatility_position_multiplier IS 'Position size multiplier based on volatility (0.5-1.1)';

-- Timeframe Weighting (Improvement #5)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS trend_score NUMERIC,
ADD COLUMN IF NOT EXISTS trend_score_raw NUMERIC,
ADD COLUMN IF NOT EXISTS trend_confidence NUMERIC,
ADD COLUMN IF NOT EXISTS timeframe_weight NUMERIC;

COMMENT ON COLUMN public.market_data.trend_score IS 'Final weighted trend score';
COMMENT ON COLUMN public.market_data.trend_score_raw IS 'Raw trend score before ADX adjustment';
COMMENT ON COLUMN public.market_data.trend_confidence IS 'Trend confidence level (0-100)';
COMMENT ON COLUMN public.market_data.timeframe_weight IS 'Timeframe weight in trend calculation (0.7-1.3)';

-- SuperTrend Enhancement (Improvement #8)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS supertrend_multiplier NUMERIC;

COMMENT ON COLUMN public.market_data.supertrend_multiplier IS 'Dynamic SuperTrend multiplier based on ADX (2.0-3.0)';

-- Multi-Timeframe Confluence (Improvement #9)
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS confluence_level INTEGER,
ADD COLUMN IF NOT EXISTS confluence_direction TEXT,
ADD COLUMN IF NOT EXISTS entry_allowed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.market_data.confluence_level IS 'Number of timeframes aligned (0-4)';
COMMENT ON COLUMN public.market_data.confluence_direction IS 'Confluence direction: BULLISH, BEARISH, MIXED, NEUTRAL';
COMMENT ON COLUMN public.market_data.entry_allowed IS 'Entry allowed by confluence check (1h + 15m + 5m alignment)';

-- ========== Add 15M Enhancements ==========
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS adx_percentile_15m NUMERIC,
ADD COLUMN IF NOT EXISTS squeeze_releasing_15m BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS volume_acceleration_15m NUMERIC,
ADD COLUMN IF NOT EXISTS supertrend_multiplier_15m NUMERIC,
ADD COLUMN IF NOT EXISTS atr_ratio_15m NUMERIC,
ADD COLUMN IF NOT EXISTS volatility_regime_15m TEXT,
ADD COLUMN IF NOT EXISTS trend_score_15m NUMERIC,
ADD COLUMN IF NOT EXISTS market_state_15m TEXT;

-- ========== Add 1H Enhancements ==========
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS adx_percentile_1h NUMERIC,
ADD COLUMN IF NOT EXISTS volume_acceleration_1h NUMERIC,
ADD COLUMN IF NOT EXISTS atr_ratio_1h NUMERIC,
ADD COLUMN IF NOT EXISTS volatility_regime_1h TEXT,
ADD COLUMN IF NOT EXISTS trend_score_1h NUMERIC;

-- ========== Add 4H Enhancements ==========
ALTER TABLE public.market_data
ADD COLUMN IF NOT EXISTS adx_percentile_4h NUMERIC,
ADD COLUMN IF NOT EXISTS trend_score_4h NUMERIC;

-- ========== Create Indexes for Performance ==========
CREATE INDEX IF NOT EXISTS idx_market_data_adx_percentile ON public.market_data(adx_percentile);
CREATE INDEX IF NOT EXISTS idx_market_data_volatility_regime ON public.market_data(volatility_regime);
CREATE INDEX IF NOT EXISTS idx_market_data_confluence ON public.market_data(entry_allowed, confluence_level);
CREATE INDEX IF NOT EXISTS idx_market_data_divergence ON public.market_data(bullish_divergence, bearish_divergence);

-- ========== Verify Columns ==========
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'market_data'
  AND column_name IN (
    'adx_percentile', 'adx_regime',
    'squeeze_releasing', 'squeeze_release_pct', 'bb_width_trend', 'bb_width',
    'volume_acceleration', 'bullish_divergence', 'bearish_divergence',
    'atr_ratio', 'avg_atr',
    'volatility_regime', 'volatility_position_multiplier',
    'trend_score', 'trend_score_raw', 'trend_confidence', 'timeframe_weight',
    'supertrend_multiplier',
    'confluence_level', 'confluence_direction', 'entry_allowed',
    'trend_score_15m', 'trend_score_1h', 'trend_score_4h'
  )
ORDER BY column_name;

-- ========== Success Message ==========
DO $$
BEGIN
  RAISE NOTICE '✅ Market Data v6.0 schema update completed successfully!';
  RAISE NOTICE '📊 Added 25+ new columns for enhanced technical analysis';
END $$;
