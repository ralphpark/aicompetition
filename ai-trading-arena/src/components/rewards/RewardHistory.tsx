'use client'

import { motion } from 'framer-motion'
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, ChevronRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { RewardStatus } from '@/types/database'

interface RewardHistoryItem {
  id: string
  suggestionTitle: string
  modelName: string
  improvementPct: number
  rewardAmount: number
  status: RewardStatus
  createdAt: string
}

interface RewardHistoryProps {
  rewards: RewardHistoryItem[]
  className?: string
  onItemClick?: (id: string) => void
}

const statusConfig: Record<RewardStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  verified: {
    label: 'Verified',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  paid: {
    label: 'Paid',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
}

export function RewardHistory({ rewards, className, onItemClick }: RewardHistoryProps) {
  if (rewards.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No reward history yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Submit suggestions in the community and earn rewards when approved
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {rewards.map((reward, index) => {
        const config = statusConfig[reward.status]

        return (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onItemClick?.(reward.id)}
            className={cn(
              'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4',
              'hover:shadow-md transition-shadow',
              onItemClick && 'cursor-pointer'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {reward.suggestionTitle}
                  </h4>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.color)}>
                    {config.icon}
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Model: {reward.modelName}</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{reward.improvementPct.toFixed(1)}%
                  </span>
                  <span>{formatDate(reward.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                    <DollarSign className="w-4 h-4" />
                    {reward.rewardAmount.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">Reward</div>
                </div>
                {onItemClick && (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
