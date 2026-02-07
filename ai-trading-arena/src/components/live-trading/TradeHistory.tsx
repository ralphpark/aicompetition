'use client'

import { useState } from 'react'
import { Radio, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { BitgetTradeExecution } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'

interface TradeHistoryProps {
  trades: BitgetTradeExecution[]
  isLoading?: boolean
}

export function TradeHistory({ trades, isLoading }: TradeHistoryProps) {
  const [showAll, setShowAll] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const displayTrades = showAll ? trades : trades.slice(0, 10)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getActionColor = (action: string) => {
    if (action.includes('LONG')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30'
    if (action.includes('SHORT')) return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30'
    return 'text-gray-600 bg-gray-50 dark:bg-gray-700'
  }

  const getSideIcon = (side: string) => {
    if (side?.toUpperCase() === 'BUY') {
      return <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
    }
    return <ArrowDownCircle className="w-5 h-5 text-rose-500" />
  }

  const getStatusIcon = (status: string) => {
    if (status === 'SUCCESS') {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <XCircle className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Trade History</h3>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">LIVE</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          Total: {trades.length} trades
        </span>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No trades yet</p>
          <p className="text-sm mt-1">Trades will appear here in real-time</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
            <div>Time</div>
            <div>Action</div>
            <div>Side</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">P&L</div>
            <div className="text-center">Status</div>
          </div>

          {/* Trade Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <AnimatePresence mode="popLayout">
              {displayTrades.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: -20, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 hidden md:block" />
                    <span className="font-mono text-xs md:text-sm">{formatTime(trade.executed_at)}</span>
                  </div>

                  {/* Action */}
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getActionColor(trade.action)}`}>
                      {trade.action}
                    </span>
                  </div>

                  {/* Side */}
                  <div className="flex items-center gap-2">
                    {getSideIcon(trade.side)}
                    <span className={`text-sm font-medium ${
                      trade.side?.toUpperCase() === 'BUY' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {trade.side?.toUpperCase()}
                    </span>
                  </div>

                  {/* Quantity */}
                  <div className="text-right text-sm font-mono">
                    {trade.quantity} BTC
                  </div>

                  {/* P&L */}
                  <div className={`text-right text-sm font-medium ${
                    (trade.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {trade.position_status === 'CLOSED' ? (
                      `${(trade.pnl || 0) >= 0 ? '+' : ''}$${(trade.pnl || 0).toFixed(2)}`
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center gap-1">
                    {getStatusIcon(trade.status)}
                    <span className={`text-xs ${
                      trade.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Show More/Less Button */}
          {trades.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All ({trades.length} trades)
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}
