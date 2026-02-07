'use client'

import { Crown, MessageCircle, Bot, Check } from 'lucide-react'
import type { UserTier } from '@/types/database'

interface TierBenefitsProps {
  currentTier?: UserTier
  currentPoints?: number
}

const TIER_CONFIG: {
  tier: UserTier
  name: string
  points: number
  color: string
  bgColor: string
  borderColor: string
  icon: string
  mainBenefit: string
}[] = [
  {
    tier: 'bronze',
    name: 'Bronze',
    points: 0,
    color: 'text-amber-700 dark:text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: '🥉',
    mainBenefit: 'Basic Stats',
  },
  {
    tier: 'silver',
    name: 'Silver',
    points: 500,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    borderColor: 'border-gray-200 dark:border-gray-700',
    icon: '🥈',
    mainBenefit: 'Telegram Signal',
  },
  {
    tier: 'gold',
    name: 'Gold',
    points: 2000,
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: '🥇',
    mainBenefit: 'Detailed Alerts',
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    points: 5000,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    icon: '💎',
    mainBenefit: 'Real-time Position',
  },
  {
    tier: 'diamond',
    name: 'Diamond',
    points: 10000,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '👑',
    mainBenefit: 'Auto-trade Waitlist',
  },
  {
    tier: 'master',
    name: 'Master',
    points: 25000,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: '🏆',
    mainBenefit: 'Hall of Fame',
  },
]

const TIER_ORDER: UserTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']

export function TierBenefits({ currentTier = 'bronze', currentPoints = 0 }: TierBenefitsProps) {
  const currentTierIndex = TIER_ORDER.indexOf(currentTier)
  const nextTier = TIER_CONFIG[currentTierIndex + 1]
  const progressPercent = nextTier
    ? Math.min(100, (currentPoints / nextTier.points) * 100)
    : 100

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-500" />
        Tier Benefits
      </h3>

      {/* Current Tier & Progress */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{TIER_CONFIG[currentTierIndex].icon}</span>
            <div>
              <span className={`font-bold ${TIER_CONFIG[currentTierIndex].color}`}>
                {TIER_CONFIG[currentTierIndex].name}
              </span>
              <span className="text-gray-500 text-sm ml-2">Current Tier</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-green-600">{currentPoints.toLocaleString()} pts</div>
            {nextTier && (
              <div className="text-xs text-gray-500">
                Next: {nextTier.name} ({nextTier.points.toLocaleString()} pts)
              </div>
            )}
          </div>
        </div>
        {nextTier && (
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Tier Cards Grid - 2 rows x 3 cols */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {TIER_CONFIG.map((tier, index) => {
          const isUnlocked = index <= currentTierIndex
          const isCurrent = tier.tier === currentTier

          return (
            <div
              key={tier.tier}
              className={`relative rounded-lg p-2 border text-center transition-all min-w-0 ${
                isCurrent
                  ? 'border-green-500 border-2 ' + tier.bgColor
                  : isUnlocked
                  ? tier.borderColor + ' ' + tier.bgColor
                  : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 opacity-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg">{tier.icon}</span>
                <span className={`text-xs font-bold truncate ${isUnlocked ? tier.color : 'text-gray-400'}`}>
                  {tier.name}
                </span>
              </div>
              <div className="text-[10px] text-gray-500">
                {tier.points.toLocaleString()}pts
              </div>
              {isUnlocked && (
                <Check className="absolute -top-1 -right-1 w-3 h-3 text-green-500 bg-white dark:bg-gray-800 rounded-full" />
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Benefits */}
      <div className="grid grid-cols-2 gap-3">
        {/* Telegram */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Telegram</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300">
            Silver+ Signal Alerts
          </p>
          {currentTierIndex >= 1 ? (
            <a
              href="https://t.me/+YOUR_TELEGRAM_INVITE_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
            >
              Join
            </a>
          ) : (
            <span className="text-[10px] text-blue-500 mt-1 block">
              {500 - currentPoints}pts needed
            </span>
          )}
        </div>

        {/* Auto-trade */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Auto-trade</span>
            <span className="text-[10px] bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-1 rounded">
              Soon
            </span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-300">
            Diamond+ Conix Integration
          </p>
          {currentTierIndex >= 4 ? (
            <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium">
              Waitlist
            </button>
          ) : (
            <span className="text-[10px] text-purple-500 mt-1 block">
              {Math.max(0, 10000 - currentPoints).toLocaleString()}pts needed
            </span>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        * For reference only. You are responsible for your own trading decisions.
      </p>
    </div>
  )
}
