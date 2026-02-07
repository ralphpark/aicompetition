'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Star, Zap, TrendingUp } from 'lucide-react'

// Level definitions
export const LEVELS = [
  { level: 1, title: 'Rookie', minXP: 0, icon: '🌱', color: 'from-gray-400 to-gray-500' },
  { level: 2, title: 'Observer', minXP: 100, icon: '👀', color: 'from-green-400 to-green-500' },
  { level: 3, title: 'Enthusiast', minXP: 300, icon: '🎯', color: 'from-blue-400 to-blue-500' },
  { level: 4, title: 'Analyst', minXP: 600, icon: '📊', color: 'from-purple-400 to-purple-500' },
  { level: 5, title: 'Strategist', minXP: 1000, icon: '🧠', color: 'from-indigo-400 to-indigo-500' },
  { level: 6, title: 'Expert', minXP: 1500, icon: '💎', color: 'from-cyan-400 to-cyan-500' },
  { level: 7, title: 'Master', minXP: 2500, icon: '🏆', color: 'from-yellow-400 to-orange-500' },
  { level: 8, title: 'Grandmaster', minXP: 4000, icon: '👑', color: 'from-orange-400 to-red-500' },
  { level: 9, title: 'Legend', minXP: 6000, icon: '🌟', color: 'from-pink-400 to-purple-500' },
  { level: 10, title: 'Arena Champion', minXP: 10000, icon: '🔱', color: 'from-yellow-300 via-yellow-500 to-yellow-600' },
]

// XP actions
export const XP_ACTIONS = {
  daily_visit: { xp: 10, label: 'Daily Visit' },
  suggestion: { xp: 50, label: 'Submit Suggestion' },
  suggestion_upvoted: { xp: 10, label: 'Suggestion Upvoted' },
  suggestion_implemented: { xp: 200, label: 'Suggestion Implemented' },
  vote: { xp: 5, label: 'Vote on Suggestion' },
  prediction_correct: { xp: 100, label: 'Correct Prediction' },
  streak_7: { xp: 100, label: '7-Day Streak' },
  streak_30: { xp: 500, label: '30-Day Streak' },
  referral: { xp: 200, label: 'Referral' },
}

export function getLevelForXP(xp: number) {
  let currentLevel = LEVELS[0]
  for (const level of LEVELS) {
    if (xp >= level.minXP) {
      currentLevel = level
    } else {
      break
    }
  }
  return currentLevel
}

export function getNextLevel(currentLevel: number) {
  return LEVELS.find(l => l.level === currentLevel + 1) || null
}

export function getXPProgress(xp: number) {
  const currentLevel = getLevelForXP(xp)
  const nextLevel = getNextLevel(currentLevel.level)

  if (!nextLevel) return 100 // Max level

  const currentLevelXP = xp - currentLevel.minXP
  const xpNeeded = nextLevel.minXP - currentLevel.minXP

  return Math.min((currentLevelXP / xpNeeded) * 100, 100)
}

// User level badge component
interface UserLevelBadgeProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showXP?: boolean
}

export function UserLevelBadge({ xp, size = 'md', showXP = false }: UserLevelBadgeProps) {
  const level = getLevelForXP(xp)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full font-medium",
      `bg-gradient-to-r ${level.color} text-white`,
      sizeClasses[size]
    )}>
      <span>{level.icon}</span>
      <span>{level.title}</span>
      {showXP && (
        <span className="opacity-75 ml-1">
          ({xp.toLocaleString()} XP)
        </span>
      )}
    </div>
  )
}

// User level card with progress
interface UserLevelCardProps {
  xp: number
  username?: string
  avatar?: string
}

export function UserLevelCard({ xp, username, avatar }: UserLevelCardProps) {
  const level = getLevelForXP(xp)
  const nextLevel = getNextLevel(level.level)
  const progress = getXPProgress(xp)
  const xpToNext = nextLevel ? nextLevel.minXP - xp : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center text-3xl",
          `bg-gradient-to-br ${level.color}`
        )}>
          {avatar || level.icon}
        </div>

        <div className="flex-1">
          {username && (
            <h3 className="font-bold text-lg">{username}</h3>
          )}
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold text-white",
              `bg-gradient-to-r ${level.color}`
            )}>
              Lv.{level.level}
            </span>
            <span className="font-medium">{level.title}</span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Experience</span>
          <span className="font-mono font-bold">{xp.toLocaleString()} XP</span>
        </div>

        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              `bg-gradient-to-r ${level.color}`
            )}
          />
        </div>

        {nextLevel && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>{level.title}</span>
            <span>{xpToNext.toLocaleString()} XP to {nextLevel.title}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
          <div className="text-xs text-gray-500">Level</div>
          <div className="font-bold">{level.level}</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Zap className="w-4 h-4 mx-auto mb-1 text-blue-500" />
          <div className="text-xs text-gray-500">Total XP</div>
          <div className="font-bold">{xp.toLocaleString()}</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
          <div className="text-xs text-gray-500">Progress</div>
          <div className="font-bold">{progress.toFixed(0)}%</div>
        </div>
      </div>
    </motion.div>
  )
}

// XP gain notification
interface XPGainProps {
  amount: number
  reason: string
  onComplete?: () => void
}

export function XPGainNotification({ amount, reason, onComplete }: XPGainProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      onAnimationComplete={onComplete}
      className="fixed bottom-20 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Zap className="w-6 h-6 text-yellow-300" />
        </motion.div>
        <div>
          <div className="font-bold text-lg">+{amount} XP</div>
          <div className="text-sm text-white/80">{reason}</div>
        </div>
      </div>
    </motion.div>
  )
}

// Level up celebration
interface LevelUpProps {
  newLevel: typeof LEVELS[number]
  onClose: () => void
}

export function LevelUpCelebration({ newLevel, onClose }: LevelUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, rotate: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
          className="text-6xl mb-4"
        >
          {newLevel.icon}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
        <div className={cn(
          "inline-block px-4 py-2 rounded-full text-white font-bold mb-4",
          `bg-gradient-to-r ${newLevel.color}`
        )}>
          Level {newLevel.level}: {newLevel.title}
        </div>

        <p className="text-gray-500 mb-6">
          You've reached a new milestone! Keep up the great work!
        </p>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full font-medium hover:from-green-500 hover:to-green-600 transition-all"
        >
          Awesome!
        </button>

        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                x: '50%',
                y: '50%',
              }}
              animate={{
                opacity: 0,
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 2, delay: i * 0.03 }}
              className="absolute w-3 h-3"
              style={{
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
