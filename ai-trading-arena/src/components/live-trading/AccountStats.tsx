'use client'

import { TrendingUp, TrendingDown, Target, BarChart3, Wallet, PiggyBank } from 'lucide-react'
import type { BitgetAccountStats } from '@/types/database'

interface AccountStatsProps {
  stats: BitgetAccountStats | null
  isLoading?: boolean
}

export function AccountStats({ stats, isLoading }: AccountStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  const roi = stats?.roi || 0
  const pnl = stats?.totalPnl || 0
  const isProfit = pnl >= 0

  const statItems = [
    {
      icon: <Wallet className="w-5 h-5" />,
      label: 'Current Balance',
      value: `$${(stats?.currentBalance || 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
      label: 'Total P&L',
      value: `${isProfit ? '+' : ''}$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: isProfit ? 'text-emerald-600' : 'text-red-600',
      bgColor: isProfit ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Account ROI',
      value: `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`,
      color: roi >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: roi >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Win Rate',
      value: `${(stats?.winRate || 0).toFixed(1)}%`,
      color: (stats?.winRate || 0) >= 50 ? 'text-emerald-600' : 'text-amber-600',
      bgColor: (stats?.winRate || 0) >= 50 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      label: 'Winning Trades',
      value: stats?.winningTrades || 0,
      subValue: `of ${stats?.totalTrades || 0}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: <TrendingDown className="w-5 h-5 text-red-500" />,
      label: 'Losing Trades',
      value: stats?.losingTrades || 0,
      subValue: `of ${stats?.totalTrades || 0}`,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`${item.bgColor} rounded-xl p-4 border border-gray-100 dark:border-gray-700`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={item.color}>{item.icon}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {item.label}
            </span>
          </div>
          <div className={`text-xl font-bold ${item.color}`}>
            {item.value}
          </div>
          {'subValue' in item && item.subValue && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {item.subValue}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
