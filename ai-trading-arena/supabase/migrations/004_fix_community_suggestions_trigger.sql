-- Fix: Add trigger for community_suggestions table
-- The original trigger was only on prompt_suggestions table

-- =====================================================
-- 1. Create trigger function for community_suggestions
-- =====================================================
CREATE OR REPLACE FUNCTION on_community_suggestion_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 10 points for creating a suggestion
  PERFORM add_user_points(NEW.user_id, 10, 'suggestion_created', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. Create trigger on community_suggestions table
-- =====================================================
DROP TRIGGER IF EXISTS on_community_suggestion_insert ON community_suggestions;

CREATE TRIGGER on_community_suggestion_insert
  AFTER INSERT ON community_suggestions
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION on_community_suggestion_created();

-- =====================================================
-- 3. Update status constraint for community_suggestions
-- =====================================================
ALTER TABLE community_suggestions
DROP CONSTRAINT IF EXISTS community_suggestions_status_check;

ALTER TABLE community_suggestions
ADD CONSTRAINT community_suggestions_status_check
CHECK (status IN (
  'pending',
  'reviewing',
  'approved',
  'applied',
  'rejected',
  'testing'
));

-- =====================================================
-- 4. Add is_implemented and implemented_at columns if not exist
-- =====================================================
ALTER TABLE community_suggestions
  ADD COLUMN IF NOT EXISTS is_implemented BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS implemented_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 5. Trigger for vote on community_suggestions
-- =====================================================
CREATE OR REPLACE FUNCTION update_community_suggestion_votes()
RETURNS TRIGGER AS $$
DECLARE
  v_suggestion_user_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update vote count
    IF NEW.vote_type = 'up' THEN
      UPDATE community_suggestions SET upvotes = upvotes + 1 WHERE id = NEW.suggestion_id;
    END IF;

    -- Award points to suggestion author for upvote
    IF NEW.vote_type = 'up' THEN
      SELECT user_id INTO v_suggestion_user_id
      FROM community_suggestions WHERE id = NEW.suggestion_id;

      IF v_suggestion_user_id IS NOT NULL THEN
        PERFORM add_user_points(v_suggestion_user_id, 2, 'vote_received', NEW.suggestion_id);
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE community_suggestions SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.suggestion_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_suggestion_vote_change ON suggestion_votes;

CREATE TRIGGER on_suggestion_vote_change
  AFTER INSERT OR DELETE ON suggestion_votes
  FOR EACH ROW EXECUTE FUNCTION update_community_suggestion_votes();

-- =====================================================
-- 6. Update Hall of Fame view to use community_suggestions
-- =====================================================
CREATE OR REPLACE VIEW hall_of_fame AS
SELECT
  up.id,
  up.nickname,
  up.avatar_url,
  up.tier,
  up.points,
  COUNT(DISTINCT cs.id) FILTER (WHERE cs.status IN ('approved', 'applied')) as approved_count,
  COALESCE(SUM(sp.improvement_pct) FILTER (WHERE sp.improvement_pct > 0), 0) as total_improvement_pct,
  COALESCE(SUM((sp.improvement_pct * 100)::INTEGER) FILTER (WHERE sp.improvement_pct > 0), 0) as total_improvement_points,
  MAX(cs.implemented_at) as last_contribution
FROM user_profiles up
LEFT JOIN community_suggestions cs ON cs.user_id = up.id
LEFT JOIN suggestion_performance sp ON sp.suggestion_id = cs.id
GROUP BY up.id
HAVING COUNT(DISTINCT cs.id) FILTER (WHERE cs.status IN ('approved', 'applied')) > 0
ORDER BY COALESCE(SUM(sp.improvement_pct) FILTER (WHERE sp.improvement_pct > 0), 0) DESC;

-- =====================================================
-- 7. Update contributor_leaderboard view
-- =====================================================
CREATE OR REPLACE VIEW contributor_leaderboard AS
SELECT
  up.id,
  up.nickname,
  up.avatar_url,
  up.points,
  up.tier,
  up.total_rewards,
  COALESCE(up.total_improvement_points, 0) as total_improvement_points,
  COALESCE(up.total_improvement_pct, 0) as total_improvement_pct,
  COUNT(cs.id) FILTER (WHERE cs.status IN ('approved', 'applied')) as approved_suggestions,
  COALESCE(SUM(sp.improvement_pct) FILTER (WHERE sp.improvement_pct > 0), 0) as total_improvement
FROM user_profiles up
LEFT JOIN community_suggestions cs ON cs.user_id = up.id
LEFT JOIN suggestion_performance sp ON sp.suggestion_id = cs.id
GROUP BY up.id
ORDER BY up.points DESC;

-- =====================================================
-- 8. Backfill points for existing suggestions
-- =====================================================
-- Award points for suggestions that were created before the trigger existed
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT cs.id, cs.user_id, cs.created_at
    FROM community_suggestions cs
    WHERE cs.user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM point_transactions pt
      WHERE pt.reference_id = cs.id
      AND pt.reason = 'suggestion_created'
    )
  LOOP
    INSERT INTO point_transactions (user_id, amount, reason, reference_id, created_at)
    VALUES (r.user_id, 10, 'suggestion_created', r.id, r.created_at);

    UPDATE user_profiles
    SET points = points + 10, updated_at = NOW()
    WHERE id = r.user_id;
  END LOOP;
END $$;

-- =====================================================
-- 9. Recalculate tiers for all users
-- =====================================================
UPDATE user_profiles
SET tier = CASE
  WHEN points >= 25000 THEN 'master'
  WHEN points >= 10000 THEN 'diamond'
  WHEN points >= 5000 THEN 'platinum'
  WHEN points >= 2000 THEN 'gold'
  WHEN points >= 500 THEN 'silver'
  ELSE 'bronze'
END;
