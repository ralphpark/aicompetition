'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RacerCharacterProps {
  emoji: string
  name: string
  color: string
  isMoving?: boolean
  hasJustTraded?: boolean
  isOvertaking?: boolean
  isPitStop?: boolean
  rank: number
  previousRank?: number
  mood?: 'happy' | 'sad' | 'neutral' | 'excited'
}

export function RacerCharacter({
  emoji,
  name,
  color,
  isMoving = false,
  hasJustTraded = false,
  isOvertaking = false,
  isPitStop = false,
  rank,
  previousRank,
  mood = 'neutral',
}: RacerCharacterProps) {
  const rankChange = previousRank ? previousRank - rank : 0
  const isRankingUp = rankChange > 0
  const isRankingDown = rankChange < 0

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isOvertaking ? [1, 1.2, 1] : 1,
        rotate: isMoving ? [0, -5, 5, 0] : 0,
      }}
      transition={{
        duration: isOvertaking ? 0.5 : 0.3,
        repeat: isMoving ? Infinity : 0,
        repeatType: 'reverse',
      }}
    >
      {/* Speed boost effect */}
      <AnimatePresence>
        {hasJustTraded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute -inset-2 z-0"
          >
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full animate-ping" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2">
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: [0, 1, 0], x: [-10, -20, -30] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-orange-500 text-lg"
              >
                🔥
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overtaking effect */}
      <AnimatePresence>
        {isOvertaking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
          >
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              🚀 OVERTAKE!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pit stop indicator */}
      <AnimatePresence>
        {isPitStop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2"
          >
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="animate-pulse">🔧</span> PIT
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rank change indicator */}
      <AnimatePresence>
        {rankChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: isRankingUp ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute -right-6 top-0 text-xs font-bold",
              isRankingUp ? "text-green-500" : "text-red-500"
            )}
          >
            {isRankingUp ? `↑${rankChange}` : `↓${Math.abs(rankChange)}`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main character */}
      <motion.div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-2xl relative",
          "bg-white dark:bg-gray-800 shadow-lg border-2",
          color
        )}
        style={{ borderColor: color.includes('text-') ? undefined : color }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Character emoji */}
        <span className={cn(
          "transition-transform",
          mood === 'happy' && "animate-bounce",
          mood === 'sad' && "opacity-70",
          mood === 'excited' && "animate-pulse"
        )}>
          {emoji}
        </span>

        {/* Mood indicator */}
        <AnimatePresence>
          {mood !== 'neutral' && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-1 -right-1 text-sm"
            >
              {mood === 'happy' && '😊'}
              {mood === 'sad' && '😢'}
              {mood === 'excited' && '🤩'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Name tag */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {name}
        </span>
      </div>
    </motion.div>
  )
}

// Speech bubble for character reactions
interface SpeechBubbleProps {
  message: string
  type?: 'normal' | 'excited' | 'warning'
}

export function SpeechBubble({ message, type = 'normal' }: SpeechBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: -10 }}
      className={cn(
        "absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-xs whitespace-nowrap z-20",
        "before:absolute before:top-full before:left-1/2 before:-translate-x-1/2",
        "before:border-4 before:border-transparent",
        type === 'normal' && "bg-white dark:bg-gray-700 shadow-md before:border-t-white dark:before:border-t-gray-700",
        type === 'excited' && "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 before:border-t-yellow-100 dark:before:border-t-yellow-900",
        type === 'warning' && "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 before:border-t-red-100 dark:before:border-t-red-900"
      )}
    >
      {message}
    </motion.div>
  )
}
