import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { HallOfFameCard, HallOfFameListItem } from '@/components/community/HallOfFameCard'
import { Crown, Trophy, TrendingUp, Users, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { HallOfFameEntry, UserTier } from '@/types/database'

export const metadata = {
  title: 'Hall of Fame - AI Trading Arena',
  description: 'Community champions who improved trading system performance',
}

export default async function HallOfFamePage() {
  const supabase = await createClient()

  // Try to fetch from hall_of_fame view first
  const { data: hallOfFameData, error: viewError } = await supabase
    .from('hall_of_fame')
    .select('*')
    .limit(20)

  let entries: HallOfFameEntry[] = []

  if (hallOfFameData && hallOfFameData.length > 0) {
    // Use view data if available
    entries = hallOfFameData
  } else {
    // Fallback: Build hall of fame from user_profiles + community_suggestions
    const { data: usersWithPoints } = await supabase
      .from('user_profiles')
      .select('id, nickname, avatar_url, tier, points')
      .gt('points', 0)
      .order('points', { ascending: false })
      .limit(20)

    if (usersWithPoints) {
      entries = await Promise.all(
        usersWithPoints.map(async (user) => {
          // Get approved/applied suggestions count
          const { count: approvedCount } = await supabase
            .from('community_suggestions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', ['approved', 'applied'])

          // Get total improvement from suggestion_performance
          const { data: perfData } = await supabase
            .from('community_suggestions')
            .select(`
              suggestion_performance (improvement_pct)
            `)
            .eq('user_id', user.id)
            .eq('status', 'applied')

          let totalImprovementPct = 0
          if (perfData) {
            for (const s of perfData) {
              const perf = s.suggestion_performance as { improvement_pct: number }[] | null
              if (perf && perf.length > 0 && perf[0].improvement_pct) {
                totalImprovementPct += perf[0].improvement_pct
              }
            }
          }

          // Get last contribution date
          const { data: lastSuggestion } = await supabase
            .from('community_suggestions')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            tier: (user.tier || 'bronze') as UserTier,
            points: user.points || 0,
            approved_count: approvedCount || 0,
            total_improvement_pct: totalImprovementPct,
            total_improvement_points: Math.round(totalImprovementPct * 100),
            last_contribution: lastSuggestion?.created_at || null,
          }
        })
      )

      // Filter to only include users with approved suggestions
      entries = entries.filter(e => e.approved_count > 0)
    }
  }

  // Split into top 3 and rest
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  // Calculate totals
  const totalImprovement = entries.reduce((sum, e) => sum + e.total_improvement_pct, 0)
  const totalContributors = entries.length
  const totalSuggestions = entries.reduce((sum, e) => sum + e.approved_count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/rewards"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rewards
        </Link>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            Hall of Fame
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Community champions who improved trading system performance through their contributions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-600">+{totalImprovement.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Total Improvement</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-blue-600">{totalContributors}</p>
            <p className="text-xs text-gray-500">Contributors</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600">{totalSuggestions}</p>
            <p className="text-xs text-gray-500">Approved Suggestions</p>
          </div>
        </div>

        {entries.length === 0 ? (
          /* No entries yet */
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Champions Yet</h2>
            <p className="text-gray-500 mb-6">
              Be the first to have your suggestion approved and make it to the Hall of Fame!
            </p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              Submit a Suggestion
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Contributors
              </h2>

              {/* Podium Layout: 2nd - 1st - 3rd */}
              <div className="grid grid-cols-3 gap-4 items-end">
                {/* 2nd Place */}
                {top3[1] ? (
                  <div className="order-1">
                    <HallOfFameCard entry={top3[1]} rank={2} />
                  </div>
                ) : (
                  <div className="order-1" />
                )}

                {/* 1st Place - Elevated */}
                {top3[0] ? (
                  <div className="order-2 transform -translate-y-4">
                    <HallOfFameCard entry={top3[0]} rank={1} />
                  </div>
                ) : (
                  <div className="order-2" />
                )}

                {/* 3rd Place */}
                {top3[2] ? (
                  <div className="order-3">
                    <HallOfFameCard entry={top3[2]} rank={3} />
                  </div>
                ) : (
                  <div className="order-3" />
                )}
              </div>
            </div>

            {/* Rest of the leaderboard */}
            {rest.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Other Champions
                </h2>
                <div className="space-y-3">
                  {rest.map((entry, index) => (
                    <HallOfFameListItem key={entry.id} entry={entry} rank={index + 4} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Want to join the Hall of Fame?</h3>
            <p className="text-purple-100 text-sm mb-4">
              Submit improvement suggestions and help make our AI trading system better.
            </p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Go to Community
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
