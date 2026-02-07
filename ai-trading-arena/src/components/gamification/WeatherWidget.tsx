'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeatherWidgetProps {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  btcChange?: number
  className?: string
}

export function WeatherWidget({ sentiment, btcChange = 0, className }: WeatherWidgetProps) {
  const weatherConfig = {
    bullish: {
      icon: '☀️',
      label: 'Bullish',
      description: 'Clear skies ahead',
      gradient: 'from-yellow-400 to-orange-400',
      textColor: 'text-yellow-900',
    },
    bearish: {
      icon: '🌧️',
      label: 'Bearish',
      description: 'Stormy conditions',
      gradient: 'from-gray-500 to-gray-700',
      textColor: 'text-gray-100',
    },
    neutral: {
      icon: '⛅',
      label: 'Neutral',
      description: 'Mixed signals',
      gradient: 'from-blue-400 to-cyan-400',
      textColor: 'text-blue-900',
    },
  }

  const config = weatherConfig[sentiment]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        `bg-gradient-to-r ${config.gradient} rounded-xl p-4 ${config.textColor}`,
        className
      )}
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{
            y: [0, -4, 0],
            rotate: sentiment === 'bullish' ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-4xl"
        >
          {config.icon}
        </motion.div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider opacity-80">Market Weather</div>
          <div className="font-bold text-lg">{config.label}</div>
          <div className="text-sm opacity-80">{config.description}</div>
        </div>
        {btcChange !== 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {btcChange > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : btcChange < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
              <span className="font-mono font-bold">
                {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs opacity-80">Avg ROI</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
