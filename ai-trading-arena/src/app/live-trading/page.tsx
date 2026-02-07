'use client'

import { Header } from '@/components/layout/Header'
import { TradingConfig, AccountStats, TradeHistory } from '@/components/live-trading'
import { useBitgetRealtime } from '@/hooks/useBitgetRealtime'
import { Radio, RefreshCw, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LiveTradingPage() {
  const { config, trades, stats, isLoading, error, refetch } = useBitgetRealtime()

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
