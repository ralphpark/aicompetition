'use client'

import { cn } from '@/lib/utils'
import type { UserTier } from '@/types/database'
import { TIER_CONFIG } from '@/types/database'
import { TierBadge } from './TierBadge'

interface PointsDisplayProps {
  points: number
  tier: UserTier
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PointsDisplay({ points, tier, showProgress = true, size = 'md', className }: PointsDisplayProps) {
  const tiers = Object.entries(TIER_CONFIG) as [UserTier, typeof TIER_CONFIG[UserTier]][]
  const currentTierIndex = tiers.findIndex(([t]) => t === tier)
  const nextTier = tiers[currentTierIndex + 1]

  const progress = nextTier
    ? ((points - TIER_CONFIG[tier].minPoints) / (nextTier[1].minPoints - TIER_CONFIG[tier].minPoints)) * 100
    : 100

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TierBadge tier={tier} size={size} />
          <span className={cn('font-bold text-gray-900 dark:text-white', sizeClasses[size])}>
            {points.toLocaleString()} pts
          </span>
        </div>
      </div>

      {showProgress && nextTier && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{TIER_CONFIG[tier].label}</span>
            <span>{nextTier[1].label}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                tier === 'bronze' && 'bg-amber-500',
                tier === 'silver' && 'bg-gray-400',
                tier === 'gold' && 'bg-yellow-500',
                tier === 'platinum' && 'bg-cyan-500',
                tier === 'diamond' && 'bg-purple-500',
                tier === 'master' && 'bg-red-500',
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {nextTier[1].minPoints - points} pts to {nextTier[1].label}
          </div>
        </div>
      )}
    </div>
  )
}
