-- Migration 014: Replace static ADX percentile formula with rolling real percentile
-- Date: 2026-02-13
-- Session 14: Static formula overestimates low ADX (ADX=10 → 17% vs real 5%)
--             and underestimates high ADX (ADX=30 → 63% vs real 78%)
-- Fix: BEFORE INSERT trigger calculates percentile from last 200 records

CREATE OR REPLACE FUNCTION calculate_real_adx_percentile()
RETURNS TRIGGER AS $$
DECLARE
  v_adx NUMERIC;
  v_adx_15m NUMERIC;
  v_adx_1h NUMERIC;
  v_adx_4h NUMERIC;
  v_count_below INT;
  v_total INT;
BEGIN
  -- Parse current ADX values
  v_adx := COALESCE(NEW.adx::numeric, 0);
  v_adx_15m := COALESCE(NEW.adx_15m::numeric, 0);
  v_adx_1h := COALESCE(NEW.adx_1h::numeric, 0);
  v_adx_4h := COALESCE(NEW.adx_4h::numeric, 0);

  -- Get total count from recent 200 records
  SELECT COUNT(*) INTO v_total
  FROM (
    SELECT 1 FROM market_data
    ORDER BY created_at DESC LIMIT 200
  ) recent;

  -- Skip if not enough history
  IF v_total < 20 THEN
    RETURN NEW;
  END IF;

  -- ADX main (5m timeframe)
  IF v_adx > 0 THEN
    SELECT COUNT(*) INTO v_count_below
    FROM (
      SELECT adx::numeric as val FROM market_data
      WHERE adx IS NOT NULL
      ORDER BY created_at DESC LIMIT 200
    ) recent
    WHERE recent.val < v_adx;

    NEW.adx_percentile := ROUND(v_count_below * 100.0 / v_total);
  END IF;

  -- ADX 15m
  IF v_adx_15m > 0 THEN
    SELECT COUNT(*) INTO v_count_below
    FROM (
      SELECT adx_15m::numeric as val FROM market_data
      WHERE adx_15m IS NOT NULL
      ORDER BY created_at DESC LIMIT 200
    ) recent
    WHERE recent.val < v_adx_15m;

    NEW.adx_percentile_15m := ROUND(v_count_below * 100.0 / v_total);
  END IF;

  -- ADX 1h
  IF v_adx_1h > 0 THEN
    SELECT COUNT(*) INTO v_count_below
    FROM (
      SELECT adx_1h::numeric as val FROM market_data
      WHERE adx_1h IS NOT NULL
      ORDER BY created_at DESC LIMIT 200
    ) recent
    WHERE recent.val < v_adx_1h;

    NEW.adx_percentile_1h := ROUND(v_count_below * 100.0 / v_total);
  END IF;

  -- ADX 4h
  IF v_adx_4h > 0 THEN
    SELECT COUNT(*) INTO v_count_below
    FROM (
      SELECT adx_4h::numeric as val FROM market_data
      WHERE adx_4h IS NOT NULL
      ORDER BY created_at DESC LIMIT 200
    ) recent
    WHERE recent.val < v_adx_4h;

    NEW.adx_percentile_4h := ROUND(v_count_below * 100.0 / v_total);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_real_adx_percentile ON market_data;

-- Create BEFORE INSERT trigger (overrides WF01's static formula values)
CREATE TRIGGER trg_real_adx_percentile
  BEFORE INSERT ON market_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_real_adx_percentile();

-- Also update ADX regime based on real percentile
-- (keep existing getADXRegime logic - it uses raw ADX value, not percentile, so no change needed)
