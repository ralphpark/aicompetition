'use client'

import { cn } from '@/lib/utils'
import type { SuggestionStatus } from '@/types/database'
import { STATUS_LABELS, STATUS_COLORS } from '@/types/database'
import { Clock, CheckCircle, XCircle, FlaskConical, Search, Rocket } from 'lucide-react'

interface ClaudeReviewBadgeProps {
  status: SuggestionStatus
  reason?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusIcons: Record<SuggestionStatus, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  reviewing: <Search className="w-3.5 h-3.5" />,
  approved: <CheckCircle className="w-3.5 h-3.5" />,
  applied: <Rocket className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
  testing: <FlaskConical className="w-3.5 h-3.5" />,
}

export function ClaudeReviewBadge({ status, reason, size = 'md', className }: ClaudeReviewBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <div className={cn('inline-flex flex-col', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          sizeClasses[size],
          STATUS_COLORS[status]
        )}
      >
        {statusIcons[status]}
        {STATUS_LABELS[status]}
      </span>
      {reason && (
        <span className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={reason}>
          {reason}
        </span>
      )}
    </div>
  )
}
