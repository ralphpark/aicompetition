'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODEL_CHARACTERS, type ModelCharacter } from '@/lib/constants/models'

interface ModelStats {
  balance: number
  roi: number
  rank: number
}

interface ModelSelectorProps {
  selectedModel: ModelCharacter | null
  onModelChange: (model: ModelCharacter) => void
  modelStats?: Record<string, ModelStats>
}

export function ModelSelector({ selectedModel, onModelChange, modelStats }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const stats = selectedModel && modelStats?.[selectedModel.id]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors w-full md:w-auto min-w-[280px]"
      >
        {selectedModel ? (
          <>
            <span className="text-2xl">{selectedModel.emoji}</span>
            <div className="flex-1 text-left">
              <div className="font-semibold">{selectedModel.name}</div>
              <div className="text-xs text-gray-500">{selectedModel.provider}</div>
            </div>
          </>
        ) : (
          <span className="text-gray-500">Select a model...</span>
        )}
        <ChevronDown className={cn(
          "w-5 h-5 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
            {MODEL_CHARACTERS.map((model) => {
              const modelStat = modelStats?.[model.id]
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                    selectedModel?.id === model.id && "bg-gray-50 dark:bg-gray-700/50"
                  )}
                >
                  <span className="text-2xl">{model.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.provider} • {model.personality}</div>
                  </div>
                  {modelStat && (
                    <div className="text-right text-xs">
                      <div className={cn(
                        "font-medium",
                        modelStat.roi >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {modelStat.roi >= 0 ? '+' : ''}{modelStat.roi.toFixed(2)}%
                      </div>
                      <div className="text-gray-500">Rank #{modelStat.rank}</div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Selected Model Stats */}
      {selectedModel && stats && (
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span>Balance:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${stats.balance.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>ROI:</span>
            <span className={cn(
              "font-semibold",
              stats.roi >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Rank:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              #{stats.rank}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
