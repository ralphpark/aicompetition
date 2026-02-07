'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { voteSuggestion, type Suggestion } from '@/app/actions/community'
import { updateSuggestionStatus, markSuggestionApplied, measureSuggestionPerformance } from '@/app/actions/suggestions'
import { useState, useTransition } from 'react'
import { Shield, Check, X, RotateCcw, Rocket, BarChart3, TrendingUp, TrendingDown, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClaudeReviewBadge } from './ClaudeReviewBadge'
import { TierBadge } from './TierBadge'
import { SECTION_LABELS, type SuggestionSection, type SuggestionStatus, type UserTier } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'

interface PerformanceData {
  id: string
  status: 'measuring' | 'completed' | 'insufficient_data'
  improvement_pct: number | null
  roi_before: number | null
  roi_after: number | null
  win_rate_before: number | null
  win_rate_after: number | null
  trades_before: number | null
  trades_after: number | null
  currentTotalTrades?: number | null
}

interface SuggestionCardProps {
  suggestion: Suggestion & {
    section?: SuggestionSection
    status?: SuggestionStatus
    claude_review_reason?: string | null
    expected_effect?: string | null
    author_avatar?: string | null
    author_tier?: UserTier | null
    // Supabase join format
    user_profiles?: {
      nickname: string | null
      avatar_url: string | null
      tier: UserTier | null
    } | null
  }
  isLoggedIn: boolean
  isAdmin?: boolean
  onAdminAction?: () => void
  performance?: PerformanceData | null
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

const sectionIcons: Record<string, string> = {
  market_analysis: '📊',
  risk_management: '🛡️',
  psychology_pressure: '🧠',
  learning_feedback: '📚',
  signal_integration: '📡',
  model_specific: '🎯',
}

export function SuggestionCard({ suggestion, isLoggedIn, isAdmin, onAdminAction, performance }: SuggestionCardProps) {
  const [upvotes, setUpvotes] = useState(suggestion.upvotes)
  const [downvotes, setDownvotes] = useState(suggestion.downvotes)
  const [isPending, startTransition] = useTransition()
  const [isAdminPending, startAdminTransition] = useTransition()
  const [isExpanded, setIsExpanded] = useState(false)

  // Support both direct props and Supabase join format
  const userName = suggestion.user_profiles?.nickname || suggestion.user_name || 'Anonymous'
  const userAvatar = suggestion.user_profiles?.avatar_url || suggestion.author_avatar
  const userTier = suggestion.user_profiles?.tier || suggestion.author_tier

  const handleVote = (type: 'up' | 'down') => {
    if (!isLoggedIn) {
      alert('Please sign in to vote')
      return
    }

    startTransition(async () => {
      const result = await voteSuggestion(suggestion.id, type)
      if (result.success) {
        setUpvotes(result.upvotes!)
        setDownvotes(result.downvotes!)
      }
    })
  }

  const handleAdminAction = (action: 'review' | 'approve' | 'reject' | 'apply' | 'revert') => {
    startAdminTransition(async () => {
      let result
      if (action === 'review') {
        result = await updateSuggestionStatus(suggestion.id, 'reviewing')
      } else if (action === 'approve') {
        result = await updateSuggestionStatus(suggestion.id, 'approved')
      } else if (action === 'reject') {
        const reason = window.prompt('Reason for rejection:')
        if (!reason) return
        result = await updateSuggestionStatus(suggestion.id, 'rejected', reason)
      } else if (action === 'apply') {
        result = await markSuggestionApplied(suggestion.id)
      } else if (action === 'revert') {
        result = await updateSuggestionStatus(suggestion.id, 'pending')
      }
      if (result?.error) {
        alert(result.error)
      } else {
        onAdminAction?.()
      }
    })
  }

  const [measureResult, setMeasureResult] = useState<{
    status: string
    roiAfter?: number
    pointsAwarded?: number
    newTrades?: number
  } | null>(null)

  const handleMeasureRoi = () => {
    if (!performance?.id) return
    startAdminTransition(async () => {
      const result = await measureSuggestionPerformance(performance.id)
      if ('error' in result) {
        alert(result.error)
      } else {
        setMeasureResult({
          status: result.status,
          roiAfter: result.roiAfter,
          pointsAwarded: result.pointsAwarded,
          newTrades: result.newTrades
        })
        onAdminAction?.()
      }
    })
  }

  const score = upvotes - downvotes
  const status = suggestion.status || (suggestion.is_implemented ? 'approved' : 'pending')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        "overflow-hidden transition-all border-2",
        status === 'approved' && "border-green-500/50 bg-green-50/50 dark:bg-green-900/10",
        status === 'rejected' && "border-red-500/30 bg-red-50/30 dark:bg-red-900/10",
        status === 'testing' && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10",
        status === 'reviewing' && "border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10",
        status === 'pending' && "border-gray-200 dark:border-gray-700"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Author Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={userAvatar || undefined} />
                <AvatarFallback>
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {userName}
                  </span>
                  {userTier && (
                    <TierBadge tier={userTier} size="sm" showLabel={false} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatTimeAgo(suggestion.created_at)}</span>
                  {suggestion.section && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {sectionIcons[suggestion.section]}
                        {SECTION_LABELS[suggestion.section]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <ClaudeReviewBadge
              status={status as SuggestionStatus}
              reason={suggestion.claude_review_reason}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Content */}
          <div className="mb-4">
            <p className={cn(
              "text-sm",
              !isExpanded && "line-clamp-3"
            )}>
              {suggestion.content}
            </p>
            {suggestion.content.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
              >
                {isExpanded ? (
                  <>Show less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Read more <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>

          {/* Expected Effect */}
          <AnimatePresence>
            {isExpanded && suggestion.expected_effect && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Expected Effect
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {suggestion.expected_effect}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Operator Reply */}
          {suggestion.operator_reply && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">Admin Review</span>
              </div>
              <p className="text-sm">{suggestion.operator_reply}</p>
            </div>
          )}

          {/* Vote Buttons & Score */}
          <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('up')}
              disabled={isPending}
              className="hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {upvotes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('down')}
              disabled={isPending}
              className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              {downvotes}
            </Button>

            <div className="flex-1" />

            <span className={cn(
              "text-sm font-semibold px-2 py-0.5 rounded",
              score > 0 && "text-green-600 bg-green-100 dark:bg-green-900/30",
              score < 0 && "text-red-600 bg-red-100 dark:bg-red-900/30",
              score === 0 && "text-gray-500 bg-gray-100 dark:bg-gray-700"
            )}>
              {score > 0 ? '+' : ''}{score}
            </span>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-2 pt-2 border-t dark:border-gray-700 mt-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium mr-1">Admin</span>

              {/* Step 1: Pending → Start Review */}
              {status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdminAction('review')}
                  disabled={isAdminPending}
                  className="h-7 text-xs text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Start Review
                </Button>
              )}

              {/* Step 2: Reviewing → Approve / Reject */}
              {status === 'reviewing' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAdminAction('approve')}
                    disabled={isAdminPending}
                    className="h-7 text-xs text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAdminAction('reject')}
                    disabled={isAdminPending}
                    className="h-7 text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </>
              )}

