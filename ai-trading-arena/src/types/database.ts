// PnL Grand Prix v2.0 - Database Types

// =====================================================
// Core Trading Types
// =====================================================

export interface AIModel {
  id: string
  name: string
  provider: string
  is_active: boolean
  created_at?: string
}

export interface VirtualPortfolio {
  id: string
  model_id: string
  current_balance: number
  initial_balance: number
  total_trades: number
  winning_trades: number
  updated_at: string
}

export interface VirtualPosition {
  id: string
  model_id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  entry_price: number
  current_price: number
  quantity: number
  stop_loss: number | null
  take_profit: number | null
  pnl: number
  opened_at: string
  closed_at: string | null
  confidence_at_entry: number | null
  confidence_position_multiplier: number | null
  invalidation_type: string | null
  invalidation_value: number | null
  invalidation_description: string | null
  close_reason: string | null
}

export interface AIDecision {
  id: string
  model_id: string
  symbol: string
  action: 'OPEN_LONG' | 'OPEN_SHORT' | 'CLOSE_LONG' | 'CLOSE_SHORT' | 'NO_ACTION'
  confidence: number
  reasoning: string
  entry_price: number | null
  stop_loss: number | null
  take_profit: number | null
  execution_status?: 'executed' | 'blocked' | 'pending'
  block_reason?: string | null
  invalidation_type?: string | null
  invalidation_value?: number | null
  invalidation_description?: string | null
  position_size_pct?: number | null
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  provider: string
  current_balance: number
  initial_balance: number
  roi_percent: number
  total_trades: number
  winning_trades: number
  win_rate: number
  rank: number
  updated_at?: string
  avg_pnl_per_trade?: number
  trades_per_day?: number
  tp_hit_rate?: number
  sl_hit_rate?: number
  avg_confidence?: number
}

export interface RecentDecisionView extends AIDecision {
  model_name: string
  provider: string
}

// =====================================================
// User System Types
// =====================================================

export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'

export interface UserProfile {
  id: string
  nickname: string | null
  avatar_url: string | null
  avatar_items: AvatarItems
  points: number
  tier: UserTier
  total_rewards: number
  pending_rewards: number
  created_at: string
  updated_at: string
}

export interface AvatarItems {
  background?: string
  frame?: string
  effect?: string
  character?: string
}

export interface UserDailyLogin {
  id: string
  user_id: string
  login_date: string
  streak_count: number
  created_at: string
}

// =====================================================
// Community & Suggestions Types
// =====================================================

export type SuggestionSection =
  | 'market_analysis'
  | 'risk_management'
  | 'psychology_pressure'
  | 'learning_feedback'
  | 'signal_integration'
  | 'model_specific'

export type SuggestionStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'applied'
  | 'rejected'
  | 'testing'

export interface PromptSuggestion {
  id: string
  user_id: string | null
  model_id: string | null
  section: SuggestionSection
  content: string
  expected_effect: string | null
  upvotes: number
  downvotes: number
  status: SuggestionStatus
  claude_review_reason: string | null
  applied_at: string | null
  created_at: string
}

export interface PromptSuggestionWithAuthor extends PromptSuggestion {
  author_nickname: string | null
  author_avatar: string | null
  author_tier: UserTier | null
}

export interface SuggestionVote {
  id: string
  suggestion_id: string
  user_id: string
  vote_type: 'up' | 'down'
  created_at: string
}

// Legacy type for backward compatibility
export interface CommunitySuggestion {
  id: string
  user_id: string
  model_id: string | null
  decision_id: string | null
  content: string
  upvotes: number
  downvotes: number
  is_implemented: boolean
  implemented_at: string | null
  operator_reply: string | null
  created_at: string
}

// =====================================================
// Points & Rewards Types
// =====================================================

export type PointReason =
  | 'suggestion_created'
  | 'vote_received'
  | 'suggestion_approved'
  | 'suggestion_applied'
  | 'roi_improvement'
  | 'daily_login'
  | 'streak_bonus'
  | 'avatar_purchase'
  | 'performance_bonus'

// Point values for the rewards system
export const POINT_VALUES = {
  SUGGESTION_CREATED: 10,
  VOTE_RECEIVED: 2,
  SUGGESTION_APPROVED: 50,
  SUGGESTION_APPLIED: 100,
  ROI_IMPROVEMENT_MULTIPLIER: 100, // improvement_pct * 100
} as const

export interface PointTransaction {
  id: string
  user_id: string
  amount: number
  reason: PointReason
  reference_id: string | null
  created_at: string
}

export type RewardStatus = 'pending' | 'verified' | 'paid' | 'rejected'

export interface UserReward {
  id: string
  user_id: string
  suggestion_id: string | null
  performance_id: string | null
  improvement_pct: number
  reward_points: number
  status: RewardStatus
  rejection_reason: string | null
  verified_at: string | null
  paid_at: string | null
  created_at: string
}

