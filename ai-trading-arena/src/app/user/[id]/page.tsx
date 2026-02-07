import { Header } from '@/components/layout/Header'
import { TierBadge } from '@/components/community/TierBadge'
import { ClaudeReviewBadge } from '@/components/community/ClaudeReviewBadge'
import { TIER_CONFIG, SECTION_LABELS } from '@/types/database'
import type { UserTier, SuggestionStatus, SuggestionSection } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy,
  ThumbsUp,
  Lightbulb,
  DollarSign,
  Calendar,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'

// Mock users data - in production, this would come from Supabase
const MOCK_USERS: Record<string, {
  id: string
  nickname: string
  avatar_url: string | null
  points: number
  tier: UserTier
  total_rewards: number
  created_at: string
  suggestions: {
    id: string
    section: SuggestionSection
    content: string
    upvotes: number
    status: SuggestionStatus
    created_at: string
    model_name: string
  }[]
  stats: {
    totalSuggestions: number
    approvedSuggestions: number
    totalUpvotes: number
    avgImprovement: number
  }
}> = {
  'user-123': {
    id: 'user-123',
    nickname: 'CryptoEnthusiast',
    avatar_url: null,
    points: 2450,
    tier: 'gold',
    total_rewards: 125.00,
    created_at: '2024-01-15',
    suggestions: [
      {
        id: '1',
        section: 'market_analysis',
        content: 'Add volume divergence analysis to detect potential trend reversals earlier.',
        upvotes: 24,
        status: 'approved',
        created_at: '2024-01-20',
        model_name: 'All Models',
      },
      {
        id: '2',
        section: 'risk_management',
        content: 'Implement dynamic stop-loss based on ATR multiplier instead of fixed percentage.',
        upvotes: 18,
        status: 'testing',
        created_at: '2024-01-25',
        model_name: 'Claude-Sonnet',
      },
    ],
    stats: {
      totalSuggestions: 3,
      approvedSuggestions: 1,
      totalUpvotes: 54,
      avgImprovement: 5.35,
    }
  },
  'user-456': {
    id: 'user-456',
    nickname: 'AITrader99',
    avatar_url: null,
    points: 5200,
    tier: 'platinum',
    total_rewards: 320.00,
    created_at: '2024-01-01',
    suggestions: [
      {
        id: '1',
        section: 'psychology_pressure',
        content: 'Add competitor awareness section showing what other models decided in the last round.',
        upvotes: 45,
        status: 'approved',
        created_at: '2024-01-10',
        model_name: 'All Models',
      },
      {
        id: '2',
        section: 'signal_integration',
        content: 'Integrate whale wallet monitoring signals from Arkham Intelligence.',
        upvotes: 32,
        status: 'approved',
        created_at: '2024-01-18',
        model_name: 'GPT-5.2',
      },
      {
        id: '3',
        section: 'learning_feedback',
        content: 'Add pattern recognition for failed trades to avoid repeating mistakes.',
        upvotes: 28,
        status: 'testing',
        created_at: '2024-01-28',
        model_name: 'All Models',
      },
    ],
    stats: {
      totalSuggestions: 5,
      approvedSuggestions: 2,
      totalUpvotes: 105,
      avgImprovement: 6.8,
    }
  },
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const user = MOCK_USERS[params.id]
  if (!user) return { title: 'User Not Found' }

  return {
    title: `${user.nickname} - AI Trading Arena`,
    description: `View ${user.nickname}'s profile and contributions to AI Trading Arena`,
  }
}

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const user = MOCK_USERS[params.id]

  if (!user) {
    notFound()
  }

  const tierConfig = TIER_CONFIG[user.tier]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-4xl font-bold text-white shrink-0">
              {user.nickname.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{user.nickname}</h1>
                <TierBadge tier={user.tier} size="md" showLabel />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-4 h-4" />
                Member since {formatDate(user.created_at, { showYear: true })}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Points</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600">
                    ${user.total_rewards.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">Earned</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {user.stats.totalSuggestions}
                  </div>
                  <div className="text-xs text-gray-500">Suggestions</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {user.stats.totalUpvotes}
                  </div>
                  <div className="text-xs text-gray-500">Upvotes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Contribution Impact
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-green-700 dark:text-green-400">
                  {user.stats.approvedSuggestions} Approved
                </div>
                <div className="text-xs text-green-600 dark:text-green-500">
                  of {user.stats.totalSuggestions} suggestions
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-blue-700 dark:text-blue-400">
                  {user.stats.totalUpvotes} Upvotes
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-500">
                  Community support
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-purple-700 dark:text-purple-400">
                  +{user.stats.avgImprovement.toFixed(1)}% Avg
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-500">
                  Performance improvement
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Approved & Testing Suggestions
          </h2>

          {user.suggestions.filter(s => s.status === 'approved' || s.status === 'testing').length > 0 ? (
            <div className="space-y-4">
              {user.suggestions
                .filter(s => s.status === 'approved' || s.status === 'testing')
                .map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                          {SECTION_LABELS[suggestion.section]}
                        </span>
                        <span className="text-xs text-gray-500">{suggestion.model_name}</span>
                      </div>
                      <ClaudeReviewBadge status={suggestion.status} size="sm" />
                    </div>

                    <p className="text-gray-800 dark:text-gray-200 mb-3">
                      {suggestion.content}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        {suggestion.upvotes} upvotes
                      </span>
                      <span className="text-gray-500">
                        {formatDate(suggestion.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No approved or testing suggestions yet</p>
            </div>
          )}
        </div>

        {/* CTA to Community */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">
            Want to contribute like {user.nickname}?
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Join the Community
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  )
}
