import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { RewardCard, RewardSummary, TierBenefits } from '@/components/rewards'
import { ContributorLeaderboard } from '@/components/community/ContributorLeaderboard'
import {
  Trophy,
  TrendingUp,
  Coins,
  Users,
  Calculator,
  HelpCircle,
  CheckCircle,
  Crown,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import type { ContributorLeaderboardEntry, RewardStatus, SuggestionStatus } from '@/types/database'

export const metadata = {
  title: 'Rewards - PnL Grand Prix',
  description: 'Track your rewards and system improvement metrics'
}

export default async function RewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ============================================
  // 1. Fetch System Stats (Real Data)
  // ============================================
  const { data: appliedSuggestions } = await supabase
    .from('community_suggestions')
    .select('id')
    .eq('status', 'applied')

  const { data: performanceData } = await supabase
    .from('suggestion_performance')
    .select('improvement_pct')
    .gt('improvement_pct', 0)

  const { data: totalPointsData } = await supabase
    .from('point_transactions')
    .select('amount')

  const systemStats = {
    totalSuggestionsApplied: appliedSuggestions?.length || 0,
    avgRoiImprovement: performanceData && performanceData.length > 0
      ? (performanceData.reduce((sum, p) => sum + (p.improvement_pct || 0), 0) / performanceData.length).toFixed(1)
      : '0.0',
    avgWinRateImprovement: 0, // Would need separate tracking
    totalPointsDistributed: totalPointsData?.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0) || 0,
  }

  // ============================================
  // 2. Fetch Top Contributors (Real Data)
  // ============================================
  const { data: topContributorsData } = await supabase
    .from('user_profiles')
    .select(`
      id,
      nickname,
      avatar_url,
      points,
      tier,
      total_rewards
    `)
    .gt('points', 0)
    .order('points', { ascending: false })
    .limit(5)

  // Get approved suggestions count for each contributor
  const topContributors: ContributorLeaderboardEntry[] = await Promise.all(
    (topContributorsData || []).map(async (user) => {
      const { count: approvedCount } = await supabase
        .from('community_suggestions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['approved', 'applied'])

      const { data: improvementData } = await supabase
        .from('community_suggestions')
        .select('suggestion_performance(improvement_pct)')
        .eq('user_id', user.id)
        .eq('status', 'applied')

      const totalImprovement = improvementData?.reduce((sum, s) => {
        const perf = s.suggestion_performance as { improvement_pct: number }[] | null
        if (perf && perf.length > 0) {
          return sum + (perf[0].improvement_pct || 0)
        }
        return sum
      }, 0) || 0

      return {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        points: user.points || 0,
        tier: user.tier || 'bronze',
        total_rewards: user.total_rewards || 0,
        approved_suggestions: approvedCount || 0,
        total_improvement: totalImprovement,
      }
    })
  )

  // ============================================
  // 3. Fetch User Data (if logged in)
  // ============================================
  let userProfile = null
  let userRewardsSummary = null
  let userContributions: {
    suggestionTitle: string
    modelName: string
    roiBefore: number | null
    roiAfter: number | null
    improvementPct: number | null
    rewardPoints: number
    status: RewardStatus
    isMeasuring: boolean
    measureProgress: { current: number; target: number } | null
    createdAt: string
  }[] = []

  if (user) {
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    userProfile = profile

    // Get point transactions for breakdown
    const { data: transactions } = await supabase
      .from('point_transactions')
      .select('amount, reason')
      .eq('user_id', user.id)

    const totalEarned = transactions?.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0) || 0
    const pendingPoints = profile?.pending_rewards || 0
    const confirmedPoints = profile?.points || 0

    userRewardsSummary = {
      totalEarned,
      pendingVerification: pendingPoints,
      confirmed: confirmedPoints,
    }

    // Get user's contributions with performance data
    const { data: suggestions } = await supabase
      .from('community_suggestions')
      .select(`
        id,
        content,
        status,
        created_at,
        model_id,
        ai_models:model_id (name)
      `)
      .eq('user_id', user.id)
      .in('status', ['approved', 'applied', 'testing'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (suggestions) {
      userContributions = await Promise.all(
        suggestions.map(async (s) => {
          // Get performance data for this suggestion
          const { data: perfData } = await supabase
            .from('suggestion_performance')
            .select('roi_before, roi_after, improvement_pct, status, model_id, trades_before')
            .eq('suggestion_id', s.id)
            .maybeSingle()

          const isMeasuring = perfData?.status === 'measuring'

          // Get current trade progress if measuring
          let measureProgress: { current: number; target: number } | null = null
          if (isMeasuring && perfData?.model_id) {
            const { data: portfolio } = await supabase
              .from('virtual_portfolios')
              .select('total_trades')
              .eq('model_id', perfData.model_id)
              .maybeSingle()
            if (portfolio) {
              measureProgress = {
                current: Math.max(0, portfolio.total_trades - (perfData.trades_before || 0)),
                target: 50
              }
            }
          }

          // Get points awarded for this suggestion
          const { data: pointsData } = await supabase
            .from('point_transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('reference_id', s.id)

          const totalPoints = pointsData?.reduce((sum, p) => sum + p.amount, 0) || 0
          const aiModel = s.ai_models as { name: string } | { name: string }[] | null
          const modelName = Array.isArray(aiModel) ? aiModel[0]?.name : aiModel?.name

          // Determine reward status based on suggestion + performance status
          let rewardStatus: RewardStatus = 'pending'
          if (s.status === 'rejected') {
            rewardStatus = 'rejected'
          } else if (s.status === 'applied' && perfData?.status === 'completed' && perfData.improvement_pct > 0) {
            rewardStatus = 'paid'
          } else if (s.status === 'applied') {
            rewardStatus = 'verified'
          } else if (s.status === 'approved') {
            rewardStatus = 'verified'
          }

          return {
            suggestionTitle: s.content.substring(0, 60) + (s.content.length > 60 ? '...' : ''),
            modelName: modelName || 'General',
            roiBefore: perfData?.roi_before ?? null,
            roiAfter: isMeasuring ? null : (perfData?.roi_after ?? null),
            improvementPct: isMeasuring ? null : (perfData?.improvement_pct ?? null),
            rewardPoints: totalPoints,
            status: rewardStatus,
            isMeasuring,
            measureProgress,
            createdAt: new Date(s.created_at).toLocaleDateString(),
          }
        })
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-green-500" />
            Points & Impact
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track system improvements and earn points for successful contributions
          </p>
        </div>

        {/* System Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-xl font-bold">System Improvement Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{systemStats.totalSuggestionsApplied}</p>
              <p className="text-sm text-blue-100">Suggestions Applied</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">+{systemStats.avgRoiImprovement}%</p>
              <p className="text-sm text-blue-100">Avg ROI Improvement</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">+{systemStats.avgWinRateImprovement}%</p>
              <p className="text-sm text-blue-100">Avg Win Rate Improvement</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold">{systemStats.totalPointsDistributed.toLocaleString()} pts</p>
              <p className="text-sm text-blue-100">Total Points Distributed</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Rewards (if logged in) */}
            {user && userRewardsSummary ? (
              <>
                <RewardSummary
                  totalEarned={userRewardsSummary.totalEarned}
                  pendingVerification={userRewardsSummary.pendingVerification}
                  confirmed={userRewardsSummary.confirmed}
                />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    My Contributions
                  </h3>
                  {userContributions.length > 0 ? (
                    <div className="space-y-4">
                      {userContributions.map((reward, index) => (
                        <RewardCard key={index} {...reward} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500">No approved contributions yet</p>
                      <Link
                        href="/community"
                        className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                      >
                        Submit your first suggestion →
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                <Coins className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Sign in to track your points</h3>
                <p className="text-gray-500 mb-4">
                  Submit suggestions, get them approved, and earn points based on performance improvements
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Sign In to Get Started
                </Link>
              </div>
            )}

            {/* Point Calculation Explanation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                How Points Are Earned
              </h3>

              <div className="space-y-4">
                {/* Point Tiers */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Point Earning Steps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <span>1. Submit Suggestion</span>
                      <span className="font-bold text-green-600">+10 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <span>2. Receive Upvote</span>
                      <span className="font-bold text-green-600">+2 pts per vote</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <span>3. Admin Approves</span>
                      <span className="font-bold text-green-600">+50 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <span>4. Applied to Production</span>
                      <span className="font-bold text-green-600">+100 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-200 dark:border-emerald-800">
                      <span>5. ROI Improvement</span>
                      <span className="font-bold text-emerald-600">% x 100 pts</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Example 1
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your suggestion improves ROI by 2%
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      ROI Bonus: +200 pts
                    </p>
                  </div>
                  <div className="p-4 border dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Example 2
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your suggestion improves ROI by 5%
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      ROI Bonus: +500 pts
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-2">
                  <p className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Measurement:</strong> ROI is automatically measured after 50 trades from the point of application
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Auto-award:</strong> If ROI improves, bonus points are automatically awarded (improvement % x 100)
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Fair & Transparent:</strong> Same 50-trade measurement window for all suggestions
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tier Benefits */}
            <TierBenefits
              currentTier={userProfile?.tier || 'bronze'}
              currentPoints={userProfile?.points || 0}
            />

            {/* Top Contributors by Rewards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <h3 className="font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Earners
                </h3>
              </div>
              {topContributors.length > 0 ? (
                <ContributorLeaderboard contributors={topContributors} showRewards />
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No contributors yet. Be the first!
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Ready to Contribute?</h3>
              <p className="text-sm text-purple-100 mb-4">
                Share your ideas for improving AI trading strategies and earn rewards for successful implementations.
              </p>
              <Link
                href="/community"
                className="inline-flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                Go to Community
              </Link>
            </div>

            {/* Hall of Fame CTA */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Hall of Fame
              </h3>
              <p className="text-sm text-amber-100 mb-3">
                Top contributors who improved system performance
              </p>
              <Link
                href="/hall-of-fame"
                className="inline-flex items-center gap-2 bg-white text-amber-700 px-4 py-2 rounded-lg font-medium hover:bg-amber-50 transition-colors text-sm"
              >
                <Trophy className="w-4 h-4" />
                View Champions
              </Link>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/community" className="text-blue-600 hover:underline">
                    Submit a Suggestion
                  </Link>
                </li>
                <li>
                  <Link href="/hall-of-fame" className="text-blue-600 hover:underline">
                    Hall of Fame
                  </Link>
                </li>
                <li>
                  <Link href="/transparency" className="text-blue-600 hover:underline">
                    View Current Prompts
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="text-blue-600 hover:underline">
                    Model Performance
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-blue-600 hover:underline">
                    Latest Updates
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
