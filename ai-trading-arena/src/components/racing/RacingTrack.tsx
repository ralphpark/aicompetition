'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeLeaderboard } from '@/hooks/useRealtimeLeaderboard'
import { getModelByName, PROVIDER_COLORS } from '@/lib/constants/models'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function getRankMedal(rank: number): string {
  const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
  return medals[rank] || `#${rank}`
}

function calculateProgress(roi: number): number {
  // Map ROI to progress (0-100%)
  // Assume range of -20% to +20% for visualization
  const minRoi = -20
  const maxRoi = 20
  const clamped = Math.max(minRoi, Math.min(maxRoi, roi))
  return ((clamped - minRoi) / (maxRoi - minRoi)) * 100
}

function RacingTrackSkeleton() {
  return (
    <div className="w-full bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-12 h-8" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RacingTrack() {
  const { leaderboard, isLoading } = useRealtimeLeaderboard()

  if (isLoading) return <RacingTrackSkeleton />

  return (
    <div className="w-full bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-3xl">🏁</span>
        <span>AI TRADING ARENA - LIVE RACE</span>
      </h2>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {leaderboard.map((entry) => {
            const character = getModelByName(entry.name)
            const progressPercent = calculateProgress(entry.roi_percent)
            const providerColor = PROVIDER_COLORS[entry.provider] || 'bg-gray-500'

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/models/${entry.id}`}
                  className="flex items-center gap-4 bg-white/50 dark:bg-black/20 rounded-lg p-3 hover:bg-white/80 dark:hover:bg-black/40 transition-colors cursor-pointer"
                >
                {/* Rank */}
                <div className="w-12 text-center font-mono font-bold text-lg">
                  {getRankMedal(entry.rank)}
                </div>

                {/* Character */}
                <div className="text-3xl">{character?.emoji || '🤖'}</div>

                {/* Progress Bar */}
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{entry.name}</span>
                    <span className={cn(
                      "font-mono font-bold",
                      entry.roi_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {entry.roi_percent >= 0 ? '+' : ''}{entry.roi_percent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", providerColor)}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>${entry.current_balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    <span>{entry.total_trades} trades • {entry.win_rate.toFixed(0)}% win</span>
                  </div>
                </div>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
