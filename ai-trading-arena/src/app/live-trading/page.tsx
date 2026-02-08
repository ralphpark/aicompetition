'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { TradingConfig, AccountStats, TradeHistory } from '@/components/live-trading'
import { useBitgetRealtime } from '@/hooks/useBitgetRealtime'
import { Radio, RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

function LastUpdatedTimer({ lastUpdated, onRefresh }: { lastUpdated: Date; onRefresh: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setElapsed(0)
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [lastUpdated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const formatElapsed = (s: number) => {
    if (s < 5) return 'just now'
    if (s < 60) return `${s}s ago`
    return `${Math.floor(s / 60)}m ${s % 60}s ago`
  }

  const isStale = elapsed > 60

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-1.5 text-xs font-medium ${
        isStale ? 'text-amber-500' : 'text-emerald-500'
      }`}>
        {isStale ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
        <span>{formatElapsed(elapsed)}</span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        title="Refresh now"
      >
        <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}

export default function LiveTradingPage() {
  const { config, trades, stats, isLoading, error, lastUpdated, refetch } = useBitgetRealtime()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Radio className="w-8 h-8 text-red-500 animate-pulse" />
            <h1 className="text-3xl font-bold">Live Trading</h1>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
              Bitget Demo
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time trading execution synced with Champion AI
          </p>
          {/* Last Updated Timer */}
          <div className="flex items-center justify-center mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border dark:border-gray-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Auto-refresh 30s</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <LastUpdatedTimer lastUpdated={lastUpdated} onRefresh={refetch} />
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium">Connection Error</p>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
              <button
                onClick={refetch}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </motion.div>
        )}

        {/* Trading Configuration */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Trading Configuration
          </h2>
          <TradingConfig config={config} isLoading={isLoading} />
        </motion.section>

        {/* Account Statistics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Account Performance
          </h2>
          <AccountStats stats={stats} isLoading={isLoading} />
        </motion.section>

        {/* Trade History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TradeHistory trades={trades} isLoading={isLoading} />
        </motion.section>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500">
            This is a demo account for educational purposes only. Not financial advice.
            <br />
            Trading cryptocurrency involves significant risk of loss.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
