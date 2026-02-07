'use client'

import { motion } from 'framer-motion'
import { Coins, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { RewardStatus } from '@/types/database'

interface RewardCardProps {
  suggestionTitle: string
  modelName: string
  roiBefore: number | null
  roiAfter: number | null
  improvementPct: number | null
  rewardPoints: number
  status: RewardStatus
  isMeasuring?: boolean
  measureProgress?: { current: number; target: number } | null
  createdAt: string
}

const statusConfig: Record<RewardStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    icon: <Clock className="w-4 h-4" />,
  },
  verified: {
    label: 'Approved',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  paid: {
    label: 'Paid',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="w-4 h-4" />,
  },
}

function formatRoi(value: number | null): { text: string; color: string } {
  if (value == null) return { text: '--', color: 'text-gray-400' }
  return {
    text: `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
    color: value >= 0 ? 'text-green-600' : 'text-red-600',
  }
}

export function RewardCard({
  suggestionTitle,
  modelName,
  roiBefore,
  roiAfter,
  improvementPct,
  rewardPoints,
  status,
  isMeasuring,
  measureProgress,
  createdAt,
}: RewardCardProps) {
  const config = statusConfig[status]
  const before = formatRoi(roiBefore)
  const after = formatRoi(roiAfter)
  const hasImprovement = improvementPct != null && improvementPct !== 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
              "{suggestionTitle}"
            </h3>
            <p className="text-sm text-gray-500">
              Model: {modelName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
              {config.icon}
              {config.label}
            </span>
            {isMeasuring && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 animate-pulse">
                <BarChart3 className="w-3 h-3" />
                Measuring {measureProgress ? `${measureProgress.current}/${measureProgress.target}` : '0/50'} trades
              </span>
            )}
          </div>
        </div>

        {roiBefore != null ? (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">ROI Before</p>
              <p className={cn('font-semibold', before.color)}>{before.text}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">ROI After</p>
              <p className={cn('font-semibold', after.color)}>{after.text}</p>
            </div>
            <div className={cn('text-center p-2 rounded-lg', hasImprovement && improvementPct! > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50')}>
              <p className="text-xs text-gray-500 mb-1">Improvement</p>
              {improvementPct != null ? (
                <p className={cn('font-semibold flex items-center justify-center gap-1', improvementPct > 0 ? 'text-green-600' : improvementPct < 0 ? 'text-red-600' : 'text-gray-500')}>
                  {improvementPct > 0 ? <TrendingUp className="w-4 h-4" /> : improvementPct < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                  {improvementPct > 0 ? '+' : ''}{improvementPct.toFixed(2)}%
                </p>
              ) : (
                <p className="font-semibold text-gray-400">--</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center text-sm text-gray-500">
            {isMeasuring
              ? `ROI measurement in progress (${measureProgress ? `${measureProgress.current}/${measureProgress.target}` : '0/50'} trades)`
              : 'No ROI data available'}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
          <span className="text-xs text-gray-500">
            {formatDate(createdAt)}
          </span>
          <div className="flex items-center gap-1 text-lg font-bold text-green-600">
            <Coins className="w-5 h-5" />
            {rewardPoints.toLocaleString()} pts
          </div>
        </div>
      </div>
    </motion.div>
  )
}
