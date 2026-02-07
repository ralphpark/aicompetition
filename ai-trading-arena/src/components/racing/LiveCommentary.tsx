'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentaryMessage {
  id: string
  message: string
  type: 'info' | 'exciting' | 'warning' | 'milestone'
  timestamp: Date
}

interface LiveCommentaryProps {
  messages: CommentaryMessage[]
  className?: string
}

export function LiveCommentary({ messages, className }: LiveCommentaryProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [currentMessage, setCurrentMessage] = useState<CommentaryMessage | null>(null)

  useEffect(() => {
    if (messages.length > 0) {
      setCurrentMessage(messages[messages.length - 1])
    }
  }, [messages])

  const getTypeStyles = (type: CommentaryMessage['type']) => {
    switch (type) {
      case 'exciting':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
      case 'warning':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
      case 'milestone':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: CommentaryMessage['type']) => {
    switch (type) {
      case 'exciting':
        return '🔥'
      case 'warning':
        return '⚠️'
      case 'milestone':
        return '🏆'
      default:
        return '📢'
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Commentary Box */}
      <div className="bg-black/90 rounded-lg p-3 min-h-[60px] flex items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {currentMessage && (
              <motion.div
                key={currentMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-lg">{getTypeIcon(currentMessage.type)}</span>
                <p className="text-white text-sm font-medium">
                  {currentMessage.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Message History */}
      <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
        {messages.slice(-5).reverse().map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1 - idx * 0.2, x: 0 }}
            className={cn(
              "text-xs px-2 py-1 rounded",
              getTypeStyles(msg.type)
            )}
          >
            <span className="mr-1">{getTypeIcon(msg.type)}</span>
            {msg.message}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Commentary generator helper
export function generateCommentary(
  event: 'trade' | 'overtake' | 'milestone' | 'leader_change',
  data: {
    modelName?: string
    action?: string
    rank?: number
    roi?: number
    targetModel?: string
  }
): CommentaryMessage {
  const messages: Record<string, string[]> = {
    trade: [
      `${data.modelName} executes a ${data.action} trade!`,
      `Breaking: ${data.modelName} just made a move!`,
      `${data.modelName} is taking action in the market!`,
    ],
    overtake: [
      `🚀 ${data.modelName} overtakes ${data.targetModel}!`,
      `What a move! ${data.modelName} climbs to position ${data.rank}!`,
      `${data.modelName} is on fire, passing ${data.targetModel}!`,
    ],
    milestone: [
      `🏆 ${data.modelName} hits ${data.roi?.toFixed(1)}% ROI!`,
      `Milestone achieved! ${data.modelName} reaches new heights!`,
      `${data.modelName} is breaking records with ${data.roi?.toFixed(1)}% returns!`,
    ],
    leader_change: [
      `👑 New leader! ${data.modelName} takes the crown!`,
      `The lead changes hands! ${data.modelName} is now #1!`,
      `Dramatic shift! ${data.modelName} claims the top spot!`,
    ],
  }

  const eventMessages = messages[event] || messages.trade
  const randomMessage = eventMessages[Math.floor(Math.random() * eventMessages.length)]

  return {
    id: `${Date.now()}-${Math.random()}`,
    message: randomMessage,
    type: event === 'overtake' || event === 'leader_change' ? 'exciting' :
          event === 'milestone' ? 'milestone' : 'info',
    timestamp: new Date(),
  }
}
