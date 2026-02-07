-- AI Trading Arena v2.0 Redesign Migration
-- This migration creates new tables for user profiles, enhanced prompt suggestions,
-- point system, performance tracking, rewards, and blog posts.

-- =====================================================
-- 1. User Profiles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT UNIQUE,
  avatar_url TEXT,
  avatar_items JSONB DEFAULT '{}',
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master')),
  total_rewards DECIMAL(10,2) DEFAULT 0,
  pending_rewards DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END
$$;

-- =====================================================
-- 2. Enhanced Prompt Suggestions Table
-- =====================================================
-- Drop old table if migrating (backup first in production!)
-- ALTER TABLE community_suggestions RENAME TO community_suggestions_old;

CREATE TABLE IF NOT EXISTS prompt_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  model_id UUID, -- NULL = applies to all models
  section TEXT NOT NULL CHECK (section IN (
    'market_analysis',
    'risk_management',
    'psychology_pressure',
    'learning_feedback',
    'signal_integration',
    'model_specific'
  )),
  content TEXT NOT NULL,
  expected_effect TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'reviewing',
    'approved',
    'rejected',
    'testing'
  )),
  claude_review_reason TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. Suggestion Votes Table (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS prompt_suggestion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES prompt_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- =====================================================
-- 4. Point Transactions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'suggestion_created',
    'vote_received',
    'suggestion_approved',
    'daily_login',
    'streak_bonus',
    'avatar_purchase',
    'performance_bonus'
  )),
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. Suggestion Performance Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS suggestion_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES prompt_suggestions(id) ON DELETE CASCADE,
  model_id UUID,
  roi_before DECIMAL(10,4),
  roi_after DECIMAL(10,4),
  win_rate_before DECIMAL(5,2),
  win_rate_after DECIMAL(5,2),
  trades_count INTEGER DEFAULT 0,
  measurement_start TIMESTAMPTZ,
  measurement_end TIMESTAMPTZ,
  improvement_pct DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE
      WHEN roi_before IS NOT NULL AND roi_after IS NOT NULL
           AND win_rate_before IS NOT NULL AND win_rate_after IS NOT NULL
      THEN ((roi_after - roi_before) + (win_rate_after - win_rate_before)) / 2
      ELSE NULL
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. User Rewards Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES prompt_suggestions(id) ON DELETE SET NULL,
  performance_id UUID REFERENCES suggestion_performance(id) ON DELETE SET NULL,
  improvement_pct DECIMAL(10,4) NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'verified',
    'paid',
    'rejected'
  )),
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. Avatar Items Shop
-- =====================================================
CREATE TABLE IF NOT EXISTS avatar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('background', 'frame', 'effect', 'character')),
  image_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. User Purchased Items
-- =====================================================
CREATE TABLE IF NOT EXISTS user_avatar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES avatar_items(id) ON DELETE CASCADE,
  equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- =====================================================
-- 9. Blog Posts Table
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'update' CHECK (category IN ('update', 'analysis', 'tech')),
  cover_image TEXT,
  author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. Daily Login Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS user_daily_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, login_date)
);

-- =====================================================
-- Row Level Security
-- =====================================================

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Prompt Suggestions
ALTER TABLE prompt_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suggestions are viewable by everyone" ON prompt_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create suggestions" ON prompt_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions" ON prompt_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- Prompt Suggestion Votes
ALTER TABLE prompt_suggestion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone" ON prompt_suggestion_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON prompt_suggestion_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change own votes" ON prompt_suggestion_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON prompt_suggestion_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Point Transactions
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Suggestion Performance (public for transparency)
ALTER TABLE suggestion_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Performance data is viewable by everyone" ON suggestion_performance
  FOR SELECT USING (true);

-- User Rewards
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON user_rewards
  FOR SELECT USING (auth.uid() = user_id);

-- Avatar Items (public shop)
ALTER TABLE avatar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avatar items are viewable by everyone" ON avatar_items
  FOR SELECT USING (is_active = true);

