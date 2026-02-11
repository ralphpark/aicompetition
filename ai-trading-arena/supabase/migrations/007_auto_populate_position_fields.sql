-- ============================================
-- Auto-populate virtual_positions fields from ai_decisions
-- Trigger: on INSERT copies confidence + invalidation fields
-- Applied: 2026-02-11
-- ============================================

-- Trigger function: auto-populate confidence and invalidation fields
CREATE OR REPLACE FUNCTION public.auto_populate_position_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_decision RECORD;
BEGIN
  -- Strategy 1: Use decision_id FK if available
  IF NEW.decision_id IS NOT NULL THEN
    SELECT confidence, invalidation_type, invalidation_value, invalidation_description
    INTO v_decision
    FROM public.ai_decisions
    WHERE id = NEW.decision_id;
  END IF;

  -- Strategy 2: Fallback to time-based matching if no decision_id or no result
  IF v_decision IS NULL OR v_decision.confidence IS NULL THEN
    SELECT confidence, invalidation_type, invalidation_value, invalidation_description
    INTO v_decision
    FROM public.ai_decisions
    WHERE model_id = NEW.model_id
      AND action IN ('OPEN_LONG', 'OPEN_SHORT')
      AND created_at BETWEEN NEW.opened_at - INTERVAL '5 minutes' AND NEW.opened_at + INTERVAL '5 minutes'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Populate fields if we found a matching decision
  IF v_decision IS NOT NULL THEN
    -- Confidence
    IF NEW.confidence_at_entry IS NULL AND v_decision.confidence IS NOT NULL THEN
      NEW.confidence_at_entry := v_decision.confidence;
      -- Calculate position multiplier based on confidence
      -- <40: 0.5x (low), 40-60: 0.75x (medium), 60-80: 1.0x (standard), >80: 1.25x (high)
      NEW.confidence_position_multiplier := CASE
        WHEN v_decision.confidence < 40 THEN 0.50
        WHEN v_decision.confidence < 60 THEN 0.75
        WHEN v_decision.confidence < 80 THEN 1.00
        ELSE 1.25
      END;
    END IF;

    -- Invalidation fields
    IF NEW.invalidation_type IS NULL AND v_decision.invalidation_type IS NOT NULL THEN
      NEW.invalidation_type := v_decision.invalidation_type;
    END IF;
    IF NEW.invalidation_value IS NULL AND v_decision.invalidation_value IS NOT NULL THEN
      NEW.invalidation_value := v_decision.invalidation_value;
    END IF;
    IF NEW.invalidation_description IS NULL AND v_decision.invalidation_description IS NOT NULL THEN
      NEW.invalidation_description := v_decision.invalidation_description;
    END IF;
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
