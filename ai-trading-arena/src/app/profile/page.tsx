'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/community/TierBadge'
import { PointsDisplay } from '@/components/community/PointsDisplay'
import { ClaudeReviewBadge } from '@/components/community/ClaudeReviewBadge'
import { RewardCard } from '@/components/rewards/RewardCard'
import { RewardSummary } from '@/components/rewards/RewardSummary'
import { TIER_CONFIG, SECTION_LABELS, POINT_VALUES } from '@/types/database'
import type { UserTier, SuggestionStatus, SuggestionSection, PointReason, RewardStatus } from '@/types/database'
import { formatDate } from '@/lib/utils'
import {
  Trophy,
  Coins,
  Lightbulb,
  ThumbsUp,
  Clock,
  Edit3,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  nickname: string | null
  avatar_url: string | null
  points: number
  tier: UserTier
  total_rewards: number
  pending_rewards: number
  created_at: string
}

interface UserSuggestion {
  id: string
  section: SuggestionSection
  content: string
  expected_effect: string | null
  upvotes: number
  status: SuggestionStatus
  created_at: string
  model_name: string | null
}

interface UserReward {
  id: string
  suggestion_title: string
  model_name: string
  roi_before: number
  roi_after: number
  improvement_pct: number
  reward_points: number
  status: RewardStatus
  created_at: string
}

interface PointHistoryItem {
  id: string
  amount: number
  reason: PointReason
  created_at: string
}

