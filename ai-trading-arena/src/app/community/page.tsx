'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { ModelSelector } from '@/components/community/ModelSelector'
import { InfoCard, type InfoItem } from '@/components/community/InfoCard'
import { CategoryFilter, type CategoryType } from '@/components/community/CategoryFilter'
import { SuggestionCard } from '@/components/community/SuggestionCard'
import { ContributorLeaderboard } from '@/components/community/ContributorLeaderboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MODEL_CHARACTERS, type ModelCharacter } from '@/lib/constants/models'
import { cn, formatDate } from '@/lib/utils'
import {
  Users,
  BarChart3,
  FileText,
  Target,
  AlertTriangle,
  BookOpen,
  Bot,
  Clock,
  FlaskConical,
  CheckCircle,
  Send,
  Lightbulb,
  Info,
  Trophy,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import type { ContributorLeaderboardEntry, SuggestionSection, SuggestionStatus } from '@/types/database'
import { getIsAdmin } from '@/app/actions/suggestions'

// Info card data definitions
const MARKET_DATA_ITEMS: InfoItem[] = [
  { icon: '💰', label: 'Price', description: 'Current BTC/USD price' },
  { icon: '📈', label: 'Trend Scores', description: '15M, 1H, 4H (-100~+100)' },
  { icon: '🔥', label: 'RSI', description: '14-period momentum indicator' },
  { icon: '📊', label: 'ATR', description: 'Volatility measurement' },
  { icon: '🎯', label: 'ADX', description: 'Trend strength (0-100)' },
  { icon: '🔄', label: 'Volume Sentiment', description: 'Buy/Sell pressure ratio' },
  { icon: '⚡', label: 'Market State', description: 'TRENDING / RANGING / SQUEEZE' },
]

const MARKET_DATA_EXPANDED: InfoItem[] = [
  { icon: '📉', label: 'MACD', description: 'Momentum crossover signals' },
  { icon: '📏', label: 'Bollinger Bands', description: 'Volatility channels' },
  { icon: '🔮', label: 'Fibonacci Levels', description: 'Key support/resistance' },
  { icon: '📍', label: 'Pivot Points', description: 'Daily/Weekly pivots' },
  { icon: '🕯️', label: 'Candlestick Patterns', description: 'Pattern recognition' },
  { icon: '📑', label: 'Order Book', description: 'Depth imbalance signals' },
  { icon: '🌊', label: 'Funding Rate', description: 'Perpetual funding cost' },
  { icon: '📡', label: 'Open Interest', description: 'Market participation' },
]

// Additional reference data provided to AI models
const ADDITIONAL_DATA_ITEMS: InfoItem[] = [
  { icon: '😱', label: 'Fear & Greed Index', description: '0-100 sentiment gauge' },
  { icon: '💀', label: 'Liquidation Data', description: 'Long/Short liquidations & ratio' },
  { icon: '📰', label: 'News Sentiment', description: 'Real-time crypto news analysis (-5~+5)' },
  { icon: '🎯', label: 'AI Signal', description: '15M entry direction guide' },
  { icon: '📊', label: 'Order Flow', description: 'CVD, Taker ratio, Book imbalance' },
]

const ADDITIONAL_DATA_EXPANDED: InfoItem[] = [
  { icon: '🌍', label: 'S&P 500', description: 'US stock market correlation' },
  { icon: '💵', label: 'DXY (Dollar Index)', description: 'USD strength indicator' },
  { icon: '😨', label: 'VIX', description: 'Market volatility/fear index' },
  { icon: '🔥', label: '12-Point Entry Score', description: 'LONG/SHORT entry quality rating' },
  { icon: '₿', label: 'BTC Dominance', description: 'Bitcoin market share %' },
  { icon: '📈', label: 'Stochastic/MFI/CCI', description: 'Additional momentum indicators' },
]

const TRADING_RULES_ITEMS: InfoItem[] = [
  { icon: '🛡️', label: 'Stop Loss', description: '$400 ~ $1,200 USD range' },
  { icon: '🎯', label: 'Risk/Reward', description: '1.5x ~ 2.5x target ratio' },
  { icon: '📦', label: 'Max Positions', description: '4 open positions limit' },
  { icon: '✍️', label: 'Reasoning', description: 'Min 400 characters required' },
  { icon: '⏱️', label: 'Decision Interval', description: 'Every 15 minutes' },
  { icon: '📊', label: 'Leverage', description: '5x maximum' },
]

const PRESSURE_ITEMS: InfoItem[] = [
  { icon: '👑', label: 'Champion (Rank 1)', description: 'Defend position, real money stakes' },
  { icon: '🥈', label: 'Contender (Rank 2-3)', description: 'One trade away from #1' },
  { icon: '⚠️', label: 'Bottom Half (Rank 5-7)', description: 'Aggressive trading required' },
  { icon: '🚨', label: 'Last Place (Rank 8-9)', description: 'Survival mode, must trade' },
]

const ANTIPASSIVITY_ITEMS: InfoItem[] = [
  { icon: '📊', label: 'Tracking', description: 'Consecutive NO_ACTION monitored' },
  { icon: '🟡', label: 'WARNING', description: '3+ consecutive holds' },
  { icon: '🔴', label: 'CRITICAL', description: '5+ consecutive holds' },
  { icon: '🚨', label: 'EXTREME', description: '7+ forces mandatory trade' },
]

// Dynamic data comes from existing tables: ai_decisions, virtual_portfolios, virtual_positions

interface ModelStats {
  balance: number
  roi: number
  rank: number
}

interface Suggestion {
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
  status?: SuggestionStatus
  section?: SuggestionSection
  expected_effect?: string | null
  created_at: string
  user_name?: string
}

interface SuggestionPerformanceData {
  id: string
  suggestion_id: string
  model_id: number | null
  status: 'measuring' | 'completed' | 'insufficient_data'
  improvement_pct: number | null
  roi_before: number | null
  roi_after: number | null
  win_rate_before: number | null
  win_rate_after: number | null
  trades_before: number | null
  trades_after: number | null
  currentTotalTrades?: number | null
}

interface RecentDecision {
  id: string
  action: string
  confidence: number
  reasoning: string
  created_at: string
}

interface PortfolioStats {
  current_balance: number
  initial_balance: number
  total_trades: number
  winning_trades: number
  roi: number
  win_rate: number
}

export default function CommunityPage() {
  const [selectedModel, setSelectedModel] = useState<ModelCharacter | null>(MODEL_CHARACTERS[0])
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all')
  const [modelStats, setModelStats] = useState<Record<string, ModelStats>>({})
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [performanceMap, setPerformanceMap] = useState<Record<string, SuggestionPerformanceData>>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [consecutiveHolds, setConsecutiveHolds] = useState(1)
  const [currentRank, setCurrentRank] = useState(7)
  const [recentDecisions, setRecentDecisions] = useState<RecentDecision[]>([])
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null)

  // Form state
  const [suggestionContent, setSuggestionContent] = useState('')
  const [expectedEffect, setExpectedEffect] = useState('')
  const [suggestionCategory, setSuggestionCategory] = useState<SuggestionSection>('market_analysis')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [expandedDecisions, setExpandedDecisions] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Get user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      // Check admin status
      if (authUser) {
        const adminStatus = await getIsAdmin()
        setIsAdmin(adminStatus)
      }

      // Fetch leaderboard for model stats
      const { data: leaderboardData } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('current_balance', { ascending: false })

      if (leaderboardData) {
        const stats: Record<string, ModelStats> = {}
        leaderboardData.forEach((entry: { id: string; current_balance: number; initial_balance: number }, index: number) => {
          const roi = ((entry.current_balance - entry.initial_balance) / entry.initial_balance) * 100
          stats[entry.id] = {
            balance: entry.current_balance,
            roi,
            rank: index + 1
          }
        })
        setModelStats(stats)

        // Set current rank for selected model
        if (selectedModel && stats[selectedModel.id]) {
          setCurrentRank(stats[selectedModel.id].rank)
        }
      }

      // Fetch suggestions
      const { data: suggestionsData } = await supabase
        .from('community_suggestions')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch user profiles for suggestions
      if (suggestionsData && suggestionsData.length > 0) {
        const userIds = [...new Set(suggestionsData.map(s => s.user_id).filter(Boolean))]
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('user_profiles')
            .select('id, nickname, avatar_url, tier')
            .in('id', userIds)

          if (profilesData) {
            const profileMap = new Map(profilesData.map(p => [p.id, p]))
            suggestionsData.forEach(s => {
              if (s.user_id && profileMap.has(s.user_id)) {
                (s as Record<string, unknown>).user_profiles = profileMap.get(s.user_id)
              }
            })
          }
        }
      }

      if (suggestionsData) {
        setSuggestions(suggestionsData)

        // Fetch performance data for applied suggestions
        const appliedIds = suggestionsData
          .filter(s => s.status === 'applied' || s.is_implemented)
          .map(s => s.id)

        if (appliedIds.length > 0) {
          const { data: perfData } = await supabase
            .from('suggestion_performance')
            .select('id, suggestion_id, model_id, status, improvement_pct, roi_before, roi_after, win_rate_before, win_rate_after, trades_before, trades_after')
            .in('suggestion_id', appliedIds)

          if (perfData) {
            // Get current total_trades for measuring items
            const measuringModelIds = [...new Set(
              perfData.filter(p => p.status === 'measuring' && p.model_id).map(p => p.model_id!)
            )]
            let tradesMap: Record<number, number> = {}
            if (measuringModelIds.length > 0) {
              const { data: portfolios } = await supabase
                .from('virtual_portfolios')
                .select('model_id, total_trades')
                .in('model_id', measuringModelIds)
              if (portfolios) {
                portfolios.forEach(p => { tradesMap[p.model_id] = p.total_trades })
              }
            }

            const pMap: Record<string, SuggestionPerformanceData> = {}
            perfData.forEach(p => {
              pMap[p.suggestion_id] = {
                ...p,
                currentTotalTrades: p.model_id ? (tradesMap[p.model_id] ?? null) : null
              }
            })
            setPerformanceMap(pMap)
          }
        }
      }

      // Fetch recent decisions for consecutive holds (for selected model)
      if (selectedModel) {
        const { data: holdsData } = await supabase
          .from('ai_decisions')
          .select('action')
          .eq('model_id', selectedModel.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (holdsData) {
          let holds = 0
          for (const d of holdsData) {
            if (d.action === 'NO_ACTION') {
              holds++
            } else {
              break
            }
          }
          setConsecutiveHolds(holds)
        }

        // Fetch recent decisions
        const { data: recentDecisionsData } = await supabase
          .from('ai_decisions')
          .select('id, action, confidence, reasoning, created_at')
          .eq('model_id', selectedModel.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (recentDecisionsData) {
          setRecentDecisions(recentDecisionsData)
        } else {
          setRecentDecisions([])
        }

        // Fetch portfolio stats (maybeSingle to handle missing portfolio gracefully)
        const { data: portfolioData } = await supabase
          .from('virtual_portfolios')
          .select('*')
          .eq('model_id', selectedModel.id)
          .maybeSingle()

        if (portfolioData) {
          const winRate = portfolioData.total_trades > 0
            ? (portfolioData.winning_trades / portfolioData.total_trades) * 100
            : 0
          const roi = ((portfolioData.current_balance - portfolioData.initial_balance) / portfolioData.initial_balance) * 100
          setPortfolioStats({
            current_balance: portfolioData.current_balance,
            initial_balance: portfolioData.initial_balance,
            total_trades: portfolioData.total_trades,
            winning_trades: portfolioData.winning_trades,
            roi,
            win_rate: winRate
          })
        } else {
          setPortfolioStats(null)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [selectedModel])

  const refreshSuggestions = async () => {
    const supabase = createClient()
    const { data: refreshedData } = await supabase
      .from('community_suggestions')
      .select('*')
      .order('created_at', { ascending: false })

    if (refreshedData && refreshedData.length > 0) {
      const userIds = [...new Set(refreshedData.map(s => s.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('id, nickname, avatar_url, tier')
          .in('id', userIds)

        if (profilesData) {
          const profileMap = new Map(profilesData.map(p => [p.id, p]))
          refreshedData.forEach(s => {
            if (s.user_id && profileMap.has(s.user_id)) {
              (s as Record<string, unknown>).user_profiles = profileMap.get(s.user_id)
            }
          })
        }
      }
      setSuggestions(refreshedData)

      // Refresh performance data
      const appliedIds = refreshedData
        .filter(s => s.status === 'applied' || s.is_implemented)
        .map(s => s.id)

      if (appliedIds.length > 0) {
        const { data: perfData } = await supabase
          .from('suggestion_performance')
          .select('id, suggestion_id, model_id, status, improvement_pct, roi_before, roi_after, win_rate_before, win_rate_after, trades_before, trades_after')
          .in('suggestion_id', appliedIds)

        if (perfData) {
          const measuringModelIds = [...new Set(
            perfData.filter(p => p.status === 'measuring' && p.model_id).map(p => p.model_id!)
          )]
          let tradesMap: Record<number, number> = {}
          if (measuringModelIds.length > 0) {
            const { data: portfolios } = await supabase
              .from('virtual_portfolios')
              .select('model_id, total_trades')
              .in('model_id', measuringModelIds)
            if (portfolios) {
              portfolios.forEach(p => { tradesMap[p.model_id] = p.total_trades })
            }
          }

          const pMap: Record<string, SuggestionPerformanceData> = {}
          perfData.forEach(p => {
            pMap[p.suggestion_id] = {
              ...p,
              currentTotalTrades: p.model_id ? (tradesMap[p.model_id] ?? null) : null
            }
          })
          setPerformanceMap(pMap)
        }
      }
    }
  }

  const handleModelChange = (model: ModelCharacter) => {
    setSelectedModel(model)
    if (modelStats[model.id]) {
      setCurrentRank(modelStats[model.id].rank)
    }
  }

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    if (!user) {
      setSubmitError('Please sign in to submit suggestions')
      return
    }

    if (suggestionContent.length < 20) {
      setSubmitError('Suggestion must be at least 20 characters')
      return
    }

    setSubmitting(true)

    const supabase = createClient()
    const { data: newSuggestion, error } = await supabase.from('community_suggestions').insert({
      user_id: user.id,
      model_id: selectedModel?.id || null,
      section: suggestionCategory,
      content: suggestionContent.trim(),
      expected_effect: expectedEffect.trim() || null,
      upvotes: 0,
      downvotes: 0,
      is_implemented: false
    }).select().single()

    setSubmitting(false)

    if (error) {
      setSubmitError('Failed to submit suggestion')
      return
    }

    // Points are awarded automatically by DB trigger (on_community_suggestion_insert)
    // Do NOT call add_user_points here to avoid double-awarding

    setSubmitSuccess(true)
    setSuggestionContent('')
    setExpectedEffect('')

    // Refresh suggestions with user profiles
    const { data: refreshedData } = await supabase
      .from('community_suggestions')
      .select('*')
      .order('created_at', { ascending: false })

    if (refreshedData && refreshedData.length > 0) {
      const userIds = [...new Set(refreshedData.map(s => s.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('id, nickname, avatar_url, tier')
          .in('id', userIds)

        if (profilesData) {
          const profileMap = new Map(profilesData.map(p => [p.id, p]))
          refreshedData.forEach(s => {
            if (s.user_id && profileMap.has(s.user_id)) {
              (s as Record<string, unknown>).user_profiles = profileMap.get(s.user_id)
            }
          })
        }
      }
      setSuggestions(refreshedData)
    }

    setTimeout(() => setSubmitSuccess(false), 3000)
  }

  // Filter suggestions by selected model (show model-specific + all-models suggestions)
  const filteredSuggestions = suggestions.filter(s =>
    !selectedModel || s.model_id === selectedModel.id || s.model_id === null
  )

  // Group suggestions by status field
  const pendingSuggestions = filteredSuggestions.filter(s => !s.status || s.status === 'pending')
  const reviewingSuggestions = filteredSuggestions.filter(s => s.status === 'reviewing' || s.status === 'testing')
  const approvedSuggestions = filteredSuggestions.filter(s => s.status === 'approved' || s.status === 'applied' || s.status === 'rejected')
  const mySuggestions = user ? filteredSuggestions.filter(s => s.user_id === user.id) : []

  // Mock contributor data
  const topContributors: ContributorLeaderboardEntry[] = [
    { id: '1', nickname: 'TradingMaster', avatar_url: null, points: 2450, tier: 'gold', total_rewards: 125, approved_suggestions: 3, total_improvement: 5.2 },
    { id: '2', nickname: 'CryptoSage', avatar_url: null, points: 1890, tier: 'silver', total_rewards: 75, approved_suggestions: 2, total_improvement: 3.1 },
    { id: '3', nickname: 'AIWhisperer', avatar_url: null, points: 1200, tier: 'silver', total_rewards: 50, approved_suggestions: 1, total_improvement: 2.5 },
  ]

  // Get pressure level based on rank
  const getPressureLevel = (rank: number): { label: string; color: string; icon: string } => {
    if (rank === 1) return { label: 'CHAMPION', color: 'text-yellow-600 bg-yellow-100', icon: '👑' }
    if (rank <= 3) return { label: 'CONTENDER', color: 'text-blue-600 bg-blue-100', icon: '🥈' }
    if (rank <= 5) return { label: 'MID PACK', color: 'text-gray-600 bg-gray-100', icon: '➖' }
    if (rank <= 7) return { label: 'LAGGING', color: 'text-orange-600 bg-orange-100', icon: '⚠️' }
    return { label: 'DANGER ZONE', color: 'text-red-600 bg-red-100', icon: '🚨' }
  }

  // Get passivity status
  const getPassivityStatus = (holds: number): { label: string; color: string; icon: string } => {
    if (holds <= 2) return { label: 'NORMAL', color: 'text-green-600 bg-green-100', icon: '🟢' }
    if (holds <= 4) return { label: 'WARNING', color: 'text-yellow-600 bg-yellow-100', icon: '🟡' }
    if (holds <= 6) return { label: 'CRITICAL', color: 'text-orange-600 bg-orange-100', icon: '🔴' }
    return { label: 'EXTREME', color: 'text-red-600 bg-red-100', icon: '🚨' }
  }

  const pressureLevel = getPressureLevel(currentRank)
  const passivityStatus = getPassivityStatus(consecutiveHolds)

  // Filter cards by category
  const shouldShowCard = (cardCategory: CategoryType): boolean => {
    return activeCategory === 'all' || activeCategory === cardCategory
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Bot className="w-8 h-8 text-blue-500" />
            Community Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AI Model Configuration Center - Transparency and community participation in AI trading
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            modelStats={modelStats}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Market Data Card */}
              {shouldShowCard('market_data') && (
                <InfoCard
                  icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
                  title="Market Data Provided"
                  items={MARKET_DATA_ITEMS}
                  expandedItems={MARKET_DATA_EXPANDED}
                  category="market_data"
                />
              )}

              {/* Trading Rules Card */}
              {shouldShowCard('trading_rules') && (
                <InfoCard
                  icon={<FileText className="w-5 h-5 text-green-500" />}
                  title="Trading Rules"
                  items={TRADING_RULES_ITEMS}
                  category="trading_rules"
                />
              )}

              {/* Personal Performance Card - Dynamic */}
              {shouldShowCard('market_data') && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-indigo-500" />
                    {selectedModel?.name} Performance
                    {portfolioStats && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded">
                        Live
                      </span>
                    )}
                  </h3>

                  {portfolioStats ? (
                    <>
                      {/* ROI Gauge */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={cn(
                          "text-3xl font-bold",
                          portfolioStats.roi >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {portfolioStats.roi >= 0 ? '+' : ''}{portfolioStats.roi.toFixed(2)}%
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">ROI</p>
                          <p className="text-lg font-semibold">${portfolioStats.current_balance.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                          <span className="text-gray-500 text-xs">Win Rate</span>
                          <p className={cn(
                            "font-bold",
                            portfolioStats.win_rate >= 50 ? "text-green-600" : "text-red-600"
                          )}>{portfolioStats.win_rate.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                          <span className="text-gray-500 text-xs">Total Trades</span>
                          <p className="font-bold">{portfolioStats.total_trades}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                          <span className="text-gray-500 text-xs">Wins</span>
                          <p className="font-bold text-green-600">{portfolioStats.winning_trades}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded p-2">
                          <span className="text-gray-500 text-xs">Losses</span>
                          <p className="font-bold text-red-600">{portfolioStats.total_trades - portfolioStats.winning_trades}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No portfolio data</p>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Reference Data Card - Static */}
              {shouldShowCard('market_data') && (
                <InfoCard
                  icon={<Zap className="w-5 h-5 text-yellow-500" />}
                  title="Additional Reference Data"
                  items={ADDITIONAL_DATA_ITEMS}
                  expandedItems={ADDITIONAL_DATA_EXPANDED}
                  category="market_data"
                />
              )}

              {/* Rank Pressure Card */}
              {shouldShowCard('pressure') && (
                <InfoCard
                  icon={<Target className="w-5 h-5 text-red-500" />}
                  title="Rank Pressure System"
                  items={PRESSURE_ITEMS}
                  category="pressure"
                  footer={
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                      pressureLevel.color
                    )}>
                      <span>{pressureLevel.icon}</span>
                      <span>Current: {pressureLevel.label} - Rank #{currentRank}</span>
                    </div>
                  }
                />
              )}

              {/* Anti-Passivity Card */}
              {shouldShowCard('pressure') && (
                <InfoCard
                  icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
                  title="Anti-Passivity System"
                  items={ANTIPASSIVITY_ITEMS}
                  category="pressure"
                  footer={
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
                      passivityStatus.color
                    )}>
                      <span>{passivityStatus.icon}</span>
                      <span>Status: {passivityStatus.label} - {consecutiveHolds} hold{consecutiveHolds !== 1 ? 's' : ''}</span>
                    </div>
                  }
                />
              )}

              {/* Recent Decisions Card - Dynamic from DB */}
              {shouldShowCard('learning') && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    {selectedModel?.name} Recent Decisions
                    {recentDecisions.length > 0 && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">
                        Last {recentDecisions.length}
                      </span>
                    )}
                  </h3>

                  {recentDecisions.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No decisions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentDecisions.map((decision, index) => (
                        <div
                          key={decision.id}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-xs">#{index + 1}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-bold",
                                decision.action === 'NO_ACTION' && "bg-gray-200 text-gray-700",
                                decision.action === 'OPEN_LONG' && "bg-green-100 text-green-700",
                                decision.action === 'OPEN_SHORT' && "bg-red-100 text-red-700",
                                decision.action === 'CLOSE_LONG' && "bg-blue-100 text-blue-700",
                                decision.action === 'CLOSE_SHORT' && "bg-orange-100 text-orange-700"
                              )}>
                                {decision.action?.replace('_', ' ')}
                              </span>
                              {decision.confidence && (
                                <span className="text-xs text-gray-500">
                                  Confidence: {decision.confidence}%
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDate(decision.created_at, { showTime: true })}
                            </span>
                          </div>
                          {decision.reasoning && (
                            <div>
                              <p className={cn(
                                "text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap",
                                !expandedDecisions.has(decision.id) && "line-clamp-2"
                              )}>
                                {expandedDecisions.has(decision.id) ? decision.reasoning : decision.reasoning.substring(0, 150) + (decision.reasoning.length > 150 ? '...' : '')}
                              </p>
                              {decision.reasoning.length > 150 && (
                                <button
                                  onClick={() => setExpandedDecisions(prev => {
                                    const next = new Set(prev)
                                    if (next.has(decision.id)) next.delete(decision.id)
                                    else next.add(decision.id)
                                    return next
                                  })}
                                  className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 mt-1 flex items-center gap-1"
                                >
                                  {expandedDecisions.has(decision.id) ? (
                                    <><ChevronUp className="w-3 h-3" /> Show less</>
                                  ) : (
                                    <><ChevronDown className="w-3 h-3" /> Show all</>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    AI's actual decision history with reasoning
                  </p>
                </div>
              )}

              {/* Model Profile Card - with dynamic stats */}
              {shouldShowCard('system') && selectedModel && (
                <div
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 border-l-4",
                    selectedModel.bgColor.replace('bg-', 'border-')
                  )}
                  data-category="system"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <span className="text-xl">{selectedModel.emoji}</span>
                    {selectedModel.name} Profile
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">Provider:</span>
                      <span className="text-gray-500">{selectedModel.provider}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">Personality:</span>
                      <span className="text-gray-500">"{selectedModel.personality}"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">Catchphrase:</span>
                      <span className="text-gray-500 italic">"{selectedModel.catchphrase}"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">Mode:</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        currentRank <= 3 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {currentRank <= 3 ? 'Normal' : 'Aggressive (rank-based)'}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Stats from Portfolio */}
                  {portfolioStats && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Stats</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-center">
                          <span className={cn(
                            "block text-lg font-bold",
                            portfolioStats.win_rate >= 50 ? "text-green-600" : "text-red-600"
                          )}>{portfolioStats.win_rate.toFixed(0)}%</span>
                          <span className="text-gray-500">Win Rate</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-center">
                          <span className="block text-lg font-bold text-blue-600">{portfolioStats.total_trades}</span>
                          <span className="text-gray-500">Total Trades</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Suggestion Form */}
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Suggest Improvement for {selectedModel?.name || 'AI Model'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-6">
                    <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-500 mb-2">
                      Sign in to submit suggestions and earn points
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={suggestionCategory}
                        onChange={(e) => setSuggestionCategory(e.target.value as SuggestionSection)}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                      >
                        <option value="market_analysis">Market Analysis</option>
                        <option value="risk_management">Risk Management</option>
                        <option value="psychology_pressure">Psychology & Pressure</option>
                        <option value="learning_feedback">Learning Feedback</option>
                        <option value="signal_integration">Signal Integration</option>
                        <option value="model_specific">Model Specific</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Suggestion</label>
                      <textarea
                        value={suggestionContent}
                        onChange={(e) => setSuggestionContent(e.target.value)}
                        placeholder="Describe your improvement idea. What should be changed or added?"
                        className="w-full p-3 border rounded-lg resize-none h-28 focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                        disabled={submitting}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{suggestionContent.length}/1000</span>
                        <span>Min 20 characters</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Expected Effect (Optional)</label>
                      <textarea
                        value={expectedEffect}
                        onChange={(e) => setExpectedEffect(e.target.value)}
                        placeholder="What improvement do you expect? E.g., 'Reduce false signals in sideways markets'"
                        className="w-full p-3 border rounded-lg resize-none h-16 focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
                        disabled={submitting}
                      />
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-semibold mb-1">Note:</p>
                        <p>Suggestions are reviewed by the operator. Approved improvements earn you points and recognition!</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={submitting || suggestionContent.length < 20}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {submitting ? 'Submitting...' : 'Submit Suggestion'}
                      </Button>
                    </div>

                    {submitError && (
                      <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {submitError}
                      </p>
                    )}
                    {submitSuccess && (
                      <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        Suggestion submitted successfully!
                      </p>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Suggestions List */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({pendingSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="reviewing" className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Reviewing ({reviewingSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Processed ({approvedSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="mine" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Mine ({mySuggestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No pending suggestions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSuggestions.slice(0, 5).map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        isLoggedIn={!!user}
                        isAdmin={isAdmin}
                        onAdminAction={() => { refreshSuggestions(); setActiveTab('reviewing') }}
                        performance={performanceMap[suggestion.id] || null}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviewing">
                {reviewingSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FlaskConical className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No suggestions under review</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewingSuggestions.map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        isLoggedIn={!!user}
                        isAdmin={isAdmin}
                        onAdminAction={() => { refreshSuggestions(); setActiveTab('approved') }}
                        performance={performanceMap[suggestion.id] || null}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="approved">
                {approvedSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No processed suggestions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedSuggestions.map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        isLoggedIn={!!user}
                        isAdmin={isAdmin}
                        onAdminAction={refreshSuggestions}
                        performance={performanceMap[suggestion.id] || null}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mine">
                {!user ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>Sign in to see your suggestions</p>
                  </div>
                ) : mySuggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>You haven&apos;t submitted any suggestions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySuggestions.map((suggestion) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        isLoggedIn={!!user}
                        isAdmin={isAdmin}
                        onAdminAction={refreshSuggestions}
                        performance={performanceMap[suggestion.id] || null}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How to Earn */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                How to Earn Points
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Submit Suggestion</span>
                  <span className="font-bold">+10 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Receive Upvote</span>
                  <span className="font-bold">+2 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Suggestion Approved</span>
                  <span className="font-bold">+50 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Applied to Production</span>
                  <span className="font-bold">+100 pts</span>
                </li>
                <li className="flex items-center justify-between border-t border-white/20 pt-2 mt-2">
                  <span>ROI Improvement</span>
                  <span className="font-bold">% x 100 pts</span>
                </li>
              </ul>
              <Link
                href="/hall-of-fame"
                className="mt-4 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Crown className="w-4 h-4" />
                View Hall of Fame
              </Link>
            </div>

            {/* Top Contributors */}
            <ContributorLeaderboard contributors={topContributors} />

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How It Works
              </h3>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 dark:bg-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Browse model configuration details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 dark:bg-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Submit improvement suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 dark:bg-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>Approved suggestions get applied</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-200 dark:bg-blue-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Earn rewards if performance improves!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
