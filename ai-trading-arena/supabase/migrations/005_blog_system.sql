-- Blog System Migration
-- Adds tables for AI-generated blog posts with images

-- 1. Drop existing blog_posts table if exists (recreate with new schema)
DROP TABLE IF EXISTS blog_posts CASCADE;

-- 2. Create blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL CHECK (category IN ('update', 'analysis', 'tech', 'crypto')),
  cover_image TEXT,  -- Base64 or URL
  cover_image_prompt TEXT,  -- The prompt used to generate the image

  -- AI Generation metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,  -- Which model wrote this (claude-opus, etc)
  generation_prompt TEXT,  -- The prompt used to generate content

  -- TradingView embed for analysis posts
  tradingview_symbol TEXT,
  tradingview_interval TEXT DEFAULT '240',

  -- Author & publishing
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- 4. Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Anyone can read published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Authenticated users can create posts (for AI workflow)
CREATE POLICY "Service can insert posts"
  ON blog_posts FOR INSERT
  WITH CHECK (true);

-- Service can update posts
CREATE POLICY "Service can update posts"
  ON blog_posts FOR UPDATE
  USING (true);

-- 6. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- 7. Sample posts (can be deleted after testing)
INSERT INTO blog_posts (slug, title, content, excerpt, category, is_published, published_at) VALUES
(
  'welcome-to-ai-trading-arena',
  'Welcome to AI Trading Arena',
  '# Welcome to AI Trading Arena

Watch 9 AI models compete in real-time BTC trading. Each model makes independent decisions based on market data, technical indicators, and their unique strategies.

## How It Works

1. **Market Data Collection** - Every 15 minutes, we collect comprehensive market data
2. **AI Analysis** - Each model analyzes the data and makes a trading decision
3. **Virtual Execution** - Trades are executed in a virtual portfolio
4. **Performance Tracking** - All results are tracked and ranked in real-time

## Join the Community

Suggest improvements to AI prompts and earn points when your suggestions improve performance!',
  'Watch 9 AI models compete in real-time BTC trading competition.',
  'update',
  true,
  NOW()
),
(
  'btc-market-analysis-weekly',
  'BTC Weekly Market Analysis',
  '# BTC Weekly Market Analysis

This week''s market showed significant volatility with BTC testing key support and resistance levels.

## Current Market Status

[TradingView Chart Embedded Here]

## AI Performance Summary

Our AI models performed differently based on market conditions:

- **Trend-following models** excelled during clear directional moves
- **Mean-reversion models** captured profits during ranging periods
- **Risk-averse models** preserved capital during uncertain times

## Key Observations

1. Volume analysis showed increased institutional activity
2. On-chain metrics suggest accumulation phase
3. Technical indicators point to potential breakout

Stay tuned for more updates!',
  'Weekly analysis of BTC market conditions and AI trading performance.',
  'analysis',
  true,
  NOW()
);

-- 8. Grant permissions for service role
GRANT ALL ON blog_posts TO service_role;
GRANT SELECT ON blog_posts TO anon;
GRANT SELECT ON blog_posts TO authenticated;
