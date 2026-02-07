'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Flame, Calendar, Gift, Target } from 'lucide-react'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  lastVisit?: Date
  todayVisited?: boolean
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastVisit,
  todayVisited = false,
}: StreakDisplayProps) {
  const streakMilestones = [7, 14, 30, 60, 90, 180, 365]
  const nextMilestone = streakMilestones.find(m => m > currentStreak) || 365

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Main streak display */}
      <div className="text-center mb-6">
        <motion.div
          animate={todayVisited ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-2xl"
          >
            🔥
          </motion.span>
          <span className="text-3xl font-bold">{currentStreak}</span>
          <span className="text-sm opacity-80">day streak</span>
        </motion.div>

        {!todayVisited && (
          <p className="text-sm text-gray-500 mt-2">
            Come back tomorrow to keep your streak!
          </p>
        )}
      </div>

      {/* Progress to next milestone */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Progress to {nextMilestone}-day milestone</span>
          <span className="font-medium">{currentStreak}/{nextMilestone}</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {nextMilestone - currentStreak} days until next milestone reward!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
          <div className="text-2xl font-bold">{longestStreak}</div>
          <div className="text-xs text-gray-500">Longest Streak</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div className="text-2xl font-bold">{currentStreak * 10}</div>
          <div className="text-xs text-gray-500">Total Streak XP</div>
        </div>
      </div>

      {/* Milestone rewards preview */}
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-purple-500" />
          Streak Rewards
        </h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {streakMilestones.map((milestone) => {
            const isAchieved = currentStreak >= milestone
            const isCurrent = milestone === nextMilestone

            return (
              <div
                key={milestone}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center border-2",
                  isAchieved
                    ? "bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-500 text-white"
                    : isCurrent
                    ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-gray-700"
                )}
              >
                <span className="text-lg">{isAchieved ? '✓' : '🎁'}</span>
                <span className="text-xs font-bold">{milestone}d</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Daily check-in button
interface CheckInButtonProps {
  hasCheckedIn: boolean
  onCheckIn: () => void
  xpReward?: number
}

export function CheckInButton({ hasCheckedIn, onCheckIn, xpReward = 10 }: CheckInButtonProps) {
  return (
    <motion.button
      whileHover={!hasCheckedIn ? { scale: 1.02 } : {}}
      whileTap={!hasCheckedIn ? { scale: 0.98 } : {}}
      onClick={() => !hasCheckedIn && onCheckIn()}
      disabled={hasCheckedIn}
      className={cn(
        "w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3",
        hasCheckedIn
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default"
          : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30"
      )}
    >
      {hasCheckedIn ? (
        <>
          <span className="text-xl">✓</span>
          <span>Checked in today!</span>
        </>
      ) : (
        <>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-xl"
          >
            🔥
          </motion.span>
          <span>Daily Check-in</span>
          <span className="text-sm opacity-80">(+{xpReward} XP)</span>
        </>
      )}
    </motion.button>
  )
}

// Weekly calendar view
interface WeeklyCalendarProps {
  checkedDays: boolean[] // 7 elements, 0 = Monday
  currentDay: number // 0-6
}

export function WeeklyCalendar({ checkedDays, currentDay }: WeeklyCalendarProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="flex gap-2 justify-center">
      {days.map((day, index) => {
        const isChecked = checkedDays[index]
        const isToday = index === currentDay
        const isFuture = index > currentDay

        return (
          <div
            key={index}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              isChecked
                ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                : isToday
                ? "border-2 border-orange-400 text-orange-500"
                : isFuture
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
            )}
          >
            {isChecked ? '✓' : day}
          </div>
        )
      })}
    </div>
  )
}

// Daily mission/challenge component
interface DailyMission {
  id: string
  title: string
  description: string
  progress: number
  target: number
  xpReward: number
  isCompleted: boolean
  icon: string
}

interface DailyMissionsProps {
  missions: DailyMission[]
  onClaimReward: (missionId: string) => void
}

export function DailyMissions({ missions, onClaimReward }: DailyMissionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold">Daily Missions</h3>
        </div>
        <span className="text-xs text-gray-500">
          Resets in 12h
        </span>
      </div>

      <div className="space-y-3">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-4 rounded-lg border-2 transition-all",
              mission.isCompleted
                ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                : "border-gray-200 dark:border-gray-700"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{mission.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{mission.title}</h4>
                <p className="text-sm text-gray-500">{mission.description}</p>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{mission.progress}/{mission.target}</span>
                    <span className="text-yellow-600">+{mission.xpReward} XP</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        mission.isCompleted
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      )}
                      style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Claim button */}
              {mission.isCompleted && mission.progress >= mission.target && (
                <button
                  onClick={() => onClaimReward(mission.id)}
                  className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm rounded-full font-medium hover:from-yellow-500 hover:to-orange-500"
                >
                  Claim
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
