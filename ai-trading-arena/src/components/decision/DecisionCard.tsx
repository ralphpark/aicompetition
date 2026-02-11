'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getModelByName } from '@/lib/constants/models'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Target, StopCircle, TrendingUp, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AIDecision } from '@/types/database'

interface DecisionCardProps {
  decision: AIDecision & { model_name?: string; provider?: string }
  showModel?: boolean
}

const actionConfig: Record<string, {
  label: string
  icon: string
  bgColor: string
  borderColor: string
  textColor: string
}> = {
  OPEN_LONG: {
    label: 'LONG',
    icon: '📈',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-600',
  },
  OPEN_SHORT: {
    label: 'SHORT',
    icon: '📉',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-600',
  },
  CLOSE_LONG: {
    label: 'CLOSE LONG',
    icon: '💰',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600',
  },
  CLOSE_SHORT: {
    label: 'CLOSE SHORT',
    icon: '💰',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600',
  },
  NO_ACTION: {
    label: 'HOLD',
    icon: '⏸️',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-600',
  },
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function formatBlockReason(reason: string | null | undefined): string | null {
  if (!reason) return null
  if (reason.startsWith('Has LONG')) return 'Already holding a LONG position — duplicate entry blocked'
  if (reason.startsWith('Has SHORT')) return 'Already holding a SHORT position — duplicate entry blocked'
  if (reason.startsWith('RANGING market')) return `Market is ranging with weak trend — ${reason.match(/\(.*\)/)?.[0] || ''}`
  if (reason.startsWith('Max pos')) return 'Maximum open positions reached (4/4)'
  if (reason.startsWith('R:R too low')) return `Risk/Reward ratio too low — ${reason.match(/\(.*\)/)?.[0] || ''}`
  if (reason.startsWith('Squeeze releasing')) return 'Bollinger Band squeeze detected — waiting for breakout direction'
  if (reason.startsWith('No pos')) return 'No open position to close'
  if (reason.startsWith('No portfolio')) return 'Portfolio not found for this model'
  if (reason.startsWith('Confluence fail')) return `Insufficient technical confluence — ${reason.match(/\(.*\)/)?.[0] || ''}`
  return reason
}

export function DecisionCard({ decision, showModel = true }: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const character = decision.model_name ? getModelByName(decision.model_name) : undefined
  const config = actionConfig[decision.action] || actionConfig.NO_ACTION
  const isBlocked = decision.execution_status === 'blocked'

  const shouldShowExpand = decision.reasoning && decision.reasoning.length > 150

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className={cn(
        "overflow-hidden hover:shadow-md transition-all border-l-4",
        isBlocked
          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 opacity-80"
          : cn(config.borderColor, config.bgColor)
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showModel && (
                <>
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl"
                  >
                    {character?.emoji || '🤖'}
                  </motion.span>
                  <div>
                    <p className="font-semibold">{decision.model_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{decision.provider}</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn(
                "text-sm font-bold px-3 py-1 border",
                isBlocked
                  ? "text-amber-600 bg-amber-100/50 border-amber-500 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-600"
                  : cn(config.textColor, config.bgColor, config.borderColor)
              )}>
                {config.icon} {config.label}
              </Badge>
              {isBlocked && (
                <Badge className="text-sm font-bold px-3 py-1 bg-amber-500/20 text-amber-700 border border-amber-500 dark:text-amber-300">
                  ⛔ BLOCKED
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(decision.created_at)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Block Reason */}
          {isBlocked && decision.block_reason && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-3 font-medium">
              ⚠ {formatBlockReason(decision.block_reason)}
            </p>
          )}

          {/* Confidence Bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500 w-20">Confidence</span>
            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${decision.confidence}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  "h-full rounded-full",
                  decision.confidence >= 80 ? "bg-green-500" :
                  decision.confidence >= 60 ? "bg-emerald-500" :
                  decision.confidence >= 40 ? "bg-yellow-500" : "bg-red-500"
                )}
              />
            </div>
            <span className={cn(
              "text-sm font-mono font-bold w-12 text-right",
              decision.confidence >= 80 ? "text-green-600" :
              decision.confidence >= 60 ? "text-emerald-600" :
              decision.confidence >= 40 ? "text-yellow-600" : "text-red-600"
            )}>
              {decision.confidence}%
            </span>
          </div>

          {/* Price Info */}
          {decision.entry_price && (
            <div className={cn(
              "grid grid-cols-3 gap-3 mb-4",
              isBlocked && "opacity-50 line-through"
            )}>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Target className="w-3 h-3" />
                  Entry
                </div>
                <p className="font-mono font-semibold">
                  ${decision.entry_price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </p>
              </div>
              {decision.stop_loss && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                    <StopCircle className="w-3 h-3" />
                    Stop Loss
                  </div>
                  <p className="font-mono font-semibold text-red-600">
                    ${decision.stop_loss.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>
              )}
              {decision.take_profit && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Take Profit
                  </div>
                  <p className="font-mono font-semibold text-green-600">
                    ${decision.take_profit.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Exit Plan / Invalidation */}
          {(decision.action === 'OPEN_LONG' || decision.action === 'OPEN_SHORT') &&
           (decision.invalidation_type || decision.invalidation_description) && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4 border border-amber-200 dark:border-amber-800">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                Exit Plan
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {decision.invalidation_type && (
                  <div>
                    <span className="text-gray-500 text-xs">Type</span>
                    <p className="font-medium text-amber-700 dark:text-amber-300">{decision.invalidation_type}</p>
                  </div>
                )}
                {decision.invalidation_value && (
                  <div>
                    <span className="text-gray-500 text-xs">Price</span>
                    <p className="font-mono font-medium text-amber-700 dark:text-amber-300">${decision.invalidation_value.toLocaleString()}</p>
                  </div>
                )}
                {decision.invalidation_description && (
                  <div className="col-span-3">
                    <span className="text-gray-500 text-xs">Condition</span>
                    <p className="text-gray-700 dark:text-gray-300">{decision.invalidation_description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reasoning */}
          {decision.reasoning && (
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reasoning
                </span>
                {shouldShowExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-6 text-xs text-blue-600 hover:text-blue-700"
                  >
                    {isExpanded ? (
                      <>Less <ChevronUp className="w-3 h-3 ml-1" /></>
                    ) : (
                      <>More <ChevronDown className="w-3 h-3 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isExpanded ? 'expanded' : 'collapsed'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "text-sm text-gray-700 dark:text-gray-300 leading-relaxed",
                    !isExpanded && shouldShowExpand && "line-clamp-2"
                  )}
                >
                  {decision.reasoning}
                </motion.p>
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
