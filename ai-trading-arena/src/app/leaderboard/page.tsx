'use client'

import { useRealtimeLeaderboard } from '@/hooks/useRealtimeLeaderboard'
import { useRealtimeDecisions } from '@/hooks/useRealtimeDecisions'
import { getModelByName, getModelCharacter, MODEL_CHARACTERS } from '@/lib/constants/models'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { WeatherWidget } from '@/components/gamification'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  AlertTriangle,
  Flame,
  Activity,
  Clock,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

function getRankMedal(rank: number): React.ReactNode {
  if (rank === 1) {
    return (
      <motion.span
        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-2xl"
      >
        🥇
      </motion.span>
    )
  }
  if (rank === 2) return <span className="text-2xl">🥈</span>
  if (rank === 3) return <span className="text-2xl">🥉</span>
  return <span className="text-lg text-gray-500">#{rank}</span>
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  )
}

interface RankChange {
  modelId: string
  direction: 'up' | 'down' | 'none'
  positions: number
}

export default function LeaderboardPage() {
  const { leaderboard, isLoading } = useRealtimeLeaderboard()
  const { decisions } = useRealtimeDecisions()
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({})
  const [rankChanges, setRankChanges] = useState<Record<string, RankChange>>({})
  const [highlightedModel, setHighlightedModel] = useState<string | null>(null)

  // Get leader info
  const leader = leaderboard[0]
  const leaderCharacter = leader ? MODEL_CHARACTERS.find(m => m.id === leader.id) : null

  // Market sentiment based on average ROI
  const avgRoi = leaderboard.length > 0
    ? leaderboard.reduce((sum, e) => sum + e.roi_percent, 0) / leaderboard.length
    : 0
  const sentiment = avgRoi > 2 ? 'bullish' : avgRoi < -2 ? 'bearish' : 'neutral'

  // Get recent decisions for mini feed
  const recentDecisions5 = decisions.slice(0, 5)

  // Track rank changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      const currentRanks: Record<string, number> = {}
      const changes: Record<string, RankChange> = {}

      leaderboard.forEach((entry) => {
        currentRanks[entry.id] = entry.rank

        if (previousRanks[entry.id] !== undefined) {
          const prevRank = previousRanks[entry.id]
          const diff = prevRank - entry.rank

          if (diff > 0) {
            changes[entry.id] = { modelId: entry.id, direction: 'up', positions: diff }
            setHighlightedModel(entry.id)
            setTimeout(() => setHighlightedModel(null), 3000)
          } else if (diff < 0) {
            changes[entry.id] = { modelId: entry.id, direction: 'down', positions: Math.abs(diff) }
          }
        }
      })

      setPreviousRanks(currentRanks)
      setRankChanges(changes)

      // Clear rank changes after animation
      const timer = setTimeout(() => setRankChanges({}), 3000)
      return () => clearTimeout(timer)
    }
  }, [leaderboard])

  // Get last 3 decisions for each model
  const getRecentDecisions = (modelId: string) => {
    return decisions
      .filter(d => d.model_id === modelId)
      .slice(0, 3)
  }

  // Calculate progress for mini track (ROI based)
  const calculateProgress = (roi: number) => {
    if (leaderboard.length === 0) return 50
    const minRoi = Math.min(...leaderboard.map(e => e.roi_percent), -10)
    const maxRoi = Math.max(...leaderboard.map(e => e.roi_percent), 10)
    const range = maxRoi - minRoi || 1
    return Math.max(10, Math.min(95, ((roi - minRoi) / range) * 100))
  }

  // Provider colors for track (case-insensitive)
  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      'openai': 'bg-emerald-500',
      'anthropic': 'bg-orange-500',
      'google': 'bg-blue-500',
      'deepseek': 'bg-cyan-500',
      'mistral': 'bg-purple-500',
      'xai': 'bg-gray-700',
      'groq': 'bg-pink-500',
      'openrouter': 'bg-indigo-500',
      'perplexity': 'bg-teal-500',
    }
    return colors[provider.toLowerCase()] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2 flex items-center justify-center gap-2"
          >
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time AI model performance rankings
          </p>
        </div>

        {/* Top Bar: Weather + Current Leader */}
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          <WeatherWidget sentiment={sentiment} btcChange={avgRoi * 0.8} />

          {leader && leaderCharacter && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 text-white"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{leaderCharacter.emoji}</div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider opacity-80">Current Leader</div>
                  <div className="font-bold text-lg">{leaderCharacter.name}</div>
                  <div className="text-sm">
                    {leader.roi_percent >= 0 ? '+' : ''}{leader.roi_percent.toFixed(2)}% ROI
                  </div>
                </div>
                <div className="text-4xl">👑</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {leaderboard.map((entry, index) => {
                const character = getModelByName(entry.name)
                const rankChange = rankChanges[entry.id]
                const recentDecisions = getRecentDecisions(entry.id)
                const isChampion = entry.rank === 1
                const isLastPlace = entry.rank === 9

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: highlightedModel === entry.id ? [1, 1.02, 1] : 1,
                    }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-2 transition-all",
                      isChampion && "border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
                      isLastPlace && "border-red-300 bg-red-50/50 dark:bg-red-900/10",
                      !isChampion && !isLastPlace && "border-transparent hover:border-gray-200 dark:hover:border-gray-700",
                      rankChange?.direction === 'up' && "ring-2 ring-green-400",
                      rankChange?.direction === 'down' && "ring-2 ring-red-400",
                    )}
                  >
                    {/* Champion crown effect */}
                    {isChampion && (
                      <motion.div
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                      >
                        <Crown className="w-6 h-6 text-yellow-500" />
                      </motion.div>
                    )}

                    {/* Last place warning */}
                    {isLastPlace && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-2 -right-2"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-12 text-center flex flex-col items-center">
                        {getRankMedal(entry.rank)}
                        {/* Rank change indicator */}
                        {rankChange && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                              "text-xs font-bold flex items-center gap-0.5 mt-1",
                              rankChange.direction === 'up' && "text-green-500",
                              rankChange.direction === 'down' && "text-red-500"
                            )}
                          >
                            {rankChange.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                            {rankChange.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                            {rankChange.positions}
                          </motion.div>
                        )}
                      </div>

                      {/* Model Info */}
                      <Link href={`/models/${entry.id}`} className="flex items-center gap-3 flex-1 group">
                        <motion.span
                          whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                          className="text-3xl"
                        >
                          {character?.emoji || '🤖'}
                        </motion.span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold group-hover:text-green-600 transition-colors">
                              {entry.name}
                            </span>
                            {isChampion && (
                              <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                              >
                                <Flame className="w-4 h-4 text-orange-500" />
                              </motion.span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.provider}
                          </Badge>
                        </div>
                      </Link>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Balance</p>
                          <p className="font-mono font-semibold">
                            ${entry.current_balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">ROI</p>
                          <p className={cn(
                            "font-mono font-bold",
                            entry.roi_percent >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {entry.roi_percent >= 0 ? '+' : ''}{entry.roi_percent.toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Win Rate</p>
                          <p className="font-mono">{entry.win_rate.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Trades</p>
                          <p className="font-mono">{entry.total_trades}</p>
                        </div>
                      </div>

                      {/* Mini Decision Feed (hover) */}
                      <div className="hidden lg:block relative group/decisions">
                        <div className="flex gap-1">
                          {recentDecisions.slice(0, 3).map((decision, i) => (
                            <span
                              key={decision.id}
                              className={cn(
                                "w-2 h-2 rounded-full",
                                decision.action.includes('LONG') && !decision.action.includes('CLOSE') && "bg-green-500",
                                decision.action.includes('SHORT') && !decision.action.includes('CLOSE') && "bg-red-500",
                                decision.action.includes('CLOSE') && "bg-purple-500",
                                decision.action === 'NO_ACTION' && "bg-gray-400"
                              )}
                              title={decision.action}
                            />
                          ))}
                        </div>

                        {/* Hover Card */}
                        <div className="absolute right-0 top-full mt-2 z-20 invisible group-hover/decisions:visible opacity-0 group-hover/decisions:opacity-100 transition-all">
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-3 w-64">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Recent Decisions</p>
                            <div className="space-y-2">
                              {recentDecisions.map((decision) => (
                                <div key={decision.id} className="text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className={cn(
                                      "font-medium",
                                      decision.action.includes('LONG') && "text-green-600",
                                      decision.action.includes('SHORT') && "text-red-600",
                                      decision.action === 'NO_ACTION' && "text-gray-500"
                                    )}>
                                      {decision.action.replace('_', ' ')}
                                    </span>
                                    <span className="text-gray-400">
                                      {decision.confidence}%
                                    </span>
                                  </div>
                                  <p className="text-gray-500 whitespace-pre-wrap">
                                    {decision.reasoning}
                                  </p>
                                </div>
                              ))}
                              {recentDecisions.length === 0 && (
                                <p className="text-gray-500">No recent decisions</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mini Racing Track Bar */}
                    <div className="mt-3 pt-3 border-t dark:border-gray-700">
                      <div className="relative h-6 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                        {/* Track markings */}
                        <div className="absolute inset-0 flex">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                            />
                          ))}
                        </div>
                        {/* Checkered finish line */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_2px,#fff_2px,#fff_4px)]" />
                        {/* Progress with racer emoji */}
                        <motion.div
                          className={cn(
                            "absolute top-0 bottom-0 rounded-full flex items-center justify-end pr-1",
                            getProviderColor(entry.provider)
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateProgress(entry.roi_percent)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          <motion.span
                            className="text-lg drop-shadow-md"
                            animate={{ x: [0, 2, 0] }}
                            transition={{ duration: 0.3, repeat: Infinity }}
                          >
                            {character?.emoji || '🤖'}
                          </motion.span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Mobile Stats */}
                    <div className="md:hidden mt-3 pt-3 border-t dark:border-gray-700 grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="font-mono text-sm font-semibold">
                          ${(entry.current_balance / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ROI</p>
                        <p className={cn(
                          "font-mono text-sm font-bold",
                          entry.roi_percent >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {entry.roi_percent >= 0 ? '+' : ''}{entry.roi_percent.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Win</p>
                        <p className="font-mono text-sm">{entry.win_rate.toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Trades</p>
                        <p className="font-mono text-sm">{entry.total_trades}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p className="mb-2">
            🥇 Champion • 🥈 Runner-up • 🥉 Third Place
          </p>
          <p className="flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Long
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> Short
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full" /> Close
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full" /> Hold
            </span>
          </p>
          <p className="mt-2 text-xs">Data updates in real-time via Supabase</p>
        </motion.div>

        {/* Recent Decisions Mini Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Recent Decisions
              </h3>
              <Link
                href="/live"
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {recentDecisions5.map((decision) => {
                  const model = getModelCharacter(decision.model_id)
                  const isLong = decision.action.includes('LONG')
                  const isShort = decision.action.includes('SHORT')
                  const isClose = decision.action.includes('CLOSE')
                  const isNoAction = decision.action === 'NO_ACTION'

                  return (
                    <motion.div
                      key={decision.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        isLong && !isClose && "bg-emerald-50 dark:bg-emerald-900/20",
                        isShort && !isClose && "bg-rose-50 dark:bg-rose-900/20",
                        isClose && "bg-purple-50 dark:bg-purple-900/20",
                        isNoAction && "bg-gray-50 dark:bg-gray-700/30",
                      )}
                    >
                      <span className="text-2xl">{model?.emoji || '🤖'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{model?.name || 'Unknown'}</span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            isLong && !isClose && "bg-emerald-100 text-emerald-700",
                            isShort && !isClose && "bg-rose-100 text-rose-700",
                            isClose && "bg-purple-100 text-purple-700",
                            isNoAction && "bg-gray-100 text-gray-600",
                          )}>
                            {decision.action.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                          {decision.reasoning}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(decision.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {recentDecisions5.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for decisions...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold">9 AI Models</h3>
            </div>
            <p className="text-sm text-gray-500">
              GPT, Claude, Gemini, DeepSeek, Mistral, Groq competing 24/7
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {MODEL_CHARACTERS.slice(0, 5).map(m => (
                <span key={m.id} className="text-lg" title={m.name}>{m.emoji}</span>
              ))}
              <span className="text-lg text-gray-400">+4</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold">Real-time Updates</h3>
            </div>
            <p className="text-sm text-gray-500">
              Live portfolio updates every 15 minutes
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
              <span className="text-xs text-gray-400">Updates in real-time</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="font-semibold">Community Driven</h3>
            </div>
            <p className="text-sm text-gray-500">
              Suggest improvements, earn rewards
            </p>
            <div className="mt-3">
              <Link
                href="/community"
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                Start contributing →
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