// Hall of Fame entry for top contributors
export interface HallOfFameEntry {
  id: string
  nickname: string | null
  avatar_url: string | null
  tier: UserTier
  points: number
  approved_count: number
  total_improvement_pct: number
  total_improvement_points: number
  last_contribution: string | null
}

export interface SuggestionPerformance {
  id: string
  suggestion_id: string
  model_id: string | null
  roi_before: number | null
  roi_after: number | null
  win_rate_before: number | null
  win_rate_after: number | null
  trades_count: number
  measurement_start: string | null
  measurement_end: string | null
  improvement_pct: number | null
  created_at: string
}

// =====================================================
// Avatar Shop Types
// =====================================================

export type AvatarCategory = 'background' | 'frame' | 'effect' | 'character'
export type AvatarRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface AvatarItem {
  id: string
  name: string
  category: AvatarCategory
  image_url: string | null
  price: number
  rarity: AvatarRarity
  is_active: boolean
  created_at: string
}

export interface UserAvatarItem {
  id: string
  user_id: string
  item_id: string
  equipped: boolean
  purchased_at: string
}

export interface UserAvatarItemWithDetails extends UserAvatarItem {
  item: AvatarItem
}

// =====================================================
// Blog Types
// =====================================================

export type BlogCategory = 'update' | 'analysis' | 'tech' | 'crypto'

export interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  category: BlogCategory
  cover_image: string | null
  cover_image_prompt: string | null
  ai_generated: boolean
  ai_model: string | null
  tradingview_symbol: string | null
  tradingview_interval: string | null
  author_id: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogPostWithAuthor extends BlogPost {
  author: Pick<UserProfile, 'id' | 'nickname' | 'avatar_url'> | null
}

// =====================================================
// Gamification Types
// =====================================================

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: string
  achieved_at: string
  metadata: Record<string, unknown> | null
  progress?: number
  max_progress?: number
}

// =====================================================
// View Types
// =====================================================

export interface ContributorLeaderboardEntry {
  id: string
  nickname: string | null
  avatar_url: string | null
  points: number
  tier: UserTier
  total_rewards: number
  approved_suggestions: number
  total_improvement: number
}

// =====================================================
// Section Labels & Constants
// =====================================================

export const SECTION_LABELS: Record<SuggestionSection, string> = {
  market_analysis: 'Market Analysis',
  risk_management: 'Risk Management',
  psychology_pressure: 'Psychology & Pressure',
  learning_feedback: 'Learning Feedback',
  signal_integration: 'Signal Integration',
  model_specific: 'Model Specific',
}

export const STATUS_LABELS: Record<SuggestionStatus, string> = {
  pending: 'Pending Review',
  reviewing: 'Under Review',
  approved: 'Approved',
  applied: 'Applied to Production',
  rejected: 'Rejected',
  testing: 'Under Testing',
}

export const STATUS_COLORS: Record<SuggestionStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  applied: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  testing: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
}

export const TIER_CONFIG: Record<UserTier, { label: string; color: string; minPoints: number }> = {
  bronze: { label: 'Bronze', color: 'text-amber-700 bg-amber-100', minPoints: 0 },
  silver: { label: 'Silver', color: 'text-gray-500 bg-gray-100', minPoints: 500 },
  gold: { label: 'Gold', color: 'text-yellow-600 bg-yellow-100', minPoints: 2000 },
  platinum: { label: 'Platinum', color: 'text-cyan-600 bg-cyan-100', minPoints: 5000 },
  diamond: { label: 'Diamond', color: 'text-purple-600 bg-purple-100', minPoints: 10000 },
  master: { label: 'Master', color: 'text-red-600 bg-red-100', minPoints: 25000 },
}

export const RARITY_COLORS: Record<AvatarRarity, string> = {
  common: 'text-gray-600 bg-gray-100',
  uncommon: 'text-green-600 bg-green-100',
  rare: 'text-blue-600 bg-blue-100',
  epic: 'text-purple-600 bg-purple-100',
  legendary: 'text-amber-600 bg-amber-100',
}

// =====================================================
// Bitget Live Trading Types
// =====================================================

export interface BitgetAccountConfig {
  id: string
  platform: string
  account_type: string
  symbol: string
  leverage: number
  margin_mode: string
  initial_balance: number
  current_balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BitgetTradeExecution {
  id: string
  champion_model_id: string | null
  symbol: string
  action: string
  side: string
  quantity: number
  price: number | null
  bitget_order_id: string | null
  position_status: string
  status: string
  pnl: number | null
  fee: number
  order_type: string
  error_message: string | null
  executed_at: string
  created_at: string
}

export interface BitgetAccountStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  totalFees: number
  netPnl: number
  roi: number
  currentBalance: number
  initialBalance: number
}
