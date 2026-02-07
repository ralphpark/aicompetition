'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Achievement, getRarityColor } from '@/lib/constants/achievements'

interface AchievementBadgeProps {
  achievement: Achievement
  isUnlocked?: boolean
  progress?: number // 0-100
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function AchievementBadge({
  achievement,
  isUnlocked = false,
  progress = 0,
  showProgress = false,
  size = 'md',
  onClick,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  }

  const rarityGlow = {
    common: '',
    uncommon: 'shadow-green-500/30',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-yellow-500/50 animate-pulse',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer group",
        onClick && "hover:z-10"
      )}
    >
      {/* Badge circle */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center relative overflow-hidden",
          "border-2 transition-all duration-300",
          sizeClasses[size],
          isUnlocked
            ? cn(getRarityColor(achievement.rarity), "shadow-lg", rarityGlow[achievement.rarity])
            : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 grayscale"
        )}
      >
        {/* Icon/Emoji */}
        <span className={cn(
          "transition-all",
          !isUnlocked && "opacity-30"
        )}>
          {achievement.icon}
        </span>

        {/* Lock overlay for locked achievements */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
        )}

        {/* Progress ring */}
        {showProgress && !isUnlocked && progress > 0 && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-green-500/30"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${progress * 2.89} 289`}
              className="text-green-500"
            />
          </svg>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className={cn(
        "absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg",
        "bg-gray-900 text-white text-xs whitespace-nowrap",
        "opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20",
        "before:absolute before:top-full before:left-1/2 before:-translate-x-1/2",
        "before:border-4 before:border-transparent before:border-t-gray-900"
      )}>
        <p className="font-bold">{achievement.name}</p>
        <p className="text-gray-300">{achievement.description}</p>
        <p className="text-yellow-400 mt-1">+{achievement.points} pts</p>
      </div>
    </motion.div>
  )
}

// Achievement unlock notification
interface AchievementUnlockProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementUnlock({ achievement, onClose }: AchievementUnlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className={cn(
        "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-1 rounded-xl shadow-2xl",
        "shadow-yellow-500/30"
      )}>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-4xl"
          >
            {achievement.icon}
          </motion.div>
          <div>
            <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider">
              Achievement Unlocked!
            </p>
            <h3 className="font-bold text-lg">{achievement.name}</h3>
            <p className="text-sm text-gray-500">{achievement.description}</p>
            <p className="text-yellow-600 font-bold text-sm mt-1">
              +{achievement.points} points
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              x: '50%',
              y: '50%',
            }}
            animate={{
              opacity: 0,
              x: `${Math.random() * 200 - 50}%`,
              y: `${Math.random() * -200}%`,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1, delay: i * 0.05 }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Achievement grid display
interface AchievementGridProps {
  achievements: Achievement[]
  unlockedIds: string[]
  progressMap?: Record<string, number>
}

export function AchievementGrid({ achievements, unlockedIds, progressMap = {} }: AchievementGridProps) {
  const groupedByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = []
    }
    acc[achievement.category].push(achievement)
    return acc
  }, {} as Record<string, Achievement[]>)

  const categoryLabels = {
    participation: '🎮 Participation',
    contribution: '💡 Contribution',
    streak: '🔥 Streaks',
    special: '⭐ Special',
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCategory).map(([category, categoryAchievements]) => (
        <div key={category}>
          <h3 className="text-lg font-bold mb-3">
            {categoryLabels[category as keyof typeof categoryLabels] || category}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {categoryAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                isUnlocked={unlockedIds.includes(achievement.id)}
                progress={progressMap[achievement.id] || 0}
                showProgress
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
