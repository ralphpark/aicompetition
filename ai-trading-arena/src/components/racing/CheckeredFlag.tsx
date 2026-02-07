'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CheckeredFlagProps {
  winner: {
    name: string
    emoji: string
    roi: number
  }
  period: 'daily' | 'weekly' | 'monthly' | 'alltime'
  className?: string
}

export function CheckeredFlag({ winner, period, className }: CheckeredFlagProps) {
  const periodLabels = {
    daily: "Today's Champion",
    weekly: "Weekly Champion",
    monthly: "Monthly Champion",
    alltime: "All-Time Champion",
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl p-1",
        className
      )}
    >
      {/* Checkered pattern overlay */}
      <div className="absolute inset-0 opacity-10 rounded-xl overflow-hidden">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(45deg, #000 25%, transparent 25%),
            linear-gradient(-45deg, #000 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #000 75%),
            linear-gradient(-45deg, transparent 75%, #000 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }} />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 relative">
        {/* Trophy icon */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            🏆
          </motion.div>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {periodLabels[period]}
          </p>

          {/* Winner display */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl"
            >
              {winner.emoji}
            </motion.span>
            <div className="text-left">
              <h3 className="font-bold text-lg">{winner.name}</h3>
              <p className={cn(
                "text-sm font-mono font-bold",
                winner.roi >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {winner.roi >= 0 ? '+' : ''}{winner.roi.toFixed(2)}% ROI
              </p>
            </div>
          </div>

          {/* Confetti effect */}
          <div className="flex justify-center gap-1">
            {['🎉', '🎊', '✨', '🎉', '🎊'].map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-lg"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Mini version for inline use
interface MiniChampionBadgeProps {
  emoji: string
  name: string
  period: 'daily' | 'weekly'
}

export function MiniChampionBadge({ emoji, name, period }: MiniChampionBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-medium"
    >
      <span>👑</span>
      <span>{emoji}</span>
      <span>{name}</span>
      <span className="opacity-75">({period})</span>
    </motion.div>
  )
}