              {/* Step 3: Approved → Apply to Production */}
              {status === 'approved' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdminAction('apply')}
                  disabled={isAdminPending}
                  className="h-7 text-xs text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                >
                  <Rocket className="w-3 h-3 mr-1" />
                  Apply to Production
                </Button>
              )}

              {/* Step 4: Applied → Auto-measuring (50 trades) */}
              {status === 'applied' && performance?.status === 'measuring' && (
                <>
                  <span className="text-xs text-indigo-500 flex items-center gap-1 animate-pulse">
                    <BarChart3 className="w-3 h-3" />
                    Measuring... {performance.currentTotalTrades != null && performance.trades_before != null
                      ? `${Math.max(0, performance.currentTotalTrades - performance.trades_before)}/50 trades`
                      : '0/50 trades'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMeasureRoi}
                    disabled={isAdminPending}
                    className="h-7 text-xs text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  >
                    Force Measure
                  </Button>
                </>
              )}

              {/* Revert: any non-pending state → back to pending */}
              {status !== 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdminAction('revert')}
                  disabled={isAdminPending}
                  className="h-7 text-xs text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Revert
                </Button>
              )}
            </div>
          )}

          {/* ROI Performance Results */}
          {(performance?.status === 'completed' || measureResult) && (
            <div className="mt-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">ROI Measurement</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">ROI Before</span>
                  <p className="font-medium">{(performance?.roi_before ?? 0).toFixed(2)}%</p>
                </div>
                <div>
                  <span className="text-gray-500">ROI After</span>
                  <p className="font-medium">{(performance?.roi_after ?? measureResult?.roiAfter ?? 0).toFixed(2)}%</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Improvement</span>
                  {(() => {
                    const imp = performance?.improvement_pct ?? (measureResult?.roiAfter != null && performance?.roi_before != null ? measureResult.roiAfter - performance.roi_before : null)
                    if (imp == null) return <p className="font-medium text-gray-400">--</p>
                    return (
                      <p className={cn("font-bold flex items-center gap-1", imp > 0 ? "text-green-600" : imp < 0 ? "text-red-600" : "text-gray-500")}>
                        {imp > 0 ? <TrendingUp className="w-3 h-3" /> : imp < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                        {imp > 0 ? '+' : ''}{imp.toFixed(2)}%
                        {imp > 0 && <span className="text-green-500 font-normal ml-1">(+{Math.round(imp * 100)} pts)</span>}
                      </p>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}

          {performance?.status === 'insufficient_data' && (
            <div className="mt-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-700 dark:text-yellow-300">
              Insufficient data for ROI measurement (need more trades)
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
