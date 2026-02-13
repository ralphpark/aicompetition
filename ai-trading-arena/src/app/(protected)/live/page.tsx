'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { DecisionFeed } from '@/components/decision/DecisionFeed'
import { MODEL_CHARACTERS } from '@/lib/constants/models'
import { Radio, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const actionFilters = [
  { value: '', label: 'All Actions', color: 'bg-gray-100 text-gray-700' },
  { value: 'LONG', label: 'Long', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'SHORT', label: 'Short', color: 'bg-rose-100 text-rose-700' },
  { value: 'CLOSE', label: 'Close', color: 'bg-purple-100 text-purple-700' },
  { value: 'NO_ACTION', label: 'Hold', color: 'bg-slate-100 text-slate-700' },
]

export default function LivePage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  const activeFilters = (selectedModel ? 1 : 0) + (selectedAction ? 1 : 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Radio className="w-8 h-8 text-red-500 animate-pulse" />
            <h1 className="text-3xl font-bold">Live Decision Feed</h1>
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time AI trading decisions with full reasoning
          </p>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">Real-time AI Decisions</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Watch as 9 AI models analyze the market and make trading decisions every 15 minutes.
                Each decision shows the model's reasoning, confidence level, and trading parameters.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </Button>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedModel(null)
                  setSelectedAction('')
                }}
                className="text-gray-500"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border dark:border-gray-700"
          >
            {/* Model Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Model
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedModel(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    selectedModel === null
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  All Models
                </button>
                {MODEL_CHARACTERS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                      selectedModel === model.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    <span>{model.emoji}</span>
                    <span className="hidden sm:inline">{model.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Action
              </label>
              <div className="flex flex-wrap gap-2">
                {actionFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedAction(filter.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      selectedAction === filter.value
                        ? "bg-green-600 text-white"
                        : filter.color
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filters Display */}
        {activeFilters > 0 && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-gray-500">Showing:</span>
            {selectedModel && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                {MODEL_CHARACTERS.find(m => m.id === selectedModel)?.emoji}
                {MODEL_CHARACTERS.find(m => m.id === selectedModel)?.name}
                <button
                  onClick={() => setSelectedModel(null)}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedAction && (
              <span className={cn(
                "px-2 py-1 rounded-full flex items-center gap-1",
                actionFilters.find(f => f.value === selectedAction)?.color
              )}>
                {actionFilters.find(f => f.value === selectedAction)?.label}
                <button
                  onClick={() => setSelectedAction('')}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded" />
            Long (Buy)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-rose-500 rounded" />
            Short (Sell)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded" />
            Close Position
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-slate-400 rounded" />
            Hold
          </span>
        </div>

        {/* Decision Feed */}
        <DecisionFeed
          modelId={selectedModel || undefined}
          limit={50}
          showModel={true}
        />
      </main>
    </div>
  )
}