const REASON_LABELS: Record<PointReason, string> = {
  suggestion_created: 'Suggestion created',
  vote_received: 'Vote received',
  suggestion_approved: 'Suggestion approved',
  suggestion_applied: 'Applied to production',
  roi_improvement: 'ROI improvement bonus',
  daily_login: 'Daily login',
  streak_bonus: 'Login streak bonus',
  avatar_purchase: 'Avatar purchase',
  performance_bonus: 'Performance bonus',
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [rewards, setRewards] = useState<UserReward[]>([])
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true)

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          nickname: profile.nickname || 'Anonymous',
          avatar_url: profile.avatar_url,
          points: profile.points || 0,
          tier: (profile.tier || 'bronze') as UserTier,
          total_rewards: profile.total_rewards || 0,
          pending_rewards: profile.pending_rewards || 0,
          created_at: profile.created_at,
        })
      }

      // Fetch user suggestions
      const { data: suggestionsData } = await supabase
        .from('community_suggestions')
        .select(`
          id,
          section,
          content,
          expected_effect,
          upvotes,
          status,
          created_at,
          ai_models:model_id (name)
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (suggestionsData) {
        setSuggestions(
          suggestionsData.map((s) => {
            const aiModel = s.ai_models as { name: string } | { name: string }[] | null
            const modelName = Array.isArray(aiModel) ? aiModel[0]?.name : aiModel?.name
            return {
              id: s.id,
              section: s.section as SuggestionSection,
              content: s.content,
              expected_effect: s.expected_effect,
              upvotes: s.upvotes || 0,
              status: s.status as SuggestionStatus,
              created_at: s.created_at,
              model_name: modelName || 'All Models',
            }
          })
        )
      }

      // Fetch rewards (suggestions with performance data)
      const { data: appliedSuggestions } = await supabase
        .from('community_suggestions')
        .select(`
          id,
          content,
          status,
          created_at,
          ai_models:model_id (name),
          suggestion_performance (
            roi_before,
            roi_after,
            improvement_pct
          )
        `)
        .eq('user_id', authUser.id)
        .in('status', ['approved', 'applied'])

      if (appliedSuggestions) {
        const rewardsData: UserReward[] = []
        for (const s of appliedSuggestions) {
          const perf = (s.suggestion_performance as { roi_before: number; roi_after: number; improvement_pct: number }[])?.[0]

          // Get points awarded for this suggestion
          const { data: pointsData } = await supabase
            .from('point_transactions')
            .select('amount')
            .eq('user_id', authUser.id)
            .eq('reference_id', s.id)

          const totalPoints = pointsData?.reduce((sum, p) => sum + p.amount, 0) || 0

          const aiModel = s.ai_models as { name: string } | { name: string }[] | null
          const modelName = Array.isArray(aiModel) ? aiModel[0]?.name : aiModel?.name
          rewardsData.push({
            id: s.id,
            suggestion_title: s.content.substring(0, 60) + (s.content.length > 60 ? '...' : ''),
            model_name: modelName || 'General',
            roi_before: perf?.roi_before || 0,
            roi_after: perf?.roi_after || 0,
            improvement_pct: perf?.improvement_pct || 0,
            reward_points: totalPoints,
            status: s.status === 'applied' && totalPoints > 0 ? 'paid' : 'pending',
            created_at: s.created_at,
          })
        }
        setRewards(rewardsData)
      }

      // Fetch point history
      const { data: historyData } = await supabase
        .from('point_transactions')
        .select('id, amount, reason, created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (historyData) {
        setPointHistory(historyData as PointHistoryItem[])
      }

      setLoading(false)
    }

    fetchUserData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const tierConfig = TIER_CONFIG[user.tier]

  // Calculate next tier progress
  const currentTierMin = tierConfig.minPoints
  const nextTierKey = Object.keys(TIER_CONFIG).find(
    (key) => TIER_CONFIG[key as UserTier].minPoints > user.points
  ) as UserTier | undefined
  const nextTierMin = nextTierKey ? TIER_CONFIG[nextTierKey].minPoints : currentTierMin
  const progressToNextTier = nextTierKey
    ? ((user.points - currentTierMin) / (nextTierMin - currentTierMin)) * 100
    : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 border dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-4xl font-bold text-white">
                {(user.nickname || 'A').charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 dark:bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{user.nickname}</h1>
                <TierBadge tier={user.tier} size="md" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                Member since {formatDate(user.created_at, { showYear: true })}
              </p>
              <PointsDisplay points={user.points} tier={user.tier} size="lg" />
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{user.points.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{user.pending_rewards}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{suggestions.length}</div>
                <div className="text-xs text-gray-500">Suggestions</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contribution Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Suggestions</span>
                      <span className="font-semibold">{suggestions.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Approved</span>
                      <span className="font-semibold text-green-600">
                        {suggestions.filter(s => s.status === 'approved' || s.status === 'applied').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Testing</span>
                      <span className="font-semibold text-blue-600">
                        {suggestions.filter(s => s.status === 'testing').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Upvotes</span>
                      <span className="font-semibold">
                        {suggestions.reduce((sum, s) => sum + s.upvotes, 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Points Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Coins className="w-5 h-5 text-green-500" />
                    Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Points</span>
                      <span className="font-semibold text-green-600">{user.points.toLocaleString()} pts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">From Suggestions</span>
                      <span className="font-semibold">
                        {pointHistory.filter(p => p.reason === 'suggestion_created').reduce((sum, p) => sum + p.amount, 0)} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">From Approvals</span>
                      <span className="font-semibold">
                        {pointHistory.filter(p => p.reason === 'suggestion_approved' || p.reason === 'suggestion_applied').reduce((sum, p) => sum + p.amount, 0)} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">From ROI Bonuses</span>
                      <span className="font-semibold text-emerald-600">
                        {pointHistory.filter(p => p.reason === 'roi_improvement').reduce((sum, p) => sum + p.amount, 0)} pts
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tier Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    Tier Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <TierBadge tier={user.tier} size="lg" showLabel />
                  </div>
                  {nextTierKey && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress to {TIER_CONFIG[nextTierKey].label}</span>
                        <span className="font-medium">{progressToNextTier.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressToNextTier}%` }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {nextTierMin - user.points} points to {TIER_CONFIG[nextTierKey].label}
                      </p>
                    </div>
                  )}
                  {!nextTierKey && (
                    <p className="text-center text-sm text-gray-500">
                      You've reached the highest tier!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pointHistory.length > 0 ? (
                  <div className="space-y-3">
                    {pointHistory.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0">
                        <div>
                          <p className="font-medium">{REASON_LABELS[item.reason] || item.reason}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.amount >= 0 ? '+' : ''}{item.amount} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No activity yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Suggestions</h2>
              <Link href="/community">
                <Button>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  New Suggestion
                </Button>
              </Link>
            </div>

            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 border dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {SECTION_LABELS[suggestion.section]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.model_name}
                      </span>
                    </div>
                    <ClaudeReviewBadge status={suggestion.status} size="sm" />
                  </div>

                  <p className="text-gray-800 dark:text-gray-200 mb-2">{suggestion.content}</p>

                  {suggestion.expected_effect && (
                    <p className="text-sm text-gray-500 mb-3">
                      Expected: {suggestion.expected_effect}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        {suggestion.upvotes} votes
                      </span>
                      <span className="text-gray-500">
                        {formatDate(suggestion.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 mb-4">You haven't submitted any suggestions yet</p>
                <Link href="/community">
                  <Button>Submit Your First Suggestion</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <RewardSummary
              totalEarned={user.points}
              pendingVerification={user.pending_rewards}
              confirmed={user.points - user.pending_rewards}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Approved Contributions</h3>
              {rewards.length > 0 ? (
                rewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    suggestionTitle={reward.suggestion_title}
                    modelName={reward.model_name}
                    roiBefore={reward.roi_before}
                    roiAfter={reward.roi_after}
                    improvementPct={reward.improvement_pct}
                    rewardPoints={reward.reward_points}
                    status={reward.status}
                    createdAt={reward.created_at}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">No approved contributions yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  Points Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {user.points.toLocaleString()}
                  </div>
                  <p className="text-gray-500">Total Points</p>
                </div>

                {/* Points earning info */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">How to earn points:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">+{POINT_VALUES.SUGGESTION_CREATED}</span>
                      <span className="text-gray-600 dark:text-gray-400">Create suggestion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">+{POINT_VALUES.VOTE_RECEIVED}</span>
                      <span className="text-gray-600 dark:text-gray-400">Per vote received</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">+{POINT_VALUES.SUGGESTION_APPROVED}</span>
                      <span className="text-gray-600 dark:text-gray-400">Suggestion approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">+{POINT_VALUES.SUGGESTION_APPLIED}</span>
                      <span className="text-gray-600 dark:text-gray-400">Applied to production</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Points History</CardTitle>
              </CardHeader>
              <CardContent>
                {pointHistory.length > 0 ? (
                  <div className="space-y-3">
                    {pointHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0">
                        <div>
                          <p className="font-medium">{REASON_LABELS[item.reason] || item.reason}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        <span className={`font-semibold ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.amount >= 0 ? '+' : ''}{item.amount} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No points history yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
