-- ============================================
-- Auto-populate virtual_positions fields from ai_decisions
-- Trigger: on INSERT copies confidence + invalidation + position_size
-- Applied: 2026-02-11
-- Fixed: 2026-02-11 - RECORD type bug → individual scalar variables
--   Root cause: SELECT INTO RECORD + IS NULL check failed silently
--   Also added: position_size enforcement from ai_decisions
--   Also added: Block incomplete decisions (position_size=0 or entry_price=null)
-- Fixed: 2026-02-12 - Added Phase 5: minimum quantity fallback (0.02)
--   Covers case where ai_decision not found and v_pos_size stays NULL
-- Fixed: 2026-02-12 - Phase 4 no longer overwrites WF03's risk-calculated quantity
--   Root cause: WF03 calculates ATR/volatility/confidence-based sizing, but trigger
--   unconditionally replaced it with AI's raw position_size (always 0.02 for DeepSeek)
--   Now Phase 4 only applies when WF03 didn't set quantity (NULL/0)
-- ============================================

CREATE OR REPLACE FUNCTION public.auto_populate_position_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_confidence NUMERIC;
  v_inv_type VARCHAR;
  v_inv_value NUMERIC;
  v_inv_desc TEXT;
  v_pos_size NUMERIC;
  v_entry_price NUMERIC;
BEGIN
  -- ============================================
  -- Phase 1: Lookup ai_decision data
  -- ============================================
  IF NEW.decision_id IS NOT NULL THEN
    SELECT confidence, invalidation_type, invalidation_value, invalidation_description,
           position_size, entry_price
    INTO v_confidence, v_inv_type, v_inv_value, v_inv_desc,
         v_pos_size, v_entry_price
    FROM public.ai_decisions
    WHERE id = NEW.decision_id;
  END IF;

  -- Strategy 2: Fallback to time-based matching
  IF NOT FOUND OR v_confidence IS NULL THEN
    SELECT confidence, invalidation_type, invalidation_value, invalidation_description,
           position_size, entry_price
    INTO v_confidence, v_inv_type, v_inv_value, v_inv_desc,
         v_pos_size, v_entry_price
    FROM public.ai_decisions
    WHERE model_id = NEW.model_id
      AND action IN ('OPEN_LONG', 'OPEN_SHORT')
      AND created_at BETWEEN NEW.opened_at - INTERVAL '5 minutes' AND NEW.opened_at + INTERVAL '5 minutes'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- ============================================
  -- Phase 2: Block incomplete decisions
  -- position_size=0 or entry_price=null → reject INSERT
  -- ============================================
  IF v_pos_size IS NOT NULL AND v_pos_size = 0 THEN
    RETURN NULL;  -- silently reject: AI recommended no position
  END IF;
  IF v_entry_price IS NULL AND v_pos_size IS NOT NULL THEN
    RETURN NULL;  -- silently reject: no entry price provided
  END IF;

  -- ============================================
  -- Phase 3: Populate confidence + invalidation
  -- ============================================
  IF NEW.confidence_at_entry IS NULL AND v_confidence IS NOT NULL THEN
    NEW.confidence_at_entry := v_confidence;
    NEW.confidence_position_multiplier := CASE
      WHEN v_confidence < 40 THEN 0.50
      WHEN v_confidence < 60 THEN 0.75
      WHEN v_confidence < 80 THEN 1.00
      ELSE 1.25
    END;
  END IF;

  IF NEW.invalidation_type IS NULL AND v_inv_type IS NOT NULL THEN
    NEW.invalidation_type := v_inv_type;
  END IF;
  IF NEW.invalidation_value IS NULL AND v_inv_value IS NOT NULL THEN
    NEW.invalidation_value := v_inv_value;
  END IF;
  IF NEW.invalidation_description IS NULL AND v_inv_desc IS NOT NULL THEN
    NEW.invalidation_description := v_inv_desc;
  END IF;

  -- ============================================
  -- Phase 4: Fallback position sizing (only if WF03 didn't set quantity)
  -- WF03 calculates risk-based sizing (ATR, volatility, confidence, counter-trend)
  -- and sets quantity before INSERT. We only override if WF03 left it NULL/0.
  -- ============================================
  IF (NEW.quantity IS NULL OR NEW.quantity <= 0) AND v_pos_size IS NOT NULL AND v_pos_size > 0 THEN
    NEW.quantity := v_pos_size;
  END IF;

  -- ============================================
  -- Phase 5: Minimum quantity fallback
  -- If quantity is still NULL or <= 0 after all phases, set minimum
  -- ============================================
  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    NEW.quantity := 0.02;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger (BEFORE INSERT so we can modify NEW)
DROP TRIGGER IF EXISTS trg_auto_populate_position_fields ON public.virtual_positions;
CREATE TRIGGER trg_auto_populate_position_fields
  BEFORE INSERT ON public.virtual_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_populate_position_fields();

-- ============================================
-- Backfill existing records
-- ============================================

-- Pass 1: Using decision_id FK (most reliable)
UPDATE public.virtual_positions vp SET
  confidence_at_entry = ad.confidence,
  confidence_position_multiplier = CASE
    WHEN ad.confidence < 40 THEN 0.50
    WHEN ad.confidence < 60 THEN 0.75
    WHEN ad.confidence < 80 THEN 1.00
    ELSE 1.25
  END,
  invalidation_type = COALESCE(vp.invalidation_type, ad.invalidation_type),
  invalidation_value = COALESCE(vp.invalidation_value, ad.invalidation_value),
  invalidation_description = COALESCE(vp.invalidation_description, ad.invalidation_description)
FROM public.ai_decisions ad
WHERE vp.decision_id = ad.id
  AND vp.confidence_at_entry IS NULL
  AND ad.confidence IS NOT NULL;

-- Pass 2: Time-based matching for positions without decision_id
WITH matched AS (
  SELECT DISTINCT ON (vp.id)
    vp.id as vp_id,
    ad.confidence,
    ad.invalidation_type,
    ad.invalidation_value,
    ad.invalidation_description
  FROM public.virtual_positions vp
  JOIN public.ai_decisions ad ON ad.model_id = vp.model_id
    AND ad.action IN ('OPEN_LONG', 'OPEN_SHORT')
    AND ad.created_at BETWEEN vp.opened_at - INTERVAL '5 minutes' AND vp.opened_at + INTERVAL '5 minutes'
  WHERE vp.confidence_at_entry IS NULL
    AND vp.decision_id IS NULL
    AND ad.confidence IS NOT NULL
  ORDER BY vp.id, ad.created_at DESC
)
UPDATE public.virtual_positions vp SET
  confidence_at_entry = m.confidence,
  confidence_position_multiplier = CASE
    WHEN m.confidence < 40 THEN 0.50
    WHEN m.confidence < 60 THEN 0.75
    WHEN m.confidence < 80 THEN 1.00
    ELSE 1.25
  END,
  invalidation_type = COALESCE(vp.invalidation_type, m.invalidation_type),
  invalidation_value = COALESCE(vp.invalidation_value, m.invalidation_value),
  invalidation_description = COALESCE(vp.invalidation_description, m.invalidation_description)
FROM matched m
WHERE vp.id = m.vp_id;
