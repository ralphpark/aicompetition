'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, DollarSign } from 'lucide-react'

interface StatsPanelProps {
  stats: {
    current_balance: number
    initial_balance: number
    total_trades: number
    winning_trades: number
    roi_percent: number
    win_rate: number
    currentPosition?: {
      side: 'LONG' | 'SHORT' | null
      entry_price?: number
      pnl?: number
      stop_loss?: number
      take_profit?: number
    }
  }
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const pnl = stats.current_balance - stats.initial_balance
  const isProfit = pnl >= 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold font-mono">
            ${stats.current_balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className={cn(
            "text-sm font-mono",
            isProfit ? "text-green-600" : "text-red-600"
          )}>
            {isProfit ? '+' : ''}{pnl.toFixed(2)} ({isProfit ? '+' : ''}{stats.roi_percent.toFixed(2)}%)
          </p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Target className="w-4 h-4" />
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold font-mono">
            {stats.win_rate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">
            {stats.winning_trades} / {stats.total_trades} trades
          </p>
        </CardContent>
      </Card>

      {/* ROI */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            {isProfit ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn(
            "text-2xl font-bold font-mono",
            isProfit ? "text-green-600" : "text-red-600"
          )}>
            {isProfit ? '+' : ''}{stats.roi_percent.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500">
            From ${stats.initial_balance.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Current Position */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.currentPosition?.side ? (
            <>
              <Badge className={cn(
                "text-lg px-3 py-1",
                stats.currentPosition.side === 'LONG' ? "bg-green-500" : "bg-red-500"
              )}>
                {stats.currentPosition.side === 'LONG' ? '📈' : '📉'} {stats.currentPosition.side}
              </Badge>
              {stats.currentPosition.entry_price && (
                <p className="text-sm text-gray-500 mt-1">
                  @ ${stats.currentPosition.entry_price.toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-400">NONE</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
