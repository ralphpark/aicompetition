-- Points-Based Rewards System Migration
-- Converts cash-based rewards to points-based system
-- Adds ROI improvement points, suggestion_applied status, and Hall of Fame

-- =====================================================
-- 1. Update PointReason Types
-- =====================================================
-- Drop existing constraint and add new reasons
ALTER TABLE point_transactions
DROP CONSTRAINT IF EXISTS point_transactions_reason_check;

ALTER TABLE point_transactions
ADD CONSTRAINT point_transactions_reason_check
CHECK (reason IN (
  'suggestion_created',    -- +10 pts
  'vote_received',         -- +2 pts
  'suggestion_approved',   -- +50 pts (was 100)
  'suggestion_applied',    -- +100 pts (new)
  'roi_improvement',       -- % x 100 pts (new)
  'daily_login',
  'streak_bonus',
  'avatar_purchase',
  'performance_bonus'
));

-- =====================================================
-- 2. Add user_profiles tracking columns
-- =====================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS total_improvement_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_improvement_pct DECIMAL(10,4) DEFAULT 0;

-- =====================================================
-- 3. Update prompt_suggestions status options
-- =====================================================
ALTER TABLE prompt_suggestions
DROP CONSTRAINT IF EXISTS prompt_suggestions_status_check;

ALTER TABLE prompt_suggestions
ADD CONSTRAINT prompt_suggestions_status_check
CHECK (status IN (
  'pending',
  'reviewing',
  'approved',    -- Claude approved
  'applied',     -- Applied to production (new)
  'rejected',
  'testing'
));

-- =====================================================
-- 4. Create Hall of Fame View
-- =====================================================
CREATE OR REPLACE VIEW hall_of_fame AS
SELECT
  up.id,
  up.nickname,
  up.avatar_url,
  up.tier,
  up.points,
  COUNT(DISTINCT ps.id) FILTER (WHERE ps.status IN ('approved', 'applied')) as approved_count,
  COALESCE(SUM(sp.improvement_pct) FILTER (WHERE sp.improvement_pct > 0), 0) as total_improvement_pct,
  COALESCE(SUM((sp.improvement_pct * 100)::INTEGER) FILTER (WHERE sp.improvement_pct > 0), 0) as total_improvement_points,
  MAX(ps.applied_at) as last_contribution
FROM user_profiles up
LEFT JOIN prompt_suggestions ps ON ps.user_id = up.id
LEFT JOIN suggestion_performance sp ON sp.suggestion_id = ps.id
GROUP BY up.id
HAVING COUNT(DISTINCT ps.id) FILTER (WHERE ps.status IN ('approved', 'applied')) > 0
ORDER BY COALESCE(SUM(sp.improvement_pct) FILTER (WHERE sp.improvement_pct > 0), 0) DESC;

-- =====================================================
-- 5. ROI Improvement Points Function
-- =====================================================
CREATE OR REPLACE FUNCTION award_roi_improvement_points(p_performance_id UUID)
RETURNS TABLE(
  user_id UUID,
  improvement_pct DECIMAL,
  points_awarded INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_improvement DECIMAL;
  v_points INTEGER;
  v_suggestion_id UUID;
BEGIN
  -- Get performance data with at least 10 trades
  SELECT sp.suggestion_id, sp.improvement_pct, ps.user_id
  INTO v_suggestion_id, v_improvement, v_user_id
  FROM suggestion_performance sp
  JOIN prompt_suggestions ps ON ps.id = sp.suggestion_id
  WHERE sp.id = p_performance_id
    AND sp.trades_count >= 10;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 0::DECIMAL, 0;
    RETURN;
  END IF;

  IF v_improvement > 0 THEN
    -- Calculate points: improvement % x 100
    v_points := ROUND(v_improvement * 100)::INTEGER;

    -- Add points to user
    PERFORM add_user_points(v_user_id, v_points, 'roi_improvement', p_performance_id);

    -- Update user profile tracking
    UPDATE user_profiles
    SET
      total_improvement_points = total_improvement_points + v_points,
      total_improvement_pct = total_improvement_pct + v_improvement,
      updated_at = NOW()
    WHERE id = v_user_id;
  ELSE
    v_points := 0;
  END IF;

  RETURN QUERY SELECT v_user_id, COALESCE(v_improvement, 0::DECIMAL), COALESCE(v_points, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Mark Suggestion Applied Function
-- =====================================================
CREATE OR REPLACE FUNCTION mark_suggestion_applied(p_suggestion_id UUID)
RETURNS TABLE(
  user_id UUID,
  points_awarded INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_current_status TEXT;
BEGIN
  -- Get suggestion info
  SELECT ps.user_id, ps.status
  INTO v_user_id, v_current_status
  FROM prompt_suggestions ps
  WHERE ps.id = p_suggestion_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Suggestion not found';
  END IF;

  -- Only allow marking as applied if currently approved
  IF v_current_status != 'approved' THEN
    RAISE EXCEPTION 'Suggestion must be approved before applying';
  END IF;

  -- Update suggestion status
  UPDATE prompt_suggestions
  SET status = 'applied', applied_at = NOW()
  WHERE id = p_suggestion_id;

  -- Award 100 points for applied suggestion
  PERFORM add_user_points(v_user_id, 100, 'suggestion_applied', p_suggestion_id);

  RETURN QUERY SELECT v_user_id, 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. Update contributor_leaderboard view with improvement points
-- =====================================================
CREATE OR REPLACE VIEW contributor_leaderboard AS
SELECT
  up.id,
  up.nickname,
  up.avatar_url,
  up.points,
  up.tier,
  up.total_rewards,
  up.total_improvement_points,
  up.total_improvement_pct,
  COUNT(ps.id) FILTER (WHERE ps.status IN ('approved', 'applied')) as approved_suggestions,
  COALESCE(SUM(sp.improvement_pct) FILTER (WHERE sp.improvement_pct > 0), 0) as total_improvement
FROM user_profiles up
LEFT JOIN prompt_suggestions ps ON ps.user_id = up.id
LEFT JOIN suggestion_performance sp ON sp.suggestion_id = ps.id
GROUP BY up.id
ORDER BY up.points DESC;

-- =====================================================
-- 8. POINT_VALUES Reference Comment
-- =====================================================
-- Point values for reference (also defined in TypeScript):
-- SUGGESTION_CREATED: 10 pts
-- VOTE_RECEIVED: 2 pts
-- SUGGESTION_APPROVED: 50 pts
-- SUGGESTION_APPLIED: 100 pts
-- ROI_IMPROVEMENT: improvement_pct * 100 pts
--
-- Tier thresholds:
-- Bronze: 0
-- Silver: 500
-- Gold: 2,000
-- Platinum: 5,000
-- Diamond: 10,000
-- Master: 25,000
