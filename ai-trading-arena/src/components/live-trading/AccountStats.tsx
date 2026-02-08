'use client'

import { TrendingUp, TrendingDown, Target, BarChart3, Wallet, Receipt } from 'lucide-react'
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
  const netPnl = stats?.netPnl || 0
  const grossPnl = stats?.totalPnl || 0
  const totalFees = stats?.totalFees || 0
  const isProfit = netPnl >= 0

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
      label: 'Net P&L',
      value: `${isProfit ? '+' : ''}$${netPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subValue: `Gross: ${grossPnl >= 0 ? '+' : ''}$${grossPnl.toFixed(2)}`,
      color: isProfit ? 'text-emerald-600' : 'text-red-600',
      bgColor: isProfit ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      label: 'Total Fees',
      value: `$${totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'ROI',
      value: `${roi >= 0 ? '+' : ''}${roi.toFixed(2)}%`,
      subValue: `${stats?.totalTrades || 0} trades`,
      color: roi >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: roi >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Win Rate',
      value: `${(stats?.winRate || 0).toFixed(1)}%`,
      subValue: `${stats?.winningTrades || 0}W / ${stats?.losingTrades || 0}L`,
      color: (stats?.winRate || 0) >= 50 ? 'text-emerald-600' : 'text-amber-600',
      bgColor: (stats?.winRate || 0) >= 50 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
      label: 'Avg P&L',
      value: (stats?.totalTrades || 0) > 0
        ? `${(netPnl / (stats?.totalTrades || 1)) >= 0 ? '+' : ''}$${(netPnl / (stats?.totalTrades || 1)).toFixed(2)}`
        : '$0.00',
      subValue: 'per trade',
      color: isProfit ? 'text-emerald-600' : 'text-red-600',
      bgColor: isProfit ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
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
