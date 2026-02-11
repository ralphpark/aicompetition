-- Migration: enforce_sl_tp_minimum_distance
-- Date: 2026-02-11
-- Purpose: Enforce minimum 0.5% distance between entry_price and SL/TP on virtual_positions
-- This prevents Bitget 400 errors when SL is too close to mark price
-- Single source of truth: all downstream workflows (WF04, WF04b) read corrected values

-- Analysis (2026-02-11, last 30 days):
--   SL too close: LONG 331/1039 (31.9%), SHORT 271/1076 (25.2%)
--   TP too close: LONG 96/1039 (9.2%), SHORT 37/1076 (3.4%)
--   Wrong-side SL: 0 (none detected)

CREATE OR REPLACE FUNCTION enforce_sl_tp_minimum_distance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only apply when entry_price is set
  IF NEW.entry_price IS NOT NULL AND NEW.entry_price > 0 THEN

    -- === STOP LOSS CORRECTION ===
    IF NEW.stop_loss IS NOT NULL THEN
      IF NEW.side = 'LONG' THEN
        -- LONG: SL must be at least 0.5% below entry
        IF NEW.stop_loss > NEW.entry_price * 0.995 THEN
          NEW.stop_loss := ROUND(NEW.entry_price * 0.995, 2);
        END IF;
      ELSIF NEW.side = 'SHORT' THEN
        -- SHORT: SL must be at least 0.5% above entry
        IF NEW.stop_loss < NEW.entry_price * 1.005 THEN
          NEW.stop_loss := ROUND(NEW.entry_price * 1.005, 2);
        END IF;
      END IF;
    END IF;

    -- === TAKE PROFIT CORRECTION ===
    IF NEW.take_profit IS NOT NULL THEN
      IF NEW.side = 'LONG' THEN
        -- LONG: TP must be at least 0.5% above entry
        IF NEW.take_profit < NEW.entry_price * 1.005 THEN
          NEW.take_profit := ROUND(NEW.entry_price * 1.005, 2);
        END IF;
      ELSIF NEW.side = 'SHORT' THEN
        -- SHORT: TP must be at least 0.5% below entry
        IF NEW.take_profit > NEW.entry_price * 0.995 THEN
          NEW.take_profit := ROUND(NEW.entry_price * 0.995, 2);
        END IF;
      END IF;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger (BEFORE INSERT OR UPDATE)
DROP TRIGGER IF EXISTS trg_enforce_sl_tp_distance ON public.virtual_positions;
CREATE TRIGGER trg_enforce_sl_tp_distance
  BEFORE INSERT OR UPDATE ON public.virtual_positions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_sl_tp_minimum_distance();