-- User Avatar Items
ALTER TABLE user_avatar_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items" ON user_avatar_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase items" ON user_avatar_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can equip own items" ON user_avatar_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Blog Posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Daily Logins
ALTER TABLE user_daily_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logins" ON user_daily_logins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logins" ON user_daily_logins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_prompt_suggestions_user_id ON prompt_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_suggestions_status ON prompt_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_prompt_suggestions_section ON prompt_suggestions(section);
CREATE INDEX IF NOT EXISTS idx_prompt_suggestions_created_at ON prompt_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prompt_suggestion_votes_suggestion_id ON prompt_suggestion_votes(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_prompt_suggestion_votes_user_id ON prompt_suggestion_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_suggestion_performance_suggestion_id ON suggestion_performance(suggestion_id);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_daily_logins_user_date ON user_daily_logins(user_id, login_date DESC);

-- =====================================================
-- Functions for Point System
-- =====================================================

-- Function to add points and update user tier
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS void AS $$
DECLARE
  new_total INTEGER;
  new_tier TEXT;
BEGIN
  -- Insert transaction
  INSERT INTO point_transactions (user_id, amount, reason, reference_id)
  VALUES (p_user_id, p_amount, p_reason, p_reference_id);

  -- Update user points
  UPDATE user_profiles
  SET points = points + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING points INTO new_total;

  -- Calculate new tier
  new_tier := CASE
    WHEN new_total >= 25000 THEN 'master'
    WHEN new_total >= 10000 THEN 'diamond'
    WHEN new_total >= 5000 THEN 'platinum'
    WHEN new_total >= 2000 THEN 'gold'
    WHEN new_total >= 500 THEN 'silver'
    ELSE 'bronze'
  END;

  -- Update tier if changed
  UPDATE user_profiles
  SET tier = new_tier
  WHERE id = p_user_id AND tier != new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle daily login
CREATE OR REPLACE FUNCTION handle_daily_login(p_user_id UUID)
RETURNS TABLE(streak INTEGER, points_earned INTEGER) AS $$
DECLARE
  last_login DATE;
  current_streak INTEGER;
  points_to_add INTEGER;
BEGIN
  -- Get last login info
  SELECT login_date, streak_count INTO last_login, current_streak
  FROM user_daily_logins
  WHERE user_id = p_user_id
  ORDER BY login_date DESC
  LIMIT 1;

  -- Check if already logged in today
  IF last_login = CURRENT_DATE THEN
    RETURN QUERY SELECT current_streak, 0;
    RETURN;
  END IF;

  -- Calculate streak
  IF last_login = CURRENT_DATE - INTERVAL '1 day' THEN
    current_streak := COALESCE(current_streak, 0) + 1;
  ELSE
    current_streak := 1;
  END IF;

  -- Cap streak at 7 for bonus calculation
  IF current_streak > 7 THEN
    current_streak := 7;
  END IF;

  -- Calculate points (5 base + 10 per streak day up to 7)
  points_to_add := 5 + (LEAST(current_streak, 7) * 10);

  -- Insert login record
  INSERT INTO user_daily_logins (user_id, login_date, streak_count)
  VALUES (p_user_id, CURRENT_DATE, current_streak)
  ON CONFLICT (user_id, login_date) DO NOTHING;

  -- Add points
  IF points_to_add > 0 THEN
    PERFORM add_user_points(p_user_id, points_to_add,
      CASE WHEN current_streak > 1 THEN 'streak_bonus' ELSE 'daily_login' END);
  END IF;

  RETURN QUERY SELECT current_streak, points_to_add;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_suggestion_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE prompt_suggestions SET upvotes = upvotes + 1 WHERE id = NEW.suggestion_id;
    ELSE
      UPDATE prompt_suggestions SET downvotes = downvotes + 1 WHERE id = NEW.suggestion_id;
    END IF;

    -- Award points to suggestion author for upvote
    IF NEW.vote_type = 'up' THEN
      PERFORM add_user_points(
        (SELECT user_id FROM prompt_suggestions WHERE id = NEW.suggestion_id),
        2,
        'vote_received',
        NEW.suggestion_id
      );
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE prompt_suggestions SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.suggestion_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE prompt_suggestions SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.suggestion_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE prompt_suggestions SET upvotes = upvotes - 1 WHERE id = OLD.suggestion_id;
    ELSE
      UPDATE prompt_suggestions SET downvotes = downvotes - 1 WHERE id = OLD.suggestion_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON prompt_suggestion_votes
  FOR EACH ROW EXECUTE FUNCTION update_suggestion_votes();

-- Function to award points on suggestion creation
CREATE OR REPLACE FUNCTION on_suggestion_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM add_user_points(NEW.user_id, 10, 'suggestion_created', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_suggestion_insert
  AFTER INSERT ON prompt_suggestions
  FOR EACH ROW EXECUTE FUNCTION on_suggestion_created();

-- =====================================================
-- Seed Data: Default Avatar Items
-- =====================================================
INSERT INTO avatar_items (name, category, price, rarity) VALUES
  -- Backgrounds
  ('Default Blue', 'background', 0, 'common'),
  ('Sunset Gradient', 'background', 100, 'common'),
  ('Starfield', 'background', 250, 'uncommon'),
  ('Matrix Rain', 'background', 500, 'rare'),
  ('Holographic', 'background', 1000, 'epic'),
  ('Aurora Borealis', 'background', 2500, 'legendary'),

  -- Frames
  ('Simple Circle', 'frame', 0, 'common'),
  ('Bronze Ring', 'frame', 100, 'common'),
  ('Silver Hexagon', 'frame', 300, 'uncommon'),
  ('Gold Crown', 'frame', 750, 'rare'),
  ('Diamond Shield', 'frame', 1500, 'epic'),
  ('Legendary Wings', 'frame', 3000, 'legendary'),

  -- Effects
  ('None', 'effect', 0, 'common'),
  ('Sparkle', 'effect', 150, 'common'),
  ('Fire Aura', 'effect', 400, 'uncommon'),
  ('Lightning', 'effect', 800, 'rare'),
  ('Cosmic Glow', 'effect', 1750, 'epic'),
  ('Rainbow Trail', 'effect', 4000, 'legendary'),

  -- Characters
  ('Robot', 'character', 0, 'common'),
  ('Ninja', 'character', 200, 'common'),
  ('Wizard', 'character', 500, 'uncommon'),
  ('Dragon Rider', 'character', 1000, 'rare'),
  ('Cyberpunk', 'character', 2000, 'epic'),
  ('Cosmic Being', 'character', 5000, 'legendary')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Useful Views
-- =====================================================

-- Leaderboard for contributors
CREATE OR REPLACE VIEW contributor_leaderboard AS
SELECT
  up.id,
  up.nickname,
  up.avatar_url,
  up.points,
  up.tier,
  up.total_rewards,
  COUNT(ps.id) FILTER (WHERE ps.status = 'approved') as approved_suggestions,
  COALESCE(SUM(sp.improvement_pct) FILTER (WHERE sp.improvement_pct > 0), 0) as total_improvement
FROM user_profiles up
LEFT JOIN prompt_suggestions ps ON ps.user_id = up.id
LEFT JOIN suggestion_performance sp ON sp.suggestion_id = ps.id
GROUP BY up.id
ORDER BY up.points DESC;

-- Suggestion with author info
CREATE OR REPLACE VIEW suggestions_with_authors AS
SELECT
  ps.*,
  up.nickname as author_nickname,
  up.avatar_url as author_avatar,
  up.tier as author_tier
FROM prompt_suggestions ps
LEFT JOIN user_profiles up ON ps.user_id = up.id
ORDER BY ps.created_at DESC;
