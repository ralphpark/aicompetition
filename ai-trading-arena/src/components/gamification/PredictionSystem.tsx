'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Trophy, Clock, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { MODEL_CHARACTERS, type ModelCharacter } from '@/lib/constants/models'

interface Prediction {
  id: string
  userId: string
  modelId: string
  predictionType: 'daily_winner' | 'weekly_winner' | 'next_trade'
  predictedAt: string
  resolvedAt?: string
  isCorrect?: boolean
  xpEarned?: number
}

interface PredictionCardProps {
  models: ModelCharacter[]
  type: 'daily_winner' | 'weekly_winner'
  onPredict: (modelId: string) => void
  currentPrediction?: string
  isResolved?: boolean
  winner?: string
  deadline?: Date
}

export function PredictionCard({
  models,
  type,
  onPredict,
  currentPrediction,
  isResolved = false,
  winner,
  deadline,
}: PredictionCardProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(currentPrediction || null)

  const typeLabels = {
    daily_winner: "Today's Winner",
    weekly_winner: 'Weekly Champion',
  }

  const handlePredict = () => {
    if (selectedModel && !currentPrediction && !isResolved) {
      onPredict(selectedModel)
    }
  }

  const isCorrect = isResolved && winner === currentPrediction

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold">Predict {typeLabels[type]}</h3>
        </div>
        {deadline && !isResolved && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Ends {deadline.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Result banner if resolved */}
      {isResolved && (
        <div className={cn(
          "mb-4 p-3 rounded-lg flex items-center gap-2",
          isCorrect
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
        )}>
          {isCorrect ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Correct! +100 XP earned!</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5" />
              <span className="font-medium">
                Not this time. Winner was {models.find(m => m.id === winner)?.name}
              </span>
            </>
          )}
        </div>
      )}

      {/* Model Selection Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {models.map((model) => {
          const isSelected = selectedModel === model.id
          const isPredicted = currentPrediction === model.id
          const isWinner = winner === model.id

          return (
            <motion.button
              key={model.id}
              whileHover={{ scale: currentPrediction || isResolved ? 1 : 1.05 }}
              whileTap={{ scale: currentPrediction || isResolved ? 1 : 0.95 }}
              onClick={() => !currentPrediction && !isResolved && setSelectedModel(model.id)}
              disabled={!!currentPrediction || isResolved}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-center relative",
                isSelected && !currentPrediction
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-gray-700",
                isPredicted && "border-purple-500 bg-purple-50 dark:bg-purple-900/30",
                isWinner && "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30",
                (currentPrediction || isResolved) && !isPredicted && !isWinner && "opacity-50"
              )}
            >
              <span className="text-2xl block mb-1">{model.emoji}</span>
              <span className="text-xs font-medium">{model.name}</span>

              {/* Indicators */}
              {isPredicted && (
                <span className="absolute -top-1 -right-1 text-xs bg-purple-500 text-white px-1 rounded">
                  Your pick
                </span>
              )}
              {isWinner && (
                <span className="absolute -top-1 -right-1 text-lg">👑</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Submit Button */}
      {!currentPrediction && !isResolved && (
        <button
          onClick={handlePredict}
          disabled={!selectedModel}
          className={cn(
            "w-full py-3 rounded-lg font-medium transition-all",
            selectedModel
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
          )}
        >
          {selectedModel ? 'Lock In Prediction' : 'Select a Model'}
        </button>
      )}

      {/* Already predicted */}
      {currentPrediction && !isResolved && (
        <div className="text-center text-sm text-gray-500">
          <HelpCircle className="w-4 h-4 inline mr-1" />
          Prediction locked. Results will be revealed soon!
        </div>
      )}

      {/* XP info */}
      <div className="mt-4 text-center text-xs text-gray-400">
        Correct prediction = +100 XP
      </div>
    </motion.div>
  )
}

// Prediction leaderboard
interface PredictionLeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  correctPredictions: number
  totalPredictions: number
  streak: number
}

interface PredictionLeaderboardProps {
  entries: PredictionLeaderboardEntry[]
  currentUserId?: string
}

export function PredictionLeaderboard({ entries, currentUserId }: PredictionLeaderboardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold">Prediction Masters</h3>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => {
          const accuracy = entry.totalPredictions > 0
            ? (entry.correctPredictions / entry.totalPredictions * 100).toFixed(0)
            : 0
          const isCurrentUser = entry.userId === currentUserId

          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                isCurrentUser
                  ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                  : "bg-gray-50 dark:bg-gray-700/50"
              )}
            >
              {/* Rank */}
              <div className="w-8 text-center font-bold">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                {entry.avatar || entry.username.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {entry.username}
                  {isCurrentUser && <span className="text-blue-500 ml-1">(You)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.correctPredictions}/{entry.totalPredictions} correct • {accuracy}% accuracy
                </div>
              </div>

              {/* Streak */}
              {entry.streak > 0 && (
                <div className="flex items-center gap-1 text-orange-500 text-sm font-medium">
                  🔥 {entry.streak}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Mini prediction widget for sidebar
interface MiniPredictionWidgetProps {
  currentPrediction?: {
    modelId: string
    modelName: string
    modelEmoji: string
    type: string
  }
  timeLeft?: string
}

export function MiniPredictionWidget({ currentPrediction, timeLeft }: MiniPredictionWidgetProps) {
  if (!currentPrediction) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4" />
          <span className="font-medium text-sm">Make a Prediction!</span>
        </div>
        <p className="text-xs text-white/80">
          Predict today's winner and earn XP!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-4 h-4" />
        <span className="font-medium text-sm">Your Prediction</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{currentPrediction.modelEmoji}</span>
        <div>
          <div className="font-bold">{currentPrediction.modelName}</div>
          <div className="text-xs text-white/80">
            {timeLeft ? `Results in ${timeLeft}` : 'Waiting for results...'}
          </div>
        </div>
      </div>
    </div>
  )
}
