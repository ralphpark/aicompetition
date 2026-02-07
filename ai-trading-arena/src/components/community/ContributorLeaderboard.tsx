'use client'

import { motion } from 'framer-motion'
import { TierBadge } from './TierBadge'
import { Trophy, Star, DollarSign } from 'lucide-react'
import type { ContributorLeaderboardEntry } from '@/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ContributorLeaderboardProps {
  contributors: ContributorLeaderboardEntry[]
  showRewards?: boolean
}

export function ContributorLeaderboard({ contributors, showRewards = false }: ContributorLeaderboardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Contributors
        </h3>
      </div>
      <div className="divide-y dark:divide-gray-700">
        {contributors.map((contributor, index) => (
          <motion.div
            key={contributor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Rank */}
            <div className="w-8 text-center font-bold text-lg">
              {index === 0 && <span className="text-yellow-500">🥇</span>}
              {index === 1 && <span className="text-gray-400">🥈</span>}
              {index === 2 && <span className="text-amber-600">🥉</span>}
              {index > 2 && <span className="text-gray-500">#{index + 1}</span>}
            </div>

            {/* Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src={contributor.avatar_url || undefined} />
              <AvatarFallback>
                {contributor.nickname?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  {contributor.nickname || 'Anonymous'}
                </span>
                <TierBadge tier={contributor.tier} size="sm" showLabel={false} />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {contributor.approved_suggestions} approved
                </span>
                {contributor.total_improvement > 0 && (
                  <span className="text-green-600">
                    +{contributor.total_improvement.toFixed(2)}% impact
                  </span>
                )}
              </div>
            </div>

            {/* Points or Rewards */}
            <div className="text-right">
              {showRewards ? (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  {contributor.total_rewards.toLocaleString()}
                </div>
              ) : (
                <div className="font-semibold text-gray-900 dark:text-white">
                  {contributor.points.toLocaleString()} pts
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {contributors.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No contributors yet</p>
            <p className="text-sm">Be the first to contribute!</p>
          </div>
        )}
      </div>
    </div>
  )
}
