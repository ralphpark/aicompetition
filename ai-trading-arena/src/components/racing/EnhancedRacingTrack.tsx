'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeLeaderboard } from '@/hooks/useRealtimeLeaderboard'
import { MODEL_CHARACTERS, getModelCharacter, PROVIDER_COLORS } from '@/lib/constants/models'
import { RacerCharacter } from './RacerCharacter'
import { LiveCommentary, generateCommentary } from './LiveCommentary'
import { CheckeredFlag, MiniChampionBadge } from './CheckeredFlag'
import { cn } from '@/lib/utils'

interface EnhancedRacingTrackProps {
  showCommentary?: boolean
  showChampion?: boolean
  compact?: boolean
}

export function EnhancedRacingTrack({
  showCommentary = true,
  showChampion = true,
  compact = false,
}: EnhancedRacingTrackProps) {
  const { leaderboard, isLoading } = useRealtimeLeaderboard()
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({})
  const [commentary, setCommentary] = useState<Array<{
    id: string
    message: string
    type: 'info' | 'exciting' | 'warning' | 'milestone'
    timestamp: Date
  }>>([])
  const [recentTrades, setRecentTrades] = useState<Set<string>>(new Set())

  // Track rank changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      const currentRanks: Record<string, number> = {}
      leaderboard.forEach((entry, idx) => {
        currentRanks[entry.id] = idx + 1
      })

      // Detect overtakes
      Object.entries(currentRanks).forEach(([id, rank]) => {
        const prevRank = previousRanks[id]
        if (prevRank && prevRank > rank) {
          const model = getModelCharacter(id)
          const overtakenId = Object.entries(currentRanks).find(([, r]) => r === rank + 1)?.[0]
          const overtakenModel = overtakenId ? getModelCharacter(overtakenId) : null

          if (model && overtakenModel) {
            const newCommentary = generateCommentary('overtake', {
              modelName: model.name,
              targetModel: overtakenModel.name,
              rank,
            })
            setCommentary(prev => [...prev.slice(-10), newCommentary])
          }

          // Leader change
          if (rank === 1 && prevRank !== 1 && model) {
            const leaderCommentary = generateCommentary('leader_change', {
              modelName: model.name,
            })
            setCommentary(prev => [...prev.slice(-10), leaderCommentary])
          }
        }
      })

      setPreviousRanks(currentRanks)
    }
  }, [leaderboard])

  // Simulate recent trades (in production, this would come from realtime subscription)
  useEffect(() => {
    const interval = setInterval(() => {
      if (leaderboard.length > 0) {
        const randomModel = leaderboard[Math.floor(Math.random() * leaderboard.length)]
        if (randomModel && Math.random() > 0.7) {
          setRecentTrades(prev => new Set([...prev, randomModel.id]))
          setTimeout(() => {
            setRecentTrades(prev => {
              const next = new Set(prev)
              next.delete(randomModel.id)
              return next
            })
          }, 3000)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [leaderboard])

  const leader = leaderboard[0]
  const leaderCharacter = leader ? getModelCharacter(leader.id) : null

  const calculateProgress = (roi: number) => {
    // Normalize ROI to 0-100 scale for progress bar
    const minRoi = Math.min(...leaderboard.map(e => e.roi_percent), -10)
    const maxRoi = Math.max(...leaderboard.map(e => e.roi_percent), 10)
    const range = maxRoi - minRoi || 1
    return Math.max(5, ((roi - minRoi) / range) * 100)
  }

  const getMood = (entry: typeof leaderboard[0], rank: number): 'happy' | 'sad' | 'neutral' | 'excited' => {
    if (rank === 1) return 'excited'
    if (entry.roi_percent > 5) return 'happy'
    if (entry.roi_percent < -5) return 'sad'
    return 'neutral'
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6" />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Champion Banner */}
      {showChampion && leader && leaderCharacter && (
        <div className="flex justify-center">
          <MiniChampionBadge
            emoji={leaderCharacter.emoji}
            name={leaderCharacter.name}
            period="daily"
          />
        </div>
      )}

      {/* Main Racing Track */}
      <div className="relative bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#000_20px,#000_40px)]" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#000_20px,#000_40px)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              🏁
            </motion.span>
            <span>LIVE RACE</span>
            <span className="flex items-center gap-1 text-xs font-normal text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
          </h2>
        </div>

        {/* Race Track */}
        <div className={cn("space-y-3", compact && "space-y-2")}>
          <AnimatePresence mode="popLayout">
            {leaderboard.map((entry, index) => {
              const character = getModelCharacter(entry.id)
              const progress = calculateProgress(entry.roi_percent)
              const prevRank = previousRanks[entry.id]
              const isOvertaking = prevRank ? prevRank > index + 1 : false
              const hasRecentTrade = recentTrades.has(entry.id)
              const mood = getMood(entry, index + 1)

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-center gap-4",
                    compact && "gap-2"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-12 text-center font-mono font-bold",
                    compact && "w-8 text-sm"
                  )}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>

                  {/* Character */}
                  <div className={cn("relative", compact && "scale-75")}>
                    <RacerCharacter
                      emoji={character?.emoji || '🤖'}
                      name=""
                      color={character?.color || 'text-gray-500'}
                      isMoving={hasRecentTrade}
                      hasJustTraded={hasRecentTrade}
                      isOvertaking={isOvertaking}
                      isPitStop={entry.roi_percent === 0}
                      rank={index + 1}
                      previousRank={prevRank}
                      mood={mood}
                    />
                  </div>

                  {/* Progress Track */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className={cn(
                        "font-medium",
                        compact && "text-sm"
                      )}>
                        {character?.name || entry.name}
                      </span>
                      <span className={cn(
                        "font-mono font-bold",
                        entry.roi_percent >= 0 ? "text-green-600" : "text-red-600",
                        compact && "text-sm"
                      )}>
                        {entry.roi_percent >= 0 ? '+' : ''}{entry.roi_percent.toFixed(2)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className={cn(
                      "h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative",
                      compact && "h-3"
                    )}>
                      {/* Track markings */}
                      <div className="absolute inset-0 flex">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
                          />
                        ))}
                      </div>

                      {/* Progress */}
                      <motion.div
                        className={cn(
                          "h-full rounded-full relative",
                          PROVIDER_COLORS[entry.provider as keyof typeof PROVIDER_COLORS] || 'bg-gray-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        {/* Speed lines effect when moving */}
                        {hasRecentTrade && (
                          <div className="absolute right-0 top-0 bottom-0 w-8 overflow-hidden">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute h-0.5 bg-white/50 rounded"
                                style={{ top: `${25 + i * 25}%` }}
                                initial={{ width: 0, right: 0 }}
                                animate={{ width: 20, right: -20 }}
                                transition={{
                                  duration: 0.3,
                                  delay: i * 0.1,
                                  repeat: Infinity,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Finish line */}
        <div className="absolute right-6 top-16 bottom-6 w-1 bg-[repeating-linear-gradient(0deg,#000,#000_10px,#fff_10px,#fff_20px)] opacity-20" />
      </div>

      {/* Live Commentary */}
      {showCommentary && (
        <LiveCommentary messages={commentary} />
      )}
    </div>
  )
}
