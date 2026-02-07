'use client'

import { Settings, Cpu, TrendingUp, Layers, DollarSign } from 'lucide-react'
import type { BitgetAccountConfig } from '@/types/database'

interface TradingConfigProps {
  config: BitgetAccountConfig | null
  isLoading?: boolean
}

export function TradingConfig({ config, isLoading }: TradingConfigProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  const configItems = [
    {
      icon: <Cpu className="w-5 h-5" />,
      label: 'Platform',
      value: config?.platform?.toUpperCase() || 'BITGET',
      subValue: config?.account_type === 'demo' ? 'Demo Account' : 'Live Account',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Symbol',
      value: config?.symbol || 'BTCUSDT',
      subValue: 'Perpetual Futures',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Leverage',
      value: `${config?.leverage || 5}x`,
      subValue: 'Cross Margin',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: <Layers className="w-5 h-5" />,
      label: 'Margin Mode',
      value: config?.margin_mode === 'crossed' ? 'Cross' : 'Isolated',
      subValue: 'Full Position',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Initial Balance',
      value: `$${(config?.initial_balance || 10000).toLocaleString()}`,
      subValue: 'USDT',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {configItems.map((item, index) => (
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
          <div className={`text-lg font-bold ${item.color}`}>
            {item.value}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {item.subValue}
          </div>
        </div>
      ))}
    </div>
  )
}
