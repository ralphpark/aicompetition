-- Community Suggestions Table
CREATE TABLE IF NOT EXISTS community_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  model_id UUID REFERENCES ai_models(id),
  decision_id UUID REFERENCES ai_decisions(id),
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  is_implemented BOOLEAN DEFAULT false,
  implemented_at TIMESTAMPTZ,
  operator_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestion Votes Table (prevent duplicate votes)
CREATE TABLE IF NOT EXISTS suggestion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID REFERENCES community_suggestions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  vote_type VARCHAR NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(suggestion_id, user_id)
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  achievement_type VARCHAR NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE community_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_suggestions
CREATE POLICY "Anyone can view suggestions" ON community_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert suggestions" ON community_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions" ON community_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for suggestion_votes
CREATE POLICY "Anyone can view votes" ON suggestion_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON suggestion_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON suggestion_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON suggestion_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_suggestions_created_at ON community_suggestions(created_at DESC);
CREATE INDEX idx_suggestions_is_implemented ON community_suggestions(is_implemented);
CREATE INDEX idx_votes_suggestion_id ON suggestion_votes(suggestion_id);
