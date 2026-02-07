'use client'

import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Award, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TIER_CONFIG, type UserTier } from '@/types/database'

interface HallOfFameEntry {
  id: string
  nickname: string | null
  avatar_url: string | null
  tier: UserTier
  points: number
  approved_count: number
  total_improvement_pct: number
  total_improvement_points: number
}

interface HallOfFameCardProps {
  entry: HallOfFameEntry
  rank: number
}

export function HallOfFameCard({ entry, rank }: HallOfFameCardProps) {
  const tierConfig = TIER_CONFIG[entry.tier]

  const getRankStyle = (rank: number) => {
    if (rank === 1) return {
      bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
      border: 'border-yellow-400',
      icon: '👑',
      size: 'text-4xl',
    }
    if (rank === 2) return {
      bg: 'bg-gradient-to-br from-gray-300 to-gray-400',
      border: 'border-gray-400',
      icon: '🥈',
      size: 'text-3xl',
    }
    if (rank === 3) return {
      bg: 'bg-gradient-to-br from-orange-400 to-orange-500',
      border: 'border-orange-400',
      icon: '🥉',
      size: 'text-3xl',
    }
    return {
      bg: 'bg-gray-100 dark:bg-gray-800',
      border: 'border-gray-300 dark:border-gray-600',
      icon: '',
      size: 'text-xl',
    }
  }

  const rankStyle = getRankStyle(rank)
  const isTop3 = rank <= 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={cn(
        'rounded-xl border-2 overflow-hidden',
        isTop3 ? rankStyle.border : 'border-gray-200 dark:border-gray-700',
        isTop3 ? 'shadow-lg' : ''
      )}
    >
      {/* Header with rank */}
      <div className={cn(
        'p-4 text-center',
        isTop3 ? rankStyle.bg : 'bg-gray-50 dark:bg-gray-800/50'
      )}>
        <div className="flex items-center justify-center gap-2 mb-2">
          {rankStyle.icon ? (
            <span className={rankStyle.size}>{rankStyle.icon}</span>
          ) : (
            <span className="text-gray-500 font-bold">#{rank}</span>
          )}
        </div>
        <div className="flex items-center justify-center gap-2">
          {entry.avatar_url ? (
            <img
              src={entry.avatar_url}
              alt={entry.nickname || 'User'}
              className="w-12 h-12 rounded-full border-2 border-white shadow"
            />
          ) : (
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold',
              isTop3 ? 'bg-white/30 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            )}>
              {(entry.nickname || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
        <h3 className={cn(
          'font-bold mt-2',
          isTop3 ? 'text-white' : 'text-gray-900 dark:text-white'
        )}>
          {entry.nickname || 'Anonymous'}
        </h3>
        <span className={cn(
          'inline-block text-xs px-2 py-0.5 rounded mt-1',
          tierConfig.color
        )}>
          {tierConfig.label}
        </span>
      </div>

      {/* Stats */}
      <div className="p-4 bg-white dark:bg-gray-800 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-500">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Improvement
          </span>
          <span className="font-bold text-green-600">
            +{entry.total_improvement_pct.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-500">
            <Coins className="w-4 h-4 text-amber-500" />
            Points Earned
          </span>
          <span className="font-bold text-amber-600">
            {entry.total_improvement_points.toLocaleString()} pts
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-500">
            <Award className="w-4 h-4 text-blue-500" />
            Approved
          </span>
          <span className="font-bold text-blue-600">
            {entry.approved_count} suggestions
          </span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t dark:border-gray-700">
          <span className="flex items-center gap-1 text-gray-500">
            <Trophy className="w-4 h-4 text-purple-500" />
            Total Points
          </span>
          <span className="font-bold text-purple-600">
            {entry.points.toLocaleString()} pts
          </span>
        </div>
      </div>
    </motion.div>
  )
}

interface HallOfFameListItemProps {
  entry: HallOfFameEntry
  rank: number
}

export function HallOfFameListItem({ entry, rank }: HallOfFameListItemProps) {
  const tierConfig = TIER_CONFIG[entry.tier]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (rank - 3) * 0.05 }}
      className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <span className="text-gray-500 font-bold w-8 text-center">#{rank}</span>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.avatar_url ? (
          <img
            src={entry.avatar_url}
            alt={entry.nickname || 'User'}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
            {(entry.nickname || 'U')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{entry.nickname || 'Anonymous'}</p>
          <span className={cn('text-xs px-1.5 py-0.5 rounded', tierConfig.color)}>
            {tierConfig.label}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-green-600 font-bold">+{entry.total_improvement_pct.toFixed(2)}%</p>
        <p className="text-xs text-gray-500">{entry.total_improvement_points.toLocaleString()} pts</p>
      </div>
    </motion.div>
  )
}
