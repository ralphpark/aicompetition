'use client'

import { cn } from '@/lib/utils'
import type { UserTier } from '@/types/database'
import { TIER_CONFIG } from '@/types/database'

interface TierBadgeProps {
  tier: UserTier
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const tierEmojis: Record<UserTier, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💠',
  master: '👑',
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function TierBadge({ tier, showLabel = true, size = 'sm', className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <span>{tierEmojis[tier]}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  )
}
